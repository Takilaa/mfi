import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const RBZApplicationForm = ({ user }) => {
  const navigate = useNavigate()

  // Load checklist state from localStorage
  const loadChecklistState = () => {
    const saved = localStorage.getItem('mfi_checklist_progress')
    if (saved) {
      return JSON.parse(saved)
    }
    return {
      // Institution Information
      institutionName: false,
      registrationNumber: false,
      physicalAddress: false,
      postalAddress: false,
      contactPerson: false,
      emailAddress: false,
      phoneNumbers: false,
      businessType: false,

      // Professional Services
      bankers: false,
      externalAuditor: false,
      legalAdvisor: false,
      professionalCertifications: false,

      // Board & Governance
      boardMembers: false,
      directorQualifications: false,
      boardCommittees: false,
      governancePolicies: false,

      // Capital & Shareholding
      shareCapital: false,
      shareholderInfo: false,
      sourceOfCapital: false,
      beneficialOwnership: false,

      // Required Documents
      certificateIncorporation: false,
      memorandumArticles: false,
      taxClearance: false,
      auditedFinancials: false,
      businessPlan: false,
      policyManuals: false
    }
  }

  const [checklistItems, setChecklistItems] = useState(loadChecklistState)

  const applicationChecklist = [
    {
      category: "🏢 Institution Information",
      items: [
        { id: 'institutionName', label: 'Institution name and legal structure', required: true },
        { id: 'registrationNumber', label: 'Company registration number', required: true },
        { id: 'physicalAddress', label: 'Physical address of head office', required: true },
        { id: 'postalAddress', label: 'Postal address', required: true },
        { id: 'contactPerson', label: 'Primary contact person details', required: true },
        { id: 'emailAddress', label: 'Official email address', required: true },
        { id: 'phoneNumbers', label: 'Contact telephone numbers', required: true },
        { id: 'businessType', label: 'Type of microfinance business', required: true }
      ]
    },
    {
      category: "🏦 Professional Services",
      items: [
        { id: 'bankers', label: 'Banking relationships and account details', required: true },
        { id: 'externalAuditor', label: 'External auditor information and contact', required: true },
        { id: 'legalAdvisor', label: 'Legal advisor details', required: true },
        { id: 'professionalCertifications', label: 'Professional certifications and licenses', required: false }
      ]
    },
    {
      category: "👥 Board & Governance",
      items: [
        { id: 'boardMembers', label: 'Board of directors (minimum 3 members)', required: true },
        { id: 'directorQualifications', label: 'Director qualifications and experience', required: true },
        { id: 'boardCommittees', label: 'Board committees structure', required: true },
        { id: 'governancePolicies', label: 'Corporate governance policies', required: true }
      ]
    },
    {
      category: "💰 Capital & Shareholding",
      items: [
        { id: 'shareCapital', label: 'Share capital structure (minimum USD 25,000)', required: true },
        { id: 'shareholderInfo', label: 'Shareholder information and ownership percentages', required: true },
        { id: 'sourceOfCapital', label: 'Source of capital and funding proof', required: true },
        { id: 'beneficialOwnership', label: 'Beneficial ownership disclosure', required: true }
      ]
    },
    {
      category: "📄 Required Documents",
      items: [
        { id: 'certificateIncorporation', label: 'Certificate of Incorporation', required: true },
        { id: 'memorandumArticles', label: 'Memorandum & Articles of Association', required: true },
        { id: 'taxClearance', label: 'ZIMRA tax clearance certificate', required: true },
        { id: 'auditedFinancials', label: 'Audited financial statements (2 years)', required: true },
        { id: 'businessPlan', label: 'Comprehensive business plan', required: true },
        { id: 'policyManuals', label: 'Credit and operational policy manuals', required: true }
      ]
    }
  ]

  const handleChecklistChange = (itemId) => {
    setChecklistItems(prev => {
      const newState = {
        ...prev,
        [itemId]: !prev[itemId]
      }
      // Save to localStorage
      localStorage.setItem('mfi_checklist_progress', JSON.stringify(newState))
      return newState
    })
  }

  const getCompletedCount = () => {
    return Object.values(checklistItems).filter(Boolean).length
  }

  const getTotalCount = () => {
    return Object.keys(checklistItems).length
  }

  const getProgressPercentage = () => {
    return Math.round((getCompletedCount() / getTotalCount()) * 100)
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('MFI License Application Preparation Checklist', 20, 30)

    // Add subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Reserve Bank of Zimbabwe - Microfinance Institution License', 20, 40)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50)

    // Add progress summary
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Progress: ${getProgressPercentage()}% (${getCompletedCount()}/${getTotalCount()} items completed)`, 20, 65)

    let yPosition = 80

    // Add each section
    applicationChecklist.forEach((section) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 30
      }

      // Section header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(section.category, 20, yPosition)
      yPosition += 10

      // Section items
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      section.items.forEach((item) => {
        const status = checklistItems[item.id] ? '✓' : '☐'
        const required = item.required ? '(Required)' : '(Optional)'
        const text = `${status} ${item.label} ${required}`

        // Wrap long text
        const lines = doc.splitTextToSize(text, 170)
        lines.forEach((line) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(line, 25, yPosition)
          yPosition += 6
        })
        yPosition += 2
      })

      yPosition += 10
    })

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(`Page ${i} of ${pageCount}`, 20, 285)
      doc.text('MFI Portal - Application Preparation Checklist', 120, 285)
    }

    // Save the PDF
    doc.save('MFI_Application_Checklist.pdf')
  }

  const getCategoryProgress = (categoryItems) => {
    const categoryIds = categoryItems.map(item => item.id)
    const completed = categoryIds.filter(id => checklistItems[id]).length
    return Math.round((completed / categoryIds.length) * 100)
  }

  const resetChecklist = () => {
    const confirmed = window.confirm('Are you sure you want to reset your checklist progress? This action cannot be undone.')
    if (confirmed) {
      const resetState = {
        institutionName: false,
        registrationNumber: false,
        physicalAddress: false,
        postalAddress: false,
        contactPerson: false,
        emailAddress: false,
        phoneNumbers: false,
        businessType: false,
        bankers: false,
        externalAuditor: false,
        legalAdvisor: false,
        professionalCertifications: false,
        boardMembers: false,
        directorQualifications: false,
        boardCommittees: false,
        governancePolicies: false,
        shareCapital: false,
        shareholderInfo: false,
        sourceOfCapital: false,
        beneficialOwnership: false,
        certificateIncorporation: false,
        memorandumArticles: false,
        taxClearance: false,
        auditedFinancials: false,
        businessPlan: false,
        policyManuals: false
      }
      setChecklistItems(resetState)
      localStorage.setItem('mfi_checklist_progress', JSON.stringify(resetState))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📋 MFI License Application Preparation
              </h1>
              <p className="text-gray-600 text-lg">
                Before you start your application, please ensure you have gathered all required information and documents.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <div className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</div>
              <div className="text-sm text-gray-500">{getCompletedCount()}/{getTotalCount()} items</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePDF}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📄 Download PDF Checklist
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🖨️ Print Checklist
            </button>
            <button
              onClick={resetChecklist}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Reset Progress
            </button>
          </div>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {applicationChecklist.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.category}
                </h2>
                <div className="text-sm text-gray-500">
                  {getCategoryProgress(section.items)}% complete
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={checklistItems[item.id]}
                      onChange={() => handleChecklistChange(item.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={item.id}
                      className={`text-sm cursor-pointer flex-1 ${
                        checklistItems[item.id] ? 'text-gray-600 line-through' : 'text-gray-900'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {item.required && (
                        <span className="ml-2 text-red-500 text-xs font-semibold">REQUIRED</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Start Your Application?
            </h3>
            <p className="text-gray-600 mb-6">
              Once you've gathered all the required information and documents, you can proceed to the application form.
            </p>

            <div className="text-center">
              <button
                disabled={getProgressPercentage() < 100}
                className={`px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${
                  getProgressPercentage() === 100
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (getProgressPercentage() === 100) {
                    // Mark application form as started
                    const appProgress = {
                      started: true,
                      completed: false,
                      timestamp: new Date().toISOString()
                    }
                    localStorage.setItem('mfi_application_progress', JSON.stringify(appProgress))

                    // Navigate to application form
                    navigate('/application-form')
                  }
                }}
              >
                📝 Start Application Form
              </button>

              {getProgressPercentage() < 100 && (
                <p className="text-sm text-gray-500 mt-4">
                  Complete all required items above to proceed to the application form
                </p>
              )}

              {getProgressPercentage() === 100 && (
                <p className="text-sm text-green-600 mt-4">
                  🎉 Great! You're ready to fill out the official application form
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RBZApplicationForm
