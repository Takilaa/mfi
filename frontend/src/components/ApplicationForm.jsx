import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ApplicationForm = ({ user }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Information
    institutionName: '',
    registrationNumber: '',
    physicalAddress: '',
    postalAddress: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',

    // Professional Services
    bankers: '',
    externalAuditor: '',
    legalAdvisor: '',

    // Board Information
    boardMembers: '',
    directorQualifications: '',
    boardCommittees: '',

    // Capital Information
    shareCapital: '',
    shareholderInfo: '',
    sourceOfCapital: '',

    // Declaration
    declarationAccepted: false
  })

  const [errors, setErrors] = useState({})

  // Check if user has completed checklist
  useEffect(() => {
    const checklistProgress = localStorage.getItem('mfi_checklist_progress')
    if (!checklistProgress) {
      navigate('/application')
      return
    }

    const checklist = JSON.parse(checklistProgress)
    const completedItems = Object.values(checklist).filter(Boolean).length
    const totalItems = Object.keys(checklist).length

    if (completedItems !== totalItems) {
      navigate('/application')
      return
    }
  }, [navigate])

  const steps = [
    { id: 1, title: 'Basic Information', completed: false },
    { id: 2, title: 'Professional Services', completed: false },
    { id: 3, title: 'Board & Governance', completed: false },
    { id: 4, title: 'Capital & Shareholding', completed: false },
    { id: 5, title: 'Review & Submit', completed: false }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required'
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required'
        if (!formData.physicalAddress.trim()) newErrors.physicalAddress = 'Physical address is required'
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        break

      case 2:
        if (!formData.bankers.trim()) newErrors.bankers = 'Banking information is required'
        if (!formData.externalAuditor.trim()) newErrors.externalAuditor = 'External auditor information is required'
        if (!formData.legalAdvisor.trim()) newErrors.legalAdvisor = 'Legal advisor information is required'
        break

      case 3:
        if (!formData.boardMembers.trim()) newErrors.boardMembers = 'Board members information is required'
        if (!formData.directorQualifications.trim()) newErrors.directorQualifications = 'Director qualifications are required'
        if (!formData.boardCommittees.trim()) newErrors.boardCommittees = 'Board committees information is required'
        break

      case 4:
        if (!formData.shareCapital.trim()) newErrors.shareCapital = 'Share capital information is required'
        if (!formData.shareholderInfo.trim()) newErrors.shareholderInfo = 'Shareholder information is required'
        if (!formData.sourceOfCapital.trim()) newErrors.sourceOfCapital = 'Source of capital is required'
        break

      case 5:
        if (!formData.declarationAccepted) newErrors.declarationAccepted = 'You must accept the declaration'
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Mark application form as completed
      const appProgress = {
        started: true,
        completed: true,
        submittedAt: new Date().toISOString(),
        formData: formData
      }
      localStorage.setItem('mfi_application_progress', JSON.stringify(appProgress))

      // Trigger storage event for navigation to update
      window.dispatchEvent(new Event('storage'))

      // Show success message
      alert('🎉 Application submitted successfully! You can now proceed to upload documents.')

      // Navigate to upload page
      navigate('/upload')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏢 Institution Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter institution name"
                />
                {errors.institutionName && <p className="text-red-500 text-sm mt-1">{errors.institutionName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company registration number"
                />
                {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Address *
                </label>
                <textarea
                  value={formData.physicalAddress}
                  onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Head office physical address"
                />
                {errors.physicalAddress && <p className="text-red-500 text-sm mt-1">{errors.physicalAddress}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Address
                </label>
                <textarea
                  value={formData.postalAddress}
                  onChange={(e) => handleInputChange('postalAddress', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Postal address (if different)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Contact Person *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name of primary contact"
                />
                {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="official@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+263 XX XXX XXXX"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Business *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select business type</option>
                  <option value="credit-only">Credit Only Microfinance</option>
                  <option value="deposit-taking">Deposit Taking Microfinance</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🏦 Professional Services</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banking Relationships *
                </label>
                <textarea
                  value={formData.bankers}
                  onChange={(e) => handleInputChange('bankers', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List your banking relationships, account numbers, and contact details"
                />
                {errors.bankers && <p className="text-red-500 text-sm mt-1">{errors.bankers}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Auditor Information *
                </label>
                <textarea
                  value={formData.externalAuditor}
                  onChange={(e) => handleInputChange('externalAuditor', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name, contact details, and qualifications of your external auditor"
                />
                {errors.externalAuditor && <p className="text-red-500 text-sm mt-1">{errors.externalAuditor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Advisor Information *
                </label>
                <textarea
                  value={formData.legalAdvisor}
                  onChange={(e) => handleInputChange('legalAdvisor', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name, contact details, and qualifications of your legal advisor"
                />
                {errors.legalAdvisor && <p className="text-red-500 text-sm mt-1">{errors.legalAdvisor}</p>}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Board & Governance</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board of Directors *
                </label>
                <textarea
                  value={formData.boardMembers}
                  onChange={(e) => handleInputChange('boardMembers', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List all board members with their names, positions, qualifications, and contact details (minimum 3 directors required)"
                />
                {errors.boardMembers && <p className="text-red-500 text-sm mt-1">{errors.boardMembers}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director Qualifications *
                </label>
                <textarea
                  value={formData.directorQualifications}
                  onChange={(e) => handleInputChange('directorQualifications', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the qualifications, experience, and expertise of each director"
                />
                {errors.directorQualifications && <p className="text-red-500 text-sm mt-1">{errors.directorQualifications}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board Committees *
                </label>
                <textarea
                  value={formData.boardCommittees}
                  onChange={(e) => handleInputChange('boardCommittees', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the board committees (Audit, Risk, etc.) and their composition"
                />
                {errors.boardCommittees && <p className="text-red-500 text-sm mt-1">{errors.boardCommittees}</p>}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Capital & Shareholding</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Capital Structure *
                </label>
                <textarea
                  value={formData.shareCapital}
                  onChange={(e) => handleInputChange('shareCapital', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your authorized and paid-up share capital (minimum USD 25,000 required)"
                />
                {errors.shareCapital && <p className="text-red-500 text-sm mt-1">{errors.shareCapital}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareholder Information *
                </label>
                <textarea
                  value={formData.shareholderInfo}
                  onChange={(e) => handleInputChange('shareholderInfo', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List all shareholders with their names, share percentages, and ownership details"
                />
                {errors.shareholderInfo && <p className="text-red-500 text-sm mt-1">{errors.shareholderInfo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source of Capital *
                </label>
                <textarea
                  value={formData.sourceOfCapital}
                  onChange={(e) => handleInputChange('sourceOfCapital', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the source and proof of your capital funding"
                />
                {errors.sourceOfCapital && <p className="text-red-500 text-sm mt-1">{errors.sourceOfCapital}</p>}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Review & Declaration</h3>

            {/* Summary of entered information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Application Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Institution:</strong> {formData.institutionName || 'Not provided'}
                </div>
                <div>
                  <strong>Registration:</strong> {formData.registrationNumber || 'Not provided'}
                </div>
                <div>
                  <strong>Contact:</strong> {formData.contactPerson || 'Not provided'}
                </div>
                <div>
                  <strong>Email:</strong> {formData.email || 'Not provided'}
                </div>
                <div>
                  <strong>Business Type:</strong> {formData.businessType || 'Not provided'}
                </div>
                <div>
                  <strong>Share Capital:</strong> {formData.shareCapital ? 'Provided' : 'Not provided'}
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4">📜 Declaration</h4>
              <p className="text-gray-700 mb-4">
                I hereby declare that all information provided in this application is true and accurate to the best of my knowledge.
                I understand that providing false information may result in the rejection of this application and potential legal consequences.
              </p>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={formData.declarationAccepted}
                  onChange={(e) => handleInputChange('declarationAccepted', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="declaration" className="text-sm text-gray-700 cursor-pointer">
                  I accept the declaration and confirm that all provided information is accurate and complete.
                </label>
              </div>
              {errors.declarationAccepted && <p className="text-red-500 text-sm mt-2">{errors.declarationAccepted}</p>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 MFI License Application Form</h1>
              <p className="text-gray-600 mt-2">Complete your application for a Microfinance Institution License</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Step {currentStep} of {steps.length}</div>
              <div className="text-lg font-semibold text-blue-600">{steps[currentStep - 1].title}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {steps.map((step, index) => (
                <span key={step.id} className={index + 1 <= currentStep ? 'text-blue-600 font-semibold' : ''}>
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm
