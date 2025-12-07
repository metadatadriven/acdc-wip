# eSAP Domain Model - ContextMapper DSL

This directory contains formal Domain-Driven Design (DDD) models for the electronic Statistical Analysis Plan (eSAP) domain, expressed using the ContextMapper DSL (CML).

## Files

- **eSAP.cml** - Complete eSAP domain model including:
  - Domain and subdomain definitions
  - 8 bounded contexts with aggregates
  - Context map showing relationships
  - Tactical DDD patterns (entities, value objects, services)

## Source Documentation

The CML model is derived from:
- **model/analysis/eSAP_DOMAIN_DESIGN.md** - Comprehensive DDD analysis of the eSAP domain

## Domain Structure

### Subdomains

The ClinicalTrialsDomain contains 8 subdomains classified by strategic importance:

**Core Domains (Competitive Differentiators):**
1. **StudyDesignManagement** - Protocol, objectives, endpoints, estimands
2. **StatisticalMethodology** - Statistical methods, models, hypothesis testing
3. **EfficacyEvaluation** - Treatment effect analysis and evaluation

**Supporting Domains (Necessary but not differentiating):**
4. **DataManagement** - Analysis datasets, derivations, quality
5. **SafetyMonitoring** - Adverse event capture and coding
6. **InterimAnalysisControl** - Adaptive decision-making
7. **OutputGeneration** - TFLs (Tables, Figures, Listings)

**Generic Domains (Standard functionality):**
8. **RegulatoryCompliance** - ICH guideline adherence, quality control

### Bounded Contexts

Each subdomain is implemented by a corresponding bounded context:

| Context | Key Aggregates | Technology |
|---------|---------------|------------|
| StudyDesignContext | Protocols | Java, Spring Boot, CDISC USDM |
| StatisticalAnalysisContext | StatisticalAnalysisPlans | R, SAS, Python |
| DataManagementContext | AnalysisSets, DerivedVariables | SAS, R, CDISC ADaM |
| SafetyMonitoringContext | AdverseEvents | SAS, MedDRA, CDISC SDTM/ADaM |
| EfficacyAssessmentContext | EfficacyAnalyses | R, SAS, CDISC ADaM |
| InterimAnalysisContext | InterimAnalyses | R, SAS, DMC Systems |
| RegulatoryComplianceContext | ComplianceAudits | QMS, Validation Tools |
| ReportingContext | TFLs | SAS, R, CDISC ARS |

## Context Relationships

The context map defines the following strategic relationships:

### Shared Kernel
- **StudyDesignContext ↔ StatisticalAnalysisContext**
  - Shared: Estimand framework
  - Requires close coordination

### Partnership
- **StatisticalAnalysisContext ↔ EfficacyAssessmentContext**
  - Equal collaboration on statistical methods
  - Shared infrastructure

### Customer-Supplier (Upstream → Downstream)

**Data Management as Supplier:**
- DataManagementContext → StatisticalAnalysisContext (ADaM datasets)
- DataManagementContext → SafetyMonitoringContext (Safety data, MedDRA coding)
- DataManagementContext → EfficacyAssessmentContext (Efficacy datasets)

**Reporting as Customer:**
- StatisticalAnalysisContext → ReportingContext (Analysis specifications)
- EfficacyAssessmentContext → ReportingContext (Efficacy results)
- SafetyMonitoringContext → ReportingContext (Safety summaries)

### Conformist
All contexts conform to:
- **RegulatoryComplianceContext** (ICH guidelines, quality standards)

### Orchestration
- **InterimAnalysisContext** coordinates multiple contexts for interim looks

## Key Aggregates

### Study Design Context
- **Protocols** - Protocol versioning, objectives, endpoints, estimands, study design

### Statistical Analysis Context
- **StatisticalAnalysisPlans** - SAP versions, analysis specifications, sample size calculations

### Data Management Context
- **AnalysisSets** - FAS, Safety, Per-Protocol population definitions
- **DerivedVariables** - Variable derivation rules and transformations

### Safety Monitoring Context
- **AdverseEvents** - AE capture, MedDRA coding, treatment-emergent determination

### Efficacy Assessment Context
- **EfficacyAnalyses** - Treatment effect estimation, hypothesis testing

### Interim Analysis Context
- **InterimAnalyses** - DMC decisions, stopping rules, alpha spending

### Regulatory Compliance Context
- **ComplianceAudits** - Compliance verification, findings, audit trail

### Reporting Context
- **TFLs** - Tables, Figures, Listings specifications and generation

## Standards Integration

The model integrates industry standards:

- **CDISC**
  - USDM (Unified Study Data Model) - Protocol digitization
  - SDTM (Study Data Tabulation Model) - Source data
  - ADaM (Analysis Data Model) - Analysis datasets
  - ARS (Analysis Results Standard) - Results representation
  - Controlled Terminology - Standardized vocabularies

- **ICH Guidelines**
  - E3 - Clinical Study Report structure
  - E9 - Statistical Principles
  - E9(R1) - Estimands and Sensitivity Analysis

- **Medical Coding**
  - MedDRA - Adverse event coding
  - WHO Drug Dictionary - Medication coding

## Using the Model

### Prerequisites

1. Install ContextMapper:
   - VS Code Extension: https://marketplace.visualstudio.com/items?itemName=contextmapper.context-mapper-vscode-extension
   - Eclipse Plugin: https://contextmapper.org/docs/eclipse/
   - CLI Tool: https://github.com/ContextMapper/context-mapper-cli

2. Review ContextMapper documentation:
   - Language Reference: https://contextmapper.org/docs/language-reference/
   - Examples: https://github.com/ContextMapper/context-mapper-examples

### Viewing the Model

Open `eSAP.cml` in:
- VS Code with ContextMapper extension
- Eclipse with ContextMapper plugin
- Any text editor (CML is human-readable)

### Generating Artifacts

ContextMapper can generate various outputs from CML models:

**Architecture Diagrams:**
```bash
# Generate PlantUML diagrams
context-mapper generate --input eSAP.cml --output-type PLANTUML
```

**API Contracts:**
```bash
# Generate MDSL (Microservice Domain-Specific Language) contracts
context-mapper generate --input eSAP.cml --output-type MDSL
```

**Service Decomposition:**
```bash
# Generate Service Cutter input for decomposition recommendations
context-mapper generate --input eSAP.cml --output-type SERVICE_CUTTER
```

### Model Validation

ContextMapper provides built-in validation:
- Checks syntax correctness
- Validates semantic rules (e.g., aggregate roots, relationship consistency)
- Ensures context map completeness

## Model Evolution

When updating the model:

1. **Maintain Traceability** - Document changes back to source analysis documents
2. **Version Control** - Use git to track model evolution
3. **Regenerate Artifacts** - Update diagrams and contracts after changes
4. **Review Relationships** - Ensure context map remains accurate
5. **Validate Invariants** - Check that business rules are preserved

## References

- **ContextMapper Official Site**: https://contextmapper.org/
- **DDD Reference**: Eric Evans - "Domain-Driven Design" (Blue Book)
- **Estimand Framework**: ICH E9(R1) Addendum
- **CDISC Standards**: https://www.cdisc.org/

## Contact

For questions about the model or ContextMapper usage, see:
- ContextMapper Documentation: https://contextmapper.org/docs/
- ContextMapper GitHub: https://github.com/ContextMapper/context-mapper-dsl
