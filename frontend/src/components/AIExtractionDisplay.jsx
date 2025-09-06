import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, Eye, EyeOff, Download, RefreshCw } from 'lucide-react'

const AIExtractionDisplay = ({ extractedData, documentType, fileName, onRefresh, onValidate }) => {
  const [showRawText, setShowRawText] = useState(false)

  if (!extractedData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center text-gray-500">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Processing document with AI...
        </div>
      </div>
    )
  }

  const { confidence, fields, completeness, missingFields, validation } = extractedData

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-green-600'
    if (conf >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (conf) => {
    if (conf >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (conf >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const formatFieldName = (fieldKey) => {
    const fieldNames = {
      name: 'Full Name',
      idNumber: 'ID Number',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      companyName: 'Company Name',
      registrationNumber: 'Registration Number',
      taxNumber: 'Tax Number',
      shareCapital: 'Share Capital',
      shareholding: 'Shareholding',
      date: 'Date',
      currency: 'Amount',
      percentage: 'Percentage'
    }
    return fieldNames[fieldKey] || fieldKey.replace(/([A-Z])/g, ' $1').trim()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getConfidenceIcon(confidence)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Analysis Results
                </h3>
                <p className="text-sm text-gray-600">{fileName}</p>
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-xs text-amber-800">
                    📝 Using pattern-matching algorithms (not true AI/ML model)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence)}% Confidence
            </div>
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              {showRawText ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showRawText ? 'Hide' : 'Show'} Raw Text
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900">Confidence Level</div>
            <div className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence)}%
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-900">Completeness</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(completeness)}%
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-900">Fields Found</div>
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(fields).length}
            </div>
          </div>
        </div>

        {/* Extracted Fields */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h4>

          {Object.keys(fields).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No information could be extracted from this document.</p>
              <p className="text-sm mt-2">Try uploading a clearer version or different format.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(fields).map(([fieldKey, fieldData]) => (
                <div key={fieldKey} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {formatFieldName(fieldKey)}
                    </label>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      fieldData.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                      fieldData.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(fieldData.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 font-mono bg-white p-2 rounded border">
                    {fieldData.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Fields Alert */}
        {missingFields && missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-yellow-800 mb-2">
                  Missing Required Information
                </h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index}>• {formatFieldName(field)}</li>
                  ))}
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  Consider uploading a different version of this document that contains this information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Results */}
        {validation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-medium text-blue-800 mb-2">
              Validation Results
            </h5>
            {validation.isValid ? (
              <div className="flex items-center text-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Document extraction appears valid</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center text-red-700 mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Issues found during validation</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1 ml-6">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {validation && validation.recommendations && validation.recommendations.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-medium text-indigo-800 mb-2">
              Recommendations
            </h5>
            <ul className="text-sm text-indigo-700 space-y-1">
              {validation.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw Text Display */}
        {showRawText && extractedData.rawText && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-800 mb-2">Raw Extracted Text</h5>
            <div className="text-xs font-mono text-gray-700 bg-white p-3 rounded border max-h-40 overflow-y-auto">
              {extractedData.rawText}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-extract
            </button>

            <button
              onClick={onValidate}
              className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate
            </button>
          </div>

          <button
            onClick={() => {
              const dataStr = JSON.stringify(extractedData, null, 2)
              const dataBlob = new Blob([dataStr], { type: 'application/json' })
              const url = URL.createObjectURL(dataBlob)
              const link = document.createElement('a')
              link.href = url
              link.download = `${fileName}_extraction.json`
              link.click()
              URL.revokeObjectURL(url)
            }}
            className="flex items-center px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIExtractionDisplay
