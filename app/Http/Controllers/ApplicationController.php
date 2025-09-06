<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    /**
     * Get all applications (for registrars/super users)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Application::with(['user:id,name,email,organization', 'assignedRegistrar:id,name'])
            ->withCount(['documents', 'reports']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by assigned registrar (for registrars)
        if (auth()->user()->isRegistrar()) {
            $query->where('assigned_registrar_id', auth()->id());
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%")
                               ->orWhere('organization', 'like', "%{$search}%");
                  })
                  ->orWhereRaw("JSON_EXTRACT(form_data, '$.company_name') LIKE ?", ["%{$search}%"]);
            });
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'applications' => $applications
        ]);
    }

    /**
     * Get user's applications
     */
    public function myApplications(): JsonResponse
    {
        $applications = auth()->user()->applications()
            ->withCount(['documents', 'reports'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'applications' => $applications
        ]);
    }

    /**
     * Create new application
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'form_data' => 'array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $application = Application::create([
                'user_id' => auth()->id(),
                'form_data' => $request->form_data ?? [],
                'status' => 'draft'
            ]);

            return response()->json([
                'success' => true,
                'application' => $application,
                'message' => 'Application created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Application creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific application
     */
    public function show(Application $application): JsonResponse
    {
        // Check access permissions
        if ($application->user_id !== auth()->id() && !auth()->user()->isRegistrar() && !auth()->user()->isSuperUser()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $application->load([
            'user:id,name,email,phone,organization',
            'assignedRegistrar:id,name',
            'documents:id,application_id,category,document_type,original_filename,file_size,extraction_status,is_mandatory,created_at',
            'reports:id,application_id,type,status,generated_at'
        ]);

        return response()->json([
            'success' => true,
            'application' => $application
        ]);
    }

    /**
     * Update application
     */
    public function update(Request $request, Application $application): JsonResponse
    {
        // Check access permissions
        if ($application->user_id !== auth()->id() && !auth()->user()->isRegistrar()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'form_data' => 'array',
            'evaluation' => 'array',
            'notes' => 'string',
            'assigned_registrar_id' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = [];

            if ($request->has('form_data')) {
                $updateData['form_data'] = array_merge($application->form_data ?? [], $request->form_data);
            }

            if ($request->has('evaluation') && auth()->user()->isRegistrar()) {
                $updateData['evaluation'] = $request->evaluation;
            }

            if ($request->has('notes') && auth()->user()->isRegistrar()) {
                $updateData['notes'] = $request->notes;
            }

            if ($request->has('assigned_registrar_id') && auth()->user()->isSuperUser()) {
                $updateData['assigned_registrar_id'] = $request->assigned_registrar_id;
            }

            $application->update($updateData);

            return response()->json([
                'success' => true,
                'application' => $application->fresh(),
                'message' => 'Application updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit application
     */
    public function submit(Application $application): JsonResponse
    {
        // Check if user owns this application
        if ($application->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Check if application can be submitted
        if (!$application->canBeSubmitted()) {
            return response()->json([
                'success' => false,
                'message' => 'Application cannot be submitted. Please upload all mandatory documents.'
            ], 422);
        }

        try {
            $application->update([
                'status' => 'submitted',
                'submitted_at' => now()
            ]);

            // Auto-assign to available registrar
            $this->autoAssignRegistrar($application);

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Submission failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update application status (registrars only)
     */
    public function updateStatus(Request $request, Application $application): JsonResponse
    {
        if (!auth()->user()->isRegistrar() && !auth()->user()->isSuperUser()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only registrars can update status.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:under_review,approved,rejected',
            'notes' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $application->update([
                'status' => $request->status,
                'notes' => $request->notes ?? $application->notes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Application status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Status update failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get application statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_applications' => Application::count(),
            'draft_applications' => Application::where('status', 'draft')->count(),
            'submitted_applications' => Application::where('status', 'submitted')->count(),
            'under_review' => Application::where('status', 'under_review')->count(),
            'approved_applications' => Application::where('status', 'approved')->count(),
            'rejected_applications' => Application::where('status', 'rejected')->count(),
        ];

        if (auth()->user()->isRegistrar()) {
            $stats['my_assigned'] = Application::where('assigned_registrar_id', auth()->id())->count();
        }

        return response()->json([
            'success' => true,
            'statistics' => $stats
        ]);
    }

    /**
     * Auto-assign application to registrar with least workload
     */
    private function autoAssignRegistrar(Application $application): void
    {
        $registrar = User::where('user_type', 'registrar')
            ->where('is_active', true)
            ->withCount(['assignedApplications' => function ($query) {
                $query->whereIn('status', ['submitted', 'under_review']);
            }])
            ->orderBy('assigned_applications_count')
            ->first();

        if ($registrar) {
            $application->update([
                'assigned_registrar_id' => $registrar->id,
                'status' => 'under_review'
            ]);
        }
    }
}
