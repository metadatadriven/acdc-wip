# Example 1 AC/DC Model Structure

This document presents the structural analysis of Example 1 (ANACOVA analysis of Lumbar Spine Bone Mineral Density) from the CDISC ADaM Examples. The model identifies key concepts and cube entities that represent the statistical analysis plan for comparing Drug ABC versus Placebo in a clinical trial measuring bone mineral density changes over time.

## Structure

```yaml
model:
  concept:
    biomedical:
      - Bone Mineral Density
      - Lumbar Spine
      - Treatment
        - Drug ABC
        - Placebo
      - Subject
      - Population
        - Intent-to-Treat Population
      - Machine
      - Baseline Value

    derived:
      - Percent Change from Baseline
      - Treatment Difference
      - Adjusted Value

    analysis:
      - ANCOVA Model
      - Statistical Test
      - Least Squares Mean
      - Confidence Interval
      - P-value
      - Imputation Method
        - Last Observation Carried Forward
      - Efficacy Analysis
      - Primary Endpoint
      - Interaction Term
        - Baseline BMD by Machine Type

  cube:
    dimension:
      - Treatment Group
        - levels: [Drug ABC, Placebo]
      - Time Point
        - levels: [Baseline, Month 6, Month 12, Month 18, Month 24, Month 30, Month 36]
      - Machine Type
        - levels: [type categories to be defined]
      - Analysis Population
        - levels: [ITT]
      - Visit
        - levels: [every 6 months for 3 years]

    attribute:
      - Planned Treatment
      - Baseline BMD Value
      - Machine Type Category
      - Imputation Flag

    measure:
      - BMD
        - unit: [g/cm² or similar]
        - concept_instance_of: Bone Mineral Density
      - Percent Change from Baseline BMD
        - unit: percentage
        - concept_instance_of: Percent Change from Baseline
        - calculation: ((BMD - Baseline BMD) / Baseline BMD) * 100
      - LS Mean
        - unit: percentage
        - concept_instance_of: Least Squares Mean
        - derived_from: ANCOVA Model
      - Lower 95% CI
        - unit: percentage
        - concept_instance_of: Confidence Interval
      - Upper 95% CI
        - unit: percentage
        - concept_instance_of: Confidence Interval
      - Treatment Difference LS Mean
        - unit: percentage
        - concept_instance_of: Treatment Difference
        - calculation: LS Mean (Drug ABC) - LS Mean (Placebo)
      - P-Value
        - concept_instance_of: P-value
        - range: [0, 1]
      - Sample Size (n)
        - unit: count
        - description: number of subjects with non-missing values
      - Population Size (N)
        - unit: count
        - description: total ITT population
```

## Definitions

**Biomedical Concepts:**

- **Bone Mineral Density (BMD)**: A quantitative measurement of bone density, measured at the lumbar spine in this study. Primary efficacy endpoint.
- **Lumbar Spine**: The anatomical location where BMD measurements are taken.
- **Treatment**: The intervention assigned to subjects (Drug ABC or Placebo).
- **Subject**: Individual participant in the clinical trial.
- **Population**: Group of subjects for analysis; specifically Intent-to-Treat (ITT) population.
- **Machine**: Equipment used to measure bone mineral density; type may influence measurements.
- **Baseline Value**: Initial measurement of BMD before treatment begins.

**Derived Concepts:**

- **Percent Change from Baseline**: The relative change in BMD from baseline, expressed as a percentage. Calculated as ((Current BMD - Baseline BMD) / Baseline BMD) × 100.
- **Treatment Difference**: The difference in adjusted means between treatment groups (Drug ABC - Placebo).
- **Adjusted Value**: Values adjusted by the ANCOVA model for covariates.

**Analysis Concepts:**

- **ANCOVA Model**: Analysis of Covariance statistical model adjusting for planned treatment, baseline BMD value, machine type, and their interaction.
- **Least Squares Mean (LS Mean)**: Model-adjusted mean from the ANCOVA model.
- **Confidence Interval (95% CI)**: Range of values providing 95% confidence for the parameter estimate.
- **P-value**: Probability value for testing treatment difference hypothesis.
- **Last Observation Carried Forward (LOCF)**: Imputation method for handling missing data at Month 24.
- **Efficacy Analysis**: Primary analysis to assess treatment effect.
- **Primary Endpoint**: Percent change from baseline at Month 24 in lumbar spine BMD.
- **Interaction Term**: Baseline BMD value by machine type interaction included in the model.

**Cube Entities:**

- **Treatment Group** (dimension): Categorical variable with levels Drug ABC and Placebo.
- **Time Point** (dimension): Temporal dimension including Baseline and assessments every 6 months through Month 36, with Month 24 as primary timepoint.
- **Machine Type** (dimension): Type of equipment used for BMD measurement.
- **Analysis Population** (dimension): ITT (Intent-to-Treat) population.
- **BMD** (measure): Concrete instance of the bone mineral density concept; the actual measurement values.
- **Percent Change from Baseline BMD** (measure): Concrete calculated values representing the response variable.
- **LS Mean** (measure): Actual computed adjusted means from ANCOVA model.
- **95% CI bounds** (measure): Actual computed lower and upper confidence limits.
- **Treatment Difference LS Mean** (measure): Actual computed difference between treatment groups.
- **P-Value** (measure): Actual computed statistical significance value.
- **Sample Size** (measure): Actual count of subjects (n and N).

## Issues

1. **Machine Type Levels**: The specific categories or levels of machine types are not defined in the example document. Need to determine if these are manufacturer types, model types, or technology types.

2. **Unit of Measurement for BMD**: The document doesn't specify the unit for BMD measurements (typically g/cm² for DXA scans, but should be confirmed).

3. **LOCF Implementation**: While LOCF is specified for Month 24 imputation, the detailed rules for implementing LOCF across earlier timepoints are not specified.

4. **Interaction Term Significance**: The model includes baseline BMD by machine type interaction, but it's unclear whether this interaction is tested for significance or always included.

5. **Visit Schedule Precision**: "Every 6 months for 3 years" suggests 6 post-baseline visits, but the exact visit windows and whether intermediate visits are analyzed is unclear.

6. **Source Dataset Details**: The document references "XX" as a placeholder for the SDTM domain containing bone measurements. The actual domain (likely QS or a custom domain) should be specified.

7. **Additional Covariates**: Need to confirm whether other potential covariates (age, sex, baseline characteristics) are included in the model or just those explicitly mentioned.

8. **Multiple Comparison Adjustments**: No mention of adjustments for multiple comparisons if other timepoints or endpoints are analyzed.

9. **Model Assumptions**: ANCOVA assumptions (normality, homogeneity of variance) and validation methods are not specified.

10. **Namespace/Ontology Mapping**: Need to map concepts to appropriate standards:
    - CDISC Controlled Terminology
    - NCI Thesaurus codes
    - STATO ontology terms for statistical methods
    - Units to UCUM standard
