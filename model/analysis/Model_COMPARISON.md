# AC/DC Model Comparison and Metamodel Analysis

**Purpose:** This document compares five AC/DC models derived from CDISC ADaM examples to identify commonalities (metamodel core), variations (extension points), patterns, anti-patterns, and consolidated issues. The goal is to derive a unified metamodel that accommodates all examples.

**Source Models:**
1. `Model_ex01-ex04_BMD.md` - Bone Mineral Density (ANCOVA, Fisher's Exact, Repeated Measures, Descriptive)
2. `Model_ex05_Pain.md` - Pain Relief (Logistic Regression)
3. `Model_ex06_Mood.md` - POMS Mood Assessment (MANOVA, MMRM)
4. `Model_ex07_FEV1.md` - Pulmonary Function (Crossover Design, MMRM, AUC)
5. `Model_ex08_HysLaw.md` - Hy's Law Safety Analysis (Shift Tables, CMH Test)

**Date:** 2025-12-06

---

## Table of Contents

1. [Commonalities: Metamodel Core](#commonalities-metamodel-core)
2. [Variations: Extension Points](#variations-extension-points)
3. [Patterns](#patterns)
   - Pattern 1-8: Various successful patterns
   - Pattern 9: Immutability of Data Structures (NEW)
4. [Anti-Patterns](#anti-patterns)
5. [Consolidated Issues](#consolidated-issues)
6. [Proposed Unified Metamodel](#proposed-unified-metamodel)
7. [Traceability Matrix](#traceability-matrix)
8. [Summary and Recommendations](#summary-and-recommendations)

---

## Commonalities: Metamodel Core

These elements appear consistently across all five models and represent the stable core of the AC/DC metamodel.

### 1. Three-Tier Architecture

**Universal Structure:** All models follow the same top-level organization:

```yaml
model:
  concepts:
    - biomedical
    - derivation
    - analysis
  structures:
    - dimension/dimensions
    - measure/measures
    - attribute/attributes
    - cube/cubes
  derivations:
    - slice/slices
    - method/methods
    - display/displays
```

**Traceability:**
- BMD: Lines 8-31 (concepts), 49-116 (structures), 118-323 (derivations)
- Pain: Lines 9-77 (concepts), 78-221 (structures), 222-374 (derivations)
- Mood: Lines 11-137 (concepts), 139-298 (structures), 300-469 (derivations)
- FEV1: Lines 9-124 (concepts), 126-344 (structures), 346-537 (derivations)
- HysLaw: Lines 13-124 (concepts), 122-327 (structures), 329-563 (derivations)

**Pattern:** This three-tier separation of concerns is the fundamental organizing principle of AC/DC.

---

### 2. Core Concept Categories

#### 2.1 Biomedical Concepts

**Definition:** Abstract entities representing clinical/biological observations and measurements.

**Common Properties:**
- `description`: Human-readable definition
- `unit` or `measurement_unit`: Physical units
- Domain-specific metadata (e.g., `anatomical_location`, `instrument`, `scale`)

**Examples Across Models:**
- **BMD:** `bone_mineral_density`, `baseline_bmd` (Model_ex01-ex04_BMD.md:11-18)
- **Pain:** `pain_severity`, `age`, `sex` (Model_ex05_Pain.md:11-37)
- **Mood:** `ProfileOfMoodStates`, subscales (`TensionAnxiety`, `Depression`, etc.) (Model_ex06_Mood.md:17-78)
- **FEV1:** `FEV1`, `StudyBaseline`, `PeriodBaseline` (Model_ex07_FEV1.md:11-28)
- **HysLaw:** `liver_function_test`, `transaminase`, `bilirubin` (Model_ex08_HysLaw.md:14-40)

**Pattern:** Biomedical concepts are domain-specific but all relate to clinical observations, measurements, or patient characteristics.

#### 2.2 Derivation Concepts

**Definition:** Abstract transformations and computed values.

**Common Patterns:**
- Change from baseline (appears in 4/5 models)
- Percentages/proportions
- Statistical measures (SE, CI)
- Test statistics

**Examples:**
- **BMD:** `change_from_baseline`, `percent_change_from_baseline`, `treatment_difference` (Model_ex01-ex04_BMD.md:21-33)
- **Pain:** `change_in_pain_severity`, `pain_relief_status`, `locf_imputation` (Model_ex05_Pain.md:40-56)
- **Mood:** `ChangeFromBaseline`, `EffectEstimate`, `WilksLambda` (Model_ex06_Mood.md:86-109)
- **FEV1:** `ChangeFromBaseline`, `AdjustedMean`, `TreatmentDifference`, `TrapezoidalRule` (Model_ex07_FEV1.md:46-85)
- **HysLaw:** `elevation`, `multiple_of_uln`, `shift_from_baseline` (Model_ex08_HysLaw.md:55-76)

**Pattern:** Derivation concepts represent the "how" of transforming raw observations into analysis-ready values.

#### 2.3 Analysis Concepts

**Definition:** Abstract analytical constructs and study design elements.

**Common Patterns:**
- Endpoint definitions (primary, secondary, co-primary)
- Statistical methods/models
- Population definitions
- Study design elements

**Examples:**
- **BMD:** `efficacy_endpoint`, `secondary_endpoint`, `descriptive_analysis` (Model_ex01-ex04_BMD.md:35-47)
- **Pain:** `primary_efficacy_endpoint`, `treatment_comparison`, `covariate_adjustment` (Model_ex05_Pain.md:59-77)
- **Mood:** `EfficacyEndpoint`, `OverallTreatmentEffect`, `MultivariateAnalysis` (Model_ex06_Mood.md:112-137)
- **FEV1:** `CoPrimaryEndpoint`, `MixedEffectsModel`, `CrossoverDesign` (Model_ex07_FEV1.md:87-124)
- **HysLaw:** `hys_law_criteria`, `shift_analysis`, `treatment_comparison`, `safety_analysis` (Model_ex08_HysLaw.md:78-120)

**Pattern:** Analysis concepts bridge study objectives and statistical methodology.

---

### 3. Core Structure Categories

#### 3.1 Dimensions

**Definition:** Data components that identify and organize observations.

**Universal Dimensions (appear in all 5 models):**

| Dimension | Models | Purpose | CDISC Variable |
|-----------|--------|---------|----------------|
| **Subject** | All 5 | Individual identifier | USUBJID |
| **Treatment** | All 5 | Intervention arm | TRT01P, ARM |
| **Visit/Timepoint** | All 5 | Temporal location | VISIT, AVISIT |
| **Analysis Population** | All 5 | Population subset | ITTFL, SAFFL |

**Examples:**
- **BMD:** `treatment`, `time_point`, `subject`, `analysis_population` (Model_ex01-ex04_BMD.md:51-69)
- **Pain:** `treatment`, `timepoint`, `subject`, `analysis_population` (Model_ex05_Pain.md:81-101)
- **Mood:** `TreatmentArm`, `AnalysisTimepoint`, `Subject`, `AnalysisPopulation` (Model_ex06_Mood.md:141-175)
- **FEV1:** `treatment`, `visit`, `subject`, `site` (Model_ex07_FEV1.md:128-162)
- **HysLaw:** `subject`, `treatment`, `visit`, `analysis_population` (Model_ex08_HysLaw.md:124-169)

**Pattern:** Dimensions form the "coordinates" that uniquely identify each observation in the cube.

#### 3.2 Measures

**Definition:** Quantitative or qualitative values being analyzed.

**Common Measure Types:**
- **Raw observations:** Biomedical measurements (e.g., `bmd_value`, `fev1`, `pain_severity_score`)
- **Derived values:** Computed measures (e.g., `change_from_baseline`, `percent_change`)
- **Aggregations:** Summary statistics (e.g., `subject_count`, `percentage`)
- **Statistical results:** Model outputs (e.g., `adjusted_mean`, `p_value`, `odds_ratio`)

**Examples:**
- **BMD:** `bmd_value`, `percent_change_bmd`, `subject_count` (Model_ex01-ex04_BMD.md:72-89)
- **Pain:** `pain_severity_score`, `pain_relief_indicator`, `odds_ratio`, `p_value` (Model_ex05_Pain.md:149-192)
- **Mood:** `SubscaleScore`, `ChangeFromBaselineScore`, `WilksLambdaValue` (Model_ex06_Mood.md:212-248)
- **FEV1:** `fev1`, `fev1_auc_0_12`, `adjusted_mean`, `treatment_difference` (Model_ex07_FEV1.md:191-262)
- **HysLaw:** `lab_result_value`, `subject_count`, `percentage`, `p_value` (Model_ex08_HysLaw.md:172-204)

**Pattern:** Measures progress from raw → derived → aggregated → inferential as data flows through the pipeline.

#### 3.3 Attributes

**Definition:** Metadata that qualifies and interprets measures and dimensions.

**Common Attribute Types:**
- **Units:** Measurement units (e.g., `"g/cm^2"`, `"liters"`, `"points"`)
- **Methods:** Imputation, calculation methods (e.g., `"LOCF"`, `"OC"`)
- **Flags:** Binary indicators (e.g., baseline flag, population flag)
- **Thresholds:** Reference values (e.g., confidence level, ULN)

**Examples:**
- **BMD:** `measurement_unit`, `imputation_method`, `confidence_level` (Model_ex01-ex04_BMD.md:91-108)
- **Pain:** `pain_scale_unit`, `imputation_method`, `confidence_level` (Model_ex05_Pain.md:119-145)
- **Mood:** `ScoreRange`, `ItemCount`, `SampleSize`, `Polarity` (Model_ex06_Mood.md:186-210)
- **FEV1:** `unit`, `population`, `model_specification` (Model_ex07_FEV1.md:265-294)
- **HysLaw:** `units`, `multiple_of_uln`, `criteria_met_flag` (Model_ex08_HysLaw.md:206-244)

**Pattern:** Attributes provide essential context for interpreting measures without identifying observations.

#### 3.4 Cubes

**Definition:** Collections of observations organized by dimensions, containing measures, qualified by attributes.

**Cube Hierarchy Pattern (appears in all models):**

1. **Raw/Source Cubes:** Direct from data collection
   - BMD: `adbmd` (Model_ex01-ex04_BMD.md:111-116)
   - Pain: `ADPAIN` (Model_ex05_Pain.md:195-201)
   - Mood: `POMSSubscalesCube` (Model_ex06_Mood.md:251-263)
   - FEV1: `FEV1_Observations` (Model_ex07_FEV1.md:297-302)
   - HysLaw: `adlbhy` (Model_ex08_HysLaw.md:247-264)

2. **Derived Cubes:** Transformed/computed values
   - BMD: (implicitly derived within slices)
   - Pain: `pain_relief_by_treatment` (Model_ex05_Pain.md:203-207)
   - Mood: `MoodChangeFromBaselineCube` (Model_ex06_Mood.md:265-276)
   - FEV1: `FEV1_AUC`, `FEV1_Response` (Model_ex07_FEV1.md:311-323)
   - HysLaw: `hys_law_status_cube`, `shift_cube` (Model_ex08_HysLaw.md:267-314)

3. **Results Cubes:** Statistical outputs
   - BMD: (results embedded in methods)
   - Pain: `regression_results` (Model_ex05_Pain.md:216-220)
   - Mood: `TreatmentEffectCube`, `OverallTestResultsCube` (Model_ex06_Mood.md:278-298)
   - FEV1: `FEV1_AdjustedMeans`, `FEV1_Comparisons` (Model_ex07_FEV1.md:325-337)
   - HysLaw: `cmh_test_results` (Model_ex08_HysLaw.md:315-327)

**Pattern:** Cubes form a directed acyclic graph (DAG) from source data through transformations to results.

---

### 4. Core Derivation Categories

#### 4.1 Slices

**Definition:** Subsets of cubes created by fixing one or more dimension values.

**Common Slice Patterns:**
- **Temporal slicing:** Fix visit/timepoint (appears in all 5 models)
- **Population slicing:** Fix analysis population (appears in all 5 models)
- **Treatment slicing:** Fix treatment arm (appears in 4/5 models explicitly)

**Examples:**
- **BMD:** `bmd_month_24_locf`, `bmd_month_36_oc` (Model_ex01-ex04_BMD.md:120-154)
- **Pain:** `pain_relief_at_2hr`, `itt_population` (Model_ex05_Pain.md:224-250)
- **Mood:** `Week6Slice`, `ITTPopulationSlice`, `PlaceboSlice` (Model_ex06_Mood.md:302-337)
- **FEV1:** `FEV1_AUC_0_12_Slice`, `Study_Baseline_Slice` (Model_ex07_FEV1.md:348-397)
- **HysLaw:** `by_treatment`, `by_visit`, `by_baseline_status` (Model_ex08_HysLaw.md:331-360)

**Pattern:** Slicing is the primary mechanism for subsetting multidimensional data for specific analyses.

#### 4.2 Methods

**Definition:** Statistical or mathematical computations transforming inputs to outputs.

**Universal Method Categories:**

1. **Arithmetic Methods:** Simple calculations
   - Change from baseline (all 5 models)
   - Percentages (4/5 models)
   - Averaging (3/5 models)

2. **Statistical Methods:** Inferential procedures
   - ANCOVA (BMD)
   - Logistic Regression (Pain)
   - MANOVA, MMRM (Mood)
   - Mixed Effects REML (FEV1)
   - CMH Test (HysLaw)

3. **Aggregation Methods:** Summarization
   - Descriptive statistics (BMD, FEV1, HysLaw)
   - Counting (all 5 models)

**Examples:**
- **BMD:** `ancova_primary`, `descriptive_statistics`, `locf_imputation` (Model_ex01-ex04_BMD.md:156-227)
- **Pain:** `calculate_pain_relief`, `logistic_regression`, `calculate_percentage` (Model_ex05_Pain.md:252-323)
- **Mood:** `CalculateChangeFromBaseline`, `MixedModelRepeatedMeasures`, `MultivariateANOVA` (Model_ex06_Mood.md:340-402)
- **FEV1:** `Trapezoidal_AUC_Calculation`, `Mixed_Effects_REML`, `Calculate_LS_Means` (Model_ex07_FEV1.md:400-485)
- **HysLaw:** `assess_elevated_transaminase`, `classify_shift`, `cmh_test` (Model_ex08_HysLaw.md:363-477)

**Pattern:** Methods represent the analytical "verbs" - operations that transform data states.

#### 4.3 Displays

**Definition:** Formatted presentations of results (tables, figures, listings).

**Common Display Properties:**
- **Identity:** `id`, `title`, `subtitle`
- **Type:** `table`, `figure`, `listing`
- **Structure:** `rows`, `columns`, `cells`
- **Formatting:** Number formats, titles, footnotes
- **Sources:** Input cubes/slices/methods

**Examples:**
- **BMD:** `table_2_1_3_1`, `table_2_2_1_1`, `figure_2_4_1_1` (Model_ex01-ex04_BMD.md:229-323)
- **Pain:** `table_2_5_3_1` (Model_ex05_Pain.md:325-374)
- **Mood:** `Table_2_6_3_1` (Model_ex06_Mood.md:405-469)
- **FEV1:** `Table_2_7_4_1` (Model_ex07_FEV1.md:487-537)
- **HysLaw:** `table_2_8_3_1` (Model_ex08_HysLaw.md:480-563)

**Pattern:** Displays are the terminal nodes in the dependency graph, consuming but not producing data.

---

### 5. Universal Dependencies

**Core Dependency Pattern (observed in all 5 models):**

```
Display → Method → Slice → Cube → Measure → Concept
           ↓                ↓        ↓
        Concept         Dimension  Derivation
                                    Concept
```

**End-to-End Traceability Examples:**

1. **BMD Primary Analysis:**
   - `table_2_1_3_1` → `ancova_primary` → `bmd_month_24_locf` → `adbmd` → `percent_change_bmd` → `percent_change_from_baseline` → `bone_mineral_density`
   - (Model_ex01-ex04_BMD.md:332-339)

2. **Pain Logistic Regression:**
   - `table_2_5_3_1` → `logistic_regression` → `pain_relief_at_2hr` → `ADPAIN` → `pain_relief_indicator` → `pain_relief_status` → `pain_relief`
   - (Model_ex05_Pain.md:381-415)

3. **Mood MANOVA:**
   - `Table_2_6_3_1` → `MultivariateANOVA` → `Week6ITTSlice` → `MoodChangeFromBaselineCube` → `ChangeFromBaselineScore` → `ChangeFromBaseline` → `ProfileOfMoodStates` subscales
   - (Model_ex06_Mood.md:473-505)

4. **FEV1 AUC:**
   - `Table_2_7_4_1` → `Mixed_Effects_REML` → `FEV1_Response` → `FEV1_AUC` → `fev1_auc_0_12` → `FEV1_AUC_0_12` → `FEV1`
   - (Model_ex07_FEV1.md:543-588)

5. **HysLaw Shift:**
   - `table_2_8_3_1` → `cmh_test` → `shift_cube` → `hys_law_status_cube` → `criteria_met_flag` → `hys_law_criteria` → `liver_function_test`
   - (Model_ex08_HysLaw.md:572-611)

**Pattern:** All models exhibit clear forward dependencies from concepts to structures and backward traceability from displays to concepts.

---

## Variations: Extension Points

These elements vary systematically across models and represent extension points for the metamodel.

### 1. Study Design Variations

| Design Element | BMD | Pain | Mood | FEV1 | HysLaw |
|----------------|-----|------|------|------|--------|
| **Design Type** | Parallel group | Parallel group | Parallel group | 4-way crossover | Parallel group |
| **Periods** | 1 | 1 | 1 | 4 | 1 |
| **Washout** | No | No | No | Yes (14 days) | No |
| **Baseline Type** | Single | Single | Single | Study + Period | Single |

**Impact on Model:**
- **Crossover** (FEV1) requires:
  - Additional dimensions: `period` (Model_ex07_FEV1.md:146-153)
  - Period baseline calculations (Model_ex07_FEV1.md:26-28, 218-218)
  - Within-subject correlation modeling (Model_ex07_FEV1.md:437-439)
  - Visit schedule mapping (Model_ex07_FEV1.md:340-344)

**Metamodel Extension:** Study design should be a configurable aspect with corresponding structural implications.

---

### 2. Endpoint Type Variations

| Endpoint Type | Model | Analysis Method | Measure Type | CDISC Dataset |
|---------------|-------|-----------------|--------------|---------------|
| **Continuous** | BMD, Mood, FEV1 | ANCOVA, MMRM | Numeric | BDS |
| **Binary** | Pain | Logistic Regression | 0/1 indicator | BDS |
| **Categorical** | BMD (secondary) | Fisher's Exact | Count/proportion | BDS |
| **Shift** | HysLaw | CMH Test | Baseline → Post categories | BDS/OCCDS |
| **Time-to-Event** | (not in examples) | Cox Regression | Time, censor flag | ADTTE |

**Pattern:** Endpoint type drives:
1. Measure data types (Model evidence: BMD:72-89, Pain:149-192, HysLaw:172-204)
2. Statistical method selection (Model evidence: BMD:157-221, Pain:290-323, HysLaw:464-477)
3. Display structure (Model evidence: BMD:229-308, Pain:325-374, HysLaw:480-563)

**Metamodel Extension:** Endpoint type should be a first-class analysis concept with method compatibility rules.

---

### 3. Statistical Method Variations

#### 3.1 Method Taxonomy

**Linear Models:**
- ANCOVA (BMD: Model_ex01-ex04_BMD.md:157-173)
- MMRM (Mood: Model_ex06_Mood.md:352-368, FEV1: Model_ex07_FEV1.md:433-439)
- Mixed Effects (FEV1: Model_ex07_FEV1.md:433-439)

**Generalized Linear Models:**
- Logistic Regression (Pain: Model_ex05_Pain.md:290-306)

**Multivariate Methods:**
- MANOVA (Mood: Model_ex06_Mood.md:371-393)

**Non-parametric Methods:**
- Fisher's Exact Test (BMD: Model_ex01-ex04_BMD.md:175-186)
- CMH Test (HysLaw: Model_ex08_HysLaw.md:464-477)

**Descriptive Methods:**
- Summary Statistics (BMD: Model_ex01-ex04_BMD.md:207-220, FEV1: implicitly)

#### 3.2 Method Properties Matrix

| Property | ANCOVA | Logistic | MANOVA | MMRM | CMH |
|----------|--------|----------|--------|------|-----|
| **Input Type** | Continuous | Binary | Multiple continuous | Continuous | Categorical |
| **Covariates** | Yes | Yes | No (in example) | Yes | Stratified |
| **Random Effects** | No | No | No | Yes | No |
| **Test Statistic** | F-test | Wald | Wilks' Lambda | F-test | χ² |
| **Outputs** | LS means, SE, CI, p | OR, CI, p | Lambda, p | LS means, SE, CI, p | p-value |

**Pattern:** Method properties determine input requirements and output structure.

**Metamodel Extension:** Methods should declare:
- Input requirements (measure types, cube structure)
- Parameter specifications (covariates, contrasts)
- Output schema (measures produced)

---

### 4. Biomedical Domain Variations

| Domain | Models | Concept Examples | Standard Instruments |
|--------|--------|------------------|---------------------|
| **Musculoskeletal** | BMD | Bone density, DXA measurement | DXA protocol |
| **Pain** | Pain | Pain severity scale, rescue medication | VAS, NRS |
| **Psychiatry** | Mood | POMS instrument, mood subscales | POMS-65 |
| **Pulmonary** | FEV1 | Spirometry, lung function | ATS/ERS guidelines |
| **Hepatology** | HysLaw | Liver enzymes, Hy's Law | DILI criteria |

**Pattern:** Domain determines:
1. Biomedical concept vocabulary (model-specific)
2. Measurement scales and units (model-specific)
3. Clinical thresholds (e.g., Hy's Law: 1.5× ULN, Model_ex08_HysLaw.md:91-104)
4. Assessment schedules (model-specific visit structures)

**Metamodel Extension:** Domain ontologies should be pluggable while maintaining core structure.

---

### 5. Derivation Complexity Variations

#### 5.1 Simple Derivations (all models)

**Examples:**
- Change from baseline: `value - baseline` (all 5 models)
- Percentage: `(count / total) × 100` (BMD, Pain, HysLaw)

#### 5.2 Moderate Derivations

**Examples:**
- Percent change: `(value - baseline) / baseline × 100` (BMD: Model_ex01-ex04_BMD.md:24-26)
- Multiple of ULN: `value / ULN` (HysLaw: Model_ex08_HysLaw.md:60-62, 364-369)

#### 5.3 Complex Derivations

**Examples:**
- **Trapezoidal AUC:** Integration over time (FEV1: Model_ex07_FEV1.md:84-85, 400-408)
  - Requires multiple timepoints, interpolation
  - Normalization by duration

- **Total Mood Disturbance:** Weighted sum of subscales (Mood: Model_ex06_Mood.md:80-83, 397-402)
  - Formula: `TensionAnxiety + Depression + AngerHostility + Fatigue + Confusion - Vigor`

- **Pain Relief Status:** Multi-condition logic (Pain: Model_ex05_Pain.md:44-47, 252-265)
  - Logic: `(baseline ≥ 2) AND (post-dose ≤ 1) AND (rescue = 'No')`

- **Hy's Law Criteria:** Hierarchical logic (HysLaw: Model_ex08_HysLaw.md:78-105, 373-413)
  - Variation 1: `(ALT > 1.5×ULN) OR (AST > 1.5×ULN)`
  - Variation 2: `Variation1 AND (BILI > 1.5×ULN)`

#### 5.4 Statistical Derivations

**Model-Based Estimates:**
- LS Means from mixed models (Mood, FEV1)
- Odds ratios from logistic regression (Pain)
- Test statistics (all models with inferential methods)

**Pattern:** Derivation complexity spans a spectrum from arithmetic to statistical modeling.

**Metamodel Extension:** Methods should support:
- Formula specification (for arithmetic)
- Logic specification (for rule-based)
- Model specification (for statistical)
- Predicate specification (for logic programming, seen in Mood: Model_ex06_Mood.md:809-844)

---

### 6. Population and Stratification Variations

| Model | Primary Population | Stratification Factors | Subgroups |
|-------|-------------------|------------------------|-----------|
| **BMD** | ITT | None explicit | None mentioned |
| **Pain** | ITT | None explicit | Age, sex, baseline pain (as covariates) |
| **Mood** | ITT | None explicit | None mentioned |
| **FEV1** | FAS (Full Analysis Set) | Site | Period |
| **HysLaw** | Safety Population | Baseline Hy's Law status | Normal vs Met Criteria at baseline |

**Stratification Impact:**
- **Site stratification** (FEV1): Random effect in mixed model (Model_ex07_FEV1.md:108-109, 438)
- **Baseline status stratification** (HysLaw): CMH test stratification (Model_ex08_HysLaw.md:113-115, 471)

**Pattern:** Stratification affects:
1. Method specification (which variables are stratification factors)
2. Display structure (stratified presentations)
3. Statistical validity (controlling for confounders)

**Metamodel Extension:** Stratification should be declarative with propagation to methods and displays.

---

## Patterns

Successful design patterns observed across models.

### Pattern 1: Baseline as Special Dimension Value

**Observation:** Baseline is universally treated as a special case requiring:

1. **Identification:** Baseline flag (all 5 models have some form)
   - BMD: Implicit via time_point = "Baseline" (Model_ex01-ex04_BMD.md:56)
   - Pain: timepoint = "Baseline" (Model_ex05_Pain.md:88)
   - Mood: AnalysisTimepoint = "Baseline" (Model_ex06_Mood.md:162)
   - FEV1: Explicit baseline definition (Model_ex07_FEV1.md:21-28)
   - HysLaw: baseline_flag attribute (Model_ex08_HysLaw.md:236-239)

2. **Averaging:** Baseline often averages multiple pre-dose measurements
   - BMD: Implicit (Model_ex01-ex04_BMD.md:15-18)
   - FEV1: Average of -1hr and -10min (Model_ex07_FEV1.md:21-28, 210-218)
   - HysLaw: Identified via ABLFL (Model_ex08_HysLaw.md:236-239)

3. **Reference:** Used in derivations (change from baseline in all models)

4. **Exclusion:** Often excluded from post-baseline analyses
   - HysLaw: `filter: "visit != 'Baseline'"` (Model_ex08_HysLaw.md:312, 558)

**Recommendation:** Baseline should be a first-class concept in the metamodel with standardized treatment.

---

### Pattern 2: Treatment Comparison Always References Placebo

**Observation:** All models with treatment comparisons use placebo/control as reference:

- BMD: "Difference vs Placebo" (Model_ex01-ex04_BMD.md:29-31)
- Pain: `reference_treatment: "Placebo"` (Model_ex05_Pain.md:299)
- Mood: Placebo vs Drug ZZZ (Model_ex06_Mood.md:147-148)
- FEV1: `reference: "Placebo"` (Model_ex07_FEV1.md:65, 337)
- HysLaw: Placebo vs Drug XYZ (Model_ex08_HysLaw.md:134, 469)

**Statistical Implications:**
- Contrasts coded with placebo as reference group
- Treatment differences computed as `active - placebo`
- Odds ratios computed as `OR(active vs placebo)`

**Recommendation:** Reference treatment should be explicitly declared in analysis concepts with automatic contrast generation.

---

### Pattern 3: Hierarchical Cube Dependencies (DAG Structure)

**Observation:** Cubes form a directed acyclic graph (DAG) where downstream cubes depend on upstream:

**Example 1: Mood Model (Model_ex06_Mood.md)**
```
POMSSubscalesCube (raw)
    ↓ [CalculateChangeFromBaseline]
MoodChangeFromBaselineCube
    ↓ [MixedModelRepeatedMeasures]
TreatmentEffectCube
    ↓ [Display]
Table_2_6_3_1
```

**Example 2: FEV1 Model (Model_ex07_FEV1.md)**
```
FEV1_Observations (raw)
    ↓ [Trapezoidal_AUC_Calculation]
FEV1_AUC
    ↓ [Calculate_Change_From_Baseline]
FEV1_Response
    ↓ [Mixed_Effects_REML]
FEV1_AdjustedMeans
    ↓ [Calculate_Treatment_Difference]
FEV1_Comparisons
    ↓ [Display]
Table_2_7_4_1
```

**Example 3: HysLaw Model (Model_ex08_HysLaw.md)**
```
adlbhy (raw)
    ↓ [classify_hys_law_status]
hys_law_status_cube
    ↓ [baseline subset]
baseline_status_cube
    ↓ [classify_shift + join]
shift_cube
    ↓ [cmh_test]
cmh_test_results
    ↓ [Display]
table_2_8_3_1
```

**Pattern Properties:**
- No cycles (DAG property maintained)
- Clear provenance (can trace backward)
- Incremental computation possible
- Testable at each stage

**Recommendation:** Metamodel should enforce DAG structure with explicit cube lineage.

---

### Pattern 4: Method Input/Output Schema Declaration

**Observation:** Best-documented methods explicitly declare inputs and outputs:

**Example 1: Pain Logistic Regression (Model_ex05_Pain.md:290-306)**
```yaml
logistic_regression:
  model_type: "Binary logistic regression"
  response_variable: "pain_relief_indicator"
  independent_variables:
    - "treatment"
    - "age"
    - "sex"
    - "baseline_pain_severity"
  output_measures:
    - "odds_ratio"
    - "ci_lower"
    - "ci_upper"
    - "p_value"
```

**Example 2: FEV1 Trapezoidal AUC (Model_ex07_FEV1.md:400-408)**
```yaml
Trapezoidal_AUC_Calculation:
  input: "FEV1_Observations"
  output: "FEV1_AUC"
  formula: "sum((t[i+1] - t[i]) * (fev1[i+1] + fev1[i]) / 2)"
  parameters:
    time_range: ["0-12 hr", "12-24 hr"]
```

**Example 3: HysLaw CMH Test (Model_ex08_HysLaw.md:464-477)**
```yaml
cmh_test:
  input: shift_cube
  output: p_value
  statistical_method: "CMH test"
  comparison: "Placebo vs Drug XYZ"
  stratification: "baseline_status"
  null_hypothesis: "No association..."
```

**Pattern:** Well-specified methods enable:
- Automatic validation of data flow
- Documentation generation
- Code generation
- Dependency analysis

**Recommendation:** Metamodel should require input/output schema for all methods.

---

### Pattern 5: Display Structure Separation

**Observation:** Best displays separate data from presentation. Displays can be **tables**, **figures** (plots), or **listings**.

**Components:**
1. **Data Sources:** Which cubes/slices/methods (all models)
2. **Structure:** Rows, columns, cells (tables); axes, aesthetics (figures); records (listings)
3. **Formatting:** Number formats, alignment (all models)
4. **Metadata:** Titles, subtitles, footnotes (all models)

**Example: HysLaw Table (Model_ex08_HysLaw.md:480-563)**
```yaml
table_2_8_3_1:
  # Metadata
  title: "Summary E.8"
  subtitle: "Shifts of Hy's Law Values During Treatment"
  population: "(Safety Population)"

  # Structure
  structure:
    rows: [criteria_type, visit]
    columns: [treatment, baseline_status, shift_category]
    cells: [count, percentage]

  # Formatting
  formatting:
    number_format:
      count: "xxx"
      percentage: "x.x%"
      p_value: "x.xxx"

  # Data sources
  data_sources:
    - shift_cube
    - cmh_test_results

  # Footnotes
  footnotes: [...]
```

**Pattern:** Separating structure from content enables:
- Reusable display templates
- Multiple output formats (PDF, RTF, HTML)
- Consistent styling
- Automated validation

**Recommendation:** Metamodel should formalize display schema with reusable templates.

---

### Pattern 6: Imputation as Explicit Method

**Observation:** Missing data handling is explicitly modeled as a method:

- **BMD:** `locf_imputation` method (Model_ex01-ex04_BMD.md:222-227)
- **Pain:** `apply_locf` method (Model_ex05_Pain.md:267-273), `locf_imputation` derivation concept (Model_ex05_Pain.md:49-52)
- **FEV1:** Implicitly in mixed model (MMRM handles missing data)

**Components:**
- Method type (LOCF, BOCF, MI, etc.)
- Application scope (which measures, which subjects)
- Timing (when in pipeline)

**Pattern:** Explicit imputation enables:
- Sensitivity analyses (different imputation methods)
- Traceability (which values were imputed)
- Regulatory compliance (documented handling)

**Recommendation:** Metamodel should treat imputation as first-class method with standardized properties.

---

### Pattern 7: Dimensions as Coordinates, Measures as Values

**Observation:** Clear conceptual separation universally maintained:

**Dimensions:**
- Discrete or categorical (even when underlying is continuous like time)
- Identify "which" observation
- Form composite key
- Used in GROUP BY, slicing

**Measures:**
- Continuous or discrete numeric values
- Represent "what" is observed/computed
- Can be aggregated (SUM, MEAN, COUNT)
- Used in calculations

**Example Clarity: FEV1 Model (Model_ex07_FEV1.md:128-262)**
- Dimensions: treatment, visit, period, subject, site, timepoint (128-188)
- Measures: fev1, fev1_auc_0_12, adjusted_mean, p_value (191-262)
- Clear separation maintained throughout

**Violation Example:**
- Pain model uses `age_group` as both dimension and continuous covariate (Model_ex05_Pain.md:103-105)
- Creates ambiguity: is age a dimension or a measure?

**Recommendation:** Metamodel should enforce strict dimension/measure separation with clear rules for hybrid cases.

---

### Pattern 8: Logic Programming for Complex Derivations

**Observation:** Mood model includes logic programming predicates (Model_ex06_Mood.md:809-844):

```prolog
% Change from baseline calculation
change_from_baseline(Subject, Subscale, Week6Score, BaselineScore, Change) :-
    Change = Week6Score - BaselineScore.

% MMRM estimation
mmrm_estimate(Subscale, Treatment, EffectEstimate, SE) :-
    mixed_model(ChangeFromBaseline ~ Treatment + (1|Subject), Data),
    extract_coefficient(Treatment, EffectEstimate, SE).

% MANOVA test
manova_test(DependentVars, Treatment, WilksLambda, PValue) :-
    multivariate_model(DependentVars ~ Treatment),
    wilks_test(WilksLambda, PValue).
```

**Benefits:**
- Declarative specification of derivation logic
- Automatic inference of dependencies
- Formal verification possible
- Executable specification

**Recommendation:** Metamodel should support optional logic programming representation for complex derivations.

---

### Pattern 9: Immutability of Data Structures

**Observation:** All entities in the AC/DC model are **immutable** - nothing is modified in-place.

**Key Principle:**
- **Cubes are immutable:** Operations on cubes always produce new cubes
- **Slices are immutable:** Slicing creates new views without modifying source
- **Methods produce new outputs:** Methods transform inputs to new outputs, never modifying inputs

**Implications:**

1. **Clear Data Lineage:** Every cube has unambiguous provenance
   - Source cubes remain unchanged
   - Derived cubes explicitly reference their sources
   - Full audit trail maintained

2. **Safe Parallelization:** Multiple analyses can safely read same source cubes
   - No race conditions or data corruption
   - Reproducible results

3. **Version Control Friendly:** Each step produces new artifacts
   - Easy to compare versions
   - Rollback is trivial

4. **Testing and Validation:** Source data remains pristine
   - Can rerun derivations from source
   - Intermediate results can be validated independently

**Example Pattern from All Models:**
```yaml
# Source cube (immutable)
FEV1_Observations → [Trapezoidal_AUC_Calculation] → FEV1_AUC (new cube)
                                                      ↓
                                     [Calculate_Change_From_Baseline]
                                                      ↓
                                              FEV1_Response (new cube)
                                                      ↓
                                           [Mixed_Effects_REML]
                                                      ↓
                                          FEV1_AdjustedMeans (new cube)
```

**Pattern Evidence:**
- **BMD:** Multiple slices from same source `adbmd` (Model_ex01-ex04_BMD.md:120-154)
- **Pain:** Cubes produced by methods never modify inputs (Model_ex05_Pain.md:203-220)
- **Mood:** Explicit cube pipeline (Model_ex06_Mood.md:251-298)
- **FEV1:** Clear cube DAG with distinct stages (Model_ex07_FEV1.md:297-337)
- **HysLaw:** Multiple derived cubes from single source (Model_ex08_HysLaw.md:247-327)

**Benefits:**
- **Reproducibility:** Rerun any step with same inputs → same outputs
- **Debuggability:** Inspect intermediate results at any stage
- **Composability:** Build complex analyses from simple transformations
- **Safety:** No accidental data corruption

**Recommendation:** Metamodel must enforce immutability principle:
1. Methods declare outputs as **new cubes**, never as modifications
2. Validation rules check that no cube is listed as both input and output
3. Slice operations are pure functions (no side effects)

---

## Anti-Patterns

Problematic patterns that should be avoided or corrected.

### Anti-Pattern 1: Inconsistent Plural/Singular Naming

**Problem:** Inconsistent use of singular vs plural in structural element names.

**Examples:**

| Model | Concept | Structure | Derivation |
|-------|---------|-----------|------------|
| **BMD** | singular | **plural** (`dimensions`, `measures`) | **plural** |
| **Pain** | singular | **singular** (`dimension`, `measure`) | **singular** |
| **Mood** | singular | **singular** | **singular** |
| **FEV1** | singular | **plural** | **plural** |
| **HysLaw** | singular | **singular** | **singular** |

**Evidence:**
- BMD: `structures:` → `dimensions:`, `measures:` (Model_ex01-ex04_BMD.md:49-50)
- Pain: `structures:` → `dimension:`, `measure:` (Model_ex05_Pain.md:78-79)

**Impact:**
- Parser ambiguity (is `dimension` a single item or a list?)
- Inconsistent query patterns
- Documentation confusion

**Recommendation:** Standardize on **plural** for all collection-level categories:
```yaml
model:
  concepts:
    biomedical: []
    derivation: []
    analysis: []
  structures:
    dimensions: []
    measures: []
    attributes: []
    cubes: []
  derivations:
    slices: []
    methods: []
    displays: []
```

---

### Anti-Pattern 2: Mixing Abstraction Levels in Same Category

**Problem:** Concepts of different abstraction levels grouped together.

**Example 1: BMD Dimensions (Model_ex01-ex04_BMD.md:51-69)**
```yaml
dimensions:
  - treatment:           # High-level factor
      values: ["Drug ABC", "Placebo"]
  - time_point:          # High-level temporal
      values: ["Baseline", "Month 6", ...]
  - machine_type:        # Specific covariate
      description: "Type of DXA machine"
  - analysis_population: # Meta-level filter
      values: ["ITT"]
  - subject:             # Identifier
      type: identifier
```

**Mixing:**
- Primary factors (treatment, time)
- Covariates (machine_type)
- Population selectors (analysis_population)
- Identifiers (subject)

**Impact:**
- Unclear which dimensions are "required" vs "optional"
- Difficult to determine primary vs stratification factors
- Hard to generate appropriate statistical models

**Recommendation:** Introduce sub-categories within dimensions:
```yaml
dimensions:
  primary_factors:
    - treatment
    - time_point
  covariates:
    - machine_type
  stratification:
    - site
    - analysis_population
  identifiers:
    - subject
```

---

### Anti-Pattern 3: Implicit vs Explicit Baseline Handling

**Problem:** Baseline treatment is inconsistent across models.

**Approaches Observed:**

1. **Implicit (BMD, Pain, Mood):** Baseline is just another timepoint value
2. **Explicit (FEV1):** Baseline calculation is a formal method with its own cube
3. **Flag-based (HysLaw):** Baseline identified via attribute flag

**Evidence:**
- BMD: "Baseline" is a value in time_point dimension (Model_ex01-ex04_BMD.md:56)
- FEV1: Separate `StudyBaseline` and `PeriodBaseline` concepts (Model_ex07_FEV1.md:21-28) + `FEV1_Baseline` cube (Model_ex07_FEV1.md:304-309) + `Average_Baseline` method (Model_ex07_FEV1.md:418-423)
- HysLaw: `baseline_flag` attribute (Model_ex08_HysLaw.md:236-239) + `BaselineStatusCube` (Model_ex08_HysLaw.md:282-294)

**Issues:**
- Inconsistent queries (sometimes filter on dimension value, sometimes on flag, sometimes use special cube)
- Unclear when baseline averaging is performed
- Difficult to handle multiple baseline definitions (study vs period)

**Recommendation:** Standardize baseline as:
1. **Biomedical concept** defining what constitutes baseline
2. **Dimension value** for identification
3. **Attribute flag** for filtering
4. **Method** for multi-measurement averaging
5. **Cube** when baseline needs independent existence (crossover designs)

---

### Anti-Pattern 4: Methods Without Input/Output Specification

**Problem:** Some methods lack clear declaration of inputs and outputs, making data lineage ambiguous.

**Example 1: BMD LOCF Imputation (Model_ex01-ex04_BMD.md:222-227)**
```yaml
locf_imputation:
  type: "Imputation"
  description: "Last Observation Carried Forward imputation"
  method: "LOCF"
  applied_to: bmd_value
  condition: "missing_indicator = Missing"
```

**Missing:**
- **Input cube:** Which cube contains `bmd_value`?
- **Output cube:** What is the name of the new cube produced?
- **Temporal ordering:** How is "last observation" determined?

**Example 2: BMD ANCOVA (Model_ex01-ex04_BMD.md:157-173)**
```yaml
ancova_primary:
  type: "ANCOVA"
  input: bmd_month_24_locf  # Good: slice specified
  dependent_variable: percent_change_bmd
  independent_variables: [...]
  outputs: [...]  # Good: outputs listed
  population: "ITT"
```

**Better, but missing:**
- **Output cube name:** Where do LS means, p-values go? (should be explicit new cube)
- **Complete signature:** What new cube is produced?

**Impact:**
- Ambiguous data lineage
- Difficult to generate processing pipeline
- Hard to validate correct implementation
- Cannot verify immutability principle

**Recommendation:** Require all methods to declare complete signatures. Since all entities are **immutable**, methods must specify the new cubes they produce:
```yaml
method_name:
  input_cubes: [Cube]        # Source cubes (read-only)
  input_slices: [Slice]      # Source slices (read-only)
  output_cubes: [Cube]       # NEW cubes produced (immutable)
  output_measures: [Measure] # Measures in output cubes
  parameters: {}             # Method parameters
  # NOTE: No "side_effects" or "modifies in-place" - all outputs are NEW
```

**Example of Complete Specification:**
```yaml
locf_imputation:
  type: "Imputation"
  input_cubes:
    - adbmd_raw
  output_cubes:
    - adbmd_locf  # NEW cube with imputed values
  output_measures:
    - bmd_value  # Now includes imputed values
  parameters:
    method: "LOCF"
    applied_to: bmd_value
    ordering: subject, time_point
```

---

### Anti-Pattern 5: Overloaded Attribute Semantics

**Problem:** Attributes used for multiple purposes without clear distinction.

**Attribute Uses Observed:**

1. **Metadata** about measures (e.g., `unit`, `scale_range`)
2. **Flags** for filtering (e.g., `population_flag`, `baseline_flag`)
3. **Derived values** (e.g., `multiple_of_uln`)
4. **Method parameters** (e.g., `imputation_method`, `confidence_level`)

**Example: HysLaw Attributes (Model_ex08_HysLaw.md:206-244)**
```yaml
attribute:
  - units:                    # (1) Metadata
      description: "Unit of measurement"
  - multiple_of_uln:          # (3) Derived value
      formula: "AVAL / A1HI"
  - shift_category:           # (1/3) Metadata + derived
      values: ["Normal", "Met Criteria"]
  - criteria_met_flag:        # (2) Flag
      variable: "CRIT1FL"
  - baseline_flag:            # (2) Flag
      variable: "ABLFL"
```

**Issues:**
- `multiple_of_uln` is a derived measure, not pure metadata
  - Has formula, can be aggregated
  - Should arguably be a measure, not attribute
- Flags blur line with dimensions
  - `baseline_flag` could be dimension value
  - `criteria_met_flag` could be dimension or measure

**Impact:**
- Unclear which attributes can be aggregated
- Ambiguous querying (filter on attribute or dimension?)
- Difficult to generate correct SQL/code

**Recommendation:** Distinguish attribute types:
```yaml
attributes:
  metadata:          # Pure metadata (units, labels)
    - units
    - scale_range
  method_parameters: # Analysis settings (how computed)
    - imputation_method
    - confidence_level
  flags:             # Boolean indicators (could be dimensions)
    - baseline_flag
    - population_flag
```

And potentially promote some "attributes" to measures:
```yaml
measures:
  - multiple_of_uln:  # This is a computed value, not metadata
      formula: "lab_value / uln_value"
```

---

### Anti-Pattern 6: Coupling Display Structure to Data Structure

**Problem:** Some displays tightly couple presentation layout to cube dimensions.

**Example: Pain Table (Model_ex05_Pain.md:327-374)**
```yaml
table_2_5_3_1:
  structure:
    columns:
      - name: "Statistic"
      - name: "Placebo"
      - name: "Drug XYZ"
    rows:
      - statistic: "Number (%) with pain relief"
        placebo_format: "xx (xx.x%)"
        drug_xyz_format: "xx (xx.x%)"
      - statistic: "Odds ratio"
        placebo_value: ""
        drug_xyz_format: "x.xx"
```

**Issues:**
- Hard-coded treatment values ("Placebo", "Drug XYZ")
- Can't easily adapt to different number of treatment arms
- Row/column structure embedded in data specification

**Better Approach: HysLaw (Model_ex08_HysLaw.md:486-529)**
```yaml
table_2_8_3_1:
  structure:
    rows:
      primary: "criteria_type"
      secondary: "visit"
    columns:
      level1: "treatment"              # Dimension-based
      level2: "baseline_status"
      level3: "shift_category"
    cells:
      row1:
        label: "n"
        statistic: "subject_count"     # Measure-based
```

**Benefits:**
- Dimension-driven (works for any number of treatments)
- Measure-driven (works for any statistics)
- Separates structure from data

**Recommendation:** Displays should reference dimensions and measures, not hard-code values.

---

### Anti-Pattern 7: Ambiguous Cube Structure

**Problem:** Some cubes don't clearly specify their record structure (one record per what?).

**Good Examples:**

**FEV1 (Model_ex07_FEV1.md:297-344)**
```yaml
FEV1_Observations:
  dimensions: [subject, site, treatment, period, visit, timepoint]
  measures: [fev1]
  structure: "implicit: one record per subject per visit per timepoint"

FEV1_AdjustedMeans:
  dimensions: [treatment, time_interval]
  measures: [adjusted_mean, standard_error, n]
  structure: "implicit: one record per treatment per time interval"
```

**Explicit Example: HysLaw (Model_ex08_HysLaw.md:247-314)**
```yaml
adlbhy:
  dimensions: [subject, treatment, visit, lab_parameter]
  structure: "One record per subject per visit per lab parameter"  # Explicit!

shift_cube:
  dimensions: [subject, treatment, visit, criteria_type, baseline_status]
  structure: "One record per subject per post-baseline visit per criteria type"
```

**Poor Example: BMD (Model_ex01-ex04_BMD.md:111-116)**
```yaml
adbmd:
  dimensions: [subject, treatment, time_point, machine_type, analysis_population]
  measures: [bmd_value, percent_change_bmd, response_indicator]
  # Missing: structure specification
  # Unclear: one record per subject per time_point?
  # Or one record per subject (with time_point as multiple records)?
```

**Impact:**
- Ambiguous data structure
- Unclear aggregation semantics
- Difficult to generate correct joins

**Recommendation:** All cubes must declare structure explicitly:
```yaml
cube_name:
  dimensions: []
  measures: []
  structure: "One record per [dimension1] per [dimension2] per ..."
```

---

## Consolidated Issues

Issues identified across multiple models, grouped by theme with general solutions.

### Theme 1: Missing Data and Imputation

**Models Affected:** All 5 models

**Issue Summary:**

1. **Missing Data Handling Not Specified** (all models except where explicitly noted)
   - **BMD:** LOCF specified for primary analysis (Model_ex01-ex04_BMD.md:222-227) but mechanism not detailed (#6)
   - **Pain:** LOCF mentioned but implementation rules unclear (Model_ex05_Pain.md:49-52, Issue #3)
   - **Mood:** MMRM assumes MAR but not stated (Model_ex06_Mood.md:859, Issue #7)
   - **FEV1:** Missing data handling unclear (Model_ex07_FEV1.md:911, Issue #2)
   - **HysLaw:** Missing baseline handling ambiguous (Model_ex08_HysLaw.md:1042-1048, Issue #2)

2. **Imputation Method Details Missing** (all models with imputation)
   - What happens if baseline is missing?
   - When is imputation applied (before or after subsetting)?
   - How are imputed values flagged?
   - What are sensitivity analyses?

3. **Missing Data Mechanism Assumptions** (BMD, Mood, FEV1)
   - MAR (Missing At Random) vs MCAR vs MNAR?
   - Sensitivity analyses to assess robustness?

**General Pattern:**
```yaml
missing_data_handling:
  mechanism_assumption: "MAR"  # or MCAR, MNAR
  imputation_method: "LOCF"    # or None, BOCF, MI, etc.
  timing: "before_subsetting"  # or after
  flag_imputed: true           # create flag for imputed values
  sensitivity_analyses:
    - method: "complete_case"
    - method: "multiple_imputation"
```

**Recommendation:** Metamodel should formalize missing data handling as:
1. **Analysis concept** (assumption about mechanism)
2. **Method** (imputation algorithm)
3. **Attribute** (flag for imputed values)
4. **Alternative analyses** (sensitivity analyses)

---

### Theme 2: Baseline Definition and Calculation

**Models Affected:** All 5 models

**Issue Summary:**

1. **Single vs Multiple Measurements** (BMD, FEV1, Pain)
   - **BMD:** Baseline definition unclear - single or averaged? (Model_ex01-ex04_BMD.md:627, Issue #8)
   - **FEV1:** Explicit averaging of -1hr and -10min (Model_ex07_FEV1.md:21-28, well-specified!)
   - **Pain:** Baseline pain severity assumed single measurement (not explicitly stated)
   - **Mood:** Baseline appears to be single measurement at "Baseline" visit
   - **HysLaw:** Baseline identified by flag, assumes single measurement

2. **Study vs Period Baseline** (FEV1 only, but generalizable)
   - **FEV1:** Dual baseline definitions clearly specified (Model_ex07_FEV1.md:21-28, 903-908, Issue #1)
   - Other crossover designs would need similar clarity

3. **Missing Baseline Handling** (HysLaw, implicitly all)
   - **HysLaw:** Subjects without baseline excluded from shift analysis (Model_ex08_HysLaw.md:312, 557) but partial baseline not addressed (Issue #2)
   - Should subjects with some baseline values (e.g., ALT but not bilirubin) be included?

**General Pattern:**
```yaml
baseline_definition:
  concept:
    name: "StudyBaseline"
    definition: "Reference measurement(s) prior to treatment"
  calculation:
    method: "Average"
    timepoints: ["-1 hour", "-10 minutes"]
    rule: "mean(measurements)"
  handling:
    missing_partial: "exclude"     # or "include_where_available"
    missing_complete: "exclude"
    multiple_candidates: "use_latest"
  identification:
    dimension_value: "Baseline"
    flag: "ABLFL = 'Y'"
```

**Recommendation:** Metamodel should include:
1. **Baseline concept** with calculation rules
2. **Baseline method** for multi-measurement averaging
3. **Baseline handling rules** for missing data
4. **Multiple baseline types** (study, period) for crossover designs

---

### Theme 3: CDISC Standards Mapping

**Models Affected:** All 5 models

**Issue Summary:**

1. **Variable Names Not Specified** (all models except partial in HysLaw)
   - **BMD:** Implicit CDISC structure but variables not named (Issue: documentation gap)
   - **Pain:** CRITy/CRITyFL mentioned but incomplete (Model_ex05_Pain.md:656, Issue #7)
   - **Mood:** CDISC variables partially named (AVISIT, PARAM) but incomplete (Model_ex06_Mood.md:850-857, Issue #2)
   - **FEV1:** ADaM structure unclear (Model_ex07_FEV1.md:949-952, Issue #10)
   - **HysLaw:** Best documentation of CDISC mapping (Model_ex08_HysLaw.md:1115-1133) but still gaps

2. **Dataset Structure Ambiguous** (all models)
   - Which ADaM structure? (BDS, ADSL, OCCDS, ADTTE, custom?)
   - **BMD:** Implies BDS structure
   - **Pain:** BDS implied
   - **Mood:** BDS (ADMOOD custom dataset name)
   - **FEV1:** BDS implied, dataset name not specified
   - **HysLaw:** BDS-based, custom ADLBHY dataset

3. **Controlled Terminology** (all models)
   - PARAMCDs not specified
   - AVISIT standardization not documented
   - Lack of standard terminology codes (LOINC, SNOMED, NCI Thesaurus)

**General Pattern:**
```yaml
cdisc_mapping:
  sdtm_domain: "LB"  # or VS, QS, etc.
  adam_dataset: "ADLB"
  adam_structure: "BDS"  # or ADSL, OCCDS, ADTTE

  variables:
    dimensions:
      subject: "USUBJID"
      treatment: "TRT01P"
      visit: "AVISIT"
      parameter: "PARAM"
    measures:
      value: "AVAL"
      change: "CHG"
      baseline: "BASE"
    attributes:
      unit: "AVALU"
      baseline_flag: "ABLFL"

  controlled_terminology:
    PARAMCD:
      - code: "BMD"
        label: "Bone Mineral Density"
    LBTESTCD:
      - code: "ALT"
        loinc: "1742-6"
```

**Recommendation:** Metamodel should include:
1. **CDISC mapping layer** linking AC/DC structures to CDISC variables
2. **Controlled terminology** references (NCI Thesaurus, LOINC, SNOMED)
3. **Dataset structure** specification (SDTM domain, ADaM structure)

---

### Theme 4: Statistical Model Specification

**Models Affected:** All models with inferential methods (BMD, Pain, Mood, FEV1, HysLaw)

**Issue Summary:**

1. **Incomplete Model Specification** (BMD, Mood, FEV1)
   - **BMD:** ANCOVA adjustments specified but interaction interpretation unclear (Model_ex01-ex04_BMD.md:633, Issue #4)
   - **Mood:** MMRM mentioned but covariance structure not specified (Model_ex06_Mood.md:859-863, Issue #3)
   - **FEV1:** Mixed model specified but missing DF method, covariance structure (Model_ex07_FEV1.md:918-922, Issue #4)

2. **Covariance Structure Not Specified** (Mood, FEV1 - both using repeated measures)
   - Unstructured? AR(1)? Compound symmetry?
   - Impact on standard errors and p-values

3. **Degrees of Freedom Method** (FEV1, Mood)
   - Kenward-Roger? Satterthwaite? Residual?
   - Critical for small sample inference

4. **Contrasts and Comparisons** (BMD, Pain, FEV1, HysLaw)
   - **Pain:** Reference coding clear (Model_ex05_Pain.md:658, Issue #8)
   - **FEV1:** Each treatment vs placebo implied but not explicit
   - **HysLaw:** CMH test general association but specific comparisons unclear

**General Pattern:**
```yaml
statistical_model:
  model_class: "LinearMixedModel"
  formula: "response ~ treatment + baseline + (1|subject)"

  estimation:
    method: "REML"
    df_method: "Kenward-Roger"

  covariance:
    structure: "unstructured"  # or AR(1), CS, etc.
    grouping: "subject"

  contrasts:
    treatment:
      type: "treatment"
      reference: "Placebo"
      comparisons:
        - contrast: "Drug A - Placebo"
        - contrast: "Drug B - Placebo"

  inference:
    significance_level: 0.05
    multiplicity_adjustment: "none"  # or "Bonferroni", "Hochberg", etc.
```

**Recommendation:** Metamodel should formalize statistical model specification including:
1. **Model formula** (fixed and random effects)
2. **Estimation method** and parameters
3. **Covariance structure** for repeated measures
4. **Contrasts** and comparisons
5. **Inference settings** (α level, multiplicity)

---

### Theme 5: Multiple Testing and Multiplicity

**Models Affected:** All models with multiple endpoints/comparisons

**Issue Summary:**

1. **No Multiplicity Adjustment Mentioned** (BMD, Pain, Mood)
   - **BMD:** Multiple analyses (primary, secondary, ad-hoc) but no adjustment discussed (Model_ex01-ex04_BMD.md:634, Issue #5)
   - **Pain:** Described as primary but no mention of other endpoints (Model_ex05_Pain.md:660, Issue #9)
   - **Mood:** Six subscales tested but no adjustment mentioned (Model_ex06_Mood.md:864-867, Issue #5)

2. **Co-Primary Endpoints Strategy** (FEV1)
   - **FEV1:** Two co-primary endpoints but Type I error control not specified (Model_ex07_FEV1.md:913-917, Issue #3)
   - Should both be significant? Or at least one?
   - What α-level for each?

3. **Hierarchical Testing Implied But Not Formalized** (BMD)
   - Primary → Secondary → Ad-hoc hierarchy suggested
   - But not formalized with testing procedure

**General Pattern:**
```yaml
multiplicity:
  strategy: "hierarchical"  # or "bonferroni", "hochberg", "none"

  hierarchy:
    - level: 1
      endpoint: "primary"
      alpha: 0.05
      required: true
    - level: 2
      endpoint: "secondary"
      alpha: 0.05
      condition: "level 1 significant"

  coprimary:
    endpoints: ["endpoint1", "endpoint2"]
    strategy: "both_significant"  # or "at_least_one"
    alpha_allocation:
      endpoint1: 0.025
      endpoint2: 0.025
```

**Recommendation:** Metamodel should formalize multiplicity control:
1. **Multiplicity strategy** (hierarchical, Bonferroni, etc.)
2. **Endpoint hierarchy** with testing order
3. **Co-primary endpoint rules** with α-allocation
4. **Family-wise error rate** vs false discovery rate

---

### Theme 6: Sample Size and Power

**Models Affected:** All 5 models

**Issue Summary:**

1. **Sample Sizes Not Specified** (all models)
   - **BMD:** N=xxx placeholders (Model_ex01-ex04_BMD.md:236, footnote)
   - **Pain:** N=xxx placeholders (Model_ex05_Pain.md:338-339)
   - **Mood:** N=xxx placeholders (Model_ex06_Mood.md:438-439)
   - **FEV1:** N values not specified (Model_ex07_FEV1.md:519, 912, Issue #2)
   - **HysLaw:** N=Safety Population but count not given (Model_ex08_HysLaw.md:539)

2. **Power and Sample Size Justification** (none provided)
   - What was target effect size?
   - What power (80%, 90%)?
   - How were sample sizes determined?

**Note:** This is expected for example documents but should be included in actual analysis specifications.

**General Pattern:**
```yaml
sample_size:
  planned:
    total: 200
    by_group:
      placebo: 100
      active: 100

  assumptions:
    effect_size: 0.5
    standard_deviation: 1.0
    power: 0.80
    alpha: 0.05

  actual:
    enrolled: 205
    analyzed: 198
    by_group:
      placebo: 99
      active: 99
```

**Recommendation:** Metamodel should include:
1. **Planned sample size** with justification
2. **Actual sample size** (enrolled, analyzed)
3. **Power calculations** with assumptions

---

### Theme 7: Temporal and Visit Windowing

**Models Affected:** BMD, FEV1

**Issue Summary:**

1. **Visit Windows Not Defined** (BMD, FEV1)
   - **BMD:** "Windowed values" mentioned but window not specified (Model_ex01-ex04_BMD.md:631, Issue #2, #7)
   - **FEV1:** Time points specified but windows not defined (Model_ex07_FEV1.md:927, Issue #5)
   - What is acceptable range for "Month 24" visit? (±7 days? ±14 days?)

2. **Window Violation Handling** (not addressed)
   - If measurement is outside window, is it:
     - Excluded?
     - Assigned to nearest window?
     - Assigned to actual timing?

**General Pattern:**
```yaml
visit_schedule:
  - visit: "Month 24"
    planned_day: 720
    window:
      lower: -14  # Day 706
      upper: 14   # Day 734
    handling:
      within_window: "assign_to_planned"
      outside_window: "exclude"
```

**Recommendation:** Metamodel should include:
1. **Visit windows** with tolerance ranges
2. **Window violation rules** (assignment, exclusion)
3. **Relative vs absolute timing** (calendar date vs study day)

---

### Theme 8: Sensitivity and Subgroup Analyses

**Models Affected:** Implicitly all models

**Issue Summary:**

1. **No Sensitivity Analyses Specified** (all models except BMD which implies)
   - **BMD:** Multiple imputation methods (LOCF, OC) suggest sensitivity but not formalized (Model_ex01-ex04_BMD.md:649-651, Issue #6)
   - **Pain:** No alternative imputation mentioned (Model_ex05_Pain.md:662, Issue #10)
   - Different imputation methods
   - Different populations (ITT, PP, mITT)
   - Different baseline definitions

2. **Subgroup Analyses Not Mentioned** (BMD, implicitly others)
   - **BMD:** Could analyze by age, sex, baseline BMD tertile (Model_ex01-ex04_BMD.md:652-653, Issue #3)
   - **Pain:** Age, sex used as covariates but not subgroup factors
   - **Mood:** No subgroups mentioned
   - **FEV1:** Site as stratification factor but not subgroup
   - **HysLaw:** Baseline status as stratification not subgroup

**General Pattern:**
```yaml
sensitivity_analyses:
  - name: "Per-Protocol Population"
    modification:
      population: "PP"

  - name: "Multiple Imputation"
    modification:
      imputation_method: "MI"

subgroup_analyses:
  - factor: "age_group"
    levels: ["<65", ">=65"]
    interaction_test: true

  - factor: "baseline_severity"
    levels: ["mild", "moderate", "severe"]
    interaction_test: true
```

**Recommendation:** Metamodel should support:
1. **Sensitivity analysis** specification (what varies)
2. **Subgroup analysis** specification (factors, interaction tests)
3. **Pre-specified vs post-hoc** designation

---

### Theme 9: Safety vs Efficacy Analysis Differences

**Models Affected:** HysLaw (safety) vs others (efficacy)

**Issue Summary:**

1. **Population Differences**
   - **Efficacy:** ITT, FAS (intent-to-treat principle)
   - **Safety:** Safety Population (all exposed)
   - **HysLaw:** Safety Population (Model_ex08_HysLaw.md:165-169)

2. **Analysis Focus Differences**
   - **Efficacy:** Hypothesis testing, effect estimation, p-values
   - **Safety:** Descriptive, incidence rates, shift tables
   - **HysLaw:** Shift analysis, CMH test (more exploratory than confirmatory)

3. **Multiplicity Considerations**
   - **Efficacy:** Strict Type I error control
   - **Safety:** More exploratory, multiple comparisons expected

4. **Metamodel Implications**
   - Need to distinguish safety vs efficacy analyses
   - Different population definitions
   - Different display types (shift tables for safety)
   - Different statistical emphasis

**General Pattern:**
```yaml
analysis:
  purpose: "safety"  # or "efficacy"

  populations:
    efficacy: ["ITT", "PP", "FAS"]
    safety: ["Safety", "Treated"]

  focus:
    efficacy:
      - hypothesis_testing: true
      - effect_estimation: true
      - multiplicity_control: "strict"
    safety:
      - descriptive: true
      - incidence_monitoring: true
      - multiplicity_control: "none"
```

**Recommendation:** Metamodel should distinguish:
1. **Safety vs efficacy** analysis purpose
2. **Population mapping** to purpose
3. **Statistical rigor** appropriate to purpose
4. **Display types** appropriate to purpose (e.g., shift tables for safety)

---

## Proposed Unified Metamodel

Based on commonalities, variations, patterns, and consolidated issues, this section proposes a unified AC/DC metamodel.

### Core Metamodel Structure

```yaml
ac_dc_metamodel:
  version: "2.0"

  # ============================================
  # TOP-LEVEL ORGANIZATION (Universal)
  # ============================================

  model:
    metadata:
      name: string
      version: string
      source_documents: [string]
      date: date

    concepts:
      biomedical: [BiomedicalConcept]
      derivation: [DerivationConcept]
      analysis: [AnalysisConcept]

    structures:
      dimensions: [Dimension]
      measures: [Measure]
      attributes: [Attribute]
      cubes: [Cube]

    derivations:
      slices: [Slice]
      methods: [Method]
      displays: [Display]
```

### Concept Schema

```yaml
# ============================================
# CONCEPT SCHEMAS
# ============================================

BiomedicalConcept:
  name: string (required)
  description: string (required)
  properties:
    domain: string  # e.g., "Pulmonary", "Hepatology"
    unit: string
    scale: string
    instrument: string
    anatomical_location: string
    standard_code:
      system: string  # "LOINC", "SNOMED", "NCI"
      code: string
  relationships:
    parent: BiomedicalConcept
    realizes_as: [Measure | Dimension]

DerivationConcept:
  name: string (required)
  description: string (required)
  properties:
    formula: string
    logic: string
    method_type: enum[arithmetic, statistical, rule_based]
  relationships:
    applies_to: [BiomedicalConcept | DerivationConcept]
    realizes_as: [Method]

AnalysisConcept:
  name: string (required)
  description: string (required)
  properties:
    analysis_type: enum[efficacy, safety, descriptive]
    endpoint_type: enum[primary, secondary, exploratory, co_primary]
    study_design: StudyDesign
    statistical_method: string
  relationships:
    implements_via: [Method]
    endpoint_of: Study
```

### Study Design Schema

```yaml
StudyDesign:
  design_type: enum[parallel, crossover, factorial, adaptive]
  periods: integer
  sequences: [[Treatment]]  # for crossover
  washout:
    required: boolean
    duration: string
  randomization:
    method: string
    stratification_factors: [Dimension]
```

### Structure Schemas

```yaml
# ============================================
# STRUCTURE SCHEMAS
# ============================================

Dimension:
  name: string (required)
  description: string (required)
  category: enum[primary_factor, covariate, stratification, identifier]
  properties:
    data_type: enum[categorical, ordinal, temporal, identifier]
    values: [string]  # for categorical
    role: enum[independent_variable, grouping, stratification, identifier]
    cardinality: integer
  cdisc_mapping:
    variable: string  # e.g., "USUBJID", "TRT01P"
    domain: string
  relationships:
    realizes: BiomedicalConcept

Measure:
  name: string (required)
  description: string (required)
  category: enum[observation, derived, aggregation, statistical_result]
  properties:
    data_type: enum[continuous, discrete, binary, count]
    unit: string
    scale: enum[nominal, ordinal, interval, ratio]
    range: [number, number]
    precision: integer
    formula: string  # if derived
    aggregation: enum[sum, mean, count, min, max]  # if aggregation
  cdisc_mapping:
    variable: string  # e.g., "AVAL", "CHG"
    derivation_type: string  # ADaM DTYPE
  relationships:
    realizes: [BiomedicalConcept | DerivationConcept]
    derived_from: [Measure]

Attribute:
  name: string (required)
  description: string (required)
  category: enum[metadata, method_parameter, flag]
  properties:
    data_type: enum[string, numeric, boolean]
    values: [any]
    applies_to: enum[measure, dimension, cube]
  cdisc_mapping:
    variable: string
  relationships:
    qualifies: [Measure | Dimension | Cube]

Cube:
  name: string (required)
  description: string (required)
  category: enum[source, derived, result]
  structure:
    dimensions: [Dimension] (required)
    measures: [Measure] (required)
    attributes: [Attribute]
    record_structure: string (required)  # e.g., "One record per subject per visit"
    primary_key: [Dimension]
  provenance:
    derived_from: [Cube]
    derivation_method: [Method]
    source_datasets: [string]  # CDISC dataset names
  cdisc_mapping:
    dataset: string  # e.g., "ADLB", "ADEFF"
    structure: enum[BDS, ADSL, OCCDS, ADTTE]
  constraints:
    filters: [Condition]
    required_attributes: [Attribute]
```

### Derivation Schemas

```yaml
# ============================================
# DERIVATION SCHEMAS
# ============================================

Slice:
  name: string (required)
  description: string (required)
  source_cube: Cube (required)
  operation:
    fixed_dimensions: {Dimension: value}
    varying_dimensions: [Dimension]
    filters: [Condition]
  output:
    cardinality: string  # e.g., "subset of source_cube"

Condition:
  type: enum[equality, inequality, membership, logic]
  expression: string  # e.g., "visit != 'Baseline'"

Method:
  name: string (required)
  description: string (required)
  category: enum[arithmetic, aggregation, statistical, imputation, transformation]

  signature:
    input_cubes: [Cube]
    input_slices: [Slice]
    input_measures: [Measure]
    output_cubes: [Cube]
    output_measures: [Measure]
    parameters: {string: any}

  specification:
    # For arithmetic methods
    formula: string

    # For rule-based methods
    logic: string
    rules: [Rule]

    # For statistical methods
    model_class: enum[LinearModel, GLM, MixedModel, Nonparametric]
    formula_syntax: string  # e.g., Wilkinson notation
    fixed_effects: [Dimension]
    random_effects: [Dimension]
    covariance_structure: enum[unstructured, AR1, CS, etc.]
    estimation_method: enum[REML, ML, GEE]
    df_method: enum[KenwardRoger, Satterthwaite, Residual]
    contrasts: [Contrast]

    # For imputation methods
    imputation_method: enum[LOCF, BOCF, MI, None]
    timing: enum[before_subsetting, after_subsetting]
    missing_mechanism: enum[MCAR, MAR, MNAR]

    # For logic programming
    predicates: [Predicate]

  metadata:
    implements: [DerivationConcept | AnalysisConcept]
    software: string  # e.g., "SAS", "R", "Python"
    validation_status: enum[validated, under_review, draft]

Rule:
  condition: Condition
  action: string

Contrast:
  name: string
  type: enum[treatment, pairwise, polynomial]
  reference: string
  comparisons: [string]

Predicate:
  name: string
  arguments: [string]
  body: string  # Prolog-style rule body

Display:
  name: string (required)
  id: string
  description: string
  type: enum[table, figure, listing]

  metadata:
    title: string
    subtitle: string
    population: string
    footnotes: [Footnote]

  data_sources:
    cubes: [Cube]
    slices: [Slice]
    methods: [Method]

  structure:
    # For tables
    rows:
      primary: Dimension
      secondary: Dimension
      categories: {string: [any]}
    columns:
      levels: [Dimension]
      categories: {string: [any]}
    cells:
      statistics: [CellSpec]

    # For figures
    plot_type: enum[boxplot, scatter, line, bar]
    axes:
      x: AxisSpec
      y: AxisSpec
    aesthetics: Aesthetics

  formatting:
    number_formats: {Measure: string}
    alignment: {string: enum[left, center, right]}
    column_widths: {string: number}

CellSpec:
  label: string
  measure: Measure
  format: string
  filter: Condition

AxisSpec:
  variable: Dimension | Measure
  label: string
  scale: enum[linear, log, etc.]
  range: [number, number]

Aesthetics:
  color: Dimension
  shape: Dimension
  size: Measure

Footnote:
  id: string
  text: string
```

### Analysis Configuration

```yaml
# ============================================
# ANALYSIS CONFIGURATION
# ============================================

AnalysisConfiguration:
  purpose: enum[efficacy, safety, descriptive]

  populations:
    primary: Population
    secondary: [Population]

  endpoints:
    primary: [Endpoint]
    secondary: [Endpoint]
    exploratory: [Endpoint]

  hypotheses:
    - Hypothesis

  multiplicity:
    strategy: enum[hierarchical, bonferroni, hochberg, fdr, none]
    hierarchy: [HierarchyLevel]
    coprimary_rule: enum[all_significant, at_least_one]
    alpha_allocation: {Endpoint: number}

  missing_data:
    mechanism_assumption: enum[MCAR, MAR, MNAR]
    primary_method: Method
    sensitivity_analyses: [Method]

  baseline:
    definition: BiomedicalConcept
    calculation_method: Method
    handling_rules: BaselineHandling

  sample_size:
    planned: SampleSize
    actual: SampleSize
    power_calculation: PowerCalculation

Population:
  name: string
  definition: string
  inclusion_criteria: [Condition]
  cdisc_flag: string  # e.g., "ITTFL"

Endpoint:
  name: string
  type: enum[primary, secondary, exploratory, coprimary]
  measure: Measure
  timepoint: Dimension
  analysis_method: Method

Hypothesis:
  null: string
  alternative: string
  test_statistic: Measure
  significance_level: number

HierarchyLevel:
  level: integer
  endpoints: [Endpoint]
  alpha: number
  condition: string  # e.g., "previous level significant"
  required: boolean

BaselineHandling:
  missing_partial: enum[exclude, include_where_available]
  missing_complete: enum[exclude, impute]
  multiple_candidates: enum[use_latest, use_average, use_earliest]

SampleSize:
  total: integer
  by_group: {Treatment: integer}

PowerCalculation:
  effect_size: number
  standard_deviation: number
  power: number
  alpha: number
  method: string
```

### Validation Rules

```yaml
# ============================================
# VALIDATION RULES
# ============================================

ValidationRules:
  # Structural integrity
  - rule: "All cubes must declare record structure"
  - rule: "All methods must declare input and output signatures"
  - rule: "All displays must reference data sources"
  - rule: "Cube dependencies must form DAG (no cycles)"

  # Immutability
  - rule: "No cube may appear in both input and output of same method"
  - rule: "Methods must declare new output cubes, not modifications"
  - rule: "Slice operations must be pure (no side effects)"
  - rule: "All cube provenance must reference source cubes, not modifications"

  # Consistency
  - rule: "Dimension values in slices must match dimension definitions"
  - rule: "Measures in methods must exist in input cubes"
  - rule: "Display structure dimensions must exist in source cubes"
  - rule: "Display type (table/figure/listing) must match structure specification"

  # Completeness
  - rule: "Primary endpoints must have analysis methods"
  - rule: "All concepts must be realized in structures or derivations"
  - rule: "All cubes must have CDISC mapping (if applicable)"
  - rule: "All display types (table/figure/listing) must have complete structure definitions"

  # Traceability
  - rule: "Displays must trace back to concepts via methods and cubes"
  - rule: "Derived cubes must reference derivation methods"
```

---

## Traceability Matrix

This matrix demonstrates how each model element traces through the metamodel levels.

| Model | Display | Method | Slice/Cube | Measure | Concept | Validation |
|-------|---------|--------|------------|---------|---------|------------|
| **BMD Primary** | table_2_1_3_1 | ancova_primary | bmd_month_24_locf → adbmd | percent_change_bmd | percent_change_from_baseline → bone_mineral_density | ✓ Complete chain |
| **Pain Logistic** | table_2_5_3_1 | logistic_regression | pain_relief_at_2hr → ADPAIN | pain_relief_indicator | pain_relief_status → pain_relief | ✓ Complete chain |
| **Mood MANOVA** | Table_2_6_3_1 | MultivariateANOVA | Week6ITTSlice → MoodChangeFromBaselineCube | ChangeFromBaselineScore | ChangeFromBaseline → ProfileOfMoodStates | ✓ Complete chain |
| **FEV1 AUC** | Table_2_7_4_1 | Mixed_Effects_REML | FEV1_Response → FEV1_AUC → FEV1_Observations | fev1_auc_0_12 | FEV1_AUC_0_12 → FEV1 | ✓ Complete chain |
| **HysLaw Shift** | table_2_8_3_1 | cmh_test | shift_cube → hys_law_status_cube → adlbhy | criteria_met_flag | hys_law_criteria → liver_function_test | ✓ Complete chain |

### Dependency Verification

All five models maintain **complete forward and backward traceability**:

1. **Forward:** Concepts → Structures → Derivations → Displays
2. **Backward:** Displays → Derivations → Structures → Concepts

This validates the core architectural principle of the AC/DC metamodel.

---

## Summary and Recommendations

### Key Findings

1. **Strong Core:** The three-tier architecture (concepts, structures, derivations) is universal and stable.

2. **Immutability Principle:** All entities (cubes, slices, measures) are immutable - operations produce new entities, never modify existing ones. This ensures reproducibility, safe parallelization, and clear data lineage.

3. **Display Diversity:** Displays encompass tables, figures (plots), and listings, each with appropriate structure and formatting specifications.

4. **Clear Patterns:** Common patterns emerge around baseline handling, treatment comparisons, DAG dependencies, immutability, and display structure separation.

5. **Systematic Variations:** Variations in study design, endpoint types, and statistical methods follow predictable patterns suitable for metamodel extension.

6. **Consistent Anti-Patterns:** Naming inconsistencies and incomplete specifications affect all models similarly.

7. **Consolidated Issues:** Missing data, baseline definitions, CDISC mapping, and statistical specifications are common gaps.

### Recommendations for Metamodel Evolution

#### High Priority

1. **Enforce Immutability:** All cubes, slices, and derivations are immutable - methods produce new cubes, never modify existing ones
2. **Standardize Naming:** Adopt plural forms for all collection categories
3. **Formalize Record Structure:** Require explicit record structure specification for all cubes (aligns with CDISC standards)
4. **Require Signatures:** All methods must declare complete input/output schemas with explicit new cubes produced
5. **Display Type Support:** Ensure metamodel fully supports tables, figures, and listings with appropriate structure schemas
6. **Baseline Framework:** Standardize baseline definition, calculation, and handling
7. **Missing Data:** Formalize imputation as methods with explicit properties

#### Medium Priority

1. **CDISC Integration:** Add comprehensive CDISC mapping layer
2. **Statistical Models:** Extend method schema for complete model specification
3. **Multiplicity Control:** Add formal multiplicity handling framework
4. **Display Templates:** Create reusable display structure templates for tables, figures, and listings
5. **Logic Programming:** Support predicate-based derivation specifications

#### Lower Priority

1. **Sensitivity Analysis:** Add configuration for sensitivity/subgroup analyses
2. **Sample Size:** Include sample size and power calculation metadata
3. **Visit Windowing:** Formalize visit window definitions and handling
4. **Safety vs Efficacy:** Distinguish safety and efficacy analysis patterns

### Next Steps

1. **Validate Metamodel:** Apply proposed metamodel to additional examples
2. **Develop Tooling:** Create validators, generators, and query tools
3. **Standard Library:** Build library of common concepts, methods, displays
4. **Documentation:** Comprehensive metamodel specification document
5. **Community Review:** Engage stakeholders for feedback and refinement

---

## Appendix: Model File References

| Model | File | Lines Analyzed |
|-------|------|----------------|
| BMD | Model_ex01-ex04_BMD.md | 1-658 (full) |
| Pain | Model_ex05_Pain.md | 1-663 (full) |
| Mood | Model_ex06_Mood.md | 1-917 (full) |
| FEV1 | Model_ex07_FEV1.md | 1-978 (full) |
| HysLaw | Model_ex08_HysLaw.md | 1-1142 (full) |

---

**END OF DOCUMENT**
