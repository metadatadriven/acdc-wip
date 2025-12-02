# Example 1 AC/DC Model Structure (prompt 3)

This document presents a hierarchical classification of entities identified in the ANACOVA example (Example 1) from the CDISC ADaM Examples 1.0 document. The classification follows a three-tier top-level structure: **concept** (abstract semantic entities), **structure** (concrete data organization entities), and **results** (relationships and outputs). Each entity from the Statistical Analysis Plan has been classified to support formal modeling of clinical trial biometric analyses.

## Structure

```yaml
model:
  concept:
    biomedical:
      - BoneMineralDensity
      - LumbarSpineBMD
      - BaselineBMD
      - MachineType
    derivation:
      - PercentChangeFromBaseline
      - ChangeFromBaseline
      - TreatmentDifference
      - LeastSquaresMean
      - ConfidenceInterval95
      - PValue
      - ImputedValue
    analysis:
      - EfficacyEndpoint
      - PrimaryEfficacyAnalysisEndpoint
      - Treatment
      - PlannedTreatment
      - IndependentVariable
      - DependentVariable
      - ResponseVariable
      - AnalysisPopulation
      - ITTPopulation
      - InteractionTerm

  structure:
    dimension:
      - VisitDimension
        - Baseline
        - Month6
        - Month12
        - Month18
        - Month24
        - Month30
        - Month36
      - TreatmentArmDimension
        - DrugABC
        - Placebo
      - MachineTypeDimension
      - SubjectDimension

    attribute:
      - PopulationType
      - ImputationMethod
      - ConfidenceLevel
      - ModelType
      - StatisticalSignificance

    measure:
      - BMDValue
      - PercentChangeFromBaselineBMD
      - LSMean
      - SampleSizeN
      - SampleSizeGroupN

    cube:
      - ADBMD
        - description: "Analysis dataset for bone mineral density measurements"
        - dimensions: [SubjectDimension, TreatmentArmDimension, VisitDimension, MachineTypeDimension]
        - measures: [BMDValue, PercentChangeFromBaselineBMD]
        - attributes: [PopulationType, ImputationMethod]
      - BaselineBMDCube
        - description: "BMD measurements at baseline by subject and machine type"
        - dimensions: [SubjectDimension, MachineTypeDimension]
        - measures: [BMDValue]
      - Month24BMDCube
        - description: "BMD measurements at Month 24 with LOCF imputation"
        - dimensions: [SubjectDimension, TreatmentArmDimension, MachineTypeDimension]
        - measures: [PercentChangeFromBaselineBMD]
        - attributes: [ImputationMethod]

  results:
    slice:
      - ITTPopulationSlice
        - description: "Subset of data limited to Intent-to-Treat population"
        - cube: ADBMD
        - filter: "PopulationType = ITT"
      - Month24Slice
        - description: "BMD percent change at Month 24 only"
        - cube: Month24BMDCube
        - filter: "VisitDimension = Month24"
      - TreatmentGroupSlice
        - description: "Data grouped by treatment arm (Drug ABC vs Placebo)"
        - cube: Month24BMDCube
        - groupBy: [TreatmentArmDimension]
      - BaselineSlice
        - description: "BMD measurements at baseline"
        - cube: ADBMD
        - filter: "VisitDimension = Baseline"

    method:
      - ANCOVAModel
        - description: "ANCOVA model with treatment, baseline BMD, machine type, and interaction"
        - input: [Month24Slice, BaselineSlice]
        - output: [LSMeanByCube, TreatmentDifferenceCube]
        - parameters:
            - dependentVariable: PercentChangeFromBaselineBMD
            - independentVariables: [PlannedTreatment, BaselineBMD, MachineType]
            - interactions: [BaselineBMD_x_MachineType]
      - LOCFImputation
        - description: "Last observation carried forward imputation for missing Month 24 values"
        - input: [ADBMD]
        - output: [Month24BMDCube]
        - parameters:
            - targetVisit: Month24
            - carryForwardRule: "last non-missing observation"
      - LSMeanCalculation
        - description: "Calculate adjusted least squares means from ANCOVA model"
        - input: [ANCOVAModelResults]
        - output: [LSMeanByCube]
      - ConfidenceIntervalCalculation
        - description: "Calculate 95% confidence intervals for LS means and treatment differences"
        - input: [LSMeanByCube, TreatmentDifferenceCube]
        - output: [CIResultsCube]
        - parameters:
            - confidenceLevel: 0.95
      - TreatmentDifferenceCalculation
        - description: "Calculate difference between Drug ABC and Placebo LS means"
        - input: [LSMeanByCube]
        - output: [TreatmentDifferenceCube]
        - formula: "LSMean(DrugABC) - LSMean(Placebo)"
      - PValueCalculation
        - description: "Calculate p-value for treatment difference"
        - input: [TreatmentDifferenceCube, ANCOVAModelResults]
        - output: [PValueCube]

    display:
      - Table_2_1_3_1
        - title: "Lumbar Spine Bone Mineral Density Percent Change From Baseline at Month 24"
        - subtitle: "(ITT Population, LOCF Data, ANCOVA Model)"
        - tableNumber: "2.1.3.1"
        - summaryID: "E.1"
        - inputSlices: [Month24Slice, TreatmentGroupSlice]
        - inputMethods: [ANCOVAModel, LSMeanCalculation, ConfidenceIntervalCalculation, TreatmentDifferenceCalculation, PValueCalculation]
        - rowDimension: TreatmentArmDimension
        - columns:
            - SampleSizeGroupN
            - LSMean
            - ConfidenceInterval95
            - TreatmentDifference
            - ConfidenceInterval95_Difference
            - PValue
        - footnotes:
            - "N = ITT population, n = number of subjects with non-missing percent change from baseline at month 24"
            - "CI = Confidence interval"
            - "LS = Least squares"
            - "[a]Based on ANCOVA model adjusting for planned treatment, baseline BMD value, machine type, and baseline BMD value by machine type interaction."
        - formatting:
            - LSMean: "x.x"
            - PValue: "x.xxxx"
            - CI: "(x.x, x.x)"
```

## Definitions

### Concept Definitions

#### Biomedical Concepts
- **BoneMineralDensity**: A measure of the amount of minerals (mainly calcium) contained in bone tissue, indicating bone strength and fracture risk
- **LumbarSpineBMD**: Bone mineral density measured specifically at the lumbar spine region
- **BaselineBMD**: The bone mineral density measurement taken at the start of the study before any intervention
- **MachineType**: The type or model of densitometry equipment used to measure bone mineral density

#### Derivation Concepts
- **PercentChangeFromBaseline**: The relative change in a measurement from baseline, expressed as a percentage: ((Value - Baseline) / Baseline) × 100
- **ChangeFromBaseline**: The absolute difference between a measurement and its baseline value
- **TreatmentDifference**: The difference between treatment groups (Drug ABC - Placebo) in outcome measures
- **LeastSquaresMean**: Model-adjusted mean values estimated from the ANCOVA model, accounting for covariates
- **ConfidenceInterval95**: A range of values that, with 95% confidence, contains the true population parameter
- **PValue**: The probability of observing results as extreme as those obtained, assuming the null hypothesis is true
- **ImputedValue**: A value substituted for a missing observation using a specified imputation method

#### Analysis Concepts
- **EfficacyEndpoint**: A measurable outcome used to assess the effectiveness of a treatment
- **PrimaryEfficacyAnalysisEndpoint**: The main outcome measure specified in the protocol for assessing treatment efficacy
- **Treatment**: The therapeutic intervention administered to study participants
- **PlannedTreatment**: The treatment assigned to a subject according to the randomization schedule
- **IndependentVariable**: Variables used as predictors or covariates in the statistical model
- **DependentVariable**: The outcome variable being predicted or explained by the model
- **ResponseVariable**: The measured outcome that responds to treatment
- **AnalysisPopulation**: A defined subset of study participants included in a statistical analysis
- **ITTPopulation**: Intent-to-Treat population; all randomized subjects analyzed according to their assigned treatment
- **InteractionTerm**: A statistical term representing the combined effect of two or more variables

### Structure Definitions

#### Dimension Entities
- **VisitDimension**: Time points at which measurements are taken (Baseline, Month 6, 12, 18, 24, 30, 36)
- **TreatmentArmDimension**: The treatment group assignment (Drug ABC, Placebo)
- **MachineTypeDimension**: The type of equipment used for BMD measurement
- **SubjectDimension**: Individual study participants

#### Attribute Entities
- **PopulationType**: Classification of analysis population (e.g., ITT, Per Protocol, Safety)
- **ImputationMethod**: The technique used to handle missing data (e.g., LOCF)
- **ConfidenceLevel**: The probability level for confidence intervals (e.g., 95%, 0.95)
- **ModelType**: The type of statistical model used (e.g., ANCOVA)
- **StatisticalSignificance**: Indication of whether results meet pre-specified significance criteria

#### Measure Entities
- **BMDValue**: The actual bone mineral density measurement value
- **PercentChangeFromBaselineBMD**: The computed percent change in BMD from baseline
- **LSMean**: The least squares mean value from the ANCOVA model
- **SampleSizeN**: Total number of subjects in the analysis population
- **SampleSizeGroupN**: Number of subjects in a specific subgroup with non-missing data

#### Cube Entities
- **ADBMD**: The main analysis dataset containing all BMD measurements, organized by subject, treatment, visit, and machine type
- **BaselineBMDCube**: A specialized cube containing only baseline BMD values used as covariates
- **Month24BMDCube**: A cube focused on Month 24 measurements with LOCF imputation applied

### Results Definitions

#### Slice Entities
- **ITTPopulationSlice**: Data filtered to include only the Intent-to-Treat population
- **Month24Slice**: Data subset containing only Month 24 observations
- **TreatmentGroupSlice**: Data grouped by treatment arm for comparative analysis
- **BaselineSlice**: Data subset containing only baseline measurements

#### Method Entities
- **ANCOVAModel**: Analysis of Covariance model adjusting for treatment, baseline BMD, machine type, and their interaction
- **LOCFImputation**: Last Observation Carried Forward imputation methodology
- **LSMeanCalculation**: Computation of adjusted least squares means from the fitted model
- **ConfidenceIntervalCalculation**: Statistical calculation of 95% confidence intervals
- **TreatmentDifferenceCalculation**: Computation of the difference between treatment arms
- **PValueCalculation**: Hypothesis test for treatment effect significance

#### Display Entities
- **Table_2_1_3_1**: The primary efficacy analysis results table showing LS means, confidence intervals, treatment differences, and p-values by treatment group

## Issues

1. **Cube Dimension Cardinality**: The ADBMD cube structure needs clarification on whether VisitDimension should include all visits or be structured as separate cubes per visit. The current model shows Month24BMDCube as a separate entity, which suggests visit-specific cubes might be preferred.

2. **Interaction Term Modeling**: The baseline BMD × machine type interaction is a derived entity but its classification is unclear. It could be considered both a derivation concept and a method parameter. Current model places it as a parameter within the ANCOVA method.

3. **Missing Data Handling**: The distinction between the original ADBMD (with missing data) and Month24BMDCube (with LOCF imputation) suggests two versions of the same structural entity. Need to clarify whether these should be separate cubes or the same cube with different attribute values.

4. **Statistical Model Results**: The outputs from ANCOVAModel (LSMeanByCube, TreatmentDifferenceCube, etc.) are referenced but not fully defined as cube entities in the structure section. Should these intermediate results be formalized as cubes?

5. **Covariate Adjustment**: BaselineBMD appears both as a biomedical concept and implicitly as a measure in BaselineBMDCube. The relationship between the concept and its structural implementation needs clarification.

6. **Sample Size Measures**: N and n are shown in the display but their computation method is not specified. Are these simple counts (dimensions) or computed measures that require specific handling of missing data?

7. **Footnote Formalization**: Footnotes contain important methodological information but are currently only captured in the display entity. Should some footnote content be elevated to formal attributes or metadata?

8. **Machine Type Dual Role**: MachineType appears as both a biomedical concept (a factor that influences response) and a dimension. Its dual nature as both a characteristic to be balanced/adjusted for and an organizational dimension needs clarification.

9. **Treatment vs. Planned Treatment**: The distinction between "Treatment" (analysis concept) and "PlannedTreatment" (independent variable) is subtle. Need to clarify if these represent different entities or different aspects of the same concept.

10. **Confidence Interval Structure**: The 95% confidence interval appears both as a derivation concept and as part of method outputs. Should it be modeled as a single composite measure with lower/upper bounds, or as two separate measures?
