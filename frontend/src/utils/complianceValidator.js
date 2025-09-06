// RBZ Compliance Validation System for Credit-Only Microfinance Institutions
// This system validates applications against the Reserve Bank of Zimbabwe requirements

export const RBZ_REQUIREMENTS = {
  // 1. General Requirements
  general: {
    applicationFee: {
      required: true,
      description: "Proof of payment of application fee (ZWL equivalent of USD 300)",
      validation: (data) => {
        return data.applicationFee && data.applicationFee.amount >= 300
      }
    },
    completedForm: {
      required: true,
      description: "Completed official application form",
      validation: (data) => {
        return data.institutionName && data.applicationType && data.physicalAddress
      }
    },
    incorporationDocs: {
      required: true,
      description: "Certified copies of Certificate of Incorporation, Memorandum & Articles of Association",
      validation: (data) => {
        return data.documents && data.documents.includes('certificate-of-incorporation') &&
               data.documents.includes('memorandum-articles')
      }
    },
    registerOfMembers: {
      required: true,
      description: "Register of members (names, addresses, occupations, shareholding)",
      validation: (data) => {
        return data.shareholders && data.shareholders.length >= 4
      }
    },
    keyPersonnel: {
      required: true,
      description: "Names & particulars of directors, CEO, CFO, and key officers",
      validation: (data) => {
        return data.chiefExecutiveOfficer && data.directors && data.directors.length >= 3
      }
    },
    capitalProof: {
      required: true,
      description: "Proof of authorized and paid-up capital (Form CR11)",
      validation: (data) => {
        return data.documents && data.documents.includes('cr11') &&
               data.paidUpCapital && data.paidUpCapital >= 25000
      }
    },
    bankStatement: {
      required: true,
      description: "Bank statement showing minimum paid-up share capital",
      validation: (data) => {
        return data.documents && data.documents.includes('bank-statement')
      }
    },
    cr6Form: {
      required: true,
      description: "Certified Form CR6 (proposed directors)",
      validation: (data) => {
        return data.documents && data.documents.includes('cr6')
      }
    },
    zimraRegistration: {
      required: true,
      description: "Proof of ZIMRA registration (tax clearance)",
      validation: (data) => {
        return data.documents && data.documents.includes('tax-clearance')
      }
    },
    businessPlan: {
      required: true,
      description: "Business Plan with 3-year projections",
      validation: (data) => {
        return data.documents && data.documents.includes('business-plan')
      }
    },
    leaseAgreements: {
      required: true,
      description: "Lease agreements for head office & branches",
      validation: (data) => {
        return data.documents && data.documents.includes('lease-agreements')
      }
    }
  },

  // 2. Shareholding Thresholds
  shareholding: {
    financialEntityLimit: {
      required: true,
      description: "Financial entity shareholding ≤ 100%",
      validation: (data) => {
        if (!data.shareholders) return false
        const financialEntityShares = data.shareholders
          .filter(s => s.entityType === 'financial')
          .reduce((sum, s) => sum + parseFloat(s.ownership || 0), 0)
        return financialEntityShares <= 100
      }
    },
    individualLimit: {
      required: true,
      description: "Any other person shareholding ≤ 25%",
      validation: (data) => {
        if (!data.shareholders) return false
        return data.shareholders.every(s => {
          if (s.entityType === 'individual') {
            return parseFloat(s.ownership || 0) <= 25
          }
          return true
        })
      }
    },
    managementLimit: {
      required: true,
      description: "Executive management shareholding ≤ 5%",
      validation: (data) => {
        if (!data.shareholders) return false
        return data.shareholders.every(s => {
          if (s.isManagement) {
            return parseFloat(s.ownership || 0) <= 5
          }
          return true
        })
      }
    },
    vettingRequired: {
      required: true,
      description: "Vetting required for ≥ 5% shareholders",
      validation: (data) => {
        if (!data.shareholders) return false
        const largeShareholders = data.shareholders.filter(s => parseFloat(s.ownership || 0) >= 5)
        return largeShareholders.every(s => s.vettingCompleted)
      }
    },
    ultimateBeneficiary: {
      required: true,
      description: "Affidavit of ultimate beneficiary ownership",
      validation: (data) => {
        return data.documents && data.documents.includes('ultimate-beneficiary-affidavit')
      }
    },
    sourceOfWealth: {
      required: true,
      description: "Disclosure of source of wealth/capital",
      validation: (data) => {
        if (!data.shareholders) return false
        return data.shareholders.every(s => s.sourceOfWealth)
      }
    },
    corporateShareholders: {
      required: true,
      description: "Corporate shareholders ≥ 5%: audited financials, M&A, tax clearance",
      validation: (data) => {
        if (!data.shareholders) return false
        const corporateShareholders = data.shareholders.filter(s => 
          s.entityType === 'corporate' && parseFloat(s.ownership || 0) >= 5
        )
        return corporateShareholders.every(s => 
          s.auditedFinancials && s.certificateOfIncorporation && s.taxClearance
        )
      }
    },
    foreignShareholders: {
      required: true,
      description: "Foreign shareholders: ZIDA approval + Exchange Control registration",
      validation: (data) => {
        if (!data.shareholders) return false
        const foreignShareholders = data.shareholders.filter(s => s.nationality !== 'Zimbabwean')
        return foreignShareholders.every(s => s.zidaApproval && s.exchangeControlRegistration)
      }
    }
  },

  // 3. Capital Requirements
  capital: {
    minimumCapital: {
      required: true,
      description: "Minimum paid-up share capital: ZWL equivalent of USD 25,000",
      validation: (data) => {
        return data.paidUpCapital && data.paidUpCapital >= 25000
      }
    },
    capitalEvidence: {
      required: true,
      description: "Evidence: bank statements, investment redemption statements, CR10/CR8/CR11",
      validation: (data) => {
        return data.documents && (
          data.documents.includes('bank-statement') ||
          data.documents.includes('investment-statements') ||
          data.documents.includes('cr10') ||
          data.documents.includes('cr8') ||
          data.documents.includes('cr11')
        )
      }
    },
    antiMoneyLaundering: {
      required: true,
      description: "Sworn statement: funds not from money laundering/illicit activities",
      validation: (data) => {
        return data.documents && data.documents.includes('anti-money-laundering-statement')
      }
    },
    foreignInvestors: {
      required: true,
      description: "Foreign corporate investors: proof of capital flow, ZIDA approval, board resolution",
      validation: (data) => {
        if (!data.shareholders) return false
        const foreignCorporateShareholders = data.shareholders.filter(s => 
          s.entityType === 'corporate' && s.nationality !== 'Zimbabwean'
        )
        return foreignCorporateShareholders.every(s => 
          s.capitalFlowProof && s.zidaApproval && s.boardResolution
        )
      }
    }
  },

  // 4. Corporate Governance
  governance: {
    boardComposition: {
      required: true,
      description: "Board of at least 3 directors (≥ 3/5 non-executive)",
      validation: (data) => {
        if (!data.directors) return false
        const totalDirectors = data.directors.length
        const nonExecutiveDirectors = data.directors.filter(d => d.position !== 'executive').length
        return totalDirectors >= 3 && nonExecutiveDirectors >= Math.ceil(totalDirectors * 3/5)
      }
    },
    independentChair: {
      required: true,
      description: "Independent non-executive chairperson",
      validation: (data) => {
        if (!data.directors) return false
        return data.directors.some(d => d.position === 'chairperson' && d.isIndependent)
      }
    },
    auditCommittee: {
      required: true,
      description: "Board Audit Committee (non-executives only)",
      validation: (data) => {
        return data.documents && data.documents.includes('audit-committee-terms')
      }
    },
    boardCommittees: {
      required: true,
      description: "Other committees with proper Terms of Reference",
      validation: (data) => {
        return data.documents && data.documents.includes('board-committees-terms')
      }
    },
    noCompetingDirectors: {
      required: true,
      description: "No director may serve on competing institutions",
      validation: (data) => {
        if (!data.directors) return false
        return data.directors.every(d => !d.servesOnCompetingInstitutions)
      }
    },
    organizationalStructure: {
      required: true,
      description: "Submit organizational structure chart",
      validation: (data) => {
        return data.documents && data.documents.includes('organizational-structure')
      }
    },
    externalAuditor: {
      required: true,
      description: "Appoint external auditor within 1 year (licensed in Zimbabwe)",
      validation: (data) => {
        return data.externalAuditor && data.externalAuditor.licensedInZimbabwe
      }
    }
  },

  // 5. Management
  management: {
    ceoAppointment: {
      required: true,
      description: "Appoint CEO with RBZ approval",
      validation: (data) => {
        return data.chiefExecutiveOfficer && data.chiefExecutiveOfficer.rbzApproval
      }
    },
    cfoAppointment: {
      required: true,
      description: "Appoint CFO with RBZ approval",
      validation: (data) => {
        return data.chiefFinancialOfficer && data.chiefFinancialOfficer.rbzApproval
      }
    },
    managementQualifications: {
      required: true,
      description: "Directors/senior managers: at least diploma + relevant professional experience",
      validation: (data) => {
        if (!data.directors) return false
        return data.directors.every(d => 
          d.qualifications && d.qualifications.includes('diploma') && d.professionalExperience
        )
      }
    },
    managementShareholding: {
      required: true,
      description: "No >5% shareholder can be principal officer without RBZ approval",
      validation: (data) => {
        if (!data.shareholders || !data.directors) return false
        const managementShareholders = data.shareholders.filter(s => 
          s.isManagement && parseFloat(s.ownership || 0) > 5
        )
        return managementShareholders.every(s => s.rbzApproval)
      }
    }
  },

  // 6. Fitness & Probity
  fitnessProbity: {
    requiredForLargeShareholders: {
      required: true,
      description: "Fitness & Probity for ≥ 5% shareholders, directors, senior management",
      validation: (data) => {
        if (!data.shareholders || !data.directors) return false
        const largeShareholders = data.shareholders.filter(s => parseFloat(s.ownership || 0) >= 5)
        const allDirectors = data.directors
        const allSeniorManagement = data.seniorManagement || []
        
        const allRequiringVetting = [...largeShareholders, ...allDirectors, ...allSeniorManagement]
        return allRequiringVetting.every(person => person.fitnessProbityCompleted)
      }
    },
    fitnessDocuments: {
      required: true,
      description: "Certified ID, CV, certificates, affidavit, net worth, tax clearance, police clearance",
      validation: (data) => {
        if (!data.shareholders || !data.directors) return false
        const allRequiringVetting = [
          ...data.shareholders.filter(s => parseFloat(s.ownership || 0) >= 5),
          ...data.directors,
          ...(data.seniorManagement || [])
        ]
        return allRequiringVetting.every(person => 
          person.certifiedId && person.cv && person.certificates && 
          person.fitnessAffidavit && person.netWorthStatement && 
          person.taxClearance && person.policeClearance
        )
      }
    },
    institutionalShareholders: {
      required: true,
      description: "Institutional shareholders: M&A, Certificate, CR6/CR11, audited financials, board resolution",
      validation: (data) => {
        if (!data.shareholders) return false
        const institutionalShareholders = data.shareholders.filter(s => s.entityType === 'corporate')
        return institutionalShareholders.every(s => 
          s.memorandumArticles && s.certificateOfIncorporation && 
          s.cr6 && s.cr11 && s.auditedFinancials && s.boardResolution
        )
      }
    },
    foreignDocuments: {
      required: true,
      description: "Foreign docs: notarized/authenticated, employment permits for foreigners",
      validation: (data) => {
        if (!data.shareholders || !data.directors) return false
        const foreignPersons = [
          ...data.shareholders.filter(s => s.nationality !== 'Zimbabwean'),
          ...data.directors.filter(d => d.nationality !== 'Zimbabwean'),
          ...(data.seniorManagement || []).filter(m => m.nationality !== 'Zimbabwean')
        ]
        return foreignPersons.every(person => 
          person.documentsNotarized && person.employmentPermit
        )
      }
    }
  },

  // 7. Business Plan Requirements
  businessPlan: {
    identifyingInfo: {
      required: true,
      description: "Name, location, branch addresses, directors, managers",
      validation: (data) => {
        return data.institutionName && data.physicalAddress && 
               data.directors && data.directors.length > 0
      }
    },
    marketAnalysis: {
      required: true,
      description: "Target markets, economic conditions, development value",
      validation: (data) => {
        return data.targetMarkets && data.economicConditions && data.developmentValue
      }
    },
    strategyObjectives: {
      required: true,
      description: "Services, products, implementation plan",
      validation: (data) => {
        return data.services && data.products && data.implementationPlan
      }
    },
    financialProjections: {
      required: true,
      description: "Financial projections (3 years): balance sheet, income statement, cashflow",
      validation: (data) => {
        return data.documents && data.documents.includes('financial-projections-3years')
      }
    },
    assumptions: {
      required: true,
      description: "Assumptions: inflation, interest rates, lending rates, bad debt ratio, growth",
      validation: (data) => {
        return data.inflationAssumptions && data.interestRateAssumptions && 
               data.lendingRateAssumptions && data.badDebtRatio && data.growthAssumptions
      }
    },
    policyManuals: {
      required: true,
      description: "Credit/operational policy manuals (align with Client Protection Principles)",
      validation: (data) => {
        return data.documents && data.documents.includes('credit-policy-manual') &&
               data.documents.includes('operational-policy-manual')
      }
    },
    loanPolicy: {
      required: true,
      description: "Loan policy: min/max loan sizes, max maturity, interest/charges breakdown",
      validation: (data) => {
        return data.minLoanSize && data.maxLoanSize && data.maxMaturity && 
               data.interestChargesBreakdown
      }
    },
    complaintsProcedure: {
      required: true,
      description: "Complaints procedure manual + complaints register",
      validation: (data) => {
        return data.documents && data.documents.includes('complaints-procedure-manual') &&
               data.documents.includes('complaints-register')
      }
    },
    loanAgreementTemplate: {
      required: true,
      description: "Template loan agreement (complying with Microfinance Act)",
      validation: (data) => {
        return data.documents && data.documents.includes('loan-agreement-template')
      }
    }
  }
}

// Main validation function
export const validateCompliance = (applicationData) => {
  const results = {
    overall: 'pending',
    categories: {},
    totalRequirements: 0,
    passedRequirements: 0,
    failedRequirements: 0,
    warnings: 0
  }

  let totalReqs = 0
  let passedReqs = 0
  let failedReqs = 0
  let warnings = 0

  // Validate each category
  Object.keys(RBZ_REQUIREMENTS).forEach(categoryKey => {
    const category = RBZ_REQUIREMENTS[categoryKey]
    results.categories[categoryKey] = {
      status: 'pending',
      requirements: {}
    }

    Object.keys(category).forEach(reqKey => {
      const requirement = category[reqKey]
      totalReqs++
      
      try {
        const isValid = requirement.validation(applicationData)
        const status = isValid ? 'passed' : 'failed'
        
        results.categories[categoryKey].requirements[reqKey] = {
          status,
          description: requirement.description,
          required: requirement.required,
          evidence: getEvidence(applicationData, reqKey)
        }

        if (isValid) {
          passedReqs++
        } else {
          failedReqs++
        }
      } catch (error) {
        results.categories[categoryKey].requirements[reqKey] = {
          status: 'error',
          description: requirement.description,
          required: requirement.required,
          error: error.message
        }
        warnings++
      }
    })

    // Set category status
    const categoryReqs = Object.values(results.categories[categoryKey].requirements)
    const categoryPassed = categoryReqs.filter(r => r.status === 'passed').length
    const categoryTotal = categoryReqs.length
    
    if (categoryPassed === categoryTotal) {
      results.categories[categoryKey].status = 'passed'
    } else if (categoryPassed > 0) {
      results.categories[categoryKey].status = 'partial'
    } else {
      results.categories[categoryKey].status = 'failed'
    }
  })

  // Set overall status
  results.totalRequirements = totalReqs
  results.passedRequirements = passedReqs
  results.failedRequirements = failedReqs
  results.warnings = warnings

  if (failedReqs === 0 && warnings === 0) {
    results.overall = 'passed'
  } else if (passedReqs > failedReqs) {
    results.overall = 'partial'
  } else {
    results.overall = 'failed'
  }

  return results
}

// Helper function to get evidence for each requirement
const getEvidence = (data, reqKey) => {
  const evidence = []
  
  switch (reqKey) {
    case 'applicationFee':
      if (data.applicationFee) evidence.push(`Application fee: ${data.applicationFee.amount} USD`)
      break
    case 'completedForm':
      if (data.institutionName) evidence.push(`Institution: ${data.institutionName}`)
      break
    case 'minimumCapital':
      if (data.paidUpCapital) evidence.push(`Paid-up capital: ${data.paidUpCapital} USD`)
      break
    case 'boardComposition':
      if (data.directors) evidence.push(`${data.directors.length} directors`)
      break
    case 'ceoAppointment':
      if (data.chiefExecutiveOfficer) evidence.push(`CEO: ${data.chiefExecutiveOfficer.name}`)
      break
    default:
      if (data.documents && data.documents.includes(reqKey)) {
        evidence.push(`Document: ${reqKey}`)
      }
  }
  
  return evidence
}

// Generate compliance report
export const generateComplianceReport = (validationResults) => {
  const report = {
    summary: {
      overallStatus: validationResults.overall,
      totalRequirements: validationResults.totalRequirements,
      passed: validationResults.passedRequirements,
      failed: validationResults.failedRequirements,
      warnings: validationResults.warnings,
      compliancePercentage: Math.round((validationResults.passedRequirements / validationResults.totalRequirements) * 100)
    },
    categories: {},
    recommendations: []
  }

  // Process each category
  Object.keys(validationResults.categories).forEach(categoryKey => {
    const category = validationResults.categories[categoryKey]
    report.categories[categoryKey] = {
      status: category.status,
      requirements: Object.keys(category.requirements).map(reqKey => ({
        name: reqKey,
        status: category.requirements[reqKey].status,
        description: category.requirements[reqKey].description,
        evidence: category.requirements[reqKey].evidence || []
      }))
    }
  })

  // Generate recommendations
  Object.keys(validationResults.categories).forEach(categoryKey => {
    const category = validationResults.categories[categoryKey]
    Object.keys(category.requirements).forEach(reqKey => {
      const req = category.requirements[reqKey]
      if (req.status === 'failed') {
        report.recommendations.push({
          category: categoryKey,
          requirement: reqKey,
          action: `Complete: ${req.description}`,
          priority: req.required ? 'high' : 'medium'
        })
      }
    })
  })

  return report
}

