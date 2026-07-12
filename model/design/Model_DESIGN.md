# AC/DC Unified Metamodel Design (Version 2.0)

**Date:** 2025-12-10
**Status:** Draft
**Based on:** Model Comparison and Analysis (2025-12-06)

---

## 1. Introduction

This document defines the schema and architectural principles for the AC/DC (Analysis Content / Data Cube) Metamodel Version 2.0. This unified metamodel is derived from the analysis of five disparate CDISC ADaM modeling examples and consolidates them into a single, rigorous specification.

### 1.1 Purpose

The purpose of this metamodel is to provide a standardized, machine-readable specification for clinical trial analysis that:
1.  **Decouples** analysis logic from data storage.
2.  **Enforces** a clean separation of concerns between biomedical concepts, data structures, and statistical derivations.
3.  **Ensures** transparency and reproducibility through immutable data transformations.
4.  **Facilitates** automation of code generation, validation, and reporting.

---

## 2. Architectural Principles

The AC/DC metamodel is built upon three non-negotiable architectural principles.

### 2.1 Three-Tier Architecture

The model is organized into three distinct layers:

1.  **Concepts (The "What"):** Abstract definitions of biomedical, derivation, and analysis concepts. These are platform-independent and semantic.
2.  **Structures (The "Where"):** logical data organizations (cubes, dimensions, measures) that realize the concepts.
3.  **Derivations (The "How"):** Transformations, methods, and displays that operate on structures to implement analysis logic.

### 2.2 Unidirectional Dependency Flow (Clean Architecture)

Dependencies MUST flow in only one direction: **Derivations → Structures → Concepts**.

*   **Derivations** depend on Structures and Concepts.
*   **Structures** depend ONLY on Concepts.
*   **Concepts** depend on NOTHING (they are self-contained).

This prohibits circular dependencies and ensures that the semantic layer (Concepts) remains stable regardless of implementation details (Structures/Derivations).

### 2.3 Immutability

All data entities (cubes, slices) are **immutable**.
*   Transformation methods (Derivations) accept input cubes/slices and produce **NEW** output cubes.
*   In-place modification of data is strictly forbidden.
*   This facilitates a clear Directed Acyclic Graph (DAG) of data lineage.

---

## 3. Metamodel Schema

### 3.1 Top-Level Organization

```yaml
ac_dc_metamodel:
  version: "2.0"

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
      
    configuration:
      analysis_settings: AnalysisConfiguration
```

### 3.2 Concept Schemas

Concepts represent the semantic vocabulary of the analysis.

```yaml
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

DerivationConcept:
  name: string (required)
  description: string (required)
  properties:
    formula: string
    logic: string
    method_type: enum[arithmetic, statistical, rule_based]
  relationships:
    applies_to: [BiomedicalConcept | DerivationConcept]

AnalysisConcept:
  name: string (required)
  description: string (required)
  properties:
    analysis_type: enum[efficacy, safety, descriptive]
    endpoint_type: enum[primary, secondary, exploratory, co_primary]
    study_design: StudyDesign
    statistical_method: string
  relationships:
    endpoint_of: Study
```

### 3.3 Study Design Schema

Defines the structural parameters of the clinical study.

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
    stratification_factors: [string]
```

### 3.4 Structure Schemas

Structures define the logical organization of data.

```yaml
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
    derivation_method_name: string  
    source_datasets: [string]  # CDISC dataset names
  cdisc_mapping:
    dataset: string  # e.g., "ADLB", "ADEFF"
    structure: enum[BDS, ADSL, OCCDS, ADTTE]
  constraints:
    filters: [Condition]
    required_attributes: [Attribute]
```

### 3.5 Derivation Schemas

Derivations define the executable logic of the analysis.

```yaml
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
    # Rule-based / Arithmetic
    formula: string
    logic: string
    rules: [Rule]

    # Statistical
    model_class: enum[LinearModel, GLM, MixedModel, Nonparametric]
    formula_syntax: string
    fixed_effects: [Dimension]
    random_effects: [Dimension]
    covariance_structure: enum[unstructured, AR1, CS, etc.]
    estimation_method: enum[REML, ML, GEE]
    df_method: enum[KenwardRoger, Satterthwaite, Residual]
    contrasts: [Contrast]

    # Imputation
    imputation_method: enum[LOCF, BOCF, MI, None]
    timing: enum[before_subsetting, after_subsetting]
    missing_mechanism: enum[MCAR, MAR, MNAR]

    # Logic Programming
    predicates: [Predicate]

  metadata:
    implements: [DerivationConcept | AnalysisConcept]
    software: string
    validation_status: enum[validated, under_review, draft]

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
    # Logic for table/plot construction
    rows:
      primary: Dimension
      secondary: Dimension
      categories: {string: [any]}
    columns:
      levels: [Dimension]
      categories: {string: [any]}
    cells:
      statistics: [CellSpec]
    
    # Logic for figures
    plot_type: enum[boxplot, scatter, line, bar]
    axes: {x: AxisSpec, y: AxisSpec}
    aesthetics: Aesthetics
```

### 3.6 Analysis Configuration

Global settings for the analysis execution.

```yaml
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
```

---

## 4. Validation Rules

A system implementing this metamodel must enforce the following rules:

1.  **Architecture Violation:** Concepts MUST NOT reference Structures or Derivations. Structures MUST NOT reference Derivations.
2.  **Immutability Violation:** A Method MUST NOT list the same Cube in both `input_cubes` and `output_cubes`. Outputs must always be new entities.
3.  **DAG Integrity:** The dependency graph formed by Cubes and Methods must be acyclic.
4.  **Completeness:** All Measures referenced in a Method `signature` must exist in the `input_cubes`.
5.  **Traceability:** Every Display must trace back to at least one Concept via the lineage of Methods and Cubes.
6.  **Explicit Structure:** Every Cube must define a `record_structure` string explaining the granularity of its rows.

---

## 5. Support Definitions

**Condition**
```yaml
type: enum[equality, inequality, membership, logic]
expression: string
```

**Rule**
```yaml
condition: Condition
action: string
```

**Contrast**
```yaml
name: string
type: enum[treatment, pairwise, polynomial]
reference: string
comparisons: [string]
```

**Predicate** (for Prolog-style logic)
```yaml
name: string
arguments: [string]
body: string
```
