# AC/DC Model Guiding Principles

**Document Purpose:** This document establishes the fundamental guiding principles for the AC/DC metamodel. These principles are derived from successful patterns observed across analyzed CDISC ADaM examples and represent non-negotiable architectural commitments that guide all design, implementation, and usage decisions.

**Source Document:** Model_COMPARISON.md (Analysis of 5 CDISC ADaM examples)

**Date:** 2025-12-07

**Version:** 2.0

---

## Table of Contents

1. [GP-1: Three-Tier Architectural Separation](#gp-1-three-tier-architectural-separation)
2. [GP-2: Unidirectional Dependency Flow (Clean Architecture)](#gp-2-unidirectional-dependency-flow-clean-architecture)
3. [GP-3: Immutability Principle](#gp-3-immutability-principle)
4. [GP-4: Complete End-to-End Traceability](#gp-4-complete-end-to-end-traceability)
5. [GP-5: CDISC Standards Alignment](#gp-5-cdisc-standards-alignment)
6. [GP-6: Explicit Over Implicit Design](#gp-6-explicit-over-implicit-design)
7. [GP-7: Separation of Data and Presentation](#gp-7-separation-of-data-and-presentation)
8. [GP-8: Directed Acyclic Graph (DAG) Structure](#gp-8-directed-acyclic-graph-dag-structure)
9. [GP-9: Analysis Purpose and Category Classification](#gp-9-analysis-purpose-and-category-classification)
10. [GP-10: Domain Agnostic Core with Domain-Specific Extensions](#gp-10-domain-agnostic-core-with-domain-specific-extensions)
11. [GP-11: Progressive Refinement and Varying Levels of Detail](#gp-11-progressive-refinement-and-varying-levels-of-detail)
12. [GP-12: Concepts as First-Class Citizens](#gp-12-concepts-as-first-class-citizens)
13. [GP-13: Language Oriented Approach](#gp-13-language-oriented-approach)
14. [GP-14: Estimand Framework First-Class Support](#gp-14-estimand-framework-first-class-support)
15. [GP-15: Pre-Specification and Temporal Integrity](#gp-15-pre-specification-and-temporal-integrity)
16. [GP-16: Validation Rules as Domain Invariants](#gp-16-validation-rules-as-domain-invariants)
17. [GP-17: Bounded Context Integration Patterns](#gp-17-bounded-context-integration-patterns)
18. [Appendix: Glossary](#appendix-glossary)
19. [Appendix: Change History](#appendix-change-history)

---

## Overview

These fundamental principles guide all design, implementation, and usage decisions for the AC/DC metamodel. They are derived from successful patterns observed across all analyzed models and represent non-negotiable architectural commitments.

---

## GP-1: Three-Tier Architectural Separation

**Principle:** The AC/DC metamodel SHALL maintain strict separation between three architectural tiers:
- **Concepts:** Abstract definitions of biomedical, derivation, and analysis entities
- **Structures:** Concrete data organization (dimensions, measures, attributes, cubes)
- **Derivations:** Transformations and presentations (slices, methods, displays)

**Rationale:** This separation ensures clear semantic layers, promotes reusability, and maintains conceptual clarity independent of implementation details.

**Evidence:** Universally observed across all 5 models (Model_COMPARISON.md, Section 1)

**Impact:** All model elements must be categorizable into exactly one tier; mixed-tier entities are prohibited.

---

## GP-2: Unidirectional Dependency Flow (Clean Architecture)

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

## GP-3: Immutability Principle

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

## GP-4: Complete End-to-End Traceability

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

## GP-5: CDISC Standards Alignment

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

## GP-6: Explicit Over Implicit Design

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

## GP-7: Separation of Data and Presentation

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

## GP-8: Directed Acyclic Graph (DAG) Structure

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

## GP-9: Analysis Purpose and Category Classification

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

## GP-10: Domain Agnostic Core with Domain-Specific Extensions

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

## GP-11: Progressive Refinement and Varying Levels of Detail

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

## GP-12: Concepts as First-Class Citizens

**Principle:** Concepts SHALL be first-class citizens in the AC/DC metamodel, meaning they can be defined with rich properties and relationships to other concepts. When structure or derivation entities reference concepts, they instantiate those concepts according to their defined properties and relationships, analogous to how objects are instantiated from types in programming languages.

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

**Instantiation Mechanism:**

When structures or derivations reference concepts, they **instantiate** those concepts:

1. **Structure Instantiation:**
   ```yaml
   # Concept Definition (Type)
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

   # Structure Instantiation (Object)
   Measure:
     name: "alt_result"
     concept: "ALT"  # References the concept
     # Inherits: data_type=numeric, unit=U/L, range=[0,1000], standard_code
     # Can override or extend:
     precision: 1  # decimal place
     missing_allowed: true
   ```

2. **Derivation Instantiation:**
   ```yaml
   # Concept Definition (Type)
   Concept:
     name: "ChangeFromBaseline"
     type: "DerivationConcept"
     properties:
       formula: "post_value - baseline_value"
       requires:
         - "post_value"
         - "baseline_value"

   # Derivation Instantiation (Object)
   Method:
     name: "calculate_alt_change"
     concept: "ChangeFromBaseline"  # References the concept
     # Inherits formula and requirements
     parameters:
       post_value: "alt_result"
       baseline_value: "alt_baseline"
     output: "alt_change"
   ```

**Programming Language Analogy:**

This design mirrors object-oriented programming:

| Programming Concept | AC/DC Metamodel Equivalent | Example |
|---------------------|----------------------------|---------|
| **Type/Class** | **Concept** | `class LabTest { unit, range, threshold }` |
| **Object/Instance** | **Structure or Derivation Entity** | `altTest = new LabTest(unit="U/L", ...)` |
| **Attributes** | **Concept Properties** | `unit`, `range`, `threshold` |
| **Methods** | **Behavioral Specifications** | `validate()`, `categorize()` |
| **Inheritance** | **Concept Hierarchies** | `ALT extends LiverFunctionTest` |
| **Composition** | **Concept Relationships** | `BloodPressure has Systolic, Diastolic` |
| **Polymorphism** | **Concept Instantiation Variants** | Same concept, different measure implementations |

**Abstraction Benefits:**

This first-class concept approach enables:

1. **Model-Defined Extensions:**
   - SAPs can define new biomedical concepts without metamodel changes
   - Therapeutic area-specific concepts added via concept libraries
   - Organizational standards encoded as reusable concepts
   - Study-specific derivations defined declaratively

2. **Reduced Hardcoding:**
   - Calculation formulas in concepts, not hardcoded in metamodel
   - Clinical thresholds (e.g., ULN values) in concepts, not hardcoded
   - Assessment scales (e.g., POMS subscales) in concepts, not hardcoded
   - CDISC mappings in concepts, not hardcoded

3. **Reusability and Consistency:**
   - Same concept used across multiple structures/derivations
   - Concept definition ensures consistent interpretation
   - Updates to concept propagate to all instantiations
   - Organizational standardization through shared concept libraries

4. **Semantic Richness:**
   - Full clinical meaning captured in concepts
   - Relationships between concepts explicit and queryable
   - Traceability enhanced by concept lineage
   - Documentation auto-generated from concept definitions

5. **Validation and Quality:**
   - Concept-level validation rules enforce data quality
   - Type checking: structures must reference valid concepts
   - Completeness checking: required concept properties must be provided
   - Consistency checking: concept relationships must be satisfied

**Examples from Analyzed Models:**

1. **Biomedical Concepts (from HysLaw model):**
   ```yaml
   ALT_Concept:
     properties:
       unit: "U/L"
       threshold: "1.5 × ULN"
       standard_code: "LOINC:1742-6"
     relationships:
       is_component_of: "HysLawCriteria"
       related_to: ["AST", "TotalBilirubin"]
   ```

2. **Derivation Concepts (from BMD model):**
   ```yaml
   PercentChange_Concept:
     formula: "((post_value - baseline_value) / baseline_value) × 100"
     properties:
       unit: "percent"
       data_type: "numeric"
     requires:
       - baseline_value: {type: numeric, non_zero: true}
       - post_value: {type: numeric}
   ```

3. **Analysis Concepts (from FEV1 model):**
   ```yaml
   AUC_0_12_Concept:
     description: "Area Under Curve from 0 to 12 hours"
     properties:
       calculation_method: "Trapezoidal"
       timepoints: [0, 0.5, 1, 2, 4, 6, 8, 10, 12]
       unit: "L·hr"
     relationships:
       is_primary_endpoint: true
       calculated_from: "FEV1"
   ```

**Rationale:** First-class concepts provide a powerful abstraction mechanism that:
- **Separates domain knowledge from metamodel structure** - Clinical expertise encoded in concepts, not metamodel code
- **Enables declarative extension** - New concepts added via data/configuration, not code changes
- **Supports multiple levels of abstraction** - From generic concepts to study-specific instantiations
- **Promotes reusability** - Concepts shared across studies, therapeutic areas, organizations
- **Facilitates interoperability** - Concept mappings to standards (USDM, CDISC) explicit and verifiable
- **Allows SAP evolution** - Statistical Analysis Plans can be extended and refined through concept definitions rather than metamodel modifications

**Evidence:**
- Pattern 2 (Model_COMPARISON.md, Lines 582-600) demonstrates concept hierarchies and reuse
- Section 2 (Model_COMPARISON.md, Lines 115-153) shows biomedical and derivation concepts across all models
- GP-10 (Domain Agnostic Core) requires pluggable concept libraries, necessitating first-class concept support

**Impact:**
- **Metamodel Schema:** Must support concept definition with properties, relationships, and behavioral specifications
- **Validation:** Must enforce type checking (structures reference valid concepts) and concept completeness
- **Concept Libraries:** Standard libraries (therapeutic areas, organizations) become first-class artifacts
- **Tooling:** Concept browsers, editors, and validators become essential development tools
- **Documentation:** Concept definitions auto-generate glossaries and data dictionaries
- **Extension Mechanism:** New analysis types added via concept definitions, not metamodel forks
- **CDISC Integration:** Concepts serve as linking layer between AC/DC entities and CDISC standards (USDM, ADaM, ARS)

---

## GP-13: Language Oriented Approach

**Principle:** The AC/DC metamodel SHALL be designed as a domain-specific language with three fundamental capabilities: (a) **Primitive Entities** as basic building blocks, (b) **Means of Combination** to compose primitives into complex structures, and (c) **Means of Abstraction** to name and reuse complex entities. These capabilities form the foundation for building expressive, scalable, and maintainable analysis models.

**Foundational Language Elements:**

This principle is based on fundamental programming language design concepts, ensuring the metamodel provides the essential building blocks for expressing complex clinical trial analyses.

### (a) Primitive Entities

**Definition:** The simplest, atomic building blocks of the model that cannot (or are currently not) broken down further within the metamodel.

**Primitive Entity Categories:**

1. **Primitive Data Types:**
   - **Numeric:** Integer, decimal, floating-point values
   - **Text:** Strings, categorical codes
   - **Temporal:** Dates, times, durations
   - **Boolean:** True/false, yes/no indicators
   - **Missing:** Explicit representation of missing values

2. **Primitive Dimensions:**
   - **Subject:** Individual patient/participant identifier (USUBJID)
   - **Time:** Visit, study day, analysis timepoint
   - **Treatment:** Assigned treatment, treatment sequence
   - **Parameter:** Measurement type, test name

3. **Primitive Operations:**
   - **Arithmetic:** Add, subtract, multiply, divide
   - **Comparison:** Equal, not equal, greater than, less than
   - **Logical:** AND, OR, NOT
   - **Aggregation:** Sum, count, mean, median, min, max
   - **Selection:** Filter, subset, slice

4. **Primitive Concepts:**
   - **Biomedical primitives:** Individual measurements (e.g., "ALT value", "Systolic BP")
   - **Temporal primitives:** "Baseline", "Post-baseline", "End of treatment"
   - **Categorical primitives:** "Male", "Female"; "Mild", "Moderate", "Severe"

**Examples:**
```yaml
# Primitive Data Type
numeric_value: 125.5

# Primitive Dimension
dimension:
  name: "subject"
  type: "identifier"

# Primitive Operation
operation: "mean"

# Primitive Concept
concept:
  name: "ALT"
  type: "BiomedicalConcept"
  primitive: true
```

**Characteristics of Primitives:**
- **Atomic:** Cannot be decomposed further within the model
- **Self-contained:** Meaning is complete without reference to other entities
- **Universal:** Applicable across studies, therapeutic areas
- **Well-defined:** Precise semantics, unambiguous interpretation

---

### (b) Means of Combination

**Definition:** Mechanisms to compose primitive entities into more complex, compound entities.

**Combination Mechanisms:**

1. **Structural Composition:**
   - **Cubes from Dimensions + Measures + Attributes**
     ```yaml
     Cube:
       name: "ADLB"
       dimensions: [subject, visit, parameter]  # Combining primitives
       measures: [lab_value, change_from_baseline]
       attributes: [unit, baseline_flag]
     ```

   - **Measures from Concepts + Properties**
     ```yaml
     Measure:
       name: "alt_result"
       concept: "ALT"  # Primitive concept
       data_type: "numeric"  # Primitive type
       unit: "U/L"
     ```

2. **Derivational Composition:**
   - **Complex derivations from primitive operations**
     ```yaml
     Method:
       name: "percent_change"
       formula: "((post_value - baseline_value) / baseline_value) * 100"
       # Combines primitives: subtract, divide, multiply
       inputs:
         - post_value
         - baseline_value
       output: percent_change_value
     ```

   - **Composite concepts from primitive concepts**
     ```yaml
     Concept:
       name: "HysLawCriteria"
       type: "CompositeConcept"
       components:  # Combining primitive concepts
         - ALT
         - AST
         - TotalBilirubin
       relationship: "AND"
       criteria: "All > 1.5 × ULN"
     ```

3. **Analytical Composition:**
   - **Methods combining statistical operations**
     ```yaml
     Method:
       name: "ANCOVA"
       type: "StatisticalMethod"
       components:  # Combining primitive statistical concepts
         - linear_model
         - least_squares_estimation
         - hypothesis_test
       parameters:
         response: "change_from_baseline"
         fixed_effects: ["treatment", "baseline_value"]
     ```

   - **Displays combining data sources and formatting**
     ```yaml
     Display:
       name: "Demographics_Table"
       type: "Table"
       data_source: demographics_cube  # Combines cube
       structure:  # Combines dimensions and statistics
         rows: [parameter]
         columns: [treatment]
         cells: [n, mean, sd]  # Primitive aggregations
     ```

4. **Hierarchical Composition:**
   - **Cube pipelines (DAG composition)**
     ```
     Source_Cube → Derived_Cube_1 → Derived_Cube_2 → Result_Cube
     # Each step combines previous cube with method
     ```

   - **Concept hierarchies**
     ```yaml
     LiverFunctionTest:  # Parent concept
       subconcepts:
         - ALT  # Primitive
         - AST  # Primitive
         - ALP  # Primitive
         - GGT  # Primitive
     ```

**Composition Properties:**
- **Closure:** Combining entities produces entities of compatible types
- **Modularity:** Components can be developed and tested independently
- **Composability:** Results of one combination can be inputs to another
- **Type safety:** Combinations must respect entity type constraints

---

### (c) Means of Abstraction

**Definition:** Mechanisms to name complex entities or operations, hide implementation details, and enable reuse and reasoning at higher levels of abstraction.

**Abstraction Mechanisms:**

1. **Naming and Aliasing:**
   - **Named cubes abstract complex derivation pipelines**
     ```yaml
     # Complex derivation hidden behind simple name
     Cube:
       name: "EFFICACY_ANALYSIS_READY"
       # User doesn't need to know the derivation steps
       derived_from: "source_cube"
       methods: [impute_locf, calculate_change, apply_population_filter]
     ```

   - **Named methods abstract statistical procedures**
     ```yaml
     Method:
       name: "Primary_Efficacy_Analysis"
       # Abstracts complex ANCOVA with specific settings
       type: "ANCOVA"
       # Implementation details hidden from user
     ```

2. **Parameterization:**
   - **Generic methods with parameters**
     ```yaml
     Method:
       name: "ChangeFromBaseline"
       type: "GenericDerivation"
       parameters:
         baseline_var: {type: measure, required: true}
         post_var: {type: measure, required: true}
       formula: "post_var - baseline_var"

     # Instantiation with specific parameters
     Method_Instance:
       uses: "ChangeFromBaseline"
       parameters:
         baseline_var: "alt_baseline"
         post_var: "alt_week_12"
       output: "alt_change_week_12"
     ```

   - **Reusable display templates**
     ```yaml
     DisplayTemplate:
       name: "Continuous_Endpoint_Table"
       parameters:
         endpoint: {type: concept}
         population: {type: population}
       # Template definition abstracts table structure
     ```

3. **Encapsulation via Concepts (GP-12):**
   - **Concepts encapsulate domain knowledge**
     ```yaml
     Concept:
       name: "AUC_0_12"
       encapsulates:
         calculation_method: "Trapezoidal"
         timepoints: [0, 0.5, 1, 2, 4, 6, 8, 10, 12]
         unit: "L·hr"
       # Users work with "AUC_0_12" without knowing details
     ```

   - **Analysis concepts encapsulate analytical strategy**
     ```yaml
     AnalysisConcept:
       name: "PrimaryEfficacy"
       encapsulates:
         endpoints: [fev1_auc_0_12]
         population: "ITT"
         method: "ANCOVA"
         multiplicity: "none"  # Single primary endpoint
         significance_level: 0.05
     ```

4. **Layered Abstraction (Three-Tier Architecture - GP-1):**
   - **Bottom layer (Concepts):** Abstract clinical/statistical ideas
   - **Middle layer (Structures):** Abstract data organization
   - **Top layer (Derivations):** Abstract transformations and outputs

   Each layer provides abstraction over the layer below.

5. **Libraries and Namespaces:**
   - **Therapeutic area libraries** abstract domain expertise
     ```yaml
     import: "oncology_library"
     # Provides pre-defined concepts like:
     #   - TumorResponse, ProgressionFreeSurvival, OverallSurvival
     # Users don't need to redefine
     ```

   - **Organizational standard libraries** abstract best practices
     ```yaml
     import: "company_standards.baseline_handling"
     import: "company_standards.missing_data"
     # Abstracts company-specific conventions
     ```

6. **Abstraction Barriers:**
   - **Public interfaces vs. implementation details**
     ```yaml
     Method:
       name: "MMRM_Analysis"
       interface:  # Public - what users see
         inputs: [response, covariates, random_effects]
         outputs: [estimates, p_values, lsmeans]
       implementation:  # Hidden - how it works
         algorithm: "REML"
         covariance: "Unstructured"
         df_method: "Kenward-Roger"
     ```

**Abstraction Benefits:**
- **Cognitive tractability:** Complex analyses reasoned about at appropriate level
- **Reusability:** Abstract entities used in multiple contexts
- **Maintainability:** Implementation changes don't affect users of abstraction
- **Modularity:** Systems composed from well-defined, abstract components
- **Scalability:** Large models manageable through hierarchical abstraction

---

**Integration of Three Elements:**

The three language elements work together synergistically:

```yaml
# Example: Building a complete analysis specification

# 1. PRIMITIVES
primitives:
  data_types: [numeric, text, date]
  operations: [mean, subtract, filter]
  concepts: [ALT, Baseline, ITT_Population]

# 2. COMBINATION
combination:
  # Combine primitives into measure
  Measure:
    name: "alt_value"
    concept: "ALT"  # primitive
    type: "numeric"  # primitive

  # Combine measures into cube
  Cube:
    name: "lab_data"
    dimensions: [subject, visit, parameter]  # primitives
    measures: [alt_value, baseline_flag]

  # Combine cube + method → derived cube
  DerivedCube:
    name: "alt_change"
    source: "lab_data"
    method: "calculate_change"  # combines subtract operation

# 3. ABSTRACTION
abstraction:
  # Name and encapsulate complex analysis
  Analysis:
    name: "Liver_Safety_Monitoring"
    abstract_definition:
      purpose: "Monitor liver safety per Hy's Law"
      # Hides complexity of multiple cubes, methods, displays
    components:
      cubes: [lab_data, alt_change, hyslaw_criteria]
      methods: [calculate_change, assess_hyslaw, cmh_test]
      displays: [shift_table, incidence_table]
```

**Metamodel Design Implications:**

1. **Primitive Entity Catalog:**
   - Metamodel must define comprehensive set of primitives
   - Primitives should be minimal but sufficient
   - New primitives added conservatively (most new capabilities via combination/abstraction)

2. **Composition Operators:**
   - Clear rules for valid combinations
   - Type system ensures composition safety
   - Composition creates entities compatible with further composition (closure)

3. **Abstraction Facilities:**
   - Naming conventions for all entity types
   - Parameter mechanisms for generalization
   - Import/export for library sharing
   - Interface/implementation separation

4. **Language Expressiveness:**
   - Can express any clinical trial analysis (completeness)
   - Can express concisely (convenience)
   - Can express clearly (clarity)

---

**Rationale:** The language-oriented approach ensures:
- **Expressiveness:** Rich vocabulary of primitives + powerful composition → can express complex analyses
- **Scalability:** Abstraction enables management of large, complex models
- **Maintainability:** Well-defined primitives and abstractions → easier to understand and modify
- **Reusability:** Named abstractions → use once, apply many times
- **Modularity:** Clear composition rules → build complex from simple in systematic way
- **Evolvability:** New capabilities added via combination/abstraction, not primitive proliferation
- **Learning curve:** Progressive disclosure - learn primitives first, then combination, then abstraction

This approach mirrors successful programming language design (e.g., Scheme, Python) and enables the AC/DC metamodel to function as a true domain-specific language for clinical trial analysis specification.

**Evidence:**
- GP-1 (Three-Tier Architecture) implements layered abstraction
- GP-12 (Concepts as First-Class Citizens) implements abstraction via types
- Pattern 3 (Model_COMPARISON.md, Lines 603-655) demonstrates composition via cube hierarchies
- Pattern 2 (Model_COMPARISON.md, Lines 582-600) demonstrates abstraction via concept hierarchies
- GP-8 (DAG Structure) demonstrates composition of cubes via methods
- GP-10 (Domain Agnostic Core) relies on abstraction to separate core from domain extensions

**Impact:**
- **Metamodel Schema Design:** Must explicitly identify primitives, composition rules, and abstraction mechanisms
- **Language Specification:** Formal grammar defining valid combinations
- **Validation:** Type checking ensures compositions are valid; abstraction boundaries are respected
- **Tooling:** Language-aware editors support primitive selection, composition assistance, abstraction creation
- **Documentation:** Structured by language elements (primitives reference, composition guide, abstraction patterns)
- **Education:** Teaching materials follow primitive → combination → abstraction progression
- **Extension Strategy:** New capabilities prioritize combination/abstraction over new primitives
- **Quality Metrics:** Model complexity measured by abstraction layers, primitive usage, composition depth

---

## GP-14: Estimand Framework First-Class Support

**Principle:** The AC/DC metamodel SHALL provide first-class support for the ICH E9(R1) estimand framework, treating estimands as explicit, structured entities with well-defined components (population, variable, intercurrent event handling strategies, and population-level summaries).

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
5. **Pre-Specification:** Estimands SHALL be specified before database lock (temporal integrity - GP-15)

**Example:**

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

**Impact:**
- Metamodel schema must include Estimand entity with all ICH E9(R1) components
- Analysis specifications must reference estimands explicitly
- Validation rules must verify estimand completeness before database lock
- Data handling rules derived from intercurrent event strategies
- Display metadata traces through analysis to estimand to protocol objective
- CDISC mappings: Estimand → USDM Protocol definitions, Analysis → ARS metadata

---

## GP-15: Pre-Specification and Temporal Integrity

**Principle:** The AC/DC metamodel SHALL support explicit versioning, timestamps, approval workflows, and locking mechanisms to enable pre-specification requirements and maintain temporal integrity throughout the analysis lifecycle.

**Pre-Specification Requirements:**

For confirmatory analyses, the metamodel SHALL enforce the principle that analysis specifications are finalized BEFORE seeing unblinded data:

1. **Statistical Analysis Plan (SAP) Finalized** - Before database lock
2. **Analysis Set Membership Assigned** - Before database lock (blinded review)
3. **Estimands Defined** - Before database lock
4. **Analysis Programs Validated** - Before database unlock

**Temporal Integrity Mechanisms:**

1. **Version Control:**
   ```yaml
   AnalysisSpecification:
     metadata:
       version: "2.1"
       created_date: "2024-01-15"
       modified_date: "2024-03-22"
       finalized_date: "2024-06-30"  # Before database lock
       locked: true
       lock_reason: "SAP finalized before database lock"
   ```

2. **Approval Workflows:**
   ```yaml
   ApprovalHistory:
     - approver: "Lead_Statistician"
       role: "Statistical_Lead"
       date: "2024-06-28"
       version: "2.1"
       status: "Approved"
     - approver: "Medical_Monitor"
       role: "Medical_Review"
       date: "2024-06-29"
       version: "2.1"
       status: "Approved"
   ```

3. **Temporal Constraints:**
   ```yaml
   TemporalConstraints:
     database_lock_date: "2024-07-01"
     constraints:
       - rule: "SAP_finalized_before_lock"
         check: "sap.finalized_date < database_lock_date"
         severity: "ERROR"
       - rule: "Analysis_sets_assigned_before_lock"
         check: "analysis_sets.assigned_date < database_lock_date"
         severity: "ERROR"
   ```

4. **Audit Trail:**
   ```yaml
   AuditTrail:
     - timestamp: "2024-03-15T14:30:00Z"
       action: "MODIFY"
       entity: "Analysis_1_1"
       field: "statistical_model.covariance"
       old_value: "Compound_Symmetry"
       new_value: "Unstructured"
       user: "statistician_jsmith"
       reason: "SAP Amendment 01: Updated per protocol amendment"
   ```

**Amendment Process:**

The metamodel SHALL support formal amendment workflows:

```yaml
Amendment:
  amendment_number: "01"
  amendment_date: "2024-03-15"
  reason: "Protocol amendment changed primary endpoint analysis timepoint"
  affected_entities:
    - "Primary_Efficacy_Analysis"
    - "Estimand_Primary"
  changes:
    - entity: "Estimand_Primary"
      field: "variable.timepoint"
      old_value: "Week_12"
      new_value: "Week_16"
  approval_required: true
  approved_by: "Data_Monitoring_Committee"
  approval_date: "2024-03-20"
```

**Locking Mechanism:**

Once specifications are finalized:

1. **SAP Lock** - Prevents modifications after finalization
2. **Analysis Set Lock** - Prevents membership changes after assignment
3. **Database Lock** - Marks point where data collection ceases
4. **Unlock Authorization** - Only authorized roles can unlock (with justification and audit)

**Scientific Integrity Anti-Patterns (to be prevented):**

- **Post-Hoc Primary Analysis** - Changing primary analysis after unblinding (eSAP Anti-Pattern 11.2.1)
- **Analysis Set Assignment After Unblinding** - Determining population membership after seeing treatment codes (eSAP Anti-Pattern 11.2.4)
- **Undocumented SAP Amendments** - Making changes without formal amendment process (eSAP Anti-Pattern 11.2.7)

**Rationale:** Pre-specification and temporal integrity ensure:
- **Scientific Integrity** - Prevents data-driven bias
- **Regulatory Acceptance** - Demonstrates prospective analysis planning
- **Reproducibility** - Clear versioning enables exact reproduction
- **Auditability** - Complete history of all changes
- **Transparency** - Explicit documentation of when specifications were defined
- **Quality** - Formal approval processes catch errors before execution

**Evidence:**
- ICH E9 Statistical Principles mandate pre-specification of confirmatory analyses
- eSAP Domain Design pattern (Pattern 11.1.3, Lines 1600-1605)
- eSAP Anti-patterns (11.2.1, 11.2.4, 11.2.7)
- FDA Guidance on Statistical Principles requires documented SAP finalization

**Impact:**
- Metamodel must include versioning, timestamps, and approval metadata for all key entities
- Validation rules must check temporal constraints (finalization before database lock)
- Tooling must support locking mechanisms and authorization controls
- Audit trail is mandatory, not optional
- Amendment workflows must be explicit and traceable
- Version control system integration for reproducibility

---

## GP-16: Validation Rules as Domain Invariants

**Principle:** The AC/DC metamodel SHALL support encoding validation rules, business rules, quality checks, and regulatory constraints as explicit, declarative domain invariants rather than external QA processes. These invariants SHALL be first-class entities that can be versioned, tested, and automatically enforced.

**Domain Invariants Categories:**

1. **Structural Invariants:**
   - Every cube must have at least one dimension (GP-1)
   - All method inputs must exist before method execution (GP-8 DAG)
   - Dependencies must be acyclic (GP-8)
   - Measure must reference a valid concept (GP-12)

2. **Temporal Invariants:**
   - SAP finalized before database lock (GP-15)
   - Analysis sets assigned before unblinding (GP-15)
   - Baseline occurs before post-baseline (temporal ordering)

3. **Statistical Invariants:**
   - Significance level must be between 0 and 1
   - Confidence intervals must have lower bound ≤ upper bound
   - Sample sizes must be non-negative integers
   - P-values must be between 0 and 1

4. **Regulatory Invariants:**
   - Primary analysis must be pre-specified (ICH E9)
   - Estimands must include all five components (ICH E9(R1))
   - Safety analyses must include all treated subjects (ICH E3)
   - ADaM datasets must trace to SDTM (CDISC)

5. **Clinical Invariants:**
   - Hy's Law criteria: ALT > 3×ULN AND Bilirubin > 2×ULN
   - Subject age must be ≥ minimum age per protocol
   - Baseline value must exist for change-from-baseline analyses

**Declarative Invariant Specification:**

```yaml
Invariant:
  id: "INV-001"
  name: "SAP_Finalized_Before_Database_Lock"
  category: "Temporal"
  severity: "ERROR"
  description: "Statistical Analysis Plan must be finalized before database lock"
  rule:
    type: "temporal_constraint"
    condition: "sap.finalized_date < study.database_lock_date"
  entities_affected: ["AnalysisSpecification", "Study"]
  enforcement_point: "Before database unlock"
  regulatory_basis: "ICH E9 Section 5.7"

Invariant:
  id: "INV-002"
  name: "Estimand_Completeness"
  category: "Regulatory"
  severity: "ERROR"
  description: "All estimands must specify treatment, population, variable, intercurrent events, and summary measure"
  rule:
    type: "completeness_check"
    required_fields:
      - "treatment"
      - "population"
      - "variable"
      - "intercurrent_events"
      - "summary_measure"
  entities_affected: ["Estimand"]
  enforcement_point: "Estimand creation"
  regulatory_basis: "ICH E9(R1) Section 2"

Invariant:
  id: "INV-003"
  name: "Primary_Analysis_Uniqueness"
  category: "Statistical"
  severity: "ERROR"
  description: "Exactly one primary efficacy analysis must be designated"
  rule:
    type: "cardinality_constraint"
    count_of: "Analysis where category == 'Primary_Efficacy'"
    operator: "equals"
    value: 1
  entities_affected: ["Analysis"]
  enforcement_point: "SAP finalization"

Invariant:
  id: "INV-004"
  name: "Baseline_Before_Post_Baseline"
  category: "Temporal"
  severity: "ERROR"
  description: "Baseline visit must occur before post-baseline visits"
  rule:
    type: "temporal_ordering"
    sequence:
      - "Baseline_Visit"
      - "Post_Baseline_Visits"
  entities_affected: ["Visit", "Timepoint"]
  enforcement_point: "Analysis execution"
```

**Invariant Enforcement:**

1. **Design-Time Validation:**
   - Invariants checked during model specification
   - Errors prevent SAP finalization
   - Warnings allow finalization with documented exception

2. **Runtime Validation:**
   - Invariants checked during analysis execution
   - Data quality rules enforced on cubes
   - Clinical thresholds validated against data

3. **Audit-Time Validation:**
   - Retrospective checking for regulatory audit
   - Confirmation of all invariants satisfied
   - Exception documentation review

**Quality as Domain Concern:**

Traditional approach: QC programmer independently reproduces results, compares outputs

DDD approach: Quality rules as domain invariants:

```yaml
QualityInvariant:
  id: "QC-001"
  name: "Statistical_Result_Reproducibility"
  description: "Production and QC statistical results must match within tolerance"
  rule:
    type: "output_comparison"
    tolerance: 0.0001
    entities: ["StatisticalResult"]
  enforcement: "QC_phase"
  severity: "ERROR"
```

**Rationale:** Validation rules as domain invariants ensure:
- **Automated Enforcement** - Rules checked automatically, not manually
- **Consistency** - Same rules applied uniformly across all analyses
- **Traceability** - Each rule linked to regulatory basis or clinical rationale
- **Documentation** - Rules are self-documenting
- **Testability** - Rules can be unit tested independently
- **Versioning** - Rules evolve with regulations and standards
- **Quality by Design** - Quality built into model, not bolted on afterward

**Evidence:**
- eSAP Domain Design (Recommendation 14.2.8, Lines 1912-1914): "Validation as Domain Concern"
- eSAP Anti-Patterns demonstrate problems from missing invariant checking (11.2.1, 11.2.4, 11.2.6)
- Domain-Driven Design principle: Encode business rules as domain model invariants

**Impact:**
- Metamodel schema must include Invariant entity type
- All critical business rules should be declaratively specified as invariants
- Validation engine required to evaluate invariants
- Invariants must be versioned with the model
- Documentation automatically generated from invariant specifications
- Exception handling must support documented justifications for invariant violations
- Regulatory submissions include invariant specifications and verification reports

---

## GP-17: Bounded Context Integration Patterns

**Principle:** The AC/DC metamodel SHALL support well-defined integration patterns for composing analyses across bounded contexts, using Domain-Driven Design patterns (Shared Kernel, Customer-Supplier, Anticorruption Layer, Published Language) and event-driven coordination to maintain loose coupling while enabling complex multi-context workflows.

**Bounded Contexts in Clinical Trial Analysis:**

Based on eSAP Domain Design, clinical trial statistical analysis involves multiple bounded contexts:

1. **Study Design Context** - Protocol, objectives, endpoints, estimands
2. **Statistical Analysis Context** - SAP, analysis specifications, methods
3. **Data Management Context** - Analysis datasets, derivations, populations
4. **Safety Monitoring Context** - Adverse events, laboratory, vital signs
5. **Efficacy Assessment Context** - Treatment effects, hypothesis testing
6. **Interim Analysis Context** - DMC analyses, stopping rules
7. **Regulatory Compliance Context** - ICH guidelines, quality standards
8. **Reporting Context** - Tables, figures, listings

**Integration Patterns:**

### Pattern 1: Shared Kernel

**Definition:** Two contexts share a common subset of domain model.

**Example:** Study Design Context ↔ Statistical Analysis Context share Estimand framework

```yaml
SharedKernel:
  name: "Estimand_Framework"
  shared_between:
    - "StudyDesignContext"
    - "StatisticalAnalysisContext"
  shared_entities:
    - "Estimand"
    - "InterurrentEvent"
    - "PopulationDefinition"
  coordination_requirement: "High - both contexts must agree on estimand changes"
  implementation: "Shared library, joint ownership"
```

**When to use:** Close collaboration required, frequent communication, joint ownership acceptable

### Pattern 2: Customer-Supplier (Upstream-Downstream)

**Definition:** Upstream context provides services/data that downstream context consumes.

**Example:** Data Management Context → Statistical Analysis Context (ADaM datasets)

```yaml
CustomerSupplier:
  upstream: "DataManagementContext"
  downstream: "StatisticalAnalysisContext"
  interface:
    provided_by_upstream:
      - "ADSL: Subject-level analysis dataset"
      - "ADAE: Adverse events dataset"
      - "BDS: Efficacy datasets"
    consumed_by_downstream:
      - "Analysis populations (ITT, Safety, PP)"
      - "Derived variables (change from baseline, etc.)"
  contract:
    - "ADaM datasets conform to CDISC standard"
    - "Datasets delivered before analysis execution"
    - "Dataset specifications reviewed by downstream before production"
  downstream_rights: "VETO_RIGHT"  # Statistical can veto dataset design
```

**When to use:** Clear provider-consumer relationship, well-defined interface

### Pattern 3: Anticorruption Layer (ACL)

**Definition:** Downstream context translates upstream model to protect its own domain.

**Example:** Statistical Analysis Context consumes Data Management Context via ACL

```yaml
AnticorruptionLayer:
  downstream: "StatisticalAnalysisContext"
  upstream: "DataManagementContext"
  purpose: "Translate ADaM datasets to analysis-specific cube structures"
  translation_rules:
    - upstream_entity: "ADSL"
      downstream_entity: "SubjectLevelCube"
      mapping:
        - "USUBJID → subject_id"
        - "SAFFL → is_in_safety_population"
        - "ITTFL → is_in_itt_population"
    - upstream_entity: "BDS"
      downstream_entity: "EfficacyMeasureCube"
      mapping:
        - "AVAL → observed_value"
        - "CHG → change_from_baseline"
```

**When to use:** Downstream needs to protect its domain model from upstream changes

### Pattern 4: Published Language

**Definition:** Upstream publishes well-specified language/protocol that downstream must conform to.

**Example:** Regulatory Compliance Context publishes ICH/CDISC standards

```yaml
PublishedLanguage:
  publisher: "RegulatoryComplianceContext"
  language: "CDISC_Standards"
  components:
    - "CDISC SDTM"
    - "CDISC ADaM"
    - "CDISC Controlled Terminology"
    - "ICH E9(R1) Estimand Framework"
  consumers:
    - "DataManagementContext"  # Must produce CDISC-compliant datasets
    - "StatisticalAnalysisContext"  # Must use ICH E9(R1) estimands
    - "ReportingContext"  # Must use CDISC terminology
  conformance_requirement: "MANDATORY for regulatory submissions"
```

**When to use:** Industry standards, regulatory requirements, broad adoption needed

### Pattern 5: Event-Driven Coordination

**Definition:** Contexts coordinate via domain events rather than direct coupling.

**Example:** Database lock triggers analysis execution

```yaml
DomainEvents:
  - event_name: "DatabaseLocked"
    publisher: "DataManagementContext"
    payload:
      - "database_lock_date"
      - "final_dataset_versions"
    subscribers:
      - context: "StatisticalAnalysisContext"
        action: "Begin analysis execution"
        preconditions:
          - "SAP finalized"
          - "Analysis programs validated"
      - context: "InterimAnalysisContext"
        action: "Execute final analysis (if ongoing)"

  - event_name: "SAPFinalized"
    publisher: "StatisticalAnalysisContext"
    payload:
      - "sap_version"
      - "finalization_date"
    subscribers:
      - context: "DataManagementContext"
        action: "Freeze dataset specifications"
      - context: "RegulatoryComplianceContext"
        action: "Archive SAP version"
```

**When to use:** Loose coupling desired, asynchronous coordination, audit trail needed

**Metamodel Support for Integration:**

1. **Context Declarations:**
   ```yaml
   BoundedContext:
     name: "StatisticalAnalysisContext"
     responsibilities:
       - "Define analysis specifications"
       - "Execute statistical analyses"
     interfaces:
       provides:
         - "AnalysisResults"
         - "StatisticalTests"
       consumes:
         - "AnalysisDatasets from DataManagementContext"
         - "Estimands from StudyDesignContext"
   ```

2. **Integration Declarations:**
   ```yaml
   ContextIntegration:
     pattern: "CustomerSupplier"
     upstream: "DataManagementContext"
     downstream: "StatisticalAnalysisContext"
     interface_definition: "CDISC_ADaM_Contract"
     anticorruption_layer: true
   ```

3. **Event Declarations:**
   ```yaml
   EventSchema:
     event: "DatabaseLocked"
     payload_schema:
       database_lock_date: {type: date, required: true}
       locked_datasets: {type: array, items: dataset_reference}
     subscribers:
       - StatisticalAnalysisContext
       - InterimAnalysisContext
   ```

**Rationale:** Bounded context integration patterns ensure:
- **Loose Coupling** - Contexts evolve independently
- **Clear Interfaces** - Integration points explicitly defined
- **Maintainability** - Changes localized to single context
- **Scalability** - New contexts added without disrupting existing ones
- **Testability** - Contexts tested in isolation with mocked interfaces
- **Auditability** - Event-driven coordination provides audit trail
- **Regulatory Alignment** - Published Language pattern supports CDISC/ICH conformance

**Evidence:**
- eSAP Domain Design Section 7 (Lines 1122-1583): Context Mapping and Integration Patterns
- eSAP Recommendations 14.2.3 (Event-Driven Integration), 14.2.5 (Anticorruption Layers), 14.2.7 (CDISC as Published Language)
- Domain-Driven Design strategic patterns (Eric Evans, Blue Book)

**Impact:**
- Metamodel must support bounded context declarations
- Integration patterns must be explicitly specified (not implicit)
- Event schema definitions required for event-driven coordination
- Interface contracts must be versioned and validated
- Tools must support context-aware validation (different rules per context)
- CDISC Published Language mappings are first-class integration specifications
- Multi-context workflows represented as event choreography

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

## Appendix: Change History

### Version 2.0 (2025-12-07)

**Changes:**
- Added GP-14: Estimand Framework First-Class Support
- Added GP-15: Pre-Specification and Temporal Integrity
- Added GP-16: Validation Rules as Domain Invariants
- Added GP-17: Bounded Context Integration Patterns

**Rationale:**
These four new guiding principles were derived from comprehensive analysis of the eSAP Domain Design document (eSAP_DOMAIN_DESIGN.md), specifically from:
- Section 11: Strategic Domain Patterns and Anti-Patterns (Lines 1584-1688)
- Section 14: Summary and Recommendations (Lines 1873-1968)

The new principles address critical gaps identified in the original v1.0 principles:

1. **GP-14 (Estimand Framework)** - Addresses Pattern 11.1.1 (Estimand-First Design) and Anti-Pattern 11.2.5 (Ignoring Intercurrent Events). Provides first-class support for ICH E9(R1) requirements that were implicit in original GP-9 (Analysis Purpose) but not explicitly specified.

2. **GP-15 (Pre-Specification and Temporal Integrity)** - Addresses Pattern 11.1.3 (Version-Controlled SAP) and Anti-Patterns 11.2.1 (Post-Hoc Primary Analysis), 11.2.4 (Analysis Set Assignment After Unblinding), and 11.2.7 (Undocumented SAP Amendments). Makes explicit the temporal integrity mechanisms that were mentioned in GP-11 (Progressive Refinement) but not elevated to a core principle.

3. **GP-16 (Validation Rules as Domain Invariants)** - Addresses Recommendation 14.2.8 (Validation as Domain Concern). Introduces the concept of encoding validation rules, business rules, and quality checks as first-class domain invariants rather than external QA processes. This was not covered in v1.0 principles.

4. **GP-17 (Bounded Context Integration Patterns)** - Addresses Section 7 (Context Mapping and Integration Patterns) and Recommendations 14.2.3 (Event-Driven Integration), 14.2.5 (Anticorruption Layers), and 14.2.7 (CDISC as Published Language). Extends GP-10 (Domain-Agnostic Core with Extensions) with explicit integration patterns for multi-context workflows.

**Impact:**
These principles significantly enhance the metamodel's ability to support:
- Regulatory compliance (ICH E9, E9(R1), E3)
- Scientific integrity (pre-specification, no post-hoc changes)
- Quality by design (validation as domain concern)
- Complex multi-context clinical trial workflows
- Domain-Driven Design patterns for large-scale systems

### Version 1.0 (2025-12-06)

**Initial release** with 13 guiding principles (GP-1 through GP-13):
- GP-1: Cube as Fundamental Structural Unit
- GP-2: Dimension-First Data Organization
- GP-3: Measures as Contextual Quantities
- GP-4: Attributes Qualify Dimensions and Measures
- GP-5: Methods are First-Class Entities
- GP-6: Explicit, Immutable Provenance
- GP-7: Slice Operations Preserve Structure
- GP-8: Computational Dependencies as DAG
- GP-9: Analysis Purpose Drives Structure
- GP-10: Domain-Agnostic Core with Extensions
- GP-11: Progressive Refinement Through Layering
- GP-12: Declarative Specification Over Imperative Programming
- GP-13: Machine-Readable, Human-Interpretable

---

**END OF DOCUMENT**

*For business requirements, see Model_BUSINESS_REQUIREMENTS.md*
*For user requirements, see Model_USER_REQUIREMENTS.md*
