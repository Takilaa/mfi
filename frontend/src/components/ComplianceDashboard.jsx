import React, { useState, useEffect } from 'react'
import { validateCompliance, generateComplianceReport } from '../utils/complianceValidator'

const ComplianceDashboard = ({ applicationData, uploadedDocuments }) => {
  const [complianceResults, setComplianceResults] = useState(null)
  const [complianceReport, setComplianceReport] = useState(null)

  useEffect(() => {
    if (applicationData) {
      const results = validateCompliance(applicationData)
      const report = generateComplianceReport(results)
      setComplianceResults(results)
      setComplianceReport(report)
    }
  }, [applicationData])

  if (!complianceResults || !complianceReport) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing compliance requirements...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'partial': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return '✅'
      case 'failed': return '❌'
      case 'partial': return '⚠️'
      default: return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RBZ Compliance Dashboard</h1>
              <p className="text-gray-600">Reserve Bank of Zimbabwe - Credit-Only Microfinance Institution Licensing</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(complianceReport.summary.overallStatus)}`}>
                {getStatusIcon(complianceReport.summary.overallStatus)} {complianceReport.summary.overallStatus.toUpperCase()}
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600">
                {complianceReport.summary.compliancePercentage}%
              </div>
              <div className="text-sm text-gray-500">Compliance</div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-green-600">{complianceReport.summary.passed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{complianceReport.summary.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceReport.summary.warnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{complianceReport.summary.totalRequirements}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Categories */}
        <div className="space-y-6">
          {Object.keys(complianceReport.categories).map(categoryKey => {
            const category = complianceReport.categories[categoryKey]
            const categoryTitle = categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            
            return (
              <div key={categoryKey} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{categoryTitle}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(category.status)}`}>
                      {getStatusIcon(category.status)} {category.status.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {category.requirements.map((req, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStatusColor(req.status)}`}>
                          {getStatusIcon(req.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{req.description}</p>
                          {req.evidence && req.evidence.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">Evidence:</p>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {req.evidence.map((evidence, idx) => (
                                  <li key={idx}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        {complianceReport.recommendations.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Action Required</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                {complianceReport.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {rec.priority === 'high' ? '!' : '⚠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                      <p className="text-xs text-gray-500">Category: {rec.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Progress */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${complianceReport.summary.compliancePercentage}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium">{complianceReport.summary.compliancePercentage}% Complete</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplianceDashboard

