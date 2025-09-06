<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions if they don't exist
        $permissions = [
            'view_applications',
            'create_applications',
            'edit_applications',
            'delete_applications',
            'approve_applications',
            'reject_applications',
            'generate_reports',
            'view_reports',
            'manage_users',
            'upload_documents',
            'process_documents',
            'view_dashboard',
            'manage_settings'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles if they don't exist
        $superUserRole = Role::firstOrCreate(['name' => 'super_user']);
        $registrarRole = Role::firstOrCreate(['name' => 'registrar']);
        $applicantRole = Role::firstOrCreate(['name' => 'applicant']);

        // Assign permissions to roles
        $superUserRole->givePermissionTo(Permission::all());
        
        $registrarRole->givePermissionTo([
            'view_applications',
            'approve_applications',
            'reject_applications',
            'generate_reports',
            'view_reports',
            'process_documents',
            'view_dashboard'
        ]);
        
        $applicantRole->givePermissionTo([
            'create_applications',
            'edit_applications',
            'view_applications',
            'upload_documents',
            'view_dashboard'
        ]);
    }
}
