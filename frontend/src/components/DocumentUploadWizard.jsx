import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { cn } from '../utils/cn';
import { aiExtractor } from '../utils/aiExtractor';
import { enhancedAIExtractor } from '../utils/enhancedAIExtractor';
import AIExtractionDisplay from './AIExtractionDisplay';

const DOCUMENT_CATEGORIES = [
  {
    id: 'corporate_registration',
    name: 'Corporate & Registration Documents',
    description: 'Company registration, incorporation documents, and corporate resolutions',
    icon: '🏢',
    documents: [
      {
        type: 'CR6',
        name: 'Certificate of Incorporation',
        description: 'Official certificate showing company incorporation details',
        mandatory: true,
        tooltip: 'Required: Company name, registration number, incorporation date'
      },
      {
        type: 'CR11',
        name: 'Return of Allotment of Shares',
        description: 'Details of share allotment and shareholding structure',
        mandatory: true,
        tooltip: 'Required: Shareholder names, share allocations, capital contributions'
      },
      {
        type: 'CR14',
        name: 'Annual Return',
        description: 'Latest annual return filed with registrar',
        mandatory: true,
        tooltip: 'Required: Current company status, directors, registered address'
      },
      {
        type: 'ARTICLES',
        name: 'Articles of Association',
        description: 'Company constitution and governance rules',
        mandatory: true,
        tooltip: 'Required: Company objectives, governance structure, share rights'
      }
    ]
  },
  {
    id: 'ownership_capital',
    name: 'Ownership & Capital Documents',
    description: 'Shareholding structure, capital statements, and ownership verification',
    icon: '💰',
    documents: [
      {
        type: 'SHARE_REGISTER',
        name: 'Share Register',
        description: 'Complete register of all shareholders',
        mandatory: true,
        tooltip: 'Required: All shareholders, share numbers, transfer dates'
      },
      {
        type: 'NET_WORTH',
        name: 'Net Worth Statements',
        description: 'Personal net worth statements of major shareholders',
        mandatory: true,
        tooltip: 'Required: Assets, liabilities, net worth calculations'
      },
      {
        type: 'CAPITAL_PROOF',
        name: 'Proof of Capital Contribution',
        description: 'Bank statements showing capital injections',
        mandatory: true,
        tooltip: 'Required: Bank transfers, deposit slips, capital receipts'
      }
    ]
  },
  {
    id: 'governance_personnel',
    name: 'Governance & Personnel Documents',
    description: 'Board composition, management team, and personnel qualifications',
    icon: '👥',
    documents: [
      {
        type: 'BOARD_RESOLUTION',
        name: 'Board Resolutions',
        description: 'Key board resolutions and appointments',
        mandatory: true,
        tooltip: 'Required: Director appointments, key decisions, authorizations'
      },
      {
        type: 'CVS',
        name: 'CVs of Key Personnel',
        description: 'Detailed CVs of directors and senior management',
        mandatory: true,
        tooltip: 'Required: Education, experience, professional qualifications'
      },
      {
        type: 'VETTING',
        name: 'Vetting Results',
        description: 'Background checks and fit & proper assessments',
        mandatory: true,
        tooltip: 'Required: Criminal background, financial history, references'
      },
      {
        type: 'ID_COPIES',
        name: 'ID Copies',
        description: 'Identity documents of all directors',
        mandatory: true,
        tooltip: 'Required: National IDs, passports, proof of address'
      }
    ]
  },
  {
    id: 'financial_operational',
    name: 'Financial & Operational Documents',
    description: 'Financial statements, projections, and operational procedures',
    icon: '📊',
    documents: [
      {
        type: 'AUDITED_ACCOUNTS',
        name: 'Audited Financial Statements',
        description: 'Latest audited financial statements (3 years)',
        mandatory: true,
        tooltip: 'Required: Balance sheet, P&L, cash flow, auditor report'
      },
      {
        type: 'PROJECTIONS',
        name: 'Financial Projections',
        description: '3-year business plan and financial projections',
        mandatory: true,
        tooltip: 'Required: Revenue forecasts, expense budgets, cash flow projections'
      },
      {
        type: 'INSURANCE',
        name: 'Insurance Policies',
        description: 'Professional indemnity and other insurance coverage',
        mandatory: false,
        tooltip: 'Recommended: Professional indemnity, public liability, key person'
      },
      {
        type: 'PROCEDURES',
        name: 'Operational Procedures',
        description: 'Loan policies, risk management, and operational manuals',
        mandatory: true,
        tooltip: 'Required: Credit policy, risk framework, operational procedures'
      }
    ]
  }
];

export default function DocumentUploadWizard({ applicationId, onProgress }) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [processingStatus, setProcessingStatus] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [aiMode, setAiMode] = useState('enhanced'); // 'basic' or 'enhanced'

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles, documentType) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const category = DOCUMENT_CATEGORIES[currentCategory];

    // Update upload status
    const docKey = `${category.id}_${documentType}`;
    setUploadedDocuments(prev => ({
      ...prev,
      [docKey]: {
        file,
        name: file.name,
        size: file.size,
        type: documentType,
        category: category.id,
        uploadedAt: new Date()
      }
    }));

    // Set processing status
    setProcessingStatus(prev => ({
      ...prev,
      [docKey]: 'processing'
    }));

    try {
      // Perform AI extraction using selected mode
      const extractor = aiMode === 'enhanced' ? enhancedAIExtractor : aiExtractor;
      const extractionResult = await extractor.extractFromFile(file, documentType);

      if (extractionResult.success) {
        // Update processing status to completed
        setProcessingStatus(prev => ({
          ...prev,
          [docKey]: 'completed'
        }));

        // Store extracted data
        setExtractedData(prev => ({
          ...prev,
          [docKey]: {
            ...extractionResult.data,
            validation: aiExtractor.validateExtraction(extractionResult.data)
          }
        }));

        console.log('AI Extraction completed:', extractionResult.data);
      } else {
        // Handle extraction failure
        setProcessingStatus(prev => ({
          ...prev,
          [docKey]: 'error'
        }));

        console.error('AI Extraction failed:', extractionResult.error);
      }

      // Update progress
      calculateProgress();

    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus(prev => ({
        ...prev,
        [docKey]: 'error'
      }));
    }
  }, [currentCategory, applicationId]);

  // AI extraction refresh function
  const refreshExtraction = async (docKey) => {
    const uploaded = uploadedDocuments[docKey];
    if (!uploaded) return;

    setProcessingStatus(prev => ({
      ...prev,
      [docKey]: 'processing'
    }));

    try {
      const extractor = aiMode === 'enhanced' ? enhancedAIExtractor : aiExtractor;
      const extractionResult = await extractor.extractFromFile(uploaded.file, uploaded.type);

      if (extractionResult.success) {
        setProcessingStatus(prev => ({
          ...prev,
          [docKey]: 'completed'
        }));

        setExtractedData(prev => ({
          ...prev,
          [docKey]: {
            ...extractionResult.data,
            validation: aiExtractor.validateExtraction(extractionResult.data)
          }
        }));
      } else {
        setProcessingStatus(prev => ({
          ...prev,
          [docKey]: 'error'
        }));
      }
    } catch (error) {
      console.error('Refresh extraction error:', error);
      setProcessingStatus(prev => ({
        ...prev,
        [docKey]: 'error'
      }));
    }
  };

  // Validate extraction manually
  const validateExtraction = (docKey) => {
    const extracted = extractedData[docKey];
    if (extracted) {
      const validation = aiExtractor.validateExtraction(extracted);
      setExtractedData(prev => ({
        ...prev,
        [docKey]: {
          ...extracted,
          validation
        }
      }));

      alert(validation.isValid
        ? '✅ Validation passed! Extraction appears accurate.'
        : `⚠️ Validation found issues: ${validation.issues.join(', ')}`
      );
    }
  };

  const calculateProgress = () => {
    const totalRequired = DOCUMENT_CATEGORIES.reduce((sum, category) => 
      sum + category.documents.filter(doc => doc.mandatory).length, 0
    );
    
    const uploaded = Object.keys(uploadedDocuments).length;
    const progress = (uploaded / totalRequired) * 100;
    
    onProgress?.(progress);
  };

  const DocumentSlot = ({ document, category }) => {
    const docKey = `${category.id}_${document.type}`;
    const uploaded = uploadedDocuments[docKey];
    const status = processingStatus[docKey];
    const extracted = extractedData[docKey];

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files, rejected) => onDrop(files, rejected, document.type),
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'image/*': ['.png', '.jpg', '.jpeg']
      },
      maxFiles: 1,
      disabled: !!uploaded
    });

    const getStatusIcon = () => {
      switch (status) {
        case 'uploading':
          return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
        case 'processing':
          return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
        case 'completed':
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'error':
          return <AlertCircle className="w-5 h-5 text-red-500" />;
        default:
          return <Upload className="w-5 h-5 text-gray-400" />;
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'uploading':
          return 'Uploading...';
        case 'processing':
          return 'AI Processing...';
        case 'completed':
          return 'Processed ✓';
        case 'error':
          return 'Error ✗';
        default:
          return uploaded ? 'Uploaded' : 'Click to upload';
      }
    };

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              {document.name}
              {document.mandatory && <span className="text-red-500 text-xs">*</span>}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
          </div>
          <div className="ml-4 text-right">
            {getStatusIcon()}
            <p className="text-xs text-gray-500 mt-1">{getStatusText()}</p>
          </div>
        </div>

        {!uploaded ? (
          <div
            {...getRootProps()}
            className={cn(
              "border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50 transition-colors",
              isDragActive && "border-primary-500 bg-primary-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop file here' : 'Drop file or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, Images</p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{uploaded.name}</p>
                <p className="text-xs text-gray-500">
                  {(uploaded.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedDocuments(prev => {
                    const newState = { ...prev };
                    delete newState[docKey];
                    return newState;
                  });
                  setProcessingStatus(prev => {
                    const newState = { ...prev };
                    delete newState[docKey];
                    return newState;
                  });
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            
            {extracted && status === 'completed' && (
              <div className="mt-4">
                <AIExtractionDisplay
                  extractedData={extracted}
                  documentType={document.type}
                  fileName={uploaded.name}
                  onRefresh={() => refreshExtraction(docKey)}
                  onValidate={() => validateExtraction(docKey)}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-800">AI will extract:</p>
          <p className="text-xs text-blue-700">{document.tooltip}</p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Upload document to see AI extraction results
          </p>
        </div>
      </div>
    );
  };

  const currentCategoryData = DOCUMENT_CATEGORIES[currentCategory];
  const totalUploaded = Object.keys(uploadedDocuments).length;
  const totalRequired = DOCUMENT_CATEGORIES.reduce((sum, cat) => 
    sum + cat.documents.filter(doc => doc.mandatory).length, 0
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Upload Wizard</h1>
        <p className="text-gray-600">Upload your MFI licensing documents. AI will automatically extract and pre-fill your application.</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {totalUploaded} of {totalRequired} required documents</span>
            <span>{Math.round((totalUploaded / totalRequired) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalUploaded / totalRequired) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {DOCUMENT_CATEGORIES.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setCurrentCategory(index)}
            className={cn(
              "flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors",
              currentCategory === index
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{category.icon}</span>
              <span className="hidden sm:inline">{category.name}</span>
            </div>
          </button>
        ))}
      </div>

              {/* Current Category */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentCategoryData.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentCategoryData.name}</h2>
            <p className="text-gray-600">{currentCategoryData.description}</p>
          </div>
        </div>

        {/* AI Processing Status & Mode Selector */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  {aiMode === 'enhanced' ? '🤖 Enhanced AI Processing' : '🔍 Pattern-Based Processing'}
                </span>
              </div>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {Object.keys(uploadedDocuments).length} documents processed
              </span>
            </div>

            {/* AI Mode Selector */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-blue-700">Processing Mode:</label>
                <select
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                  className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                >
                  <option value="enhanced">🤖 Enhanced AI</option>
                  <option value="basic">🔍 Basic Patterns</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-600">
            {aiMode === 'enhanced'
              ? '💡 Enhanced AI uses context awareness, learning algorithms, and advanced pattern matching for better accuracy'
              : '💡 Basic mode uses simple regex patterns for reliable, fast processing'
            }
          </div>
        </div>

        {/* Document Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentCategoryData.documents.map((document) => (
            <DocumentSlot
              key={document.type}
              document={document}
              category={currentCategoryData}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={() => setCurrentCategory(Math.max(0, currentCategory - 1))}
          disabled={currentCategory === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Category
        </button>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50">
            <Download className="w-4 h-4" />
            Download Checklist
          </button>
          
          {currentCategory < DOCUMENT_CATEGORIES.length - 1 ? (
            <button
              onClick={() => setCurrentCategory(currentCategory + 1)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Next Category →
            </button>
          ) : (
            <button
              disabled={totalUploaded < totalRequired}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
