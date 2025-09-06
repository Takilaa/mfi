import React from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    navigate('/login')
  }

  // Application requirements checklist
  const applicationRequirements = [
    {
      category: "🏢 Institution Information",
      items: [
        "Institution name and registration details",
        "Physical and postal addresses",
        "Contact information and primary contact person",
        "Business type and target market"
      ]
    },
    {
      category: "🏦 Professional Services",
      items: [
        "Banking relationships and account details",
        "External auditor information",
        "Legal advisor details",
        "Professional certifications"
      ]
    },
    {
      category: "👥 Board & Governance",
      items: [
        "Board of directors (minimum 3)",
        "Director qualifications and experience",
        "Board committees structure",
        "Governance policies and procedures"
      ]
    },
    {
      category: "💰 Capital & Shareholding",
      items: [
        "Share capital structure (minimum USD 25,000)",
        "Shareholder information and ownership",
        "Source of capital and funding",
        "Beneficial ownership disclosure"
      ]
    },
    {
      category: "📄 Required Documents",
      items: [
        "Certificate of Incorporation",
        "Memorandum & Articles of Association",
        "Tax clearance certificates",
        "Audited financial statements",
        "Business plan and projections",
        "Policy manuals and procedures"
      ]
    }
  ]

  const getWelcomeMessage = () => {
    switch (user.user_type) {
      case 'super_user':
        return 'System Administrator Dashboard'
      case 'registrar':
        return 'Registrar Dashboard'
      case 'applicant':
        return 'MFI License Application Portal'
      default:
        return 'Welcome to MFI Portal'
    }
  }

  const getActions = () => {
    switch (user.user_type) {
      case 'super_user':
        return [
          { name: 'Manage Users', action: () => alert('User management coming soon!') },
          { name: 'System Settings', action: () => alert('System settings coming soon!') }
        ]
      case 'registrar':
        return [
          { name: 'Review Applications', action: () => alert('Application review coming soon!') },
          { name: 'Generate Reports', action: () => alert('Report generation coming soon!') }
        ]
      case 'applicant':
        return [
          { name: 'Start Your Application', action: () => navigate('/application') },
          { name: 'My Applications', action: () => alert('Application tracking coming soon!') }
        ]
      default:
        return []
    }
  }

  // Render applicant-specific dashboard
  if (user.user_type === 'applicant') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Welcome to MFI License Application Portal
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8">
                  Complete your microfinance institution license application with confidence
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/application')}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    🚀 Start Your Application
                  </button>
                  <button
                    onClick={() => alert('Application tracking coming soon!')}
                    className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    📊 Track Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">8</div>
              <div className="text-gray-600">Application Sections</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-gray-600">Required Documents</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">$25K</div>
              <div className="text-gray-600">Minimum Capital</div>
            </div>
          </div>

          {/* Application Requirements */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              📋 Application Requirements Overview
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applicationRequirements.map((requirement, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {requirement.category}
                  </h3>
                  <ul className="space-y-2">
                    {requirement.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Application Process */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              🎯 Application Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Form</h3>
                <p className="text-gray-600 text-sm">Fill out all 8 sections of the application form</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600 text-sm">Upload all required supporting documents</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Review & Submit</h3>
                <p className="text-gray-600 text-sm">Review your application and submit for processing</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600 text-sm">Monitor your application status and updates</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-6 text-green-100">
              Begin your MFI license application today. Our guided process makes it simple and straightforward.
            </p>
            <button
              onClick={() => navigate('/application')}
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
            >
              🚀 Start Application Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render other user types with original layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MFI Portal</h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.organization}</p>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getActions().map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* User Info Card */}
          <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                User Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize">{user.user_type.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.organization}</dd>
                </div>
                {user.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
