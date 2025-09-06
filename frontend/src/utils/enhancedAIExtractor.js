// Enhanced Document Extraction - Advanced Pattern Matching & Learning
// This simulates more AI-like behavior with learning capabilities and context awareness

export class EnhancedAIDocumentExtractor {
  constructor() {
    this.extractionPatterns = this.initializeAdvancedPatterns();
    this.learningData = this.loadLearningData();
    this.contextRules = this.initializeContextRules();
    this.confidenceThresholds = {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    };
  }

  initializeAdvancedPatterns() {
    return {
      // Advanced Personal Information Patterns with context
      name: {
        patterns: [
          /(?:name|full name|applicant name|director name|shareholder name)[\s:]*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
          /(?:mr|mrs|ms|dr)\.?\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
          /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g
        ],
        context: ['director', 'shareholder', 'applicant', 'officer'],
        weight: 0.9
      },

      // Enhanced Email Patterns
      email: {
        patterns: [
          /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
          /(?:email|e-mail|contact)[\s:]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
        ],
        context: ['contact', 'communication', 'official'],
        weight: 0.95
      },

      // Advanced Phone Number Patterns
      phone: {
        patterns: [
          /(?:phone|mobile|telephone|tel|cell)[\s#:]*([+]?[0-9\s\-\(\)]{10,15})/i,
          /([+]?[0-9]{3,4}[\s\-\(\)]*[0-9]{3,4}[\s\-\(\)]*[0-9]{3,4})/g
        ],
        context: ['contact', 'communication'],
        weight: 0.85
      },

      // Company Name with Legal Entity Recognition
      companyName: {
        patterns: [
          /(?:company name|institution name|organization name|business name)[\s:]*([A-Z][A-Za-z\s&\-\.]{3,50}(?:Ltd|Limited|Corporation|Corp|Inc|PLC|Pvt|Private|Company|Group|Holdings))/i,
          /([A-Z][A-Za-z\s&\-\.]{3,50}(?:Ltd|Limited|Corporation|Corp|Inc|PLC|Pvt|Private|Company|Group|Holdings))/g
        ],
        context: ['corporate', 'registration', 'incorporation'],
        weight: 0.9
      },

      // Registration Numbers with Format Validation
      registrationNumber: {
        patterns: [
          /(?:registration number|company number|cr number|incorporation number)[\s#:]*([A-Z]{0,3}[\s\-]?[\d]{4,8}[A-Z]?)/i,
          /([A-Z]{0,3}[\s\-]?[\d]{4,8}[A-Z]?)/g
        ],
        context: ['registration', 'incorporation', 'corporate'],
        weight: 0.95
      },

      // Advanced Currency and Amount Recognition
      currency: {
        patterns: [
          /([$]?[\d,]+(?:\.\d{2})?\s*(?:USD|US\$|ZWL|ZW\$|dollars?|million|billion))/gi,
          /(?:amount|total|sum|value)[\s:]*([$]?[\d,]+(?:\.\d{2})?\s*(?:USD|US\$|ZWL|ZW\$))/gi
        ],
        context: ['financial', 'capital', 'amount', 'value'],
        weight: 0.9
      },

      // Share Capital with Context
      shareCapital: {
        patterns: [
          /(?:share capital|authorized capital|paid capital)[\s:$]*([$]?[\d,]+\.?\d*\s*(?:USD|ZWL|dollars?|million))/i,
          /(?:capital|equity)[\s:]*([$]?[\d,]+\.?\d*\s*(?:USD|ZWL))/i
        ],
        context: ['capital', 'equity', 'share', 'financial'],
        weight: 0.9
      },

      // Date Recognition with Multiple Formats
      date: {
        patterns: [
          /(?:date|dated|issued|incorporation)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/g,
          /(?:date|dated|issued|incorporation)[\s:]*(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g,
          /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/gi
        ],
        context: ['date', 'issued', 'incorporation', 'registration'],
        weight: 0.85
      }
    };
  }

  initializeContextRules() {
    return {
      // Document type specific rules
      CR6: {
        primaryFields: ['companyName', 'registrationNumber', 'date'],
        secondaryFields: ['shareCapital', 'address'],
        keywords: ['certificate', 'incorporation', 'company', 'limited']
      },
      CR11: {
        primaryFields: ['shareholding', 'currency', 'date'],
        secondaryFields: ['companyName', 'percentage'],
        keywords: ['allotment', 'shares', 'capital', 'return']
      },
      AUDITED_ACCOUNTS: {
        primaryFields: ['companyName', 'currency', 'date'],
        secondaryFields: ['currency', 'companyName'],
        keywords: ['audited', 'financial', 'statements', 'accounts']
      },
      ID_COPIES: {
        primaryFields: ['name', 'idNumber', 'date'],
        secondaryFields: ['address', 'name'],
        keywords: ['identity', 'id', 'passport', 'national']
      }
    };
  }

  loadLearningData() {
    // Load previous extraction successes/failures from localStorage
    const stored = localStorage.getItem('ai_learning_data');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      successfulPatterns: {},
      failedPatterns: {},
      userCorrections: {},
      documentTypeAccuracy: {}
    };
  }

  saveLearningData() {
    localStorage.setItem('ai_learning_data', JSON.stringify(this.learningData));
  }

  // Enhanced extraction with context awareness
  extractWithContext(text, documentType) {
    const results = {};
    const contextRules = this.contextRules[documentType] || {};

    // Analyze document context
    const contextScore = this.analyzeDocumentContext(text, contextRules);

    // Extract each field type
    Object.entries(this.extractionPatterns).forEach(([fieldType, config]) => {
      const matches = this.extractFieldWithPatterns(text, config, contextRules);

      if (matches.length > 0) {
        // Apply context scoring
        const bestMatch = this.selectBestMatch(matches, config, contextScore);
        if (bestMatch) {
          results[fieldType] = {
            value: bestMatch.value,
            confidence: bestMatch.confidence * contextScore,
            pattern: bestMatch.pattern,
            context: bestMatch.context
          };
        }
      }
    });

    return results;
  }

  analyzeDocumentContext(text, rules) {
    if (!rules.keywords) return 0.8;

    const textLower = text.toLowerCase();
    const keywordMatches = rules.keywords.filter(keyword =>
      textLower.includes(keyword.toLowerCase())
    ).length;

    // Return context score based on keyword matches
    return Math.min(1.0, 0.6 + (keywordMatches / rules.keywords.length) * 0.4);
  }

  extractFieldWithPatterns(text, config, contextRules) {
    const matches = [];

    config.patterns.forEach((pattern, index) => {
      const regex = new RegExp(pattern);
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Check if match is in relevant context
        const contextScore = this.checkContextRelevance(text, match.index, config.context);

        matches.push({
          value: match[1] || match[0],
          confidence: config.weight * contextScore,
          pattern: `pattern_${index}`,
          context: contextScore,
          position: match.index
        });

        // Prevent infinite loops with global regex
        if (!regex.global) break;
      }
    });

    return matches;
  }

  checkContextRelevance(text, position, contextKeywords) {
    if (!contextKeywords || contextKeywords.length === 0) return 0.8;

    // Check surrounding text for context keywords
    const surroundingText = text.substring(Math.max(0, position - 100), position + 100).toLowerCase();
    const contextMatches = contextKeywords.filter(keyword =>
      surroundingText.includes(keyword.toLowerCase())
    ).length;

    return Math.min(1.0, 0.5 + (contextMatches / contextKeywords.length) * 0.5);
  }

  selectBestMatch(matches, config, contextScore) {
    if (matches.length === 0) return null;

    // Sort by confidence and context
    matches.sort((a, b) => (b.confidence * b.context) - (a.confidence * a.context));

    const bestMatch = matches[0];

    // Apply learning-based adjustments
    const adjustedConfidence = this.applyLearningAdjustments(bestMatch, config);

    return {
      ...bestMatch,
      confidence: Math.min(1.0, adjustedConfidence * contextScore)
    };
  }

  applyLearningAdjustments(match, config) {
    // Check if this pattern has been successful before
    const patternKey = `${config.type}_${match.pattern}`;
    const successRate = this.learningData.successfulPatterns[patternKey] || 0;
    const failureRate = this.learningData.failedPatterns[patternKey] || 0;
    const totalAttempts = successRate + failureRate;

    if (totalAttempts > 0) {
      const learnedConfidence = successRate / totalAttempts;
      // Blend original confidence with learned confidence
      return (match.confidence * 0.7) + (learnedConfidence * 0.3);
    }

    return match.confidence;
  }

  // Learning from user feedback
  learnFromUserCorrection(originalValue, correctedValue, fieldType, documentType) {
    // Store correction for future learning
    const key = `${documentType}_${fieldType}`;
    if (!this.learningData.userCorrections[key]) {
      this.learningData.userCorrections[key] = [];
    }

    this.learningData.userCorrections[key].push({
      original: originalValue,
      corrected: correctedValue,
      timestamp: new Date().toISOString()
    });

    this.saveLearningData();
  }

  // Main extraction method
  async extractFromFile(file, documentType) {
    try {
      // Read file content (simplified for demo)
      const text = await this.extractTextFromFile(file);

      // Extract with enhanced AI-like processing
      const extractedFields = this.extractWithContext(text, documentType);

      // Calculate overall confidence
      const fieldConfidences = Object.values(extractedFields).map(f => f.confidence);
      const averageConfidence = fieldConfidences.length > 0
        ? fieldConfidences.reduce((a, b) => a + b, 0) / fieldConfidences.length
        : 0;

      // Validate extraction
      const validation = this.validateExtraction(extractedFields, documentType);

      const result = {
        success: true,
        data: {
          fields: extractedFields,
          confidence: Math.round(averageConfidence * 100),
          documentType: documentType,
          extractionTimestamp: new Date().toISOString(),
          validation: validation,
          rawText: text
        }
      };

      // Update learning data based on success
      this.updateLearningData(result, documentType);

      return result;

    } catch (error) {
      console.error('Enhanced AI Extraction Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  async extractTextFromFile(file) {
    // Simplified text extraction (in real AI, this would use OCR, PDF parsing, etc.)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate text extraction with some mock content
        const mockText = `
          ${file.name.toUpperCase()}

          This document contains important information for processing.
          Generated content for AI extraction demonstration.

          Document Type: ${this.getDocumentType(file.name)}
          Processing Method: Enhanced Pattern Matching with Context Awareness
          Confidence Scoring: Dynamic based on pattern matching and context

          Note: This is a demonstration of AI-like behavior using advanced algorithms,
          not a true machine learning model.
        `;
        resolve(mockText);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  validateExtraction(fields, documentType) {
    const rules = this.contextRules[documentType];
    if (!rules) {
      return { isValid: true, issues: [], completeness: 80 };
    }

    const issues = [];
    let completeness = 100;

    // Check primary fields
    const missingPrimary = rules.primaryFields.filter(field => !fields[field]);
    if (missingPrimary.length > 0) {
      issues.push(`Missing primary fields: ${missingPrimary.join(', ')}`);
      completeness -= (missingPrimary.length / rules.primaryFields.length) * 30;
    }

    // Check field confidence levels
    Object.entries(fields).forEach(([field, data]) => {
      if (data.confidence < this.confidenceThresholds.low) {
        issues.push(`Low confidence for ${field}: ${Math.round(data.confidence * 100)}%`);
        completeness -= 10;
      }
    });

    return {
      isValid: issues.length === 0,
      issues: issues,
      completeness: Math.max(0, Math.round(completeness)),
      recommendations: this.generateRecommendations(issues, documentType)
    };
  }

  generateRecommendations(issues, documentType) {
    const recommendations = [];

    if (issues.some(issue => issue.includes('confidence'))) {
      recommendations.push('Consider uploading a higher quality version of the document');
    }

    if (issues.some(issue => issue.includes('Missing'))) {
      recommendations.push('Document may be incomplete - check if all required information is present');
    }

    recommendations.push('Verify extracted information matches the original document');
    recommendations.push('Contact support if extraction results seem incorrect');

    return recommendations;
  }

  updateLearningData(result, documentType) {
    // Update success/failure rates for patterns used
    if (result.success) {
      this.learningData.documentTypeAccuracy[documentType] =
        (this.learningData.documentTypeAccuracy[documentType] || 0) + 1;
    }

    this.saveLearningData();
  }

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
}

// Export enhanced extractor
export const enhancedAIExtractor = new EnhancedAIDocumentExtractor();

