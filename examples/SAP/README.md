# Statistical Analysis Plan (SAP) Examples

This directory contains excerpts from Statistical Analysis Plans that serve as source material for AC/DC modeling and Thunderstruck language development. These examples are primarily derived from the [CDISC ADaM Examples 1.0 document](../../docs/adam_examples_final.pdf).

## Contents

### Individual Example Files

- **[ex01-ANACOVA.md](ex01-ANACOVA.md)** - Example 1: ANCOVA analysis of bone mineral density comparing Drug ABC to Placebo over 3 years

### Consolidated SAP Examples

- **[SAP_ex01-ex04_BMD.md](SAP_ex01-ex04_BMD.md)** - Examples 1-4: Bone Mineral Density (BMD) analyses
  - Example 1: ANCOVA analysis (primary efficacy)
  - Example 2: Categorical analysis (responder analysis)
  - Example 3: Repeated measures analysis (longitudinal MMRM)
  - Example 4: Descriptive statistics over time

- **[SAP_ex05_Pain.md](SAP_ex05_Pain.md)** - Example 5: Pain Relief analysis
  - Logistic regression for binary outcome (pain relief at 2 hours)

- **[SAP_ex06_Mood.md](SAP_ex06_Mood.md)** - Example 6: Mood/Depression analysis
  - Multivariate analysis with multiple outcome measures

- **[SAP_ex07_FEV1.md](SAP_ex07_FEV1.md)** - Example 7: FEV1 Respiratory analysis
  - Crossover design with repeated measures
  - Multiple treatment periods with washout

- **[SAP_ex08-HysLaw](SAP_ex08-HysLaw)** - Example 8: Hy's Law Criteria analysis
  - Safety analysis for drug-induced liver injury
  - Categorical shift analysis

## Purpose

These SAP excerpts serve multiple purposes:

1. **Model Refinement** - Identifying entities (concepts, structures, derivations) to refine the AC/DC metamodel
2. **Language Validation** - Testing whether Thunderstruck can cleanly express real-world analyses
3. **Documentation** - Providing concrete examples of how clinical trial analyses are specified

## Analysis Categories

The examples cover diverse analysis types commonly found in clinical trials:

- **Efficacy Analyses**: ANCOVA, repeated measures, categorical responder analyses
- **Safety Analyses**: Hy's Law criteria, shift tables
- **Statistical Methods**: Linear models, logistic regression, mixed models, descriptive statistics
- **Study Designs**: Parallel group, crossover with washout periods

## Relationship to Other Directories

- **[../model/](../model/)** - Contains AC/DC model structures derived from these SAP examples
- **[../thunderstruck/](../thunderstruck/)** - Contains Thunderstruck DSL implementations of these analyses
- **[../SDMX/](../SDMX/)** - Contains SDMX metadata representations for some examples

## Source Attribution

Most examples are adapted from:
> CDISC Analysis Data Model (ADaM) Examples Version 1.0
> Copyright © 2016 Clinical Data Interchange Standards Consortium (CDISC)

See [../../docs/adam_examples_final.pdf](../../docs/adam_examples_final.pdf) for the complete source document.
