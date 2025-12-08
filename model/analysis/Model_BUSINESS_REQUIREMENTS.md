# AC/DC Model Business Requirements

**Document Purpose:** This document specifies business requirements for the AC/DC metamodel from an organizational perspective, addressing regulatory, operational, and strategic needs for clinical trial analysis and reporting.

**Source Document:** Model_COMPARISON.md (Analysis of 5 CDISC ADaM examples)

**Date:** 2025-12-06

**Version:** 1.0

---

## Table of Contents

1. [BR-1: Regulatory Compliance Support](#br-1-regulatory-compliance-support)
2. [BR-2: Multi-Study Design Support](#br-2-multi-study-design-support)
3. [BR-3: Comprehensive Endpoint Type Coverage](#br-3-comprehensive-endpoint-type-coverage)
4. [BR-4: Statistical Method Rigor and Completeness](#br-4-statistical-method-rigor-and-completeness)
5. [BR-5: Missing Data Strategy Formalization](#br-5-missing-data-strategy-formalization)
6. [BR-6: Baseline Definition and Handling Framework](#br-6-baseline-definition-and-handling-framework)
7. [BR-7: Multiple Testing Control Framework](#br-7-multiple-testing-control-framework)
8. [BR-8: Population and Stratification Management](#br-8-population-and-stratification-management)
9. [BR-9: Full Traceability and Reproducibility](#br-9-full-traceability-and-reproducibility)
10. [BR-10: Sensitivity and Subgroup Analysis Support](#br-10-sensitivity-and-subgroup-analysis-support)
11. [BR-11: Sample Size and Power Documentation](#br-11-sample-size-and-power-documentation)
12. [BR-12: Temporal and Visit Windowing](#br-12-temporal-and-visit-windowing)
13. [BR-13: Display Diversity Support (Tables, Figures, Listings)](#br-13-display-diversity-support-tables-figures-listings)
14. [BR-14: Code Generation and Execution](#br-14-code-generation-and-execution)
15. [BR-15: Extensibility and Customization](#br-15-extensibility-and-customization)
16. [Appendix: Glossary](#appendix-glossary)

---

## Overview

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
*For user requirements, see Model_USER_REQUIREMENTS.md*
