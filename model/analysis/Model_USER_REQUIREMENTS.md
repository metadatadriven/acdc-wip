# AC/DC Model User Requirements

**Document Purpose:** This document specifies user requirements for the AC/DC metamodel, defining what biostatisticians, statistical programmers, data managers, and clinical scientists need to accomplish using the metamodel.

**Source Document:** Model_COMPARISON.md (Analysis of 5 CDISC ADaM examples)

**Date:** 2025-12-06

**Version:** 1.0

---

## Table of Contents

1. [UR-1: Define Biomedical Concepts Clearly](#ur-1-define-biomedical-concepts-clearly)
2. [UR-2: Specify Derivations Precisely](#ur-2-specify-derivations-precisely)
3. [UR-3: Configure Statistical Methods Completely](#ur-3-configure-statistical-methods-completely)
4. [UR-4: Design Displays (Tables, Figures, Listings) Efficiently](#ur-4-design-displays-tables-figures-listings-efficiently)
5. [UR-5: Handle Missing Data Transparently](#ur-5-handle-missing-data-transparently)
6. [UR-6: Define Baselines Consistently](#ur-6-define-baselines-consistently)
7. [UR-7: Map to CDISC Standards Easily](#ur-7-map-to-cdisc-standards-easily)
8. [UR-8: Trace Results to Source Data](#ur-8-trace-results-to-source-data)
9. [UR-9: Control Multiple Testing Appropriately](#ur-9-control-multiple-testing-appropriately)
10. [UR-10: Generate Analysis Code Automatically](#ur-10-generate-analysis-code-automatically)
11. [UR-11: Reuse Concepts and Methods Across Studies](#ur-11-reuse-concepts-and-methods-across-studies)
12. [UR-12: Validate Models Before Execution](#ur-12-validate-models-before-execution)
13. [Appendix: Glossary](#appendix-glossary)

---

## Overview

These requirements specify what users (biostatisticians, statistical programmers, data managers, clinical scientists) need to accomplish using the AC/DC metamodel.

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

**END OF DOCUMENT**

*For guiding principles, see ../Model_PRINCIPLES.md*
*For business requirements, see Model_BUSINESS_REQUIREMENTS.md*
