# Product Requirements Document: Thunderstruck DSL

**Product Name:** Thunderstruck
**Version:** 1.0
**Date:** 2025-11-15
**Status:** Draft for Review
**Owner:** Statistical Computing & Data Science Team
**Stakeholders:** Biostatisticians, Clinical Data Managers, Regulatory Affairs, IT/Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [Target Users](#target-users)
5. [User Stories & Use Cases](#user-stories--use-cases)
6. [Functional Requirements](#functional-requirements)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Success Metrics](#success-metrics)
9. [Assumptions & Constraints](#assumptions--constraints)
10. [Out of Scope](#out-of-scope)
11. [Dependencies](#dependencies)
12. [Risks](#risks)
13. [Competitive Analysis](#competitive-analysis)
14. [Timeline & Milestones](#timeline--milestones)
15. [Appendices](#appendices)

---

## Executive Summary

### What is Thunderstruck?

Thunderstruck is a domain-specific language (DSL) for authoring Statistical Analysis Plans (SAPs) in clinical trials. It uses the W3C Data Cube standard as its foundational abstraction, enabling statisticians to specify analyses in a formal, unambiguous, machine-readable format.

### The Problem

Currently, SAPs are written in natural language prose, leading to:
- Ambiguous specifications that cause implementation errors
- Manual, error-prone translation from SAP to analysis code
- Non-interoperable results trapped in proprietary formats
- Inability to automatically validate SAP compliance
- Limited reusability of analytical patterns across studies

### The Solution

Thunderstruck provides:
- **Formal language** for specifying analyses using W3C Data Cube vocabulary
- **Automatic validation** against CDISC standards and cube integrity constraints
- **Multi-target code generation** (R, SAS) from single specification
- **Semantic interoperability** via RDF export enabling integration with multiple standards (CDISC, W3C, OMOP, FHIR)
- **Rich IDE support** in VS Code with syntax highlighting and validation
- **Provenance tracking** from raw data through all derivations to results
- **LLM integration** via MCP server for AI-assisted SAP authoring

### Value Proposition

| Stakeholder | Current Pain | Thunderstruck Benefit |
|------------|--------------|----------------------|
| **Biostatisticians** | Ambiguous SAPs, manual code review | Precise specifications, automatic validation |
| **Programmers** | Interpreting prose SAPs, debugging | Clear requirements, auto-generated code |
| **Regulatory** | Manual compliance checking | Automated CDISC validation, audit trails |
| **Data Scientists** | Locked-in to one tool (R or SAS) | Multi-language support, portability |
| **Management** | High cost of SAP amendments | Reusable templates, faster updates |

---

## Problem Statement

### Current State

Clinical trial Statistical Analysis Plans are currently authored as:

1. **Natural language documents** (Word/PDF) describing intended analyses
2. **Separate implementation** in R or SAS by statistical programmers
3. **Manual verification** that code matches SAP intent
4. **Proprietary data formats** (SAS datasets, R objects) for results
5. **Separate documentation** for regulatory submission (ARM/ARS)

### Pain Points

#### 1. Ambiguity & Interpretation Errors

**Example:** SAP states "Analyze change from baseline at Week 24 in the efficacy population"

Questions arise:
- Which baseline definition? (First non-missing? Screening? Day 1?)
- What if baseline is missing? (Impute? Exclude?)
- How is "efficacy population" defined? (ITT? Modified ITT? Per-protocol?)
- What if Week 24 visit is missing? (LOCF? BOCF? No imputation?)

**Impact:** Different programmers implement differently, leading to inconsistent results.

#### 2. Implementation Divergence

**Problem:** Same SAP → Different code → Different results

- Programmer A uses LOCF imputation (assumed)
- Programmer B uses no imputation (assumed)
- Results differ, requiring investigation and reconciliation
- Delays in analysis delivery

**Estimated Impact:** 20-30% of SAP implementations require clarification rounds

#### 3. Non-Interoperability

**Problem:** Results locked in proprietary formats

- SAS datasets (.sas7bdat) require SAS license to read
- R objects (.RData) require R environment
- No standard way to query across studies
- Difficult to integrate with external data sources (biomarkers, genomics)

**Impact:** Data silos prevent cross-study meta-analysis and integrated safety databases

#### 4. Manual Validation

**Problem:** Checking SAP compliance is human-intensive

- QC programmers must:
  - Read SAP prose
  - Read analysis code
  - Verify correspondence
  - Check CDISC compliance
  - Validate calculations
- Typical SAP has 50-200 analyses
- Each requires hours of manual review

**Estimated Cost:** 30-50% of statistical programming time spent on validation/QC

#### 5. Limited Reusability

**Problem:** Analytical patterns not captured in reusable form

- "Change from baseline" implemented differently in every study
- Standard analyses (MMRM, survival) recoded each time
- Knowledge not transferred between studies
- New statisticians must learn by example

**Impact:** Reduced productivity, increased training time, quality variability

#### 6. SAP Amendments

**Problem:** Protocol amendments require SAP updates

- Natural language updates → re-implementation → re-validation
- High cost and time (weeks to months)
- Risk of introducing new errors

**Estimated Impact:** Average 3-5 SAP amendments per study, each taking 2-4 weeks

---

## Goals & Objectives

### Primary Goals

1. **Eliminate ambiguity in SAP specifications**
   - Formal language with precise semantics
   - Machine-checkable specifications
   - Single source of truth

2. **Automate code generation from SAPs**
   - Generate R, Python, and SAS code from single specification
   - Eliminate manual translation errors
   - Ensure SAP-code consistency by construction

3. **Enable automatic validation**
   - CDISC standards compliance (SDTM, ADaM)
   - W3C Data Cube integrity constraints
   - Type safety and consistency checks

4. **Achieve semantic interoperability**
   - Export to W3C RDF for data exchange
   - Enable SPARQL queries across studies
   - Integrate with linked data ecosystems

5. **Improve productivity and reduce costs**
   - Reusable analysis templates
   - Faster SAP amendments
   - Reduced validation time

### Secondary Goals

6. **Provide excellent developer experience**
   - Rich IDE support (VS Code)
   - Helpful error messages
   - Quick feedback during authoring

7. **Build community and ecosystem**
   - Open source language and tools
   - Standard library of common patterns
   - Community contributions

8. **Support regulatory acceptance**
   - Clear provenance and audit trails
   - Compliant with ICH guidelines (E9, E9(R1))
   - Export to regulatory formats

### Non-Goals (Out of Scope for v1.0)

- Replace existing statistical software (R, SAS, Python)
- Implement new statistical methods (use existing libraries)
- Data collection or EDC integration
- Clinical trial management system (CTMS) features

---

## Target Users

### Primary Personas

#### 1. Senior Biostatistician - "Sarah"

**Background:**
- PhD in Statistics, 10+ years in pharma
- Writes SAPs for Phase 2/3 trials
- Expert in CDISC standards
- Proficient in R, learning Python

**Goals:**
- Write clear, unambiguous SAPs
- Ensure analyses are reproducible
- Meet regulatory requirements
- Mentor junior statisticians

**Pain Points:**
- SAP prose is often misinterpreted
- Amendments take too long
- Difficult to reuse analyses across studies
- Manual CDISC compliance checking

**How Thunderstruck Helps:**
- Formal language eliminates ambiguity
- Templates enable reuse
- Automatic CDISC validation
- Fast iteration on amendments

---

#### 2. Statistical Programmer - "Paul"

**Background:**
- MS in Statistics/Computer Science
- 5 years experience in clinical trials
- Expert in R (tidyverse, lme4) and SAS
- Implements SAPs from specifications

**Goals:**
- Understand SAP requirements clearly
- Write correct, efficient code
- Pass validation/QC first time
- Deliver analyses on time

**Pain Points:**
- SAP specifications unclear or ambiguous
- Manages ADaM dataset creation
- Manages Display creation, i.e. TFL (Tables, Figures and Listings)
- Rework due to misunderstandings
- Time-consuming manual validation
- Repetitive coding of standard analyses

**How Thunderstruck Helps:**
- Clear, formal specifications
- Auto-generated code from SAP
- Built-in validation
- Focus on reviewing/customizing vs. coding from scratch

---

#### 3. Data Manager - "Diana"

**Background:**
- BS in Life Sciences, 8 years in clinical data
- Manages SDTM dataset creation
- Ensures CDISC compliance
- Works with Define.xml

**Goals:**
- Create compliant CDISC datasets
- Document dataset structures clearly
- Ensure data quality
- Support statistical analysis needs

**Pain Points:**
- Disconnect between data structures and analysis needs
- Manual checking of CDISC compliance
- Maintaining Define.xml metadata

**How Thunderstruck Helps:**
- Data Cube definitions align with CDISC standards
- Automatic validation against CDISC rules
- Can generate Define.xml from cube definitions
- Clear data lineage

---

#### 4. Regulatory Affairs Specialist - "Rachel"

**Background:**
- PharmD, 12 years in regulatory
- Prepares submission packages (eCTD)
- Reviews analysis documentation
- Interfaces with FDA/EMA

**Goals:**
- Ensure analysis traceability
- Demonstrate SAP compliance
- Provide clear documentation
- Respond to regulatory queries

**Pain Points:**
- Difficult to trace results back to SAP
- Manual documentation of analysis methods
- Responding to regulatory questions requires programmer time

**How Thunderstruck Helps:**
- Built-in provenance tracking
- Auto-generated documentation
- RDF export for semantic queries
- Clear audit trail from SAP → code → results

---

### Secondary Personas

#### 5. IT/Data Engineer - "Isaac"

**Background:**
- BS Computer Science, cloud/data engineering
- Builds data pipelines and infrastructure
- Works with modern data stacks (Spark, Parquet, etc.)

**Goals:**
- Integrate clinical data with clinical trial systems, e.g. EDC, CTMS, eTMF, etc.
- Enable data science workflows
- Ensure scalability and performance

**Pain Points:**
- Proprietary formats (SAS datasets)
- Lack of metadata standards
- Difficult to integrate with BI tools

**How Thunderstruck Helps:**
- RDF export enables semantic integration
- Open formats (Parquet, CSV)
- Clear data schemas via cube definitions

---

#### 6. Academic Researcher - "Alan"

**Background:**
- MD/PhD, clinical trial investigator
- Analyzes trial data for publications
- Uses R/Python, not expert programmer

**Goals:**
- Access and analyze trial data
- Reproduce published analyses
- Conduct secondary analyses

**Pain Points:**
- Difficult to understand analysis specifications
- Can't reproduce analyses without access to code
- Data formats incompatible with academic tools

**How Thunderstruck Helps:**
- Clear, readable SAP specifications
- Reproducible analyses
- Export to open formats
- Documentation auto-generated

---

## User Stories & Use Cases

### Epic 1: Authoring SAPs

#### Story 1.1: Define a Data Cube
**As a** biostatistician
**I want to** define the structure of my analysis dataset as a data cube
**So that** I have a formal specification of dimensions, measures, and attributes

**Acceptance Criteria:**
- Can define cube with dimensions, measures, attributes
- Can specify data types for each component
- Can add integrity constraints
- Can reuse CDISC standard cube definitions

**Example:**
```thunderstruck
cube ADADAS {
    namespace: "http://example.org/study/xyz#"
    structure: {
        dimensions: [
            USUBJID: Identifier,
            AVISITN: Integer,
            TRT01A: CodedValue
        ],
        measures: [
            AVAL: Numeric unit: "points",
            CHG: Numeric unit: "points"
        ],
        attributes: [
            PARAMCD: CodedValue,
            EFFFL: Flag
        ]
    }
}
```

---

#### Story 1.2: Create Analysis Slice
**As a** biostatistician
**I want to** specify a subset of my data cube for analysis
**So that** I can focus on specific populations and timepoints

**Acceptance Criteria:**
- Can specify fixed dimensions (e.g., Visit = Week 24)
- Can specify varying dimensions (e.g., Subject, Treatment)
- Can add filter conditions
- IDE validates slice references parent cube

**Example:**
```thunderstruck
slice Week24Efficacy from ADADAS {
    fix: {
        AVISIT: "Week 24",
        EFFFL: "Y"
    }
    vary: [USUBJID, TRT01A]
    measures: [CHG]
}
```

---

#### Story 1.3: Specify Statistical Model
**As a** biostatistician
**I want to** specify a statistical model formally
**So that** the implementation is unambiguous

**Acceptance Criteria:**
- Can specify model formula using standard notation
- Can specify model family and link function
- Can specify random effects structure
- Can define output structure (results cube)

**Example:**
```thunderstruck
model DoseResponseModel {
    input: Week24Efficacy
    formula: CHG ~ TRTDOSE + SITEGR1 + BASE
    family: Gaussian
    link: Identity
    output: DoseResponseResults {
        structure: {
            dimensions: [Parameter: Text],
            measures: [Estimate: Numeric, StdError: Numeric, PValue: Numeric]
        }
    }
}
```

---

#### Story 1.4: Define Display Specifications
**As a** biostatistician
**I want to** specify how results should be displayed
**So that** tables and figures are generated consistently

**Acceptance Criteria:**
- Can specify table layout (rows, columns)
- Can specify formatting (decimals, styles)
- Can specify figure aesthetics (axes, colors)
- Can add titles, footnotes

**Example:**
```thunderstruck
display table "Table 14.3.01: Dose Response Analysis" {
    source: DoseResponseResults
    rows: [Parameter]
    columns: [Estimate, StdError, PValue]
    format: {
        Estimate: {decimals: 3},
        PValue: {decimals: 4}
    }
}
```

---

### Epic 2: Validation & Error Detection

#### Story 2.1: Validate CDISC Compliance
**As a** data manager
**I want to** automatically validate my cube definitions against CDISC standards
**So that** I catch compliance issues early

**Acceptance Criteria:**
- Validates required SDTM/ADaM variables present
- Checks controlled terminology
- Validates ISO 8601 date formats
- Reports violations with clear messages

---

#### Story 2.2: Check Data Cube Integrity
**As a** biostatistician
**I want to** validate cube structure against W3C integrity constraints
**So that** my data model is mathematically sound

**Acceptance Criteria:**
- Validates IC-1 through IC-21
- Reports which constraint is violated
- Suggests fixes for common issues
- Validates in real-time in IDE

---

#### Story 2.3: Type Checking
**As a** statistical programmer
**I want to** have type errors caught automatically
**So that** I don't make unit or dimension mistakes

**Acceptance Criteria:**
- Catches type mismatches (e.g., adding text to number)
- Validates unit compatibility (e.g., can't add kg to mg without conversion)
- Checks dimension compatibility in operations
- Provides clear error messages with suggestions

---

### Epic 3: Code Generation

#### Story 3.1: Generate R Code
**As a** statistical programmer
**I want to** generate R code from my SAP specification
**So that** I can execute the analysis in R

**Acceptance Criteria:**
- Generates working R code (tidyverse, lme4, ggplot2)
- Code is readable and well-commented
- Includes data loading, validation, analysis, display
- Can customize code via templates

---

#### Story 3.2: Generate SAS Code
**As a** statistical programmer
**I want to** generate SAS code from my SAP specification
**So that** I can execute analyses in SAS

**Acceptance Criteria:**
- Generates BASE SAS 9.4 code with PROC SQL, DATA steps
- Uses SAS/STAT procedures (PROC MIXED, PROC GLM, etc.)
- Code follows SAS coding conventions
- Produces same results as R code
- Generates appropriate formats and macros

---

#### Story 3.3: Generate RDF Export
**As a** data engineer
**I want to** export my data cubes to RDF/Turtle format
**So that** I can integrate with semantic web systems

**Acceptance Criteria:**
- Generates valid W3C Data Cube RDF
- Validates against Data Cube spec
- Includes provenance metadata (PROV-O)
- Can be queried with SPARQL

---

### Epic 4: IDE Integration

#### Story 4.1: Syntax Highlighting
**As a** SAP author
**I want to** have syntax highlighting in my editor
**So that** code is easier to read and navigate

**Acceptance Criteria:**
- Keywords highlighted distinctly
- Dimensions, measures, attributes color-coded
- String, number, comment highlighting
- Works in VS Code

---

#### Story 4.2: Code Completion
**As a** SAP author
**I want to** have autocomplete suggestions
**So that** I can write code faster and avoid typos

**Acceptance Criteria:**
- Suggests cube names, dimensions, measures
- Suggests keywords and constructs
- Context-aware (only relevant suggestions)
- Shows documentation on hover

---

#### Story 4.3: Real-Time Validation
**As a** SAP author
**I want to** see validation errors as I type
**So that** I can fix issues immediately

**Acceptance Criteria:**
- Red underlines for errors
- Yellow for warnings
- Error message on hover
- Quick fixes when available

---

#### Story 4.4: Visualize Cube Structure
**As a** biostatistician
**I want to** visualize my cube structure graphically
**So that** I can understand the data model at a glance

**Acceptance Criteria:**
- Shows dimensions, measures, attributes
- Shows relationships between cubes
- Interactive (click to navigate)
- Export as image

---

### Epic 5: Reusability & Templates

#### Story 5.1: Define Analysis Templates
**As a** senior biostatistician
**I want to** create reusable analysis templates
**So that** common analyses can be standardized

**Acceptance Criteria:**
- Can define generic/parameterized templates
- Can instantiate templates with specific cubes
- Can share templates across studies
- Standard library of common patterns

---

#### Story 5.2: Import CDISC Standard Definitions with Version Control
**As a** data manager
**I want to** import standard SDTM/ADaM cube definitions with specific version information
**So that** I can ensure compliance with the correct standard versions and maintain traceability

**Acceptance Criteria:**
- Standard library includes all SDTM domains
- Standard library includes common ADaM datasets
- Can extend standard definitions
- Can specify and validate against specific CDISC versions:
  - SDTM (e.g., v3.2, v3.3, v3.4)
  - ADaM (e.g., v1.0, v1.1, v1.2)
  - CDISC Controlled Terminology version
- Can specify SAP version and track amendments
- Can reference protocol version (linked to USDM model)
- Version information included in generated RDF metadata
- Can query "what standards versions were used?"

---

### Epic 6: Documentation & Reporting

#### Story 6.1: Generate SAP Document
**As a** biostatistician
**I want to** automatically generate a SAP document from my specification
**So that** documentation stays in sync with implementation

**Acceptance Criteria:**
- Generates Word or PDF
- Includes all analyses with descriptions
- Formatted professionally
- Includes shell tables

---

#### Story 6.2: Provenance Tracking
**As a** regulatory specialist
**I want to** trace results back to their data sources
**So that** I can demonstrate analysis validity

**Note:** PROV-O is the W3C Provenance Ontology, a standard RDF vocabulary for representing provenance information. It captures who created what, when, and how data was derived.

**Acceptance Criteria:**
- Every result cube has provenance metadata
- Can query: "Where did this number come from?"
- Lineage graph from SDTM → ADaM → Analysis → Results
- Export provenance as PROV-O RDF (see [W3C PROV-O](https://www.w3.org/TR/prov-o/))
- Track derivations, agents (who), activities (how), and entities (what)

---

## Functional Requirements

### FR-1: Language Features

#### FR-1.1: Core Language Constructs
- **MUST** support concept definitions (biomedical, derivation, analysis concepts) as first-class constructs
- **MUST** support cube definitions with dimensions, measures, attributes
- **MUST** support slice definitions (fixing and varying dimensions)
- **MUST** support derive definitions (cube → cube mappings)
- **MUST** support model definitions (statistical models)
- **MUST** support aggregate definitions (summary statistics)
- **MUST** support display definitions (tables and figures)
- **MUST** support pipeline definitions (DAG of analyses)
- **SHOULD** support estimand definitions (ICH E9(R1))
- **SHOULD** support template/generic constructs

#### FR-1.2: Type System
- **MUST** support primitive types (Numeric, Integer, Text, DateTime, Date, Flag)
- **MUST** support coded value types with code lists
- **MUST** support identifier types
- **MUST** support cube types as first-class entities
- **MUST** perform type checking and inference
- **MUST** enforce unit compatibility

#### FR-1.3: Expression Language
- **MUST** support arithmetic operators (+, -, *, /)
- **MUST** support comparison operators (==, !=, <, >, <=, >=)
- **MUST** support logical operators (and, or, not)
- **MUST** support function calls
- **MUST** support variable references
- **SHOULD** support formula syntax (~ for models)

#### FR-1.4: Comments and Documentation
- **MUST** support single-line comments (//)
- **MUST** support multi-line comments (/* */)
- **MUST** support documentation strings (like Common Lisp) as part of language constructs
  - Inline documentation attached directly to definitions (cube, model, concept, etc.)
  - Example: `cube ADADAS "Analysis dataset for ADAS-Cog scores" { ... }`
- **SHOULD** support documentation comments (/** */) for additional annotations

---

### FR-2: Validation

#### FR-2.1: W3C Data Cube Integrity Constraints
- **MUST** implement IC-1: Unique DataSet
- **MUST** implement IC-2: Unique DSD
- **MUST** implement IC-11: All dimensions required
- **MUST** implement IC-12: No duplicate observations
- **MUST** implement IC-19: Codes from code list
- **SHOULD** implement all 21 integrity constraints

#### FR-2.2: CDISC Validation
- **MUST** validate required SDTM variables present
- **MUST** validate ADaM Basic Data Structure rules
- **MUST** validate controlled terminology against CDISC CT
- **MUST** validate ISO 8601 date formats
- **MUST** support CDISC CORE conformance rules validation
  - SDTM conformance rules
  - ADaM conformance rules
  - Programmable and configurable rule engine
- **MUST** validate against specific CDISC versions (version-aware validation)

#### FR-2.3: Type Validation
- **MUST** detect type mismatches
- **MUST** validate unit compatibility
- **MUST** check dimension compatibility
- **MUST** validate cross-references resolve

#### FR-2.4: Semantic Validation
- **MUST** validate model formulas reference valid variables
- **MUST** validate slice references valid parent cube
- **MUST** validate pipeline has no cycles
- **MUST** validate template instantiations

---

### FR-3: Code Generation

#### FR-3.1: R Code Generation
- **MUST** generate valid R code from specifications
- **MUST** support tidyverse (dplyr, ggplot2)
- **MUST** support linear models (lm)
- **MUST** support mixed models (lme4::lmer or mmrm)
- **SHOULD** support survival models (survival package)
- **MUST** generate readable, commented code
- **MUST** include data loading and validation

#### FR-3.2: SAS Code Generation
- **MUST** generate valid BASE SAS 9.4 code
- **MUST** support SAS DATA steps and PROC SQL for data manipulation
- **MUST** support SAS/STAT procedures (PROC MIXED, PROC GLM, PROC PHREG, etc.)
- **MUST** support SAS/GRAPH or ODS Graphics for visualizations
- **MUST** follow SAS coding conventions
- **MUST** generate appropriate SAS formats and macros
- **MUST** support SAS datasets (.sas7bdat, .xpt)
- **MUST** generate readable, commented code
- **MUST** include data loading and validation

#### FR-3.3: RDF Export
- **MUST** generate valid Turtle syntax
- **MUST** conform to W3C Data Cube specification
- **MUST** include Data Structure Definitions (DSDs)
- **MUST** include provenance metadata (PROV-O)
- **SHOULD** include CDISC SHARE metadata
- **MUST** validate generated RDF against spec

---

### FR-4: IDE Integration

#### FR-4.1: Language Server Protocol (LSP)
- **MUST** implement LSP for VS Code
- **MUST** provide diagnostics (errors, warnings)
- **MUST** provide code completion
- **MUST** provide hover information
- **MUST** provide go-to-definition
- **MUST** provide find-references
- **SHOULD** provide semantic highlighting
- **SHOULD** provide code lenses
- **SHOULD** provide quick fixes

#### FR-4.2: Syntax Highlighting
- **MUST** provide TextMate grammar for VS Code
- **MUST** highlight keywords, types, strings, numbers, comments
- **SHOULD** semantic highlighting for dimensions/measures/attributes

#### FR-4.3: Visualizations
- **MUST** provide cube structure visualizer (VS Code extension)
- **MUST** provide pipeline DAG visualizer (VS Code extension)
- **MUST** provide lineage graph visualizer (VS Code extension)

---

### FR-5: Standard Library

#### FR-5.1: CDISC Standard Cubes
- **MUST** include SDTM domain cube definitions (DM, AE, VS, etc.)
- **MUST** include ADaM ADSL cube definition
- **MUST** include ADaM BDS template
- **SHOULD** include common ADaM datasets (ADAE, ADTTE, etc.)

#### FR-5.2: Standard Derivations
- **MUST** include ChangeFromBaseline derivation
- **SHOULD** include LOCF imputation
- **SHOULD** include BOCF imputation
- **SHOULD** include baseline definition helpers

#### FR-5.3: Built-in Functions
- **MUST** include aggregation functions (mean, median, stddev, count, min, max)
- **MUST** include statistical functions (quantile, ci_lower, ci_upper)
- **SHOULD** include date/time functions
- **SHOULD** include string manipulation functions

---

### FR-6: Documentation & Reporting

#### FR-6.1: Auto-generated Documentation
- **SHOULD** generate SAP document from specification
- **SHOULD** generate data definition document (like Define.xml)
- **SHOULD** generate analysis results metadata (ARM/ARS)

#### FR-6.2: Provenance & Lineage
- **MUST** track data lineage (SDTM → ADaM → Results)
- **MUST** export provenance as RDF (PROV-O)
- **SHOULD** visualize lineage graph

#### FR-6.3: MCP Server for LLM Integration
- **MUST** provide Model Context Protocol (MCP) server implementation
- **MUST** support reading Thunderstruck DSL programs via MCP
- **MUST** support writing/modifying Thunderstruck DSL programs via MCP
- **MUST** enable LLMs to interact with SAPs defined in Thunderstruck
- **MUST** provide structured access to:
  - Cube definitions and metadata
  - Analysis specifications
  - Validation results
  - Code generation capabilities
- **SHOULD** support conversational SAP authoring via LLM
- **SHOULD** provide SAP querying capabilities (e.g., "What analyses are defined?", "Show me the efficacy analyses")

---

### FR-7: CLI & Build System

#### FR-7.1: Command-Line Interface
- **MUST** provide CLI for compilation
- **MUST** support `compile` command with target selection
- **MUST** support `validate` command
- **SHOULD** support `init` command for new projects
- **SHOULD** support `test` command for running examples

#### FR-7.2: Configuration
- **SHOULD** support project configuration file (thunderstruck.config.json)
- **SHOULD** support output directory configuration
- **SHOULD** support target language preferences

---

### FR-8: Concept Management

#### FR-8.1: Concept Definitions as First-Class Constructs
- **MUST** support concept definitions as first-class language elements
- **MUST** support hierarchical concept types:
  - Concepts without a parent type are **base concepts**
  - Concepts can be typed as other concepts using `type_of` or `is_a` keywords
  - **Standard base concepts** (defined in standard library):
    - **BiomedicalConcept** - clinical observations and measurements (e.g., "Systolic Blood Pressure", "ADAS-Cog Total Score")
    - **DerivationConcept** - computed or derived values (e.g., "Change from Baseline", "Percent Change")
    - **AnalysisConcept** - analytical constructs (e.g., "Efficacy Endpoint", "Safety Parameter")
  - **Custom concept hierarchies** - users can define their own concept hierarchies for domain-specific needs
- **MUST** support concept properties:
  - Properties are named and typed as concepts
  - Properties are inherited from parent concepts throughout the hierarchy
  - Both `property:` and `properties:` keywords supported as aliases
- **MUST** allow concepts to have:
  - Unique identifier
  - Human-readable label
  - Description/definition
  - Parent type (optional, using `type_of` or `is_a`)
  - Properties (optional, list of named concept references)
  - Category
  - Associated code lists or value domains
  - Links to external ontologies (CDISC, SNOMED CT, LOINC, etc.)

#### FR-8.2: Concept Namespaces
- **MUST** provide namespace mechanism for concepts
- **MUST** support importing concepts from standard namespaces:
  - CDISC Glossary
  - SDMX concepts
  - BRIDG model
  - Custom organization-specific concept libraries
- **MUST** prevent concept name collisions across namespaces
- **SHOULD** support concept versioning within namespaces

#### FR-8.3: Linking Concepts to Cube Components
- **MUST** allow dimensions, measures, and attributes to reference concepts
- **MUST** follow SDMX pattern where cube components link to concepts
- **MUST** enable querying: "What concept does this dimension represent?"
- **MUST** support semantic validation based on concept types
- **SHOULD** support concept hierarchies and relationships

#### FR-8.4: Concept Interoperability
- **MUST** export concept definitions to RDF using W3C Data Cube and SDMX vocabularies
- **MUST** support mapping concepts to external standards:
  - CDISC Controlled Terminology
  - SNOMED CT codes
  - LOINC codes
  - MedDRA codes
- **SHOULD** import concepts from external ontologies/vocabularies
- **SHOULD** support concept harmonization across studies

**Example Concept Definitions:**
```thunderstruck
// Base concepts (no parent type)
concept Value {
    definition: "A measured or observed value"
}

concept Unit {
    definition: "A unit of measurement"
}

// Biomedical concept with properties (from standard library)
concept SystolicBP "Systolic Blood Pressure" type_of BiomedicalConcept {
    category: VitalSign,
    definition: "Maximum blood pressure during contraction of the ventricles",
    properties: [
        value: Value,
        unit: Unit
    ],
    unit: "mmHg",
    codeLists: [
        CDISC.CT.VSTESTCD: "SYSBP",
        LOINC: "8480-6",
        SNOMED: "271649006"
    ]
}

// Hierarchical concepts with property inheritance
concept Change {
    properties: [
        value: Value,
        unit: Unit
    ]
}

concept ChangeFromBaseline is_a Change {
    // Inherits value and unit properties from Change
    properties: [
        baseline: Value
    ],
    definition: "Change from baseline value"
}

concept ChangeFromBaseline_Week24 type_of ChangeFromBaseline {
    // Inherits value, unit, and baseline from parent hierarchy
    properties: [
        visit: Visit
    ],
    definition: "Change from baseline at Week 24 visit"
}

// Link concept to cube dimension
cube SDTM_VS {
    dimensions: [
        VSTESTCD: CodedTest concept: SystolicBP
    ]
}
```

---

## Non-Functional Requirements

### NFR-1: Performance

#### NFR-1.1: IDE Responsiveness
- **MUST** provide validation feedback in <50ms for typical files (<1000 lines)
- **MUST** provide code completion in <100ms
- **SHOULD** support incremental validation (only re-validate changed portions)

#### NFR-1.2: Code Generation Speed
- **MUST** generate code in <500ms for typical SAP (50 analyses)
- **SHOULD** support parallel code generation for multiple targets

---

### NFR-2: Usability

#### NFR-2.1: Learning Curve
- **MUST** provide "Getting Started" guide that can be completed in <30 minutes
- **MUST** include 6+ comprehensive examples
- **MUST** provide clear, actionable error messages
- **SHOULD** provide suggestions for fixing errors

#### NFR-2.2: Documentation Quality
- **MUST** have complete language reference documentation
- **MUST** have API documentation for all public interfaces
- **MUST** have tutorials for common tasks
- **SHOULD** have video tutorials

---

### NFR-3: Reliability

#### NFR-3.1: Correctness
- **MUST** generate code that produces correct results (validated against manual implementation)
- **MUST** generate valid RDF that passes W3C validator
- **MUST** have >80% test coverage
- **MUST** have integration tests for all examples

#### NFR-3.2: Stability
- **MUST** have stable language syntax (semantic versioning)
- **MUST** provide migration guides for breaking changes
- **SHOULD** maintain backward compatibility for minor versions

---

### NFR-4: Maintainability

#### NFR-4.1: Code Quality
- **MUST** follow TypeScript best practices
- **MUST** have comprehensive unit tests
- **MUST** use linting (ESLint) and formatting (Prettier)
- **SHOULD** have <10% code duplication

#### NFR-4.2: Extensibility
- **MUST** provide documented extension points for:
  - Custom validators
  - Custom code generators
  - Custom type checkers
- **SHOULD** support plugins

---

### NFR-5: Portability

#### NFR-5.1: Platform Support
- **MUST** run on Windows, macOS, Linux
- **MUST** support Node.js 18+
- **MUST** support VS Code 1.80+

#### NFR-5.2: Output Portability
- **MUST** generate code compatible with:
  - R 4.0+
  - BASE SAS 9.4+ (using BASE SAS language features and SAS/STAT procedures)

---

### NFR-6: Security

#### NFR-6.1: Data Protection
- **MUST NOT** expose PHI/PII in error messages
- **SHOULD** support data anonymization in examples
- **SHOULD** validate against common security vulnerabilities

---

### NFR-7: Compliance

#### NFR-7.1: Standards Compliance
- **MUST** conform to W3C Data Cube specification
- **MUST** support CDISC SDTM 3.2+
- **MUST** support CDISC ADaM 1.1+
- **MUST** support USDM (Unified Study Definitions Model) v4.0+
  - Provide reference mechanism to link to external USDM model elements
  - Support referencing: populations, study design elements, estimands, endpoints, biomedical concepts
  - Enable traceability: Protocol (USDM) → SAP (Thunderstruck) → Analysis → Results
  - Do NOT import/parse USDM files directly; use URI-based references
  - Example: `protocol.population.efficacy` references USDM population definition
- **SHOULD** align with ICH E9(R1) estimand framework
- **SHOULD** support ICH M11 protocol standard (aligned with USDM)

#### NFR-7.2: Open Source
- **MUST** use open-source license (MIT or Apache 2.0)
- **MUST** have public GitHub repository
- **SHOULD** accept community contributions

---

## Success Metrics

### Quality Metrics

| Metric | Target |
|--------|--------|
| **Test Coverage** | >80% |
| **Bug Reports** | <10 critical bugs in first 6 months |
| **Documentation Completeness** | 100% of features documented |
| **Example Coverage** | All major features demonstrated |

### Productivity Metrics

| Metric | Baseline (Manual) | Target (Thunderstruck) | Improvement |
|--------|------------------|----------------------|-------------|
| **Time to Author SAP** | 40 hours | 24 hours | 40% faster |
| **SAP Amendment Time** | 16 hours | 6 hours | 62% faster |
| **Code Implementation Time** | 80 hours | 8 hours (review) | 90% faster |
| **Validation/QC Time** | 40 hours | 4 hours | 90% faster |
| **Total SAP Lifecycle** | 176 hours | 42 hours | 76% faster |

### Correctness Metrics

| Metric | Baseline | Target | Improvement |
|--------|----------|--------|-------------|
| **SAP Clarification Rounds** | 2-3 per SAP | <1 per SAP | 67% reduction |
| **Implementation Errors Found in QC** | 15-25 per SAP | <5 per SAP | 75% reduction |
| **CDISC Compliance Issues** | 10-20 per dataset | <2 per dataset | 85% reduction |

---

## Assumptions & Constraints

### Assumptions

1. **User Technical Proficiency**
   - Users have basic understanding of clinical trials and statistics
   - Users familiar with CDISC standards (SDTM, ADaM)
   - Users comfortable using VS Code or similar IDE

2. **Data Availability**
   - Analysis datasets available in standard formats (CSV, Parquet, SAS, XPT)
   - CDISC-compliant data structures
   - Metadata available (Define.xml or equivalent)

3. **Infrastructure**
   - Users have access to R or SAS environment
   - Users can install VS Code extensions
   - Network access for downloading packages

4. **Standards Stability**
   - W3C Data Cube standard remains stable
   - CDISC standards have predictable evolution
   - ICH M11 protocol standard (aligned with USDM) is stable and adopted
   - No major breaking changes in ICH guidelines

### Constraints

#### Technical Constraints

1. **Language Workbench**
   - Must use Langium (TypeScript-based)
   - Constrained by Langium capabilities and limitations
   - Node.js dependency

2. **Target Languages**
   - R code generation limited by supported packages
   - SAS code generation limited to BASE SAS 9.4 language features and SAS/STAT procedures
   - Cannot rely on advanced SAS features beyond BASE SAS and SAS/STAT

3. **Performance**
   - Language Server must run in VS Code (single-threaded JavaScript)
   - Code generation constrained by template engine performance

#### Business Constraints

1. **Regulatory**
   - Must not make claims about regulatory acceptance
   - Must not guarantee compliance (tool assists, doesn't certify)

#### Legal Constraints

1. **Licensing**
   - Must use permissive open-source license
   - Must not include proprietary code
   - Must respect third-party licenses (R packages, Python libraries)

2. **Data Privacy**
   - Must not process or store PHI/PII
   - Must comply with GDPR if users in EU

---

## Out of Scope

### Explicitly Out of Scope for v1.0

1. **Data Collection**
   - Electronic Data Capture (EDC) integration
   - Clinical database interfaces
   - eCRF design

2. **Data Processing**
   - ETL pipelines for raw data
   - Database management
   - Real-time data monitoring

3. **Study Management**
   - Protocol design tools
   - CTMS features
   - Enrollment tracking
   - Site management

4. **Advanced Analytics**
   - Machine learning / AI models
   - Adaptive trial designs
   - Bayesian adaptive randomization
   - Real-world evidence (RWE) integration

5. **Execution Environment**
   - Cloud computing infrastructure
   - Containerization (Docker)
   - Workflow orchestration (Airflow, etc.)
   - Job scheduling

6. **BI / Visualization**
   - Interactive dashboards
   - Real-time monitoring
   - Advanced data visualization beyond standard plots

7. **Other Programming Environments**
   - Web-based IDE
   - Jupyter notebook integration
   - RStudio integration

### May Be Considered for Future Versions

1. **v2.0 Candidates:**
   - SAS code generation (full support)
   - Julia code generation
   - Jupyter notebook integration
   - Web-based editor
   - Collaboration features (real-time editing)

2. **v3.0+ Candidates:**
   - Execution environment / runner
   - Cloud deployment
   - APIs for programmatic access
   - Integration with trial management systems

---

## Dependencies

### External Dependencies

#### Technology Dependencies

1. **Langium** (v3.x)
   - Language workbench
   - Risk: Breaking changes in new versions
   - Mitigation: Pin to specific version, monitor releases

2. **TypeScript** (v5.x)
   - Implementation language
   - Risk: Low (stable)

3. **Node.js** (v18+)
   - Runtime environment
   - Risk: Low (stable)

4. **VS Code** (v1.80+)
   - IDE platform
   - Risk: Low (stable API)

5. **N3.js**
   - RDF/Turtle generation
   - Risk: Low (mature library)

#### Standards Dependencies

1. **W3C Data Cube Vocabulary**
   - Core abstraction
   - Risk: Standard is stable (2014)
   - Mitigation: None needed

2. **CDISC Standards** (SDTM 3.2, ADaM 1.1)
   - Clinical data standards
   - Risk: New versions released periodically
   - Mitigation: Support multiple versions, version-specific validation

3. **ICH Guidelines** (E9, E9(R1))
   - Regulatory guidance
   - Risk: Low (stable)

#### Ecosystem Dependencies

1. **R Packages** (tidyverse, lme4, mmrm)
   - Code generation targets
   - Risk: API changes
   - Mitigation: Generate version-specific code, document requirements

2. **Python Packages** (pandas, statsmodels)
   - Code generation targets
   - Risk: API changes
   - Mitigation: Generate version-specific code, document requirements

### Internal Dependencies

1. **CDISC Standard Library**
   - Must be created as part of project
   - Risk: Time-consuming to build comprehensively
   - Mitigation: Start with core domains, expand iteratively

2. **Test Data**
   - Need CDISC-compliant test datasets
   - Risk: Creating realistic test data is complex
   - Mitigation: Use public datasets (CDISC Pilot), generate synthetic data

3. **Documentation**
   - Must be written concurrently with development
   - Risk: Documentation lags behind code
   - Mitigation: Documentation as part of Definition of Done

---

## Risks

### High Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|---------|------------|
| **Langium limitations prevent implementing complex features** | Medium | High | Early prototyping of complex constructs; engage Langium community; consider workarounds |
| **Generated code produces incorrect results** | Low | Critical | Extensive testing; side-by-side validation; formal verification where possible |
| **Poor user adoption due to steep learning curve** | Medium | High | Invest heavily in documentation, tutorials, examples; user testing; iterative UX improvements |
| **Regulatory concerns prevent adoption** | Medium | High | Engage with regulatory experts early; clear disclaimers; focus on traceability |
| **Competition from established tools** | Low | Medium | Differentiate on interoperability and automation; target early adopters |

### Medium Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|---------|------------|
| **CDISC standards change significantly** | Low | Medium | Version-specific support; automated migration tools |
| **Performance issues with large SAPs** | Medium | Medium | Performance testing; optimization; incremental processing |
| **Key R/Python packages deprecated** | Low | Medium | Target multiple packages; community engagement |
| **Limited development resources** | High | Medium | Prioritize ruthlessly; MVP first; community contributions |

### Low Priority Risks

| Risk | Probability | Impact | Mitigation |
|------|-----------|---------|------------|
| **Langium project discontinued** | Low | High | Fork if necessary; migrate to alternative (Xtext, MPS) |
| **VS Code loses market share** | Low | Low | LSP is standard, can support other editors |
| **Legal issues with licenses** | Low | Medium | Legal review before release |

---

## Competitive Analysis

### Existing Solutions

#### 1. Traditional Approach: Manual R/SAS Programming

**Strengths:**
- Mature ecosystem
- Flexible and powerful
- Well-understood by statisticians
- Extensive package ecosystem

**Weaknesses:**
- Manual translation from prose SAP
- Ambiguity and errors
- Not interoperable
- Limited reusability

**Thunderstruck Advantage:**
- Formal specification eliminates ambiguity
- Automatic validation
- Multi-target code generation

---

#### 2. R Markdown / Quarto

**Strengths:**
- Literate programming (mix code and documentation)
- Reproducible research
- Multiple output formats (HTML, PDF, Word)
- Popular in academia

**Weaknesses:**
- Still requires manual coding
- No formal validation
- Not CDISC-aware
- Limited interoperability

**Thunderstruck Advantage:**
- Formal language vs. code embedded in markdown
- Automatic CDISC validation
- RDF export for semantic interoperability
- Multi-target code generation

---

#### 3. SAS Clinical Standards Toolkit

**Strengths:**
- Designed for CDISC compliance
- Validation macros
- Used in industry

**Weaknesses:**
- SAS-only (expensive license)
- Macro language complexity
- Limited to CDISC validation
- No semantic export

**Thunderstruck Advantage:**
- Open source and multi-language
- Modern language design
- RDF semantic export
- Better IDE support

---

#### 4. R Pharma Packages (e.g., admiral, rtables)

**Strengths:**
- Open source R packages for clinical trials
- ADaM derivation support (admiral)
- Table generation (rtables)
- Growing community

**Weaknesses:**
- Still requires R coding
- No formal specification language
- Limited to R ecosystem
- No cross-language support

**Thunderstruck Advantage:**
- Formal DSL vs. R library
- Multi-language support
- Semantic interoperability
- Higher-level abstractions

---

#### 5. EDC Systems (Medidata Rave, Veeva Vault)

**Strengths:**
- Integrated data collection and analysis
- Compliance features
- Established in industry

**Weaknesses:**
- Proprietary and expensive
- Limited statistical capabilities
- Vendor lock-in
- Not designed for complex analyses

**Thunderstruck Advantage:**
- Open source
- Focused on statistical analysis
- No vendor lock-in
- Interoperable with any data source

---

#### 6. Research Data Management (Yoda, Vivli)

**Strengths:**
- Data sharing platforms
- Standardized metadata
- Multi-study repositories

**Weaknesses:**
- Focus on data storage, not analysis
- Limited analytical tools
- No formal SAP language

**Thunderstruck Advantage:**
- Focus on analysis specification
- Can export to these platforms (RDF)
- Complementary, not competing

---

### Positioning

**Thunderstruck is positioned as:**

> A **language-oriented programming approach** to clinical trial statistical analysis that provides **formal, unambiguous SAP specifications** with **automatic validation** and **multi-target code generation**, enabling **semantic interoperability** across multiple standards ecosystems including **CDISC, W3C Data Cube, OMOP, FHIR, and USDM**.

**Key Value Proposition:**

Thunderstruck is **standards-agnostic** and designed for **maximum interoperability**. Rather than locking users into a single standard, it:
- Leverages W3C Data Cube as an internal representation for flexibility
- Exports to and imports from multiple standard formats
- Bridges clinical research standards (CDISC), healthcare standards (FHIR, OMOP), protocol standards (USDM), and semantic web standards (W3C)
- Enables organizations to work seamlessly across different standards environments

**Target Market:**
- Forward-thinking pharmaceutical/biotech companies
- Academic clinical trial units
- Contract research organizations (CROs)
- Regulatory-focused organizations
- Health systems conducting clinical research

**Differentiation:**
- Only solution with formal DSL for SAPs
- Only solution with native support for multiple standards (CDISC, W3C, OMOP, FHIR, USDM)
- Standards-agnostic architecture enabling maximum interoperability
- Only solution with semantic RDF export for linked data integration
- First-class concept management aligned with SDMX and W3C patterns
- Open source with commercial support option

---

## Timeline & Milestones

### High-Level Roadmap

```
├── Q1 2026: Foundation & MVP
│   ├── Month 1: Project setup, core grammar
│   ├── Month 2: Validation, type system foundation
│   └── Month 3: Basic code generation (R, RDF)
│
├── Q2 2026: Full Language & IDE
│   ├── Month 4: Advanced features, Python generator
│   ├── Month 5: VS Code extension, LSP features
│   └── Month 6: Testing, examples, documentation
│
├── Q3 2026: Beta & Pilot Testing
│   ├── Month 7-8: Beta release, pilot users
│   └── Month 9: Refinement based on feedback
│
└── Q4 2026: v1.0 Release
    ├── Month 10-11: Final testing, documentation
    └── Month 12: Public v1.0 release
```

### Key Milestones

| Milestone | Target Date | Deliverables |
|-----------|------------|--------------|
| **M1: Project Kickoff** | 2026-01-01 | Repository setup, team assembled |
| **M2: Grammar Complete** | 2026-02-01 | All language constructs parseable |
| **M3: Validation Working** | 2026-03-01 | W3C IC validation, CDISC checks |
| **M4: MVP** | 2026-04-01 | Can specify simple SAP, generate R + RDF |
| **M5: Full Code Gen** | 2026-05-01 | R, Python, RDF generators working |
| **M6: IDE Beta** | 2026-06-01 | VS Code extension with LSP features |
| **M7: Alpha Release** | 2026-07-01 | Internal release for testing |
| **M8: Beta Release** | 2026-08-01 | Public beta with pilot users |
| **M9: Feature Complete** | 2026-10-01 | All v1.0 features implemented |
| **M10: v1.0 Release** | 2026-12-01 | Public v1.0 release |

### Release Criteria for v1.0

**Must Have:**
- [ ] Complete Langium grammar for all core constructs
- [ ] Type system with validation
- [ ] W3C IC-1 through IC-21 validation
- [ ] CDISC SDTM/ADaM validation
- [ ] R code generator (lm, lmer, ggplot2)
- [ ] Python code generator (pandas, statsmodels, matplotlib)
- [ ] RDF/Turtle generator (W3C Data Cube compliant)
- [ ] VS Code extension with LSP (completion, validation, go-to-def)
- [ ] 6+ comprehensive examples
- [ ] >80% test coverage
- [ ] Complete user guide and documentation
- [ ] CLI tool
- [ ] CDISC standard library

**Should Have:**
- [ ] MMRM support in R/Python
- [ ] Survival analysis support
- [ ] Semantic highlighting in VS Code
- [ ] Code lenses and quick fixes
- [ ] Cube visualizer
- [ ] Pipeline visualizer

**Nice to Have:**
- [ ] SAS code generator
- [ ] Estimand declarations
- [ ] Template/generic support
- [ ] Auto-generated SAP documents

---

## Appendices

### Appendix A: Glossary

| Term | Definition |
|------|------------|
| **ADaM** | Analysis Data Model - CDISC standard for analysis datasets |
| **Attribute** | Metadata about observations (e.g., imputation method, population flag) |
| **CDISC** | Clinical Data Interchange Standards Consortium |
| **Cube** | Multidimensional data structure with dimensions, measures, and attributes |
| **Dimension** | An axis along which data varies (e.g., Subject, Visit, Treatment) |
| **DSL** | Domain-Specific Language |
| **DSD** | Data Structure Definition - schema describing a cube's structure |
| **Estimand** | ICH E9(R1) framework specifying treatment, population, variable, intercurrent events, and summary |
| **IC** | Integrity Constraint - W3C Data Cube validation rules (IC-1 through IC-21) |
| **LOP** | Language-Oriented Programming |
| **LSP** | Language Server Protocol |
| **Measure** | Observed or computed values in a cube (e.g., ADAS-Cog score, change from baseline) |
| **MMRM** | Mixed Model for Repeated Measures |
| **RDF** | Resource Description Framework - W3C standard for semantic data |
| **SAP** | Statistical Analysis Plan |
| **SDTM** | Study Data Tabulation Model - CDISC standard for raw clinical data |
| **Slice** | Subset of a cube obtained by fixing some dimensions |

### Appendix B: References

1. **W3C Data Cube Vocabulary**
   https://www.w3.org/TR/vocab-data-cube/

2. **CDISC Standards**
   https://www.cdisc.org/standards

3. **ICH E9(R1) Estimands and Sensitivity Analysis**
   https://www.ema.europa.eu/en/ich-e9-statistical-principles-clinical-trials

4. **W3C PROV-O: The PROV Ontology**
   https://www.w3.org/TR/prov-o/
   (W3C Provenance Ontology for representing provenance information in RDF)

5. **CDISC CORE Conformance Rules**
   https://www.cdisc.org/standards/foundational/conformance-rules

6. **USDM (Unified Study Definitions Model)**
   https://www.cdisc.org/standards/foundational/usdm

7. **SDMX (Statistical Data and Metadata eXchange)**
   https://sdmx.org/
   (Reference for concept management patterns)

8. **Langium Documentation**
   https://langium.org/docs/

9. **Language Server Protocol**
   https://microsoft.github.io/language-server-protocol/

10. **Model Context Protocol (MCP)**
    https://modelcontextprotocol.io/
    (Protocol for LLM integration)

### Appendix C: Example SAP Specification (Thunderstruck)

```thunderstruck
// Example: Dose-Response Analysis for Alzheimer's Study

// Import CDISC standard library
import CDISC.ADaM.ADADAS;
import CDISC.ADaM.ADSL;

// Define analysis cube (extends standard ADADAS)
cube StudyXYZ_ADADAS extends ADADAS {
    namespace: "http://example.org/study/xyz#"

    // Additional study-specific dimensions
    structure: {
        dimensions: [
            TRTDOSE: Numeric unit: "mg"
        ]
    }
}

// Define analysis population slice
slice Week24EfficacyPopulation from StudyXYZ_ADADAS {
    fix: {
        AVISIT: "Week 24",
        PARAMCD: "ACTOT11",
        EFFFL: "Y"
    }
    vary: [USUBJID, TRT01A, TRTDOSE, SITEGR1]
    measures: [CHG, BASE]
}

// Define dose-response model
model PrimaryEfficacyModel {
    input: Week24EfficacyPopulation
    formula: CHG ~ TRTDOSE + SITEGR1 + BASE
    family: Gaussian
    link: Identity

    output: DoseResponseResults {
        structure: {
            dimensions: [Parameter: Text],
            measures: [
                Estimate: Numeric,
                StdError: Numeric,
                TValue: Numeric,
                PValue: Numeric,
                CI_Lower: Numeric,
                CI_Upper: Numeric
            ]
        }
    }
}

// Define table display
display table "Table 14.3.01: Dose-Response Analysis" {
    title: "Analysis of ADAS-Cog (11) Change from Baseline at Week 24"
    subtitle: "Linear Model with Dose as Continuous Predictor"

    source: DoseResponseResults
    rows: [Parameter]
    columns: [Estimate, StdError, TValue, PValue, CI_Lower, CI_Upper]

    format: {
        Estimate: {decimals: 3},
        StdError: {decimals: 3},
        TValue: {decimals: 2},
        PValue: {decimals: 4, style: "scientific-if-small"},
        CI_Lower: {decimals: 3},
        CI_Upper: {decimals: 3}
    }

    footnotes: [
        "Population: Full Analysis Set (Efficacy)",
        "Model: CHG ~ TRTDOSE + SITEGR1 + BASE",
        "Missing data: Observed cases only (no imputation)"
    ]
}
```

**Note on Formula Syntax:**

The formula syntax `CHG ~ TRTDOSE + SITEGR1 + BASE` in the `PrimaryEfficacyModel` uses **Wilkinson notation**, a standard for specifying statistical models. This notation is widely used across multiple statistical programming environments including R, Python (statsmodels, patsy), Julia (StatsModels.jl), and SAS (partially).

---

### Appendix D: Formula Syntax Language Reference

#### Overview

Thunderstruck uses **Wilkinson notation** (also called **Wilkinson-Rogers notation**) for specifying statistical model formulas. This notation was introduced by Wilkinson & Rogers (1973) and has become the de facto standard for formula specification in statistical software.

#### Basic Formula Structure

```
response ~ predictors
```

- **Left side (response)**: The dependent variable or outcome
- **`~` (tilde)**: Separates response from predictors, reads as "is modeled by"
- **Right side (predictors)**: Independent variables and their relationships

#### Operators

| Operator | Meaning | Example | Interpretation |
|----------|---------|---------|----------------|
| `+` | Addition | `y ~ x1 + x2` | Include both x1 and x2 as main effects |
| `-` | Removal | `y ~ x1 + x2 - 1` | Include x1 and x2, but remove intercept |
| `:` | Interaction | `y ~ x1:x2` | Include only the interaction between x1 and x2 |
| `*` | Crossing | `y ~ x1*x2` | Equivalent to `x1 + x2 + x1:x2` (main effects + interaction) |
| `/` | Nesting | `y ~ x1/x2` | Equivalent to `x1 + x1:x2` (x2 nested within x1) |
| `^` | Crossing to depth | `y ~ (x1+x2+x3)^2` | All main effects and 2-way interactions |
| `\|` | Conditioning | `y ~ x \| group` | Model y ~ x separately for each group (context-dependent) |
| `1` | Intercept | `y ~ 1 + x` | Explicitly include intercept (usually implicit) |
| `0` or `-1` | No intercept | `y ~ 0 + x` or `y ~ x - 1` | Force model through origin |

#### Examples

**Simple Linear Regression:**
```thunderstruck
formula: CHG ~ TRTDOSE
// Change is modeled by treatment dose
// Equivalent to: CHG = β₀ + β₁×TRTDOSE + ε
```

**Multiple Regression:**
```thunderstruck
formula: CHG ~ TRTDOSE + SITEGR1 + BASE
// Change modeled by dose, site group, and baseline
// Equivalent to: CHG = β₀ + β₁×TRTDOSE + β₂×SITEGR1 + β₃×BASE + ε
```

**Interaction Model:**
```thunderstruck
formula: CHG ~ TRT01A * AVISIT
// Treatment by visit interaction (includes main effects)
// Expanded to: CHG ~ TRT01A + AVISIT + TRT01A:AVISIT
// Equivalent to: CHG = β₀ + β₁×TRT01A + β₂×AVISIT + β₃×(TRT01A×AVISIT) + ε
```

**Model Without Intercept:**
```thunderstruck
formula: CHG ~ 0 + TRT01A
// Force through origin, estimate separate mean for each treatment
```

**Nested Effects:**
```thunderstruck
formula: AVAL ~ TRT01A/SITEID
// Site nested within treatment
// Expanded to: AVAL ~ TRT01A + TRT01A:SITEID
```

**Polynomial Terms:**
```thunderstruck
formula: AVAL ~ TRTDOSE + I(TRTDOSE^2)
// Quadratic dose-response
// Note: I() is the "as-is" function to prevent ^ from being interpreted as interaction-to-depth
```

#### Categorical Variables

Categorical (factor) variables are automatically coded using contrast coding:

```thunderstruck
formula: CHG ~ TRT01A
// If TRT01A has levels: "Placebo", "25mg", "50mg", "100mg"
// Generates 3 dummy variables (treatment coding by default)
```

Common contrast schemes:
- **Treatment/Dummy coding**: Compare each level to reference
- **Sum coding**: Compare each level to grand mean
- **Helmert coding**: Compare each level to mean of subsequent levels
- **Polynomial coding**: For ordered factors

Specify contrast in model:
```thunderstruck
model MyModel {
    formula: CHG ~ TRT01A + SITEGR1
    contrasts: {
        TRT01A: Treatment,  // Default
        SITEGR1: Sum        // Deviation coding
    }
}
```

#### Derivation Functions

Common derivations (exact syntax may vary by target language):

```thunderstruck
formula: log(AVAL) ~ TRTDOSE                 // Log derivation
formula: sqrt(AVAL) ~ TRT01A                 // Square root
formula: AVAL ~ poly(TRTDOSE, 2)             // Orthogonal polynomial (degree 2)
formula: AVAL ~ ns(TRTDOSE, df=3)            // Natural spline
```

#### Random Effects (Mixed Models)

For mixed models, random effects specified separately:

```thunderstruck
model MMRMAnalysis {
    formula: CHG ~ TRT01A * AVISIT + BASE + SITEGR1
    random: {
        subject: USUBJID,
        structure: Unstructured(AVISIT)
    }
}
```

This is equivalent to:
- **Fixed effects**: `CHG ~ TRT01A * AVISIT + BASE + SITEGR1`
- **Random effects**: Random intercept and slopes for each subject across visits

#### Offset Terms

For models with known offset (e.g., Poisson regression with exposure time):

```thunderstruck
formula: AE_COUNT ~ TRT01A + offset(log(EXPOSURE_DAYS))
```

#### Special Notes for Thunderstruck

1. **Type Safety**: Thunderstruck validates that variables in formulas exist in the input cube/slice
2. **Unit Checking**: Operations on variables with units are validated for compatibility
3. **Code Generation**: Same formula generates appropriate syntax for R (`lm()`, `glm()`, `lmer()`), SAS (`PROC GLM`, `PROC MIXED`), etc.
4. **Documentation**: Formulas are included in generated documentation with interpretation

#### References

- Wilkinson, G. N., & Rogers, C. E. (1973). "Symbolic Description of Factorial Models for Analysis of Variance." *Applied Statistics*, 22(3), 392-399.
- Chambers, J. M., & Hastie, T. J. (1992). *Statistical Models in S*. Chapman & Hall.
- R Core Team. *An Introduction to R*. Chapter 11: Statistical models in R.
- SAS Institute. *SAS/STAT User's Guide*. MODEL statement documentation.

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | TBD | ___________ | _______ |
| **Lead Biostatistician** | TBD | ___________ | _______ |
| **Engineering Lead** | TBD | ___________ | _______ |
| **Regulatory Affairs** | TBD | ___________ | _______ |

---

**End of Product Requirements Document**

**Next Steps:**
1. Review with stakeholders
2. Obtain approvals
3. Refine based on feedback
4. Proceed to implementation planning (see THUNDERSTRUCK_IMPLEMENTATION_PLAN.md)
