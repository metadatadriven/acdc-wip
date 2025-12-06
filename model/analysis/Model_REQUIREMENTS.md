# AC/DC Model Requirements Specification

**Document Purpose:** This requirements document synthesizes findings from the AC/DC Model Comparison analysis (Model_COMPARISON.md) to establish guiding principles, business requirements, and user requirements for the AC/DC metamodel. These requirements ensure the metamodel supports comprehensive clinical trial analysis and reporting for CDISC-compliant pharmaceutical and medical device studies.

**Source Document:** Model_COMPARISON.md (Analysis of 5 CDISC ADaM examples)

**Date:** 2025-12-06

**Version:** 1.0

---

## Table of Contents

1. [Guiding Principles](#guiding-principles)
2. [Business Requirements](#business-requirements)
3. [User Requirements](#user-requirements)
4. [Requirements Traceability](#requirements-traceability)
5. [Acceptance Criteria](#acceptance-criteria)

---

## Guiding Principles

These fundamental principles guide all design, implementation, and usage decisions for the AC/DC metamodel. They are derived from successful patterns observed across all analyzed models and represent non-negotiable architectural commitments.

### GP-1: Three-Tier Architectural Separation

**Principle:** The AC/DC metamodel SHALL maintain strict separation between three architectural tiers:
- **Concepts:** Abstract definitions of biomedical, derivation, and analysis entities
- **Structures:** Concrete data organization (dimensions, measures, attributes, cubes)
- **Derivations:** Transformations and presentations (slices, methods, displays)

**Rationale:** This separation ensures clear semantic layers, promotes reusability, and maintains conceptual clarity independent of implementation details.

**Evidence:** Universally observed across all 5 models (Model_COMPARISON.md, Section 1)

**Impact:** All model elements must be categorizable into exactly one tier; mixed-tier entities are prohibited.

---

### GP-2: Unidirectional Dependency Flow (Clean Architecture)

**Principle:** Dependencies SHALL flow in ONE direction through the tiers:

```
Derivations → Structures → Concepts
   (top)       (middle)     (bottom)
```

**Specific Rules:**
1. **Concepts** (Independent Layer) - SHALL NOT reference structures or derivations
2. **Structures** (Middle Layer) - SHALL ONLY reference concepts, NOT derivations
3. **Derivations** (Dependent Layer) - MAY reference both structures and concepts

**Rationale:** Unidirectional flow ensures:
- Independent testability of each tier
- Reusability of concepts and structures across analyses
- No circular dependencies
- Clear semantic interpretation
- Maintainability (changes in derivations don't affect lower tiers)

**Evidence:** Critical architectural principle identified in Model_COMPARISON.md, Section 1.1 (Lines 69-113)

**Impact:** Validation rules must enforce this dependency direction; upward references are design violations.

---

### GP-3: Immutability Principle

**Principle:** All AC/DC entities (cubes, slices, measures, dimensions) SHALL be immutable. Operations produce new entities; they NEVER modify existing entities in-place.

**Specific Rules:**
1. **Cubes are immutable** - Operations on cubes always produce new cubes
2. **Slices are immutable** - Slicing creates new views without modifying source
3. **Methods produce new outputs** - Methods transform inputs to new outputs, never modifying inputs
4. **No cube SHALL appear as both input and output** of the same method

**Rationale:** Immutability ensures:
- Clear data lineage and provenance
- Safe parallelization (no race conditions)
- Reproducibility (same inputs → same outputs)
- Debuggability (inspect intermediate results at any stage)
- Version control friendliness
- Audit trail integrity

**Evidence:** Pattern 9 identified across all models (Model_COMPARISON.md, Lines 840-899)

**Impact:** All method specifications must declare NEW output cubes; "modify in-place" semantics are prohibited.

---

### GP-4: Complete End-to-End Traceability

**Principle:** Every display output SHALL be fully traceable backward through methods, cubes/slices, measures, and ultimately to source concepts. Every concept SHALL be traceable forward to its realization in structures and derivations.

**Traceability Chain:**
```
Display → Method → Slice → Cube → Measure → Derivation Concept → Biomedical Concept
```

**Rationale:** Complete traceability ensures:
- Regulatory compliance (21 CFR Part 11, ICH E9)
- Scientific reproducibility
- Audit capability
- Impact analysis (understanding consequences of changes)
- Quality assurance

**Evidence:** Universal Dependencies section (Model_COMPARISON.md, Section 5, Lines 344-376) demonstrates complete traceability in all 5 models

**Impact:** All entities must declare their relationships; orphaned entities (unreferenced or untraced) are validation errors.

---

### GP-5: CDISC Standards Alignment

**Principle:** The AC/DC metamodel SHALL align with CDISC standards (USDM, SDTM, ADaM, ARS) while providing a higher-level abstraction for analytical specifications.

**CDISC Standards Integration:**

1. **USDM (Unified Study Definitions Model)** - Protocol definitions
   - Defines protocol entities (study design, objectives, endpoints, estimands, populations, workflows)
   - Links to AC/DC Model through **concepts** (analysis concepts, study design concepts)
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
1. All structures SHALL be mappable to CDISC ADaM datasets and variables
2. All source cubes SHALL be traceable to SDTM domains
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

### GP-6: Explicit Over Implicit Design

**Principle:** All aspects of analysis specification SHALL be explicit rather than relying on implicit conventions or assumptions.

**Examples:**
- Baseline definitions must be explicitly specified (not assumed)
- Missing data handling must be declared (not defaulted silently)
- Statistical model parameters must be complete (covariance structure, DF methods, contrasts)
- Cube record structure must be stated ("one record per subject per visit")
- Method inputs and outputs must be fully declared

**Rationale:** Explicitness ensures:
- No ambiguity in interpretation
- Automated validation capability
- Clear documentation
- Reduced errors from misunderstood assumptions
- Facilitates code generation

**Evidence:** Multiple anti-patterns identified (Model_COMPARISON.md, Sections Anti-Patterns 3, 4, 7) demonstrate problems from implicit specifications

**Impact:** Schema specifications must include required fields for all critical properties; optional fields should have explicit default values.

---

### GP-7: Separation of Data and Presentation

**Principle:** Display specifications SHALL separate data sources from presentation formatting. The same data SHALL be presentable in multiple formats (tables, figures, listings) without duplication.

**Specific Rules:**
1. **Data sources** (cubes, slices, methods) - independent of presentation
2. **Structure** (rows, columns, axes) - dimension-driven, not value-driven
3. **Formatting** (number formats, styles) - separate from structure
4. **Metadata** (titles, footnotes) - separate from data

**Rationale:** Separation enables:
- Reusable display templates
- Multiple output formats (PDF, RTF, HTML, interactive)
- Consistent styling across study
- Automated generation
- Independent testing of data vs presentation

**Evidence:** Pattern 5 (Model_COMPARISON.md, Lines 709-756) and Anti-Pattern 6 (Lines 1156-1205) contrast good vs poor separation

**Impact:** Display schemas must reference dimensions/measures abstractly, not hard-code specific values.

---

### GP-8: Directed Acyclic Graph (DAG) Structure

**Principle:** Cube dependencies SHALL form a directed acyclic graph (DAG). Circular dependencies are prohibited.

**Specific Rules:**
1. Source cubes are roots (no dependencies)
2. Derived cubes depend on upstream cubes
3. Result cubes are downstream of derived cubes
4. No cube may depend (directly or transitively) on itself

**Rationale:** DAG structure ensures:
- Well-defined computation order
- Incremental computation possibility
- Testability at each stage
- Clear provenance
- Parallelization opportunities

**Evidence:** Pattern 3 (Model_COMPARISON.md, Lines 603-655) demonstrates hierarchical cube dependencies across all models

**Impact:** Metamodel must include cycle detection; circular dependencies are validation errors.

---

### GP-9: Analysis Purpose and Category Classification

**Principle:** The metamodel SHALL support classification and differentiation of analyses by purpose and category as defined in the protocol and Statistical Analysis Plan (SAP), recognizing that different analysis types have distinct statistical, regulatory, and reporting requirements.

**Analysis Categories:**

The metamodel supports all analysis categories defined in protocol and SAP:

1. **Protocol-Defined Analyses:**
   - **Primary Efficacy Analyses:** Confirmatory analyses addressing primary study objectives with strict statistical rigor
   - **Secondary Efficacy Analyses:** Supportive analyses addressing secondary objectives
   - **Safety Analyses:** Monitoring and characterizing safety profile (adverse events, laboratory values, vital signs)
   - **Exploratory Analyses:** Hypothesis-generating investigations pre-specified in protocol

2. **SAP-Defined Analyses:**
   - **Pre-specified Sensitivity Analyses:** Assessing robustness of primary/secondary results
   - **Pre-specified Subgroup Analyses:** Examining consistency of effects across patient subgroups
   - **Additional Protocol Analyses:** Other analyses specified in SAP to support protocol objectives

3. **Post-Hoc Analyses:**
   - **Ad-Hoc Analyses:** Analyses developed after database lock, not pre-specified in protocol/SAP
   - **Regulatory Request Analyses:** Analyses performed in response to health authority questions

4. **Regulatory Reporting Analyses:**
   - **Integrated Summary of Efficacy (ISE):** Cross-study efficacy summaries
   - **Integrated Summary of Safety (ISS):** Cross-study safety summaries
   - **Periodic Safety Update Reports (PSUR):** Ongoing safety monitoring
   - **Risk Management Plan (RMP) Analyses:** Safety analyses supporting risk characterization

**Endpoint-to-Analysis Relationship:**

- **Protocol defines endpoints** (e.g., Primary endpoint: FEV1 AUC 0-12hr; Secondary endpoint: FEV1 AUC 12-24hr; Safety endpoint: Hy's Law criteria)
- **Each analysis reports on one or more endpoints** (e.g., Primary Efficacy Analysis may report primary endpoint only; Integrated Efficacy Analysis may report primary + all secondary endpoints)
- **Same endpoint may appear in multiple analyses** (e.g., Primary endpoint in primary analysis, sensitivity analyses, subgroup analyses)

**Key Differentiators by Analysis Category:**

| Aspect | Primary Efficacy | Secondary Efficacy | Safety | Exploratory | Ad-Hoc |
|--------|------------------|-----------------------|--------|-------------|---------|
| **Pre-specification** | Protocol | Protocol | Protocol | Protocol | Post-hoc |
| **Population** | ITT, FAS, PP | ITT, FAS, PP | Safety, Treated | ITT, Safety | Varies |
| **Statistical Focus** | Hypothesis testing | Hypothesis testing | Descriptive, monitoring | Hypothesis generating | Varies |
| **Multiplicity Control** | Strict (FWER) | Controlled or exploratory | Minimal/none | None | None |
| **Primary Displays** | Test results, CIs, p-values | Test results, CIs, p-values | Incidence, shift tables | Descriptive, exploratory | Varies |
| **Regulatory Weight** | Confirmatory (labeling) | Supportive | Required (safety profile) | Supportive | Minimal |

**Analysis Specification Requirements:**

Each analysis SHALL be specified with:
1. **Analysis identifier** - Unique name/ID
2. **Analysis category** - From categories above (primary efficacy, safety, ad-hoc, etc.)
3. **Analysis purpose** - Brief description of objective
4. **Endpoints addressed** - Which protocol-defined endpoints are analyzed
5. **Population(s)** - Which analysis populations are used
6. **Statistical approach** - Methods, models, hypothesis tests
7. **Pre-specification status** - Protocol, SAP, or post-hoc
8. **Regulatory role** - Confirmatory, supportive, exploratory, monitoring
9. **Displays produced** - Tables, figures, listings generated

**Rationale:** Classification ensures:
- Appropriate statistical rigor for analysis purpose
- Correct population selection
- Proper multiplicity control strategy
- Clear regulatory role and interpretation
- Traceability from protocol endpoints to analysis outputs
- Transparency regarding pre-specification vs post-hoc status

**Evidence:** Consolidated Issue Theme 9 (Model_COMPARISON.md, Lines 1667-1718) contrasts safety (HysLaw) vs efficacy analyses; Protocol and SAP structures from USDM

**Impact:**
- Analysis configuration must declare category, purpose, and endpoints
- Different analysis categories have different validation constraints
- Displays must trace to specific analyses and endpoints
- Pre-specification status affects interpretation and regulatory weight

---

### GP-10: Domain Agnostic Core with Domain-Specific Extensions

**Principle:** The metamodel core SHALL be domain-agnostic (applicable to any therapeutic area) while supporting domain-specific extensions through pluggable ontologies.

**Core (Universal):**
- Three-tier architecture
- Structural categories (dimensions, measures, attributes, cubes)
- Derivation categories (slices, methods, displays)
- Dependency patterns

**Extensions (Domain-Specific):**
- Biomedical concept vocabularies (cardiology, oncology, psychiatry, etc.)
- Measurement scales and instruments (POMS, VAS, spirometry protocols)
- Clinical thresholds and criteria (Hy's Law, tumor response criteria)
- Assessment schedules

**Rationale:** Agnostic core with extensions ensures:
- Broad applicability across therapeutic areas
- Reusable core tooling
- Standardization where appropriate
- Flexibility where necessary

**Evidence:** Section 4 (Model_COMPARISON.md, Lines 463-479) demonstrates domain variations across 5 therapeutic areas

**Impact:** Concept libraries should be modular and importable; core metamodel should not hard-code domain-specific elements.

---

### GP-11: Progressive Refinement and Varying Levels of Detail

**Principle:** The metamodel SHALL support models at varying levels of detail, from high-level conceptual specifications to fully detailed executable specifications. Models are valid at any level of detail appropriate to their intended use, and completeness requirements are context-dependent rather than absolute.

**Levels of Model Detail:**

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
   - Unidirectional dependency flow (GP-2)
   - DAG structure - no circular dependencies (GP-8)
   - Entity identifiers are unique

2. **Required for Logical Level and Above:**
   - Analysis concepts align with protocol endpoints
   - Populations are defined
   - Statistical methods are identified
   - Displays trace to analyses

3. **Required for Physical Level (Executable):**
   - Complete method input/output signatures (GP-6, BR-4)
   - All cube record structures specified (Anti-Pattern 7)
   - CDISC mappings complete (GP-5, BR-1)
   - All derivation formulas and parameters complete
   - Immutability enforced - methods declare new output cubes (GP-3)

**Completeness Metadata:**

Models SHALL declare their level of detail:

```yaml
model:
  metadata:
    name: "Study ABC-123 Statistical Analysis"
    version: "2.0"
    completeness_level: "logical"  # conceptual, logical, or physical
    intended_use:
      - "stakeholder_review"
      - "sap_documentation"
    automation_ready: false  # true only for physical level

  validation_profile: "logical_level"  # determines which validation rules apply
```

**Rationale:** Progressive refinement ensures:
- Models are useful at every stage of development
- Stakeholders can engage at appropriate level of detail
- Early validation and feedback before full implementation
- Flexibility in workflow and organizational processes
- Reuse and standardization across projects
- Collaboration without requiring full implementation details
- Gradual investment in detail as project matures

**Evidence:** Common practice in SAP development progresses from outline → draft → final; Industry need for analysis specification interchange without implementation exposure

**Impact:**
- Validation tools must support configurable completeness requirements
- Models must declare their completeness level and intended use
- Downstream tools (code generators) require physical-level completeness
- Upstream tools (protocol alignment, review) work with conceptual/logical levels
- Documentation generation adapts to model completeness level
- Version control and change management track refinement progression

---

## Business Requirements

These requirements specify what the AC/DC metamodel must enable from a business and organizational perspective, addressing regulatory, operational, and strategic needs.

### BR-1: Regulatory Compliance Support

**Requirement:** The AC/DC metamodel SHALL support full regulatory compliance for clinical trial submissions to FDA, EMA, PMDA, and other health authorities.

**Specific Capabilities:**
1. **CDISC Standards Compliance**
   - **USDM (Protocol):** Analysis concepts align with USDM protocol definitions (endpoints, populations, estimands, study design)
   - **ADaM (Analysis Data):** Map all structures to ADaM datasets (BDS, ADSL, OCCDS, ADTTE); support ADaM derivation types and metadata
   - **SDTM (Source Data):** Source cubes traceable to SDTM domains
   - **ARS (Analysis Results):** Map displays to ARS OutputDisplay entities; map methods to ARS Analysis/AnalysisMethod entities; provide result cubes for ARS AnalysisResult structures
   - Generate compliant Define-XML specifications

2. **21 CFR Part 11 Compliance**
   - Complete audit trail (who, what, when)
   - Immutable records (support GP-3)
   - Version control integration

3. **ICH Guidelines**
   - ICH E9: Statistical Principles (complete specification of estimands, methods)
   - ICH E3: Clinical Study Reports (traceability from displays to raw data)
   - ICH E6: Good Clinical Practice (data integrity, quality)

**Success Criteria:**
- Analysis concepts align with USDM protocol definitions (endpoint-to-endpoint traceability)
- Models can generate regulatory-compliant ADaM datasets
- Complete traceability from TLFs (Tables, Listings, Figures) to SDTM
- Displays and methods can be exported to ARS format for machine-readable analysis results metadata
- Define-XML export capability
- Audit trail completeness

**Rationale:** Regulatory compliance is non-negotiable for pharmaceutical and medical device trials.

**Related Issues:** Theme 3 (Model_COMPARISON.md, Lines 1358-1418)

---

### BR-2: Multi-Study Design Support

**Requirement:** The metamodel SHALL support diverse clinical trial designs without requiring design-specific metamodel variants.

**Supported Designs:**
1. **Parallel Group** (most common)
2. **Crossover** (2-way, 3-way, 4-way, N-way)
3. **Factorial** (2×2, 2×3, etc.)
4. **Adaptive** (group sequential, sample size re-estimation)
5. **Cluster Randomized**
6. **Non-inferiority / Equivalence**

**Design-Specific Requirements:**
- **Crossover:** Multiple baseline types (study baseline, period baseline), period effects, sequence effects, carryover assessment, washout periods
- **Factorial:** Interaction effects, main effects, simple effects
- **Adaptive:** Interim analysis specifications, decision rules, information fraction

**Success Criteria:**
- All 5 analyzed examples (4 parallel, 1 crossover) can be modeled
- Crossover-specific features (period baseline in FEV1 model) are supported
- Design type is declarative configuration, not metamodel change

**Rationale:** Clinical trials employ diverse designs; the metamodel must be design-agnostic.

**Related Issues:** Variation 1 (Model_COMPARISON.md, Lines 383-400)

---

### BR-3: Comprehensive Endpoint Type Coverage

**Requirement:** The metamodel SHALL support all common clinical endpoint types with appropriate statistical methods.

**Endpoint Types:**

| Type | Data Representation | Common Methods | Display Types |
|------|-------------------|----------------|---------------|
| **Continuous** | Numeric measures | ANCOVA, MMRM, t-test | Means tables, boxplots |
| **Binary** | 0/1 indicators | Logistic regression, Fisher's exact | Proportions tables, odds ratios |
| **Categorical** | Multi-level factors | Chi-square, CMH test | Contingency tables |
| **Ordinal** | Ordered categories | Proportional odds, Wilcoxon | Distribution tables |
| **Count** | Non-negative integers | Poisson/negative binomial | Rate tables, histograms |
| **Time-to-Event** | Time + censor flag | Cox regression, Kaplan-Meier | Survival curves, hazard ratios |
| **Shift** | Baseline → Post categories | CMH test, McNemar | Shift tables |
| **Longitudinal** | Repeated measures | MMRM, GEE | Profile plots, spaghetti plots |

**Success Criteria:**
- All endpoint types in analyzed examples (continuous, binary, shift) are fully supported
- Statistical method catalog includes appropriate methods for each type
- Display templates exist for each type

**Rationale:** Clinical trials measure diverse outcomes; limited endpoint coverage restricts applicability.

**Related Issues:** Variation 2 (Model_COMPARISON.md, Lines 403-418)

---

### BR-4: Statistical Method Rigor and Completeness

**Requirement:** Statistical method specifications SHALL be complete, unambiguous, and sufficient for independent implementation.

**Required Method Properties:**

1. **All Methods:**
   - Input cube(s) and measures
   - Output cube(s) and measures (new cubes per GP-3)
   - Parameters and settings
   - Implementation algorithm or reference

2. **Inferential Methods (Additional):**
   - Model formula (Wilkinson notation or equivalent)
   - Fixed and random effects
   - Covariance structure (for repeated measures)
   - Estimation method (REML, ML, GEE)
   - Degrees of freedom method (Kenward-Roger, Satterthwaite)
   - Contrasts and comparisons
   - Significance level and multiplicity adjustment
   - Missing data mechanism assumption

3. **Descriptive Methods:**
   - Statistics computed (N, mean, SD, median, Q1, Q3, min, max)
   - Handling of missing values
   - Precision specifications

**Success Criteria:**
- Two independent programmers can implement the same method specification with identical results
- All methods have complete signatures (input/output)
- Statistical methods include all elements required for SAS/R/Python implementation

**Rationale:** Incomplete specifications lead to ambiguity, errors, and non-reproducibility.

**Related Issues:** Theme 4 (Model_COMPARISON.md, Lines 1421-1478), Anti-Pattern 4 (Lines 1025-1091)

---

### BR-5: Missing Data Strategy Formalization

**Requirement:** The metamodel SHALL formalize missing data handling strategies with explicit specification of assumptions, methods, and sensitivity analyses.

**Required Components:**

1. **Mechanism Assumption:**
   - MCAR (Missing Completely At Random)
   - MAR (Missing At Random)
   - MNAR (Missing Not At Random)
   - Documentation of assumption justification

2. **Primary Method:**
   - Complete case analysis
   - LOCF (Last Observation Carried Forward)
   - BOCF (Baseline Observation Carried Forward)
   - Multiple Imputation (MI)
   - Mixed model (MMRM - implicit MAR handling)
   - Specification of when imputation occurs (before/after subsetting)

3. **Sensitivity Analyses:**
   - Alternative imputation methods
   - Tipping point analysis (for MNAR)
   - Pattern mixture models

4. **Imputed Value Flagging:**
   - Attribute to identify imputed values
   - Separate reporting of imputed vs observed

**Success Criteria:**
- Missing data handling is never implicit or assumed
- Imputation methods are formal Method entities
- LOCF/BOCF examples (BMD, Pain) have complete specifications
- MMRM examples (Mood, FEV1) declare MAR assumption

**Rationale:** Missing data is ubiquitous in clinical trials; handling must be pre-specified and scientifically justified.

**Related Issues:** Theme 1 (Model_COMPARISON.md, Lines 1267-1307)

---

### BR-6: Baseline Definition and Handling Framework

**Requirement:** The metamodel SHALL provide a comprehensive framework for baseline definition, calculation, and handling across diverse study designs.

**Required Capabilities:**

1. **Baseline Definition:**
   - Single measurement vs averaged multiple measurements
   - Pre-specified timepoints (e.g., -1hr and -10min for FEV1)
   - Identification method (dimension value, flag, or both)

2. **Calculation Rules:**
   - Averaging method (mean, median, weighted mean)
   - Handling of missing baseline components (complete baseline required vs partial acceptable)
   - Multiple baseline types (study baseline, period baseline for crossover)

3. **Usage in Derivations:**
   - Change from baseline (universal pattern)
   - Baseline as covariate in models
   - Baseline stratification
   - Baseline exclusion from post-baseline summaries

4. **Special Cases:**
   - Crossover designs: Study baseline + Period baseline (FEV1 example)
   - Adaptive designs: Interim baseline re-calculation
   - Missing baseline handling (exclude subject, impute, use closest)

**Success Criteria:**
- Simple baseline (BMD, Pain, Mood, HysLaw) and complex baseline (FEV1) both supported
- Baseline calculation is a formal Method when averaging required
- Baseline handling rules are explicit, not assumed

**Rationale:** Baseline is critical for change-from-baseline analyses (most common clinical trial endpoint); inconsistent handling causes analysis errors.

**Related Issues:** Theme 2 (Model_COMPARISON.md, Lines 1310-1355), Pattern 1 (Lines 558-579), Anti-Pattern 3 (Lines 996-1022)

---

### BR-7: Multiple Testing Control Framework

**Requirement:** The metamodel SHALL formalize multiple testing procedures to control Type I error in studies with multiple endpoints or comparisons.

**Required Capabilities:**

1. **Multiplicity Strategies:**
   - None (single endpoint/comparison)
   - Bonferroni correction
   - Holm-Bonferroni (step-down)
   - Hochberg (step-up)
   - Hierarchical testing
   - Graphical approaches
   - False Discovery Rate (FDR) control

2. **Endpoint Hierarchy:**
   - Primary endpoints (tested first, full α)
   - Secondary endpoints (conditional on primary or adjusted α)
   - Exploratory endpoints (no control)
   - Co-primary endpoints (special rules)

3. **Co-Primary Rules:**
   - All must be significant
   - At least one must be significant
   - α-allocation (e.g., 0.025 to each of two endpoints)

4. **Family-Wise Error Rate (FWER) vs FDR:**
   - Strong FWER control (most efficacy analyses)
   - Weak FWER control
   - FDR control (genomics, safety screening)

**Success Criteria:**
- Multiplicity strategy is declared in analysis configuration
- Hierarchical testing (BMD primary→secondary→ad-hoc) is formalized
- Co-primary endpoints (FEV1) have explicit rules and α-allocation
- P-values are adjusted according to strategy

**Rationale:** Multiple testing without control inflates Type I error; regulatory agencies require pre-specified multiplicity strategies.

**Related Issues:** Theme 5 (Model_COMPARISON.md, Lines 1481-1529)

---

### BR-8: Population and Stratification Management

**Requirement:** The metamodel SHALL support flexible population definitions and stratification factors with automatic propagation to methods and displays.

**Required Capabilities:**

1. **Population Definitions:**
   - ITT (Intent-to-Treat)
   - mITT (modified ITT)
   - PP (Per-Protocol)
   - FAS (Full Analysis Set)
   - Safety Population
   - Evaluable Population
   - Custom populations with inclusion/exclusion criteria

2. **Population Properties:**
   - Definition (inclusion/exclusion logic)
   - CDISC flag variable (ITTFL, SAFFL, etc.)
   - Subset relationships (PP ⊂ ITT)

3. **Stratification Factors:**
   - Randomization stratification (site, region, baseline severity)
   - Analysis stratification (may differ from randomization)
   - Subgroup factors (age group, sex, baseline tertiles)

4. **Automatic Propagation:**
   - Population filters applied to relevant cubes/slices
   - Stratification factors included in statistical models (as covariates or random effects)
   - Displays labeled with population

**Success Criteria:**
- All 5 analyzed examples have population specifications (ITT for efficacy, Safety for HysLaw)
- Stratification (site in FEV1, baseline status in HysLaw) is declarative and propagates to methods
- Subgroup analyses specify factors and interaction tests

**Rationale:** Population definition affects who is included in analysis; stratification affects statistical validity and power.

**Related Issues:** Variation 6 (Model_COMPARISON.md, Lines 531-551)

---

### BR-9: Full Traceability and Reproducibility

**Requirement:** The metamodel SHALL ensure complete traceability and reproducibility of all analysis results.

**Traceability Requirements:**

1. **Forward Traceability:** From concepts to displays
   - Which concepts are realized in which structures?
   - Which structures are used in which derivations?
   - Which derivations feed which displays?

2. **Backward Traceability:** From displays to concepts
   - What data sources underlie this display?
   - What methods produced these results?
   - What cubes/slices were inputs?
   - What measures and concepts are represented?

3. **Provenance Metadata:**
   - Cube lineage (derived from which cubes via which methods)
   - Method execution metadata (parameters, software, version, timestamp)
   - Display generation metadata (data snapshot date, generation date)

**Reproducibility Requirements:**

1. **Immutable Entities:** (per GP-3) - same inputs always yield same outputs
2. **Complete Specifications:** All parameters, assumptions, and decisions documented
3. **Version Control:** All model entities versioned
4. **Execution Environment:** Software versions, random seeds, platform details

**Success Criteria:**
- Every display traces back to source concepts (validated in all 5 models)
- Every concept traces forward to usage in structures/derivations
- Orphaned entities are flagged as validation errors
- Results are bit-reproducible given same model and data

**Rationale:** Regulatory submissions require full traceability; scientific integrity requires reproducibility.

**Related Issues:** GP-4, Universal Dependencies (Model_COMPARISON.md, Lines 344-376)

---

### BR-10: Sensitivity and Subgroup Analysis Support

**Requirement:** The metamodel SHALL support specification of sensitivity analyses and subgroup analyses with clear distinction from primary analyses.

**Sensitivity Analysis Requirements:**

1. **Variations Supported:**
   - Alternative populations (PP vs ITT)
   - Alternative imputation methods (MI vs LOCF)
   - Alternative baseline definitions
   - Alternative statistical methods (robust vs parametric)
   - Alternative visit windows

2. **Specification:**
   - Name/label
   - What differs from primary analysis
   - Purpose (assess robustness to assumption)
   - Pre-specified vs post-hoc

**Subgroup Analysis Requirements:**

1. **Subgroup Factors:**
   - Demographic (age, sex, race)
   - Baseline disease characteristics (severity, duration)
   - Geographic (region, country, site)

2. **Analysis Types:**
   - Descriptive (separate summaries per subgroup)
   - Interaction tests (treatment × subgroup)
   - Forest plots (effect size by subgroup)

3. **Multiplicity Considerations:**
   - Pre-specified subgroups (confirmatory)
   - Post-hoc subgroups (exploratory, no multiplicity control)

**Success Criteria:**
- Sensitivity analyses reference a base analysis and document variations
- Subgroup analyses specify factors and whether interaction tests are performed
- Pre-specified vs post-hoc designation is explicit

**Rationale:** Sensitivity analyses assess robustness; subgroup analyses assess consistency of treatment effect and identify responders.

**Related Issues:** Theme 8 (Model_COMPARISON.md, Lines 1619-1664)

---

### BR-11: Sample Size and Power Documentation

**Requirement:** The metamodel SHALL include sample size planning and power calculation documentation.

**Required Elements:**

1. **Planned Sample Size:**
   - Total enrollment target
   - By treatment group
   - By site/region (if stratified)

2. **Power Calculation Assumptions:**
   - Primary endpoint
   - Expected effect size (or non-inferiority margin)
   - Standard deviation (or event rate for binary)
   - Significance level (α)
   - Target power (1-β, typically 80% or 90%)
   - Dropout/attrition rate
   - Calculation method/formula

3. **Actual Sample Size:**
   - Enrolled
   - Randomized
   - Analyzed (by population: ITT, PP, Safety)
   - By treatment group

4. **Deviations and Impact:**
   - If actual < planned, impact on power
   - If assumptions violated, re-calculated power

**Success Criteria:**
- Sample size section exists in analysis configuration
- Planned and actual sample sizes are documented
- Power calculation assumptions are explicit

**Rationale:** Sample size justification is required in protocols and regulatory submissions; underpowered studies waste resources and may be unethical.

**Related Issues:** Theme 6 (Model_COMPARISON.md, Lines 1533-1579)

---

### BR-12: Temporal and Visit Windowing

**Requirement:** The metamodel SHALL support visit schedules with windowing rules and window violation handling.

**Required Elements:**

1. **Visit Schedule:**
   - Planned visits (names, nominal study days/dates)
   - Visit windows (acceptable ranges)
   - Relative timing (study day) vs absolute (calendar date)

2. **Window Definitions:**
   - Lower bound (e.g., planned day - 7)
   - Upper bound (e.g., planned day + 7)
   - Units (days, weeks, months)

3. **Window Violation Handling:**
   - **Within window:** Assign to planned visit
   - **Outside window:** Exclude, assign to actual timing, or assign to nearest planned
   - **Missing visit:** How to handle in imputation

4. **Windowing Impact:**
   - LOCF: Last observation *within window* carried forward
   - Baseline definition: Measurements *within baseline window*
   - Analysis visits: Which timepoints are analyzed

**Success Criteria:**
- Visit schedule includes window specifications
- Windowing rules are explicit for each analysis
- BMD and FEV1 examples (which mention windowing) have complete specifications

**Rationale:** Visit timing varies in practice; windowing rules determine which measurements are included in which analysis visits.

**Related Issues:** Theme 7 (Model_COMPARISON.md, Lines 1582-1617)

---

### BR-13: Display Diversity Support (Tables, Figures, Listings)

**Requirement:** The metamodel SHALL support all standard clinical trial display types with appropriate structure and formatting specifications.

**Display Types:**

1. **Tables:**
   - Descriptive statistics tables (demographics, baseline characteristics)
   - Analysis results tables (primary/secondary endpoints)
   - Shift tables (categorical change from baseline, e.g., Hy's Law)
   - Subgroup tables (effect by subgroup)
   - Disposition tables (flow from enrollment to analysis)

2. **Figures:**
   - Boxplots (distribution by treatment)
   - Profile plots (mean over time with error bars)
   - Spaghetti plots (individual trajectories)
   - Kaplan-Meier curves (survival)
   - Forest plots (subgroup effects)
   - Scatter plots (correlation, association)

3. **Listings:**
   - Subject-level data listings
   - Adverse event listings
   - Protocol deviation listings
   - Demographic listings

**Structure Requirements:**

1. **Tables:**
   - Row dimensions (primary, secondary, tertiary)
   - Column dimensions (levels)
   - Cells (statistics, measures, formatting)

2. **Figures:**
   - Plot type (boxplot, line, scatter, etc.)
   - Axes (x, y variables, scales, ranges)
   - Aesthetics (color, shape, size mapped to dimensions)
   - Facets (small multiples by factor)

3. **Listings:**
   - Record structure (one row per what?)
   - Columns (variables to include)
   - Sorting order
   - Filters (which records)

**Success Criteria:**
- All 5 analyzed models include table displays
- Figure displays (BMD Figure 2.4.1.1) have complete specifications
- Listing displays are supported (common in safety reporting)
- Display type (table/figure/listing) determines available structure properties

**Rationale:** Clinical trial reporting requires diverse display types; metamodel must support all common types.

**Related Issues:** GP-7, Pattern 5 (Model_COMPARISON.md, Lines 709-756), Key Finding #4 (Lines 2213)

---

### BR-14: Code Generation and Execution

**Requirement:** The metamodel SHALL be sufficiently complete and unambiguous to enable automated code generation in statistical programming languages (SAS, R, Python).

**Required Capabilities:**

1. **Method → Code Mapping:**
   - Arithmetic methods → formula code
   - Statistical methods → procedure calls (PROC MIXED, lm(), statsmodels)
   - Aggregation methods → GROUP BY operations
   - Imputation methods → imputation algorithms

2. **Cube → Data Structure Mapping:**
   - Cubes → data frames / datasets
   - Dimensions → grouping variables
   - Measures → analysis variables
   - Attributes → metadata variables

3. **Display → Output Mapping:**
   - Tables → table generation code (PROC REPORT, gt, pandas)
   - Figures → plotting code (PROC SGPLOT, ggplot2, matplotlib)
   - Listings → PROC PRINT, print(), to_string()

4. **Execution Orchestration:**
   - DAG-based execution order (per GP-8)
   - Dependency resolution
   - Parallel execution where possible
   - Error handling and logging

**Success Criteria:**
- Complete AC/DC model can be translated to SAS, R, or Python code
- Generated code produces identical results across languages (within numerical precision)
- No manual intervention required for well-formed models

**Rationale:** Manual coding is error-prone and time-consuming; automated generation from metamodel ensures consistency and accelerates delivery.

---

### BR-15: Extensibility and Customization

**Requirement:** The metamodel SHALL be extensible to accommodate study-specific needs, emerging methodologies, and organizational customizations without requiring metamodel core changes.

**Extension Points:**

1. **Concept Libraries:**
   - Domain-specific biomedical concepts (therapeutic area ontologies)
   - Organizational standard derivations
   - Custom analysis concepts

2. **Method Catalog:**
   - Standard statistical methods (ANCOVA, MMRM, logistic regression)
   - Custom methods (proprietary algorithms)
   - Emerging methods (Bayesian, machine learning)

3. **Display Templates:**
   - Organizational standard table shells
   - Therapeutic area-specific figure types
   - Regulatory body-specific formats (FDA, EMA)

4. **CDISC Extensions:**
   - Supplemental qualifiers (SUPP datasets)
   - Custom domains
   - Organization-specific controlled terminology

**Extensibility Mechanisms:**

1. **Inheritance:** New concepts/methods extend base classes
2. **Composition:** Complex methods compose simpler methods
3. **Plugins:** External libraries imported into model
4. **Templates:** Parameterized reusable patterns

**Success Criteria:**
- New biomedical concept added without metamodel change
- New statistical method added by defining Method schema instance
- Therapeutic area libraries exist and are reusable
- Organizational customizations don't fork metamodel

**Rationale:** Clinical research is diverse and evolving; rigid metamodel would quickly become obsolete.

**Related Issues:** GP-10 (Domain Agnostic Core)

---

## User Requirements

These requirements specify what users (biostatisticians, statistical programmers, data managers, clinical scientists) need to accomplish using the AC/DC metamodel.

### UR-1: Define Biomedical Concepts Clearly

**User Need:** As a biostatistician or clinical scientist, I need to define biomedical concepts (observations, measurements, assessments) in a clear, standardized way that bridges clinical and statistical perspectives.

**Capabilities Required:**

1. **Concept Definition:**
   - Name (unique identifier)
   - Description (clinical definition)
   - Synonyms (alternative names)
   - Domain (therapeutic area, body system)

2. **Measurement Properties:**
   - Unit of measurement
   - Scale (nominal, ordinal, interval, ratio)
   - Valid range
   - Precision
   - Instrument (questionnaire, lab assay, device)

3. **Clinical Context:**
   - Anatomical location (if applicable)
   - Standard codes (LOINC, SNOMED, NCI Thesaurus)
   - Clinical relevance
   - Reference ranges (normal, abnormal thresholds)

4. **Relationships:**
   - Parent concept (for hierarchies: e.g., ALT is-a Liver Function Test)
   - Related concepts
   - Measurement timing (continuous, intermittent, event-driven)

**Example (from FEV1 model):**
```yaml
FEV1:
  description: "Forced Expiratory Volume in 1 second"
  unit: "liters"
  scale: "ratio"
  domain: "Pulmonary Function"
  instrument: "Spirometry per ATS/ERS guidelines"
  standard_code:
    system: "LOINC"
    code: "20150-9"
  range: [0.5, 7.0]  # typical adult range
```

**Acceptance Criteria:**
- Concept definitions are reusable across studies in same therapeutic area
- Clinical reviewer can validate concept definitions without statistical expertise
- Concepts map to CDISC standard variables

**Rationale:** Clear concept definitions ensure common understanding between clinical and statistical teams and support regulatory review.

**Related Requirements:** GP-10, BR-1

---

### UR-2: Specify Derivations Precisely

**User Need:** As a biostatistician, I need to specify derived variables (change from baseline, percentages, composite scores) with mathematical precision suitable for programming implementation.

**Capabilities Required:**

1. **Arithmetic Derivations:**
   - Formula specification (mathematical notation)
   - Input variables (by name)
   - Output variable (with unit)
   - Handling of missing inputs (propagate missing, impute, skip)

2. **Rule-Based Derivations:**
   - Conditional logic (if-then-else)
   - Multi-condition criteria (AND, OR, NOT)
   - Hierarchical rules (ordered evaluation)

3. **Complex Derivations:**
   - Integration (AUC via trapezoidal rule)
   - Weighted sums (composite scores like Total Mood Disturbance)
   - Multi-step calculations (Hy's Law criteria variations)

4. **Validation:**
   - Example calculations (input → output)
   - Edge cases (missing data, boundary values)
   - Quality checks (range checks, cross-validation)

**Example (from Pain model):**
```yaml
pain_relief_status:
  description: "Binary indicator of pain relief"
  formula: "(baseline_pain >= 2) AND (post_dose_pain <= 1) AND (rescue_medication = 'No')"
  input_measures:
    - baseline_pain
    - post_dose_pain
    - rescue_medication
  output_measure: pain_relief_indicator
  output_type: binary
  handling_missing: "If any input missing, output is missing"
```

**Acceptance Criteria:**
- Two programmers implement same derivation and get identical results
- Derivation logic is testable with sample data
- Complex derivations (AUC, Hy's Law) are fully specified

**Rationale:** Precise derivation specifications prevent programming errors and enable reproducibility.

**Related Requirements:** BR-4, Variation 5 (Model_COMPARISON.md, Lines 483-528)

---

### UR-3: Configure Statistical Methods Completely

**User Need:** As a biostatistician, I need to specify statistical analysis methods with complete detail sufficient for programming and interpretation.

**Capabilities Required:**

1. **Model Specification:**
   - Model type (ANCOVA, MMRM, logistic regression, etc.)
   - Response variable
   - Fixed effects (with interaction terms)
   - Random effects (for mixed models)
   - Model formula (Wilkinson notation: `Y ~ Treatment + Baseline + (1|Subject)`)

2. **Estimation Settings:**
   - Estimation method (REML, ML, GEE)
   - Covariance structure (unstructured, AR(1), compound symmetry, etc.)
   - Degrees of freedom method (Kenward-Roger, Satterthwaite, residual)
   - Convergence criteria

3. **Contrasts and Comparisons:**
   - Contrast type (treatment, pairwise, polynomial, custom)
   - Reference group (placebo, control)
   - Specific comparisons (Drug A vs Placebo, Drug B vs Placebo)
   - Contrast coefficients (for custom contrasts)

4. **Inference Settings:**
   - Significance level (α, typically 0.05)
   - Confidence level (1-α, typically 95%)
   - Multiplicity adjustment (none, Bonferroni, hierarchical)
   - One-sided vs two-sided tests

**Example (from Mood model, enhanced):**
```yaml
MultivariateANOVA:
  model_type: "Multivariate ANOVA"
  response_variables:
    - TensionAnxiety_Change
    - Depression_Change
    - AngerHostility_Change
    - Fatigue_Change
    - Confusion_Change
    - Vigor_Change
  independent_variables:
    - Treatment
  formula: "cbind(TensionAnxiety_Change, Depression_Change, ...) ~ Treatment"
  test_statistic: "Wilks' Lambda"
  significance_level: 0.05
  hypothesis:
    null: "No multivariate treatment effect"
    alternative: "At least one subscale differs between treatments"
```

**Acceptance Criteria:**
- Statistical method specification is sufficient to generate SAS PROC or R code
- All parameters required for execution are specified (no defaults assumed)
- Method outputs (estimates, SEs, p-values) are defined

**Rationale:** Incomplete method specifications lead to programming ambiguity and inconsistent implementations across programmers.

**Related Requirements:** BR-4, Theme 4 (Model_COMPARISON.md, Lines 1421-1478)

---

### UR-4: Design Displays (Tables, Figures, Listings) Efficiently

**User Need:** As a statistical programmer or biostatistician, I need to design tables, figures, and listings with clear structure, formatting, and data source linkage.

**Capabilities Required:**

1. **Display Structure:**
   - **Tables:** Row/column dimensions, cell statistics, nesting levels
   - **Figures:** Plot type, axes, aesthetics (color, shape, facets)
   - **Listings:** Record structure, columns, sorting, filters

2. **Data Sources:**
   - Input cubes/slices
   - Input methods (for results)
   - Filters (population, visit, etc.)

3. **Formatting:**
   - Number formats (e.g., "xxx", "x.x", "x.xx", "x.x%")
   - Alignment (left, center, right)
   - Column widths
   - Fonts and styles (if applicable)

4. **Metadata:**
   - Title, subtitle, footnotes
   - Population annotation
   - Data cutoff date
   - Program name (for traceability)

5. **Templates and Reuse:**
   - Reusable table shells
   - Parameterized templates (fill with different data sources)
   - Organizational standards enforcement

**Example (simplified from HysLaw table):**
```yaml
table_2_8_3_1:
  type: "table"
  title: "Shifts in Hy's Law Criteria During Treatment"
  population: "Safety Population"

  structure:
    rows:
      primary: criteria_type
      secondary: visit
    columns:
      level1: treatment
      level2: baseline_status
      level3: shift_category
    cells:
      - statistic: subject_count
        format: "xxx"
      - statistic: percentage
        format: "x.x%"

  data_sources:
    - shift_cube
    - cmh_test_results

  footnotes:
    - "Hy's Law Criteria: ALT or AST > 1.5× ULN and Total Bilirubin > 1.5× ULN"
```

**Acceptance Criteria:**
- Table/figure/listing specifications are unambiguous
- Programmers can generate displays from specifications without clarification questions
- Reusable templates reduce redundant specification

**Rationale:** Display design is time-consuming; clear specifications and templates accelerate programming and reduce errors.

**Related Requirements:** BR-13, GP-7, Pattern 5 (Model_COMPARISON.md, Lines 709-756)

---

### UR-5: Handle Missing Data Transparently

**User Need:** As a biostatistician, I need to specify how missing data are handled with transparency suitable for regulatory review.

**Capabilities Required:**

1. **Declare Assumptions:**
   - Missing data mechanism (MCAR, MAR, MNAR)
   - Justification for assumption

2. **Specify Primary Method:**
   - Complete case analysis
   - LOCF/BOCF
   - Multiple imputation
   - MMRM (implicit MAR)
   - Method parameters (e.g., number of imputations for MI)

3. **Timing Specification:**
   - When is imputation applied? (before subsetting, after subsetting)
   - Which variables are imputed?
   - What constitutes "last observation" for LOCF?

4. **Flag Imputed Values:**
   - Create attribute to identify imputed vs observed
   - Report imputed values separately if needed

5. **Sensitivity Analyses:**
   - Alternative imputation methods
   - Tipping point analyses (varying MNAR assumption)

**Example (from BMD model, enhanced):**
```yaml
locf_imputation:
  type: "Imputation"
  method: "LOCF"
  mechanism_assumption: "MAR"

  applied_to: bmd_value
  timing: "before_subsetting"
  ordering:
    - subject
    - time_point

  input_cube: adbmd_raw
  output_cube: adbmd_locf

  rules:
    - "If bmd_value is missing at visit V, carry forward last non-missing value from prior visit"
    - "If no prior non-missing value exists (i.e., baseline is missing), value remains missing"
    - "Imputed values flagged with imputation_flag = 'Y'"

  sensitivity_analysis:
    - name: "Observed Cases (OC)"
      method: "complete_case"
```

**Acceptance Criteria:**
- Missing data handling is never implicit or assumed
- Imputation methods are fully specified with clear rules
- Sensitivity analyses are pre-specified

**Rationale:** Missing data can bias results; transparent handling is critical for scientific and regulatory credibility.

**Related Requirements:** BR-5, Theme 1 (Model_COMPARISON.md, Lines 1267-1307)

---

### UR-6: Define Baselines Consistently

**User Need:** As a biostatistician, I need to define baseline in a consistent, unambiguous way, especially for complex designs (crossover, adaptive).

**Capabilities Required:**

1. **Simple Baseline (Parallel Designs):**
   - Identification (dimension value = "Baseline", or flag = 'Y')
   - Single vs averaged measurement
   - Timepoints included in average

2. **Complex Baseline (Crossover Designs):**
   - Study baseline (overall reference)
   - Period baseline (within-period reference)
   - Calculation for each type

3. **Baseline Calculation Method:**
   - Formula (mean, median, weighted mean)
   - Input timepoints
   - Missing data handling (require complete, allow partial)

4. **Usage Documentation:**
   - Which analyses use baseline as covariate?
   - Which analyses compute change from baseline?
   - Which analyses exclude baseline timepoint?

**Example (from FEV1 model):**
```yaml
StudyBaseline:
  type: "BiomedicalConcept"
  description: "Overall baseline FEV1 prior to any treatment"
  calculation:
    method: "Average_Baseline"
    timepoints: ["-1 hour", "-10 minutes"]
    formula: "mean(fev1_minus1hr, fev1_minus10min)"
    missing_handling: "Both measurements required; if either missing, baseline is missing"

  identification:
    dimension_value: "Study Baseline"
    cube: "FEV1_Baseline"

PeriodBaseline:
  type: "BiomedicalConcept"
  description: "Baseline FEV1 at start of each treatment period (crossover)"
  calculation:
    method: "Average_Baseline"
    timepoints: ["Period start -1 hour", "Period start -10 minutes"]
    formula: "mean(fev1_period_minus1hr, fev1_period_minus10min)"

  identification:
    dimension_value: "Period Baseline"
```

**Acceptance Criteria:**
- Baseline definition is unambiguous
- Crossover designs support multiple baseline types
- Averaging rules are explicit
- Missing baseline handling is specified

**Rationale:** Baseline ambiguity is a common source of analysis errors; clear definition prevents mistakes.

**Related Requirements:** BR-6, Theme 2 (Model_COMPARISON.md, Lines 1310-1355)

---

### UR-7: Map to CDISC Standards Easily

**User Need:** As a data manager or statistical programmer, I need to map AC/DC model elements to CDISC standards (USDM, SDTM, ADaM) with minimal effort.

**Capabilities Required:**

1. **Protocol Mapping (USDM):**
   - AnalysisConcept (endpoint) → USDM StudyEndpoint
   - AnalysisConcept (population) → USDM StudyEligibilityCriteria / Population
   - AnalysisConcept (estimand) → USDM Estimand
   - StudyDesign → USDM StudyDesign

2. **Dataset Mapping (ADaM):**
   - Cube → ADaM dataset name (ADSL, ADLB, ADEFF, custom)
   - Dataset structure (BDS, OCCDS, ADTTE)
   - Source SDTM domains

3. **Variable Mapping (ADaM):**
   - Dimension → CDISC variable (USUBJID, TRT01P, AVISIT, PARAM)
   - Measure → CDISC variable (AVAL, CHG, BASE)
   - Attribute → CDISC variable (AVALU, DTYPE, ABLFL)

4. **Controlled Terminology:**
   - PARAMCD values
   - AVISIT standardization
   - Codelist references (NCI Thesaurus)

5. **Derivation Metadata:**
   - ADaM derivation flags (DTYPE for derivation type)
   - Derivation method documentation
   - Traceability to SDTM

6. **Results Mapping (ARS):**
   - Display (table/figure/listing) → ARS OutputDisplay/Output
   - Method (statistical method) → ARS Analysis/AnalysisMethod
   - Result Cube (statistical results) → ARS AnalysisResult data
   - Method.output_measures → ARS ResultGroup
   - Traceability from results back to USDM endpoints

**Example (from HysLaw model, enhanced):**
```yaml
adlbhy:
  cdisc_mapping:
    adam_dataset: "ADLBHY"
    adam_structure: "BDS"
    source_domains:
      - "LB"  # Laboratory data

  dimensions:
    subject:
      cdisc_variable: "USUBJID"
    treatment:
      cdisc_variable: "TRT01P"
    visit:
      cdisc_variable: "AVISIT"
    lab_parameter:
      cdisc_variable: "PARAM"
      paramcd_values:
        - code: "ALT"
          label: "Alanine Aminotransferase"
        - code: "AST"
          label: "Aspartate Aminotransferase"
        - code: "BILI"
          label: "Total Bilirubin"

  measures:
    lab_result_value:
      cdisc_variable: "AVAL"
    baseline_value:
      cdisc_variable: "BASE"
    change_from_baseline:
      cdisc_variable: "CHG"
      derivation_type: "DTYPE = 'CHANGE'"
```

**Acceptance Criteria:**
- All cubes have CDISC dataset mappings
- All dimensions/measures have CDISC variable mappings
- All displays have ARS OutputDisplay mappings
- All statistical methods have ARS Analysis/AnalysisMethod mappings
- Define-XML can be generated from mappings
- ARS-compliant analysis results metadata can be generated

**Rationale:** CDISC compliance is mandatory for regulatory submissions; easy mapping reduces validation effort. ARS enables machine-readable results metadata for automated regulatory review.

**Related Requirements:** BR-1, GP-5, Theme 3 (Model_COMPARISON.md, Lines 1358-1418)

---

### UR-8: Trace Results to Source Data

**User Need:** As a quality assurance reviewer, I need to trace any result in a display (table/figure/listing) back through methods, cubes, and measures to the source biomedical concept and raw data.

**Capabilities Required:**

1. **Backward Tracing:**
   - Display → Method(s) used
   - Method → Input cube(s)/slice(s)
   - Cube → Source cube(s) and derivation method
   - Measure → Derivation concept or biomedical concept
   - Concept → Clinical definition

2. **Forward Tracing:**
   - Concept → Which measures realize it?
   - Measure → Which cubes contain it?
   - Cube → Which methods consume it?
   - Method → Which displays show results?

3. **Provenance Metadata:**
   - Cube lineage graph (DAG visualization)
   - Method execution logs
   - Data snapshot dates
   - Software versions

4. **Validation Support:**
   - Identify orphaned entities (not traceable)
   - Validate complete chains (concept to display)
   - Detect missing links

**Example Trace (from FEV1 model):**
```
Table_2_7_4_1 (display)
  → Mixed_Effects_REML (method)
    → FEV1_Response (input cube)
      → Calculate_Change_From_Baseline (method)
        → FEV1_AUC (input cube)
          → Trapezoidal_AUC_Calculation (method)
            → FEV1_Observations (source cube)
              → fev1 (measure)
                → FEV1 (biomedical concept)
                  → "Forced Expiratory Volume in 1 second" (clinical definition)
```

**Acceptance Criteria:**
- Every display element is traceable to source concepts
- Traceability matrix can be generated automatically
- Orphaned entities are flagged

**Rationale:** Regulatory reviewers and auditors require full traceability; gaps undermine credibility.

**Related Requirements:** BR-9, GP-4, Pattern 3 (Model_COMPARISON.md, Lines 603-655)

---

### UR-9: Control Multiple Testing Appropriately

**User Need:** As a biostatistician, I need to specify multiplicity control strategies that align with the study's endpoint hierarchy and regulatory requirements.

**Capabilities Required:**

1. **Declare Strategy:**
   - None (single endpoint/comparison)
   - Bonferroni, Holm, Hochberg
   - Hierarchical testing
   - Graphical approaches
   - FDR control

2. **Define Endpoint Hierarchy:**
   - Primary endpoints (level 1, tested first)
   - Secondary endpoints (level 2, conditional or adjusted)
   - Exploratory (no control)

3. **Co-Primary Endpoint Rules:**
   - All significant (conjunction)
   - At least one significant (disjunction)
   - α-split (e.g., 0.025 each)

4. **Automated Adjustment:**
   - P-values adjusted according to strategy
   - Adjusted CIs (if applicable)
   - Decision rules applied (proceed to next level?)

**Example (hierarchical testing):**
```yaml
multiplicity_control:
  strategy: "hierarchical"

  hierarchy:
    - level: 1
      endpoint: "FEV1_AUC_0_12"
      alpha: 0.05
      required: true
      condition: "None (tested first)"

    - level: 2
      endpoint: "FEV1_AUC_12_24"
      alpha: 0.05
      required: false
      condition: "Test only if level 1 is significant (p < 0.05)"

    - level: 3
      endpoint: "Peak_FEV1"
      alpha: 0.05
      required: false
      condition: "Test only if level 2 is significant"
```

**Acceptance Criteria:**
- Multiplicity strategy is declared in analysis configuration
- P-values are adjusted automatically
- Hierarchical testing proceeds according to rules

**Rationale:** Multiple testing without control inflates Type I error; pre-specified strategies are required by regulators.

**Related Requirements:** BR-7, Theme 5 (Model_COMPARISON.md, Lines 1481-1529)

---

### UR-10: Generate Analysis Code Automatically

**User Need:** As a statistical programmer, I want to generate SAS, R, or Python code automatically from the AC/DC model to reduce manual coding errors and accelerate delivery.

**Capabilities Required:**

1. **Complete Specifications:**
   - All methods have input/output signatures
   - All cubes have structure definitions
   - All displays have data sources and formatting

2. **Code Templates:**
   - Method type → code template (ANCOVA → PROC MIXED, logistic → PROC LOGISTIC)
   - Display type → code template (table → PROC REPORT, figure → PROC SGPLOT)

3. **Language-Specific Generation:**
   - SAS: PROC steps, data steps
   - R: tidyverse, lm(), ggplot2
   - Python: pandas, statsmodels, matplotlib

4. **Execution Orchestration:**
   - DAG-based execution order
   - Dependency resolution
   - Error handling

5. **Validation:**
   - Generated code is syntactically correct
   - Results match expected outputs (test cases)

**Example (method to SAS code):**
```yaml
# AC/DC Model
ancova_primary:
  model_type: "ANCOVA"
  formula: "percent_change_bmd ~ treatment + baseline_bmd + machine_type"
  estimation_method: "REML"
  output_cube: "ancova_results"

# Generated SAS Code
PROC MIXED DATA=bmd_month_24_locf METHOD=REML;
  CLASS treatment machine_type;
  MODEL percent_change_bmd = treatment baseline_bmd machine_type / SOLUTION;
  LSMEANS treatment / PDIFF CL ALPHA=0.05;
  ODS OUTPUT LSMeans=lsmeans_out Diffs=diffs_out;
RUN;
```

**Acceptance Criteria:**
- Generated code executes without errors
- Results match manual coding (validation)
- Code generation covers >80% of common methods

**Rationale:** Manual coding is time-consuming and error-prone; automation accelerates delivery and improves quality.

**Related Requirements:** BR-14

---

### UR-11: Reuse Concepts and Methods Across Studies

**User Need:** As a biostatistician or statistical programmer, I want to reuse biomedical concepts, derivation concepts, and methods across studies in the same therapeutic area to reduce redundant work.

**Capabilities Required:**

1. **Concept Libraries:**
   - Therapeutic area libraries (oncology, cardiology, psychiatry, etc.)
   - Organizational standard concepts
   - Import mechanisms

2. **Method Catalog:**
   - Standard statistical methods (ANCOVA, MMRM, logistic regression)
   - Organizational standard methods (e.g., company-specific imputation rules)
   - Parameterized methods (reusable with different inputs)

3. **Display Templates:**
   - Standard table shells (demographics table, efficacy table)
   - Standard figure templates (boxplot, profile plot)
   - Organizational formatting standards

4. **Versioning:**
   - Concept/method versions
   - Backward compatibility
   - Change tracking

**Example:**
```yaml
# Study 1
model:
  concepts:
    biomedical:
      - import: "oncology_library.tumor_response"
      - import: "oncology_library.progression_free_survival"

# Study 2 (different study, same therapeutic area)
model:
  concepts:
    biomedical:
      - import: "oncology_library.tumor_response"  # Reused!
      - import: "oncology_library.overall_survival"
```

**Acceptance Criteria:**
- Concept libraries exist for common therapeutic areas
- Concepts can be imported and used without modification
- Method catalog includes >50 common methods
- Templates reduce table/figure specification time by >50%

**Rationale:** Reuse reduces work, improves consistency, and accelerates delivery across studies.

**Related Requirements:** BR-15, GP-10

---

### UR-12: Validate Models Before Execution

**User Need:** As a statistical programmer or quality assurance reviewer, I need to validate AC/DC models for completeness, consistency, and correctness before executing analysis code.

**Capabilities Required:**

1. **Structural Validation:**
   - All cubes declare record structure
   - All methods declare complete signatures (input/output)
   - All displays reference valid data sources
   - DAG structure (no cycles)

2. **Dependency Validation:**
   - Clean architecture (unidirectional dependencies per GP-2)
   - Immutability (no cube as both input and output per GP-3)
   - Complete traceability (no orphaned entities)

3. **Semantic Validation:**
   - Dimension values in slices match dimension definitions
   - Measures in methods exist in input cubes
   - Display structure dimensions exist in source cubes
   - Statistical methods match endpoint types (continuous → ANCOVA, binary → logistic)

4. **CDISC Validation:**
   - All cubes have CDISC mappings (if required)
   - Variable names are valid CDISC names
   - Controlled terminology matches standards

5. **Completeness Validation:**
   - Primary endpoints have analysis methods
   - All concepts are realized in structures or derivations
   - Missing data handling is specified

**Validation Report:**
```
AC/DC Model Validation Report
Model: BMD_Study_123
Date: 2025-12-06

ERRORS (must fix):
  - Cube "adbmd" missing record structure specification
  - Method "locf_imputation" missing output_cube
  - Display "table_2_1_3_1" references undefined cube "results_cube"

WARNINGS (should fix):
  - Concept "bone_mineral_density" not used in any structure
  - Slice "bmd_month_12" not used in any method or display

PASSED:
  - DAG structure: no cycles detected
  - Clean architecture: all dependencies unidirectional
  - Immutability: no cube appears as both input and output
  - Traceability: all displays trace to concepts
```

**Acceptance Criteria:**
- Validation runs automatically before code generation
- All errors must be fixed before proceeding
- Warnings are flagged but don't block execution

**Rationale:** Early validation prevents downstream errors and reduces rework.

**Related Requirements:** Validation Rules (Model_COMPARISON.md, Lines 2136-2176)

---

## Requirements Traceability

This section maps requirements to source evidence in the Model_COMPARISON.md document.

| Requirement | Source Evidence (Model_COMPARISON.md) | Priority |
|-------------|---------------------------------------|----------|
| **Guiding Principles** |
| GP-1: Three-Tier Architecture | Section 1 (Lines 39-68) | Critical |
| GP-2: Unidirectional Dependencies | Section 1.1 (Lines 69-113) | Critical |
| GP-3: Immutability | Pattern 9 (Lines 840-899) | Critical |
| GP-4: Complete Traceability | Section 5 (Lines 344-376) | Critical |
| GP-5: CDISC Alignment | Theme 3 (Lines 1358-1418) | Critical |
| GP-6: Explicit Over Implicit | Anti-Patterns 3,4,7 (Lines 996-1091, 1208-1260) | High |
| GP-7: Data/Presentation Separation | Pattern 5 (Lines 709-756) | High |
| GP-8: DAG Structure | Pattern 3 (Lines 603-655) | High |
| GP-9: Analysis Purpose Classification | Theme 9 (Lines 1667-1718) | Medium |
| GP-10: Domain Agnostic Core | Section 4 (Lines 463-479) | High |
| GP-11: Progressive Refinement | Common SAP development practice; Industry interchange needs | High |
| GP-12: Concepts as First-Class Citizens | Pattern 2 (Lines 582-600); Section 2 (Lines 115-153); GP-10 | Critical |
| GP-13: Language Oriented Approach | Programming language design principles; GP-1, GP-8, GP-10, GP-12; Pattern 2, Pattern 3 | Critical |
| **Business Requirements** |
| BR-1: Regulatory Compliance | Theme 3 (Lines 1358-1418) | Critical |
| BR-2: Multi-Study Design | Variation 1 (Lines 383-400) | High |
| BR-3: Endpoint Type Coverage | Variation 2 (Lines 403-418) | High |
| BR-4: Statistical Method Rigor | Theme 4 (Lines 1421-1478), Anti-Pattern 4 (Lines 1025-1091) | Critical |
| BR-5: Missing Data Formalization | Theme 1 (Lines 1267-1307) | Critical |
| BR-6: Baseline Framework | Theme 2 (Lines 1310-1355), Pattern 1 (Lines 558-579) | Critical |
| BR-7: Multiple Testing Control | Theme 5 (Lines 1481-1529) | High |
| BR-8: Population/Stratification | Variation 6 (Lines 531-551) | High |
| BR-9: Traceability/Reproducibility | Section 5 (Lines 344-376), GP-4 | Critical |
| BR-10: Sensitivity/Subgroup Analyses | Theme 8 (Lines 1619-1664) | Medium |
| BR-11: Sample Size Documentation | Theme 6 (Lines 1533-1579) | Low |
| BR-12: Visit Windowing | Theme 7 (Lines 1582-1617) | Medium |
| BR-13: Display Diversity | Key Finding #4 (Line 2213), Pattern 5 (Lines 709-756) | High |
| BR-14: Code Generation | Implied by complete specifications | High |
| BR-15: Extensibility | GP-10, Section 4 (Lines 463-479) | High |
| **User Requirements** |
| UR-1: Define Concepts | Section 2.1 (Lines 117-134) | High |
| UR-2: Specify Derivations | Section 2.2 (Lines 136-153), Variation 5 (Lines 483-528) | High |
| UR-3: Configure Methods | Theme 4 (Lines 1421-1478) | Critical |
| UR-4: Design Displays | Pattern 5 (Lines 709-756), BR-13 | High |
| UR-5: Handle Missing Data | BR-5, Theme 1 (Lines 1267-1307) | Critical |
| UR-6: Define Baselines | BR-6, Theme 2 (Lines 1310-1355) | Critical |
| UR-7: Map to CDISC | BR-1, Theme 3 (Lines 1358-1418) | Critical |
| UR-8: Trace Results | GP-4, Pattern 3 (Lines 603-655) | High |
| UR-9: Control Multiple Testing | BR-7, Theme 5 (Lines 1481-1529) | High |
| UR-10: Generate Code | BR-14 | High |
| UR-11: Reuse Concepts/Methods | GP-10, BR-15 | Medium |
| UR-12: Validate Models | Validation Rules (Lines 2136-2176) | High |

---

## Acceptance Criteria

These criteria define when the AC/DC metamodel successfully meets the requirements in this document.

### Overall Acceptance

The AC/DC metamodel is considered acceptable when:

1. **All Critical Requirements Met:**
   - All guiding principles are enforced (GP-1 through GP-13)
   - All critical business requirements are satisfied (BR-1, BR-4, BR-5, BR-6, BR-9)
   - All critical user requirements are satisfied (UR-3, UR-5, UR-6, UR-7)

2. **Validation Against Examples:**
   - All 5 analyzed models (BMD, Pain, Mood, FEV1, HysLaw) can be fully represented
   - No model requires metamodel extensions (core is sufficient)
   - All identified anti-patterns are resolved in metamodel schema

3. **Regulatory Review:**
   - CDISC standards experts confirm alignment
   - Regulatory submission specialists confirm compliance support
   - Quality assurance confirms traceability completeness

4. **User Testing:**
   - Biostatisticians can define analyses without programming knowledge
   - Statistical programmers can generate code from models
   - Quality reviewers can validate models before execution
   - All 12 user requirements have successful test cases

5. **Extensibility Demonstration:**
   - At least 3 therapeutic area concept libraries exist
   - At least 20 statistical methods in catalog
   - At least 10 display templates available
   - Custom method added without metamodel core change

### Specific Acceptance Tests

#### Test 1: Complete Model Specification (Critical)
- **Given:** A new clinical trial (parallel design, continuous primary endpoint, binary secondary endpoint)
- **When:** Biostatistician creates AC/DC model
- **Then:**
  - All concepts, structures, derivations defined
  - Model validates without errors
  - Code generation produces executable SAS/R/Python
  - Results trace from TLFs to source concepts

#### Test 2: Crossover Design Support (High)
- **Given:** 4-period crossover trial (like FEV1 example)
- **When:** Model includes study baseline and period baselines
- **Then:**
  - Both baseline types are supported
  - Period effects are modelable
  - Baseline calculation methods are explicit

#### Test 3: Missing Data Transparency (Critical)
- **Given:** Trial with 15% dropout rate
- **When:** Biostatistician specifies LOCF primary, MI sensitivity
- **Then:**
  - LOCF method is complete (timing, rules, flagging)
  - MI method is complete (number of imputations, algorithm)
  - Both methods produce distinct output cubes (immutability)
  - Sensitivity analysis links to primary analysis

#### Test 4: Multiple Testing Control (High)
- **Given:** Trial with primary, 2 secondary, 3 exploratory endpoints
- **When:** Hierarchical testing strategy specified
- **Then:**
  - Testing order is explicit
  - Conditional rules are enforced (test secondary only if primary significant)
  - P-values are adjusted appropriately
  - Exploratory endpoints have no adjustment

#### Test 5: CDISC Mapping (Critical)
- **Given:** Completed AC/DC model
- **When:** CDISC mapping layer is added
- **Then:**
  - All cubes map to ADaM datasets
  - All dimensions/measures map to variables
  - Define-XML can be generated
  - Mapping validates against CDISC standards

#### Test 6: Code Generation (High)
- **Given:** Validated AC/DC model
- **When:** Code generation is executed (SAS, R, Python)
- **Then:**
  - Code compiles/runs without errors
  - Results are numerically equivalent across languages (within precision)
  - No manual code editing required

#### Test 7: Validation Before Execution (High)
- **Given:** AC/DC model with intentional errors (missing signatures, circular dependencies)
- **When:** Validation is run
- **Then:**
  - All errors are detected and reported
  - No errors are missed (false negatives)
  - Warnings are distinguished from errors

#### Test 8: Reusability (Medium)
- **Given:** Oncology concept library with tumor response concepts
- **When:** Three different oncology trials import the library
- **Then:**
  - Concepts are reused without modification
  - No duplication of concept definitions
  - Consistency across trials

#### Test 9: Traceability (Critical)
- **Given:** A p-value in a results table
- **When:** Backward trace is performed
- **Then:**
  - Table → Method → Cube → Measure → Concept chain is complete
  - No broken links
  - Source SDTM dataset is identified

#### Test 10: Extensibility (High)
- **Given:** New statistical method (e.g., Bayesian adaptive ANCOVA)
- **When:** Method is added to catalog
- **Then:**
  - Method schema is sufficient (input/output, parameters)
  - No metamodel core changes required
  - Code generation templates can be added

---

## Appendix: Glossary

**AC/DC:** Analysis Conceptualization and Derivation Cube - a metamodel for clinical trial analysis specification

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

**END OF REQUIREMENTS DOCUMENT**
