<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing roles
        $superUserRole = Role::where('name', 'super_user')->first();
        $registrarRole = Role::where('name', 'registrar')->first();
        $applicantRole = Role::where('name', 'applicant')->first();

        // Create default users
        $users = [
            [
                'name' => 'Super User',
                'email' => 'admin@mfiportal.com',
                'password' => 'password123',
                'user_type' => 'super_user',
                'organization' => 'MFI Portal Admin',
                'phone' => '+263 4 123456'
            ],
            [
                'name' => 'RBZ Registrar',
                'email' => 'registrar@rbz.co.zw',
                'password' => 'password123',
                'user_type' => 'registrar',
                'organization' => 'Reserve Bank of Zimbabwe',
                'phone' => '+263 4 234567'
            ],
            [
                'name' => 'Sample Applicant',
                'email' => 'applicant@microfinance.co.zw',
                'password' => 'password123',
                'user_type' => 'applicant',
                'organization' => 'Sample Microfinance Institution',
                'phone' => '+263 4 345678'
            ]
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                    'user_type' => $userData['user_type'],
                    'organization' => $userData['organization'],
                    'phone' => $userData['phone'],
                    'is_active' => true
                ]
            );

            // Assign role based on user type if not already assigned
            if (!$user->hasRole($userData['user_type'])) {
                switch ($userData['user_type']) {
                    case 'super_user':
                        $user->assignRole($superUserRole);
                        break;
                    case 'registrar':
                        $user->assignRole($registrarRole);
                        break;
                    case 'applicant':
                        $user->assignRole($applicantRole);
                        break;
                }
            }
        }
    }
}
