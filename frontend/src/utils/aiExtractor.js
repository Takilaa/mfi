// Document Extraction Utility - Rule-Based Pattern Matching
// This provides client-side document processing using pattern matching algorithms
// NOT a true AI/ML model - uses regex patterns and rule-based logic

export class AIDocumentExtractor {
  constructor() {
    this.extractionPatterns = {
      // Personal Information Patterns
      name: /(?:name|full name|applicant name|director name|shareholder name)[\s:]*([A-Z\s]+(?:[A-Z\s]+)?)/i,
      idNumber: /(?:id|identification|passport|national id|employee id)[\s#:]*([A-Z0-9\s-]+)/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      phone: /(?:phone|mobile|telephone|tel|cell)[\s#:]*([+]?[0-9\s\-\(\)]{10,15})/i,
      address: /(?:address|physical address|postal address|registered address)[\s:]*([^\n\r]{10,100})/i,

      // Company Information Patterns
      companyName: /(?:company name|institution name|organization name|business name)[\s:]*([A-Z\s&\-\.]{3,50})/i,
      registrationNumber: /(?:registration number|company number|cr number|incorporation number)[\s#:]*([A-Z0-9\s-]{5,20})/i,
      taxNumber: /(?:tax number|tin|vat number|tax id)[\s#:]*([A-Z0-9\s-]{5,20})/i,

      // Financial Information Patterns
      shareCapital: /(?:share capital|authorized capital|paid capital)[\s:$]*([$]?[\d,]+\.?\d*\s*(?:USD|ZWL|dollars?|million|billion)?)/i,
      shareholding: /(?:shareholding|ownership|shares)[\s:]*(\d+(?:\.\d+)?\s*percent|%|\d+(?:\.\d+)?\s*shares)/i,

      // Dates Patterns
      date: /(?:date|dated|issued|incorporation|registration)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g,

      // Amounts and Numbers
      currency: /([$]?[\d,]+\.?\d*\s*(?:USD|ZWL|dollars?|cents?|million|billion))/gi,
      percentage: /(\d+(?:\.\d+)?\s*percent|%)/gi
    };

    this.documentTypes = {
      'CR6': {
        name: 'Certificate of Incorporation',
        patterns: ['companyName', 'registrationNumber', 'date', 'shareCapital'],
        requiredFields: ['companyName', 'registrationNumber', 'date']
      },
      'CR11': {
        name: 'Return of Allotment',
        patterns: ['shareCapital', 'shareholding', 'currency', 'percentage'],
        requiredFields: ['shareCapital', 'shareholding']
      },
      'CR14': {
        name: 'Annual Return',
        patterns: ['companyName', 'registrationNumber', 'date', 'address'],
        requiredFields: ['companyName', 'registrationNumber']
      },
      'ARTICLES': {
        name: 'Articles of Association',
        patterns: ['companyName', 'shareCapital', 'address', 'date'],
        requiredFields: ['companyName']
      },
      'AUDITED_ACCOUNTS': {
        name: 'Audited Financial Statements',
        patterns: ['companyName', 'currency', 'date', 'shareCapital'],
        requiredFields: ['companyName', 'currency']
      },
      'ID_COPIES': {
        name: 'Identity Documents',
        patterns: ['name', 'idNumber', 'date', 'address'],
        requiredFields: ['name', 'idNumber']
      },
      'BANK_STATEMENT': {
        name: 'Bank Statement',
        patterns: ['companyName', 'currency', 'accountNumber', 'date'],
        requiredFields: ['companyName']
      },
      'CERTIFICATE_INCORPORATION': {
        name: 'Certificate of Incorporation',
        patterns: ['companyName', 'registrationNumber', 'date', 'shareCapital'],
        requiredFields: ['companyName', 'registrationNumber']
      }
    };
  }

  // Extract text from PDF file
  async extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For demo purposes, we'll create mock extracted text
          // In a real implementation, you'd use a PDF parsing library
          const mockText = this.generateMockText(file.name);
          resolve(mockText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Extract text from image file
  async extractTextFromImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For demo purposes, we'll create mock extracted text
          // In a real implementation, you'd use Tesseract.js for OCR
          const mockText = this.generateMockText(file.name);
          resolve(mockText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Extract text from DOC/DOCX file
  async extractTextFromDoc(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // For demo purposes, we'll create mock extracted text
          // In a real implementation, you'd use mammoth.js for DOCX parsing
          const mockText = this.generateMockText(file.name);
          resolve(mockText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Generate mock text for demo purposes
  generateMockText(filename) {
    const fileType = filename.toLowerCase();

    if (fileType.includes('cr6') || fileType.includes('incorporation')) {
      return `
        CERTIFICATE OF INCORPORATION

        Company Name: ZIMBABWE MICROFINANCE INSTITUTION LIMITED
        Registration Number: CR123456789
        Date of Incorporation: 15/03/2020
        Registered Office: 123 Main Street, Harare, Zimbabwe
        Authorized Share Capital: USD 100,000
        Paid-up Capital: USD 25,000
        Directors: John Doe, Jane Smith, Michael Johnson
      `;
    }

    if (fileType.includes('cr11') || fileType.includes('allotment')) {
      return `
        RETURN OF ALLOTMENT OF SHARES

        Company: ZIMBABWE MICROFINANCE INSTITUTION LIMITED
        CR Number: CR123456789
        Share Allotment Date: 20/03/2020

        Shareholder Details:
        1. John Doe - 40% shares - USD 10,000
        2. Jane Smith - 35% shares - USD 8,750
        3. Michael Johnson - 25% shares - USD 6,250

        Total Shares Issued: 100
        Par Value per Share: USD 250
        Total Capital: USD 25,000
      `;
    }

    if (fileType.includes('id') || fileType.includes('passport')) {
      return `
        NATIONAL IDENTITY CARD

        Full Name: JOHN DOE
        ID Number: 123456789A12
        Date of Birth: 15/05/1985
        Nationality: Zimbabwean
        Address: 456 Park Avenue, Harare, Zimbabwe
        Issued: 10/01/2015
        Expires: 10/01/2025
        Contact: +263 77 123 4567
        Email: john.doe@email.com
      `;
    }

    if (fileType.includes('bank') || fileType.includes('statement')) {
      return `
        BANK STATEMENT

        Account Holder: ZIMBABWE MICROFINANCE INSTITUTION LIMITED
        Account Number: 123456789012
        Bank: Stanbic Bank Zimbabwe
        Branch: Harare Main
        Period: January 2024 - March 2024

        Opening Balance: USD 50,000
        Deposits: USD 25,000
        Withdrawals: USD 15,000
        Closing Balance: USD 60,000

        Contact: +263 4 123456
        Email: info@stanbic.co.zw
      `;
    }

    if (fileType.includes('audit') || fileType.includes('financial')) {
      return `
        AUDITED FINANCIAL STATEMENTS

        ZIMBABWE MICROFINANCE INSTITUTION LIMITED
        For the year ended 31 December 2023

        BALANCE SHEET
        Assets: USD 150,000
        Liabilities: USD 75,000
        Equity: USD 75,000

        INCOME STATEMENT
        Revenue: USD 45,000
        Expenses: USD 30,000
        Net Profit: USD 15,000

        Auditors: Deloitte & Touche
        Audit Date: 15/03/2024
        Auditor Contact: +263 4 987654
      `;
    }

    // Default mock text
    return `
      ${filename.toUpperCase()}

      This is a sample document for ${filename}.
      Generated for demo purposes.

      Document Type: ${this.getDocumentType(filename)}
      Processing Date: ${new Date().toLocaleDateString()}

      For actual implementation, this would contain the real extracted text
      from the uploaded document using appropriate parsing libraries.
    `;
  }

  // Extract information using pattern matching
  extractInformation(text, documentType) {
    const extractedData = {
      confidence: 0,
      fields: {},
      rawText: text,
      documentType: this.getDocumentType(documentType),
      extractionTimestamp: new Date().toISOString()
    };

    // Get patterns for this document type
    const docTypeInfo = this.documentTypes[documentType];
    if (!docTypeInfo) {
      return extractedData;
    }

    let totalMatches = 0;
    let successfulMatches = 0;

    // Apply each pattern
    docTypeInfo.patterns.forEach(patternKey => {
      const pattern = this.extractionPatterns[patternKey];
      if (!pattern) return;

      const matches = text.match(pattern);
      if (matches) {
        // Take the first match (usually the most relevant)
        extractedData.fields[patternKey] = {
          value: matches[1] || matches[0],
          confidence: 0.8,
          pattern: patternKey
        };
        successfulMatches++;
      }
      totalMatches++;
    });

    // Calculate overall confidence
    if (totalMatches > 0) {
      extractedData.confidence = (successfulMatches / totalMatches) * 100;
    }

    // Check for required fields
    const requiredFields = docTypeInfo.requiredFields || [];
    const missingFields = requiredFields.filter(field => !extractedData.fields[field]);

    extractedData.missingFields = missingFields;
    extractedData.completeness = ((requiredFields.length - missingFields.length) / requiredFields.length) * 100;

    return extractedData;
  }

  // Main extraction function
  async extractFromFile(file, documentType) {
    try {
      let text = '';

      // Extract text based on file type
      if (file.type === 'application/pdf') {
        text = await this.extractTextFromPDF(file);
      } else if (file.type.includes('image/')) {
        text = await this.extractTextFromImage(file);
      } else if (file.type.includes('word') || file.type.includes('document')) {
        text = await this.extractTextFromDoc(file);
      } else {
        text = await this.extractTextFromPDF(file); // fallback
      }

      // Extract structured information
      const extractedData = this.extractInformation(text, documentType);

      return {
        success: true,
        data: extractedData,
        processingTime: Date.now()
      };

    } catch (error) {
      console.error('AI Extraction Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Get document type from filename
  getDocumentType(filename) {
    const name = filename.toLowerCase();

    if (name.includes('cr6') || name.includes('incorporation')) return 'CR6';
    if (name.includes('cr11') || name.includes('allotment')) return 'CR11';
    if (name.includes('cr14') || name.includes('annual')) return 'CR14';
    if (name.includes('articles')) return 'ARTICLES';
    if (name.includes('audit') || name.includes('financial')) return 'AUDITED_ACCOUNTS';
    if (name.includes('id') || name.includes('passport')) return 'ID_COPIES';
    if (name.includes('bank') || name.includes('statement')) return 'BANK_STATEMENT';

    return 'UNKNOWN';
  }

  // Validate extraction quality
  validateExtraction(extractedData) {
    const issues = [];

    if (extractedData.confidence < 50) {
      issues.push('Low confidence in extracted data');
    }

    if (extractedData.missingFields && extractedData.missingFields.length > 0) {
      issues.push(`Missing required fields: ${extractedData.missingFields.join(', ')}`);
    }

    if (extractedData.completeness < 70) {
      issues.push('Document appears incomplete');
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      recommendations: this.getRecommendations(extractedData)
    };
  }

  // Get recommendations for improving extraction
  getRecommendations(extractedData) {
    const recommendations = [];

    if (extractedData.confidence < 70) {
      recommendations.push('Consider uploading a clearer, higher quality document');
    }

    if (extractedData.missingFields && extractedData.missingFields.length > 0) {
      recommendations.push('Document may be missing some required information');
    }

    recommendations.push('Verify extracted information matches the original document');
    recommendations.push('Contact support if extraction appears incorrect');

    return recommendations;
  }
}

// Export singleton instance
export const aiExtractor = new AIDocumentExtractor();
