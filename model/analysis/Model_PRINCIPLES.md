# AC/DC Model Guiding Principles

**Document Purpose:** This document establishes the fundamental guiding principles for the AC/DC metamodel. These principles are derived from successful patterns observed across analyzed CDISC ADaM examples and represent commitments that guide all design, implementation, and usage decisions.

The status of this document is: OPEN FOR REVIEW

**Source Document:** 
- Model_COMPARISON.md (Analysis of 5 CDISC ADaM examples)
- eSAP_DOMAIN_DESIGN.md (Domain-Driven Design analysis of a SAP Template)

**Date:** 2025-12-08

**Version:** 1.0

---

## Table of Contents

1. [GP-1: Layered Architecture with Unidirectional Dependencies](#gp-1-layered-architecture-with-unidirectional-dependencies)
2. [GP-2: Analysis Reproducibility and Provenance](#gp-2-analysis-reproducibility-and-provenance)
3. [GP-3: Complete End-to-End Traceability](#gp-3-complete-end-to-end-traceability)
4. [GP-4: CDISC Standards Alignment](#gp-4-cdisc-standards-alignment)
5. [GP-5: Extensible Core with Progressive Refinement](#gp-5-extensible-core-with-progressive-refinement)
6. [GP-6: Declarative Analysis Specification](#gp-6-declarative-analysis-specification)
7. [GP-7: Regulatory Framework Compliance](#gp-7-regulatory-framework-compliance)
8. [GP-8: Explicit and Automated Quality Rules](#gp-8-explicit-and-automated-quality-rules)
9. [Appendix: Glossary](#appendix-glossary)
10. [Appendix: Change History](#appendix-change-history)

---

## Overview

These guiding principles guide all design, implementation, and usage decisions for the AC/DC metamodel. They are derived from successful patterns observed across all analyzed models and represent non-negotiable commitments.

---

## GP-1: Layered Architecture

**Principle:** The AC/DC metamodel SHALL maintain strict separation between layers with unidirectional dependency flow:

**Three-Layer Structure:**
- **Concepts (Bottom Layer):** Abstract definitions of biomedical, derivation, and analysis concepts
- **Structures (Middle Layer):** Concrete data organization (dimensions, measures, attributes, cubes)
- **Derivations (Top Layer):** Transformations and presentations (slices, methods, displays)

**Unidirectional Dependency Flow:**
```
Derivations → Structures → Concepts
       (depend_on)   (depend_on)
```

**Specific Rules:**
1. **Concepts** (Independent Layer) - SHALL NOT reference structures or derivations
2. **Structures** (Middle Layer) - SHALL ONLY reference concepts, NOT derivations
3. **Derivations** (Dependent Layer) - MAY reference both structures and concepts
4. All model elements must be categorizable into exactly one layer; elements spanning multiple layers are prohibited

**Rationale:** Layered architecture with unidirectional flow ensures:
- Clear separation of concerns and conceptual clarity
- Ability to verify each layer independently
- Reusability of concepts and structures across analyses
- No circular dependencies
- Maintainability (e.g. changes in derivations don't affect other layers)
- Conceptual clarity independent of implementation details

**Evidence:**
- Universally observed across all 5 models (Model_COMPARISON.md, Section 1)
- Critical architectural principle identified in Model_COMPARISON.md, Section 1.1 (Lines 69-113)

**Impact:**
- All model elements must be categorizable into exactly one layer
- Validation rules must enforce dependency direction; references from lower to higher layers are not allowed
- Elements spanning multiple layers are prohibited, although dependencis MAY span layers

---

## GP-2: Analysis Reproducibility and Provenance

**Principle:** The AC/DC metamodel SHALL ensure reproducible analyses with clear metadata lineage through immutable entities and directed acyclic dependencies.

**Immutability Rules:**
1. **Cubes are immutable** - Operations on cubes always produce new cubes
2. **Slices are immutable** - Slicing creates new views without modifying source
3. **Methods produce new outputs** - Methods transform inputs to new outputs, never modifying inputs
4. **No cube SHALL appear as both input and output** of the same method

**DAG Structure Rules:**
1. Source cubes are roots (no dependencies)
2. Derived cubes depend on upstream cubes
3. Result cubes are downstream of derived cubes
4. No cube may depend (directly or transitively) on itself

**Rationale:** Immutable entities and DAG structure ensure analysis reproducibility and provenance through:
- Clear data lineage and provenance
- Reproducibility (same inputs → same outputs)
- Ability to inspect intermediate results at any stage
- Easy to track changes
- Audit trail integrity
- Well-defined order
- Testability at each stage

**Evidence:**
- Pattern 9 identified across all models (Model_COMPARISON.md, Lines 840-899)
- Pattern 3 (Model_COMPARISON.md, Lines 603-655) demonstrates hierarchical cube dependencies

**Impact:**
- All derivation specifications must declare NEW output structures; "modify in-place" semantics are prohibited
- Metamodel toolchain must include cycle detection; circular dependencies are validation errors

---

## GP-3: Complete End-to-End Traceability

**Principle:** Every result SHALL be fully traceable backward through derivations, structure to source concepts.

**Traceability Chain:**
```
Display → Method → Slice → Cube → Measure → Concept
```

**Rationale:** Complete traceability ensures:
- Regulatory compliance (21 CFR Part 11, ICH E9)
- Scientific reproducibility
- Audit capability
- Impact analysis (understanding consequences of changes)
- Quality assurance

**Evidence:** Universal Dependencies section (Model_COMPARISON.md, Section 5, Lines 344-376) demonstrates complete traceability in all 5 models

**Impact:** All elements must declare their relationships; orphaned elements (unreferenced or untraced) are validation errors.

---

## GP-4: CDISC Standards Alignment

**Principle:** The AC/DC metamodel SHALL align with CDISC standards (USDM, SDTM, ADaM, ARS) while providing a higher-level abstraction for analytical specifications.

**CDISC Standards Integration:**

1. **USDM (Unified Study Definitions Model)** - Protocol definitions
   - Defines protocol entities (study design, objectives, endpoints, estimands, populations, workflows)
   - Links to AC/DC Model through **concepts** (analysis concepts, study design concepts, etc.)
   - Protocol-level specifications inform analysis planning
   - Example: USDM StudyEndpoint → AC/DC AnalysisConcept (endpoint definitions)

2. **SDTM (Study Data Tabulation Model)** - Raw data standard
   - Defines source data collection structure
   - Links to AC/DC Model through **structure entities** (source cubes) via **concepts**
   - Example: SDTM LB domain → AC/DC source cube (laboratory data)

3. **ADaM (Analysis Data Model)** - Analysis dataset standard
   - Defines analysis-ready dataset structure
   - Links to AC/DC Model through **structure entities** (cubes, dimensions, measures, attributes) via **concepts**
   - Example: AC/DC Cube → ADaM BDS dataset, AC/DC Measure → ADaM AVAL variable

4. **ARS (Analysis Results Standard)** - Analysis results metadata standard
   - Defines structured representation of analysis results (statistical analyses, outputs, displays)
   - Links to AC/DC Model through **derivation entities** (methods, displays, result cubes)
   - Analysis results and displays are structured according to ARS
   - Examples:
     - AC/DC Method (statistical method) → ARS Analysis/AnalysisMethod
     - AC/DC Display (table/figure/listing) → ARS OutputDisplay/Output
     - AC/DC Result Cube (statistical results) → ARS AnalysisResult data container
     - AC/DC Method.output_measures → ARS ResultGroup

**Specific Requirements:**
1. All source data structures SHALL be traceable to SDTM domains
2. All analysis structures SHALL be mappable to CDISC ADaM datasets and variables
3. Analysis concepts SHALL align with USDM protocol definitions (endpoints, populations, estimands)
4. All displays SHALL be mappable to ARS OutputDisplay entities
5. All statistical methods SHALL be documentable as ARS Analysis/AnalysisMethod entities
6. Result cubes SHALL provide data for ARS AnalysisResult structures
7. Controlled terminology SHALL reference standard vocabularies (NCI Thesaurus, LOINC, SNOMED)
8. Dataset structures SHALL follow ADaM principles (BDS, ADSL, OCCDS, ADTTE)
9. Derivations SHALL be documentable in Define-XML format

**Rationale:** CDISC alignment ensures:
- Regulatory acceptance (FDA, EMA, PMDA)
- Industry interoperability
- Standard data exchange
- Reduced validation burden
- Protocol-to-analysis traceability (via USDM)
- Results-to-protocol traceability (via ARS linking back to USDM)
- Machine-readable analysis results (via ARS)

**Evidence:** Consolidated Issue Theme 3 (Model_COMPARISON.md, Lines 1358-1418) identifies CDISC mapping gaps across all models

**Impact:**
- CDISC mapping layer is mandatory for all production models; it should be declarative and verifiable
- USDM protocol definitions should inform AC/DC concept definitions to ensure protocol-to-analysis alignment
- ARS mappings enable automated generation of structured analysis results metadata for regulatory submissions

---

## GP-5: Extensible Core with Progressive Refinement

**Principle:** The metamodel core SHALL be domain-agnostic (applicable to any therapeutic area) while supporting both study-specific extension through progressive refinement from high-level conceptual specifications to fully detailed executable specifications.

**Domain Agnostic Core (Universal):**
- Three-tier architecture
- Standard Concept Library (Common concept definitions)
- Structural categories (dimensions, measures, attributes, cubes)
- Derivation categories (slices, methods, displays)
- Dependency patterns

**Domin-Specific Extensions:**
- Biomedical concept vocabularies (cardiology, oncology, psychiatry, etc.)
- Measurement scales and instruments (POMS, VAS, spirometry protocols)
- Clinical thresholds and criteria (Hy's Law, tumor response criteria)
- Assessment schedules

**Levels of Model Detail (Progressive Refinement):**

Models are valid at any level of detail appropriate to their intended use. Completeness requirements are context-dependent rather than absolute. For example:

1. **Conceptual Level (High-Level SAP):**
   - Analysis concepts and objectives defined
   - Endpoints identified (primary, secondary, safety)
   - Populations specified (ITT, Safety, PP)
   - Statistical approaches named (e.g., "ANCOVA", "logistic regression")
   - Displays identified by type and purpose
   - **Not required:** Detailed method parameters, complete cube specifications, derivation formulas

2. **Logical Level (Detailed SAP):**
   - Complete analysis concepts with relationships to USDM protocol definitions
   - Full method specifications (formulas, parameters, covariates)
   - Cube structures defined (dimensions, measures, attributes)
   - Slicing and subsetting logic specified
   - Display structures defined (rows, columns, statistics)
   - **Not required:** Implementation-specific details, CDISC variable mappings, software-specific code

3. **Physical Level (Executable Specification):**
   - All CDISC mappings complete (USDM, SDTM, ADaM, ARS)
   - All method input/output signatures fully specified
   - All cube record structures documented
   - All derivation formulas and logic complete
   - All display formatting and data sources specified
   - **Supports:** Full automated code generation and execution

**Progressive Refinement Workflow:**

Models typically evolve through progressive refinement:

```
Protocol → High-Level SAP → Detailed SAP → Executable Model → Generated Code
(USDM)    (Conceptual)      (Logical)      (Physical)        (SAS/R/Python)
```

At each stage, the model gains detail while maintaining validity and usefulness.

**Use Cases for Partial/High-Level Models:**

1. **Stakeholder Review and Collaboration:**
   - Share high-level analysis strategy with clinical teams, regulatory affairs, and external partners
   - Review and approve analysis approach before detailed specification
   - Communicate analysis plans without overwhelming stakeholders with implementation details
   - Enable early feedback on analysis strategy

2. **Protocol-to-SAP Alignment:**
   - Map protocol objectives and endpoints to analysis concepts
   - Demonstrate alignment with USDM protocol definitions
   - Trace endpoints through to planned analyses
   - Validate completeness of analysis coverage for protocol objectives

3. **Cross-Study Integration:**
   - Define high-level integrated analyses (ISE, ISS) that reference detailed study-level models
   - Reuse detailed model definitions across studies within therapeutic area
   - Standardize analysis approaches across development program
   - Share analysis patterns as templates

4. **Organizational Standardization:**
   - Define company-wide analysis standards at conceptual/logical level
   - Create reusable analysis templates for common study types
   - Establish therapeutic area-specific analysis libraries
   - Share best practices across statistical programming teams

5. **Regulatory Interchange:**
   - Exchange analysis strategies with health authorities (e.g., pre-submission meetings)
   - Respond to regulatory questions about analysis approach
   - Document analysis modifications requested by regulators
   - Support transparency without exposing proprietary implementation details

6. **Vendor and Partner Collaboration:**
   - Specify analysis requirements for CRO partners
   - Exchange analysis designs with collaborators
   - Enable different organizations to implement analyses from shared specifications
   - Support multi-site collaborative studies

**Validation and Completeness:**

Validation rules SHALL be **level-aware**:

1. **Always Required (All Levels):**
   - Three-tier architectural separation (GP-1)
   - Unidirectional dependency flow (GP-1)
   - DAG structure - no circular dependencies (GP-2)
   - Entity identifiers are unique

2. **Required for Logical Level and Above:**
   - Analysis concepts align with protocol endpoints
   - Populations are defined
   - Statistical methods are identified
   - Displays trace to analyses

3. **Required for Physical Level (Executable):**
   - Complete method input/output signatures (BR-4)
   - All cube record structures specified (Anti-Pattern 7)
   - CDISC mappings complete (GP-4, BR-1)
   - All derivation formulas and parameters complete
   - Immutability enforced - methods declare new output cubes (GP-2)

**Rationale:**
- **Domain Agnosticism:** Broad applicability across therapeutic areas, reusable core tooling, standardization where appropriate, flexibility where necessary
- **Progressive Refinement:** Models useful at every stage of development, stakeholders engage at appropriate detail level, early validation and feedback, reuse and standardization across projects, gradual investment in detail as project matures

**Evidence:**
- Section 4 (Model_COMPARISON.md, Lines 463-479) demonstrates domain variations across 5 therapeutic areas
- Common practice in SAP development progresses from outline → draft → final
- Industry need for analysis specification interchange without implementation exposure

**Impact:**
- Concept libraries should be modular and importable; core metamodel should not hard-code domain-specific elements
- Validation tools must support configurable completeness requirements
- Models must declare their completeness level and intended use
- Downstream tools (code generators) require physical-level completeness
- Upstream tools (protocol alignment, review) work with conceptual/logical levels
- Documentation generation adapts to model completeness level
- Version control and change management track refinement progression

---

## GP-6: Declarative Analysis Specification

**Principle:** Statistical analyses SHALL be specified declaratively through explicit concept definitions that describe:
- **Analysis intent** (endpoints, estimands, populations, objectives)
- **Data requirements** (variables, datasets, observations, measurements)
- **Derivation logic** (transformations, calculations, aggregations)

These concept definitions are implemented through a metamodel with the following capabilities:

**Concept Definition Capabilities:**

Concepts may be defined with:

1. **Properties (Attributes):**
   - Name and description
   - Data type (numeric, text, categorical, date, boolean)
   - Unit of measurement
   - Valid value ranges or constraints
   - Precision specifications
   - Standard codes (LOINC, SNOMED, NCI Thesaurus)
   - Measurement instrument or assessment scale
   - Clinical significance thresholds

2. **Relationships to Other Concepts:**
   - **Hierarchical:** Parent-child relationships (e.g., "ALT" is-a "Liver Function Test")
   - **Compositional:** Part-of relationships (e.g., "Systolic BP" part-of "Blood Pressure")
   - **Derivational:** Derived-from relationships (e.g., "Change from Baseline" derived-from "Value" and "Baseline Value")
   - **Temporal:** Precedes/follows relationships (e.g., "Baseline" precedes "Post-Baseline")
   - **Associative:** Related-to relationships (e.g., "Hy's Law Criteria" related-to "ALT", "AST", "Bilirubin")
   - **Equivalence:** Same-as relationships for mapping across standards

3. **Behavioral Specifications:**
   - Calculation rules or formulas
   - Validation logic
   - Missing data handling defaults
   - Aggregation methods (sum, mean, max, etc.)

**Concepts as Building Blocks for Analysis Specification:**

To allow any statistical analysis plan (SAP) to be modelled, the concept metamodel supports:

1. **Definition of Basic Elements:**
   - Data types (numeric, text, date, boolean)
   - Basic dimensions (subject, time, treatment, parameter)
   - Basic operations (arithmetic, comparison, aggregation)
   - Basic concepts (biomedical measurements, temporal markers, etc.)

2. **Combining Elements:**
   - Combine basic concepts to form more complex concepts
   - e.g. Change from Baseline, Percent Change, Estimands, Composite Endpoints, etc.
   - Dependencies organized as directed acyclic graph
   - Ensure consistency and reuse of concepts
   - Traceability e.g. See that "Overall Response" depends on Target Lesions, Non-Target Lesions, and
  New Lesions, etc.

3. **Grouping and Reusing Definitions:**
   - Named concepts definitions to enable reuse and unique identification
   - Concept hierarchies organised into parent-child trees to allow grouping e.g. "all liver function tests"
   - Inherited properties by all child concepts (e.g. "all liver function tests requires fasting: false")
   - Concept libraries to organize domain knowledge
   - Parameterized concept templates

**Using Concept Definitions:**

When structures or derivations reference concepts, they **use** those concept definitions to provide their properties and behaviors:

1. **Using Concepts in Structures:**

NOTE EXAMPLES ARE INDICATIVE AND DO NOT IMPLY DESIGN DECISIONS
   ```yaml
   # Concept Definition
   Concept:
     name: "ALT"
     type: "BiomedicalConcept"
     properties:
       data_type: "numeric"
       unit: "U/L"
       range: [0, 1000]
       standard_code:
         system: "LOINC"
         code: "1742-6"
       clinical_thresholds:
         - name: "Upper_Limit_Normal"
           value: 40
           unit: "U/L"

   # Measure Using the Concept
   Measure:
     name: "alt_result"
     concept: "ALT"  # References the concept
     # Inherits: data_type=numeric, unit=U/L, range=[0,1000], standard_code
     # Can override or extend:
     precision: 1  # decimal place
     missing_allowed: true
   ```

2. **Using Concepts in Derivations:**
   ```yaml
   # Concept Definition
   Concept:
     name: "ChangeFromBaseline"
     type: "DerivationConcept"
     properties:
       formula: "post_value - baseline_value"
       requires:
         - "post_value"
         - "baseline_value"

   # Method Using the Concept
   Method:
     name: "calculate_alt_change"
     concept: "ChangeFromBaseline"  # References the concept
     # Inherits formula and requirements
     parameters:
       post_value: "alt_result"
       baseline_value: "alt_baseline"
     output: "alt_change"
   ```

**Rationale:** Declarative specification through concepts enables statisticians to:
- **Specify what, not how** - Declare analysis objectives, data needs, and derivation relationships without implementation details
- **Communicate clearly** - Analysis specifications understandable to clinical, statistical, and programming teams
- **Maintain independently** - Concepts define domain knowledge separately from implementation
- **Reuse effectively** - Concept definitions shared across studies, therapeutic areas, and organizations
- **Validate early** - Declarative specifications enable validation before implementation
- **Evolve iteratively** - Statistical Analysis Plans refined through concept definitions rather than code modifications
- **Interoperate seamlessly** - Concept mappings to standards (USDM, CDISC) are explicit and verifiable

The structured framework for defining analysis concepts provides the mechanism for expressing these declarative specifications.

**Evidence:**
- Pattern 2 (Model_COMPARISON.md, Lines 582-600) demonstrates concept hierarchies and reuse
- Section 2 (Model_COMPARISON.md, Lines 115-153) shows biomedical and derivation concepts across all models
- Pattern 3 (Model_COMPARISON.md, Lines 603-655) demonstrates composition via cube hierarchies
- GP-1 (Layered Architecture) implements layered structure
- GP-2 (Analysis Reproducibility and Provenance) demonstrates composition of cubes via methods
- GP-5 (Extensible Core) requires pluggable concept libraries and domain extensions

**Impact:**
- **Metamodel Structure:** Must support concept definition with properties, relationships, and behavioral specifications
- **Validation:** Must verify that structures reference valid concepts and concept completeness
- **Concept Libraries:** Standard libraries (therapeutic areas, organizations) become important reusable assets
- **Tooling:** Concept browsers, editors, and validators become essential development tools
- **Documentation:** Concept definitions auto-generate glossaries and data dictionaries
- **Extension Mechanism:** New analysis types added via concept definitions, not metamodel changes
- **CDISC Integration:** Concepts serve as linking layer between AC/DC elements and CDISC standards (USDM, ADaM, ARS)

---

## GP-7: Regulatory and GxP Framework Compliance

**Principle:** The AC/DC metamodel SHALL align with regulatory frameworks including GxP, ICH guidelines (E3, E9, E9(R1)), and industry standards, providing first-class support for regulatory requirements such as the ICH E9(R1) estimand framework and enabling compliant integration patterns across bounded contexts.

**Estimand Components:**

An estimand SHALL be explicitly specified with all required ICH E9(R1) components:

1. **Treatment Condition** - The treatments or interventions being compared
2. **Population** - The patient population for which the treatment effect is being estimated
3. **Variable (Endpoint)** - The outcome or endpoint being measured
4. **Intercurrent Events** - Events occurring after treatment initiation that affect interpretation
5. **Population-Level Summary** - How individual outcomes are combined (e.g., mean difference, hazard ratio)

**Intercurrent Event Handling Strategies:**

The metamodel SHALL support all five ICH E9(R1) strategies:

1. **Treatment Policy Strategy** - Include all data regardless of intercurrent events
   - Example: Include data after treatment discontinuation or rescue medication use
   - Reflects "real-world" treatment effect

2. **Composite Strategy** - Treat intercurrent event occurrence as component of outcome
   - Example: Death or hospitalization as composite endpoint
   - Intercurrent event incorporated into variable definition

3. **Hypothetical Strategy** - Estimate outcome as if intercurrent event had not occurred
   - Example: Effect if patients had not discontinued treatment
   - Requires imputation or modeling

4. **While-On-Treatment Strategy** - Consider only data collected while on treatment
   - Example: Efficacy evaluated only during active treatment period
   - Data censored at intercurrent event

5. **Principal Stratum Strategy** - Estimate effect in subpopulation unaffected by intercurrent event
   - Example: Effect in patients who would complete treatment under both arms
   - Requires principal stratification statistical methods

**Estimand-First Design Pattern:**

The metamodel SHALL support the recommended "Estimand-First" workflow:

```
Protocol Objectives → Estimand Definition → Analysis Specification → Method Selection → Displays
```

**Specific Requirements:**

1. **Estimand Entity:** Explicit estimand structure with all five components
2. **Analysis-to-Estimand Traceability:** Every analysis SHALL trace to one or more estimands
3. **Strategy-Driven Data Handling:** Intercurrent event handling strategy determines data inclusion/exclusion rules
4. **Multiple Estimands per Endpoint:** Support primary estimand plus sensitivity/supplementary estimands
5. **Pre-Specification:** Estimands SHALL be specified before database lock

**Example:**

THIS IS INDICATIVE ONLY AND DOES NOT IMPLY DESIGN DECISIONS
```yaml
Estimand:
  name: "Primary_Efficacy_Estimand"
  components:
    treatment: ["Active_Drug", "Placebo"]
    population: "ITT_Population"
    variable: "FEV1_Change_Week_12"
    intercurrent_events:
      - event: "Treatment_Discontinuation"
        strategy: "Hypothetical"  # Effect if patients had not discontinued
      - event: "Rescue_Medication"
        strategy: "Treatment_Policy"  # Include data after rescue medication
    summary_measure: "Mean_Difference_Between_Treatment_Arms"

Analysis:
  name: "Primary_Efficacy_Analysis"
  implements_estimand: "Primary_Efficacy_Estimand"
  method: "MMRM"  # Chosen to align with hypothetical strategy
  # ...
```

**Rationale:** Estimand framework support ensures:
- **Alignment with ICH E9(R1)** - Regulatory expectation for new trials
- **Clear Clinical Questions** - Explicit statement of what is being estimated
- **Appropriate Method Selection** - Statistical methods chosen to match estimand strategy
- **Interpretability** - Unambiguous interpretation of analysis results
- **Sensitivity Analysis Structure** - Multiple estimands explore robustness
- **Regulatory Acceptance** - Demonstrable alignment with guideline expectations

**Evidence:**
- ICH E9(R1) Addendum (2019) mandates estimand framework for confirmatory trials
- eSAP Domain Design patterns (eSAP_DOMAIN_DESIGN.md, Pattern 11.1.1, Lines 1588-1593)
- Anti-pattern: Ignoring intercurrent events (eSAP_DOMAIN_DESIGN.md, Anti-Pattern 11.2.5, Lines 1658-1662)

**GxP and ICH Compliance:**

The metamodel SHALL support compliance with:
- **GxP Principles:** Good Clinical, Laboratory, and Manufacturing Practices
- **ICH E3:** Structure and Content of Clinical Study Reports
- **ICH E9:** Statistical Principles for Clinical Trials
- **ICH E9(R1):** Estimand Framework (as detailed above)
- **21 CFR Part 11:** Electronic Records and Electronic Signatures
- **Data Integrity (ALCOA+):** Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available

**Rationale:** Regulatory framework compliance ensures:
- Acceptance by health authorities (FDA, EMA, PMDA)
- Scientific rigor and reproducibility
- Auditability and transparency
- Industry interoperability
- Protection against regulatory risk

**Evidence:**
- ICH E9(R1) mandates estimand framework for confirmatory trials
- eSAP Domain Design patterns and DDD strategic patterns for integration
- Regulatory requirements for GxP, data integrity, and electronic records

**Impact:**
- Metamodel Concepts must be able to support modelling of Estimand entities with all ICH E9(R1) components
- Analysis specifications must reference estimands explicitly
- Validation rules must verify estimand completeness and GxP compliance
- Data handling rules derived from intercurrent event strategies
- Integration patterns must be explicitly specified (not implicit)
- Event structure definitions required for event-driven coordination
- Display metadata traces through analysis to estimand to protocol objective
- CDISC mappings: Estimand → USDM Protocol definitions, Analysis → ARS metadata

---

## GP-8: Explicit and Automated Analysis Rules

**Principle:** Analysis checks, validation rules, and constraints SHALL be explicitly specified as part of the analysis model and automatically verified, rather than maintained separately as manual checklists or embedded implicitly in code, etc.

**Key Requirements:**
- Rules are documented declaratively within the model specification
- Rules are automatically checked during model validation
- Rules are versioned alongside the statistical analysis model

**Examples of Analysis Rules:**
- Every analysis must reference at least one estimand
- Analysis populations must be defined before use
- Baseline must occur before post-baseline measurements
- Primary endpoint significance level must be pre-specified
- CDISC ADaM mappings must be complete for executable models
- Dependencies must be acyclic (no circular references)
- SAP finalization date must precede database lock date
- Estimands must include all five ICH E9(R1) components
- P-values and significance levels must be between 0 and 1
- Baseline values must exist for change-from-baseline analyses

**Rationale:**
- **Quality by design** - Validation is built into the specification, not bolted on afterward
- **Automation** - Rules checked automatically, reducing manual QC burden
- **Transparency** - Rules are explicit and auditable
- **Consistency** - Same rules applied uniformly across all analyses
- **Traceability** - Rule violations traceable to specific model elements

**Evidence:**
- eSAP Domain Design (Recommendation 14.2.8): "Validation as Domain Concern"
- Industry practice: Ability to run concormance check using an automated tooling
- FDA emphasis on quality by design and automated validation in 21 CFR Part 11

**Impact:**
- Model specifications must include explicit quality rules
- Validation engine required to automatically check rules
- Rules must be versioned with the analysis model
- Rule violations produce clear, actionable error messages
- Documentation auto-generated from rule specifications
- Regulatory submissions include rule specifications and verification reports

---

## Appendix: Glossary

**AC/DC:** Analysis Concept and Derivation Concept - a metamodel for clinical trial analysis specification

**ADaM:** Analysis Data Model - CDISC standard for analysis datasets

**ANCOVA:** Analysis of Covariance - linear model with continuous outcome and both categorical and continuous predictors

**ARS:** Analysis Results Standard - CDISC standard for structured representation of analysis results metadata (statistical analyses, outputs, displays)

**BDS:** Basic Data Structure - an ADaM dataset structure for analysis variables

**CDISC:** Clinical Data Interchange Standards Consortium - organization defining clinical trial data standards

**CMH Test:** Cochran-Mantel-Haenszel test - statistical test for association in stratified contingency tables

**Cube:** Multi-dimensional data structure organized by dimensions, containing measures, qualified by attributes

**DAG:** Directed Acyclic Graph - graph structure with no cycles

**Dimension:** Data component that identifies and organizes observations (e.g., subject, treatment, visit)

**Display:** Formatted presentation of results (table, figure, or listing)

**FAS:** Full Analysis Set - population as close as possible to intention-to-treat

**FWER:** Family-Wise Error Rate - probability of making one or more Type I errors

**ICH:** International Council for Harmonisation - develops guidelines for pharmaceutical development

**ISE:** Integrated Summary of Efficacy - cross-study efficacy summary for regulatory submissions

**ISS:** Integrated Summary of Safety - cross-study safety summary for regulatory submissions

**ITT:** Intent-to-Treat - analysis population including all randomized subjects

**LOCF:** Last Observation Carried Forward - imputation method

**MAR:** Missing At Random - missing data mechanism where missingness depends on observed data

**MCAR:** Missing Completely At Random - missing data mechanism where missingness is unrelated to any data

**Measure:** Quantitative or qualitative value being analyzed (e.g., BMD value, p-value)

**Method:** Statistical or mathematical computation transforming inputs to outputs

**MMRM:** Mixed Model for Repeated Measures - longitudinal analysis method

**MNAR:** Missing Not At Random - missing data mechanism where missingness depends on unobserved data

**PP:** Per-Protocol - analysis population including subjects who completed the study per protocol without major violations

**PSUR:** Periodic Safety Update Report - ongoing safety monitoring report submitted to regulatory authorities

**REML:** Restricted Maximum Likelihood - estimation method for mixed models

**RMP:** Risk Management Plan - safety analyses and strategies supporting risk characterization for regulatory submissions

**SAP:** Statistical Analysis Plan - detailed document specifying all planned analyses, populations, endpoints, and statistical methods

**SDTM:** Study Data Tabulation Model - CDISC standard for raw data collection

**Slice:** Subset of a cube created by fixing one or more dimension values

**TLF:** Tables, Listings, and Figures - standard clinical trial outputs

**USDM:** Unified Study Definitions Model - CDISC standard for protocol definitions (study design, objectives, endpoints, estimands, populations, workflows)

---

## Appendix: Change History

### Version 1.0 (2025-12-08)

**Changes:**
- Document created and issued for (human) review

---

**END OF DOCUMENT**

