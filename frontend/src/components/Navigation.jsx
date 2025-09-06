import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Track application progress
  const [applicationProgress, setApplicationProgress] = useState({
    checklistCompleted: false,
    applicationFormStarted: false,
    applicationFormCompleted: false,
    uploadAccess: false
  })

  // Load and refresh progress from localStorage
  const loadProgress = () => {
    const checklistProgress = localStorage.getItem('mfi_checklist_progress')
    const appFormProgress = localStorage.getItem('mfi_application_progress')

    let newProgress = {
      checklistCompleted: false,
      applicationFormStarted: false,
      applicationFormCompleted: false,
      uploadAccess: false
    }

    if (checklistProgress) {
      const checklist = JSON.parse(checklistProgress)
      const completedItems = Object.values(checklist).filter(Boolean).length
      const totalItems = Object.keys(checklist).length
      newProgress.checklistCompleted = completedItems === totalItems
    }

    if (appFormProgress) {
      const appProgress = JSON.parse(appFormProgress)
      newProgress.applicationFormStarted = appProgress.started || false
      newProgress.applicationFormCompleted = appProgress.completed || false
      newProgress.uploadAccess = appProgress.completed || false
    }

    setApplicationProgress(newProgress)
  }

  // Load progress on mount and when location changes
  useEffect(() => {
    loadProgress()
  }, [location.pathname])

  // Also listen for storage changes (in case other tabs update progress)
  useEffect(() => {
    const handleStorageChange = () => {
      loadProgress()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Check if upload should be accessible
  const canAccessUpload = () => {
    return applicationProgress.uploadAccess
  }

  // Handle upload navigation with access control
  const handleUploadClick = () => {
    if (canAccessUpload()) {
      navigate('/upload')
    } else {
      alert('Please complete your application form first before accessing document upload.')
      navigate('/application')
    }
  }

  // Applicant Navigation
  const ApplicantNav = () => (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">MFI Portal</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => navigate('/application')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/application') 
                    ? 'bg-blue-700 text-white' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                📝 My Application
              </button>
              <button
                onClick={handleUploadClick}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  !canAccessUpload()
                    ? 'text-blue-300 cursor-not-allowed opacity-50'
                    : isActive('/upload')
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
                disabled={!canAccessUpload()}
                title={!canAccessUpload() ? 'Complete application form first' : 'Upload required documents'}
              >
                {!canAccessUpload() && <span className="mr-1">🔒</span>}
                {canAccessUpload() && <span className="mr-1">📄</span>}
                Upload Documents
              </button>
              <button
                onClick={() => alert('Application status coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
              >
                📈 Application Status
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-blue-100 text-sm">
              <div>Welcome, <span className="font-semibold">{user?.name}</span></div>
              <div className="text-xs text-blue-200 mt-1">
                {!applicationProgress.checklistCompleted && '📋 Complete checklist'}
                {applicationProgress.checklistCompleted && !applicationProgress.applicationFormCompleted && '📝 Start application form'}
                {applicationProgress.applicationFormCompleted && '📄 Ready to upload documents'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  // Registrar Navigation
  const RegistrarNav = () => (
    <nav className="bg-green-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">MFI Portal - Registrar</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-green-700 text-white' 
                    : 'text-green-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => alert('Applications review coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white transition-colors"
              >
                📋 Review Applications
              </button>
              <button
                onClick={() => alert('Document verification coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white transition-colors"
              >
                📄 Verify Documents
              </button>
              <button
                onClick={() => alert('Compliance monitoring coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white transition-colors"
              >
                ⚖️ Compliance Monitor
              </button>
              <button
                onClick={() => alert('Reports coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white transition-colors"
              >
                📊 Reports
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-green-100 text-sm">
              Registrar: <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  // Examiner Navigation
  const ExaminerNav = () => (
    <nav className="bg-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">MFI Portal - Examiner</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-purple-700 text-white' 
                    : 'text-purple-100 hover:bg-purple-700 hover:text-white'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => alert('Examination queue coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:bg-purple-700 hover:text-white transition-colors"
              >
                🔍 Examination Queue
              </button>
              <button
                onClick={() => alert('Document analysis coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:bg-purple-700 hover:text-white transition-colors"
              >
                📋 Document Analysis
              </button>
              <button
                onClick={() => alert('Compliance assessment coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:bg-purple-700 hover:text-white transition-colors"
              >
                ✅ Compliance Assessment
              </button>
              <button
                onClick={() => alert('Examination reports coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-purple-100 hover:bg-purple-700 hover:text-white transition-colors"
              >
                📝 Examination Reports
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-purple-100 text-sm">
              Examiner: <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  // Super User Navigation
  const SuperUserNav = () => (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">MFI Portal - Admin</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-100 hover:bg-gray-700 hover:text-white'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => alert('User management coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-100 hover:bg-gray-700 hover:text-white transition-colors"
              >
                👥 User Management
              </button>
              <button
                onClick={() => alert('System settings coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-100 hover:bg-gray-700 hover:text-white transition-colors"
              >
                ⚙️ System Settings
              </button>
              <button
                onClick={() => alert('Analytics coming soon!')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-100 hover:bg-gray-700 hover:text-white transition-colors"
              >
                📈 Analytics
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-gray-100 text-sm">
              Admin: <span className="font-semibold">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  // Render appropriate navigation based on user type
  if (!user) return null

  switch (user.user_type) {
    case 'applicant':
      return <ApplicantNav />
    case 'registrar':
      return <RegistrarNav />
    case 'examiner':
      return <ExaminerNav />
    case 'super_user':
      return <SuperUserNav />
    default:
      return <ApplicantNav />
  }
}

export default Navigation
