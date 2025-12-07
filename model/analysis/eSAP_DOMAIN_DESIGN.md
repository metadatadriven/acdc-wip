# eSAP Domain-Driven Design Analysis

## Document Overview

**Purpose:** Domain-Driven Design analysis of the electronic Statistical Analysis Plan (eSAP) domain for regulated clinical trials biometrics workflows.

**Approach:** This document applies DDD principles to identify bounded contexts, aggregates, entities, value objects, and ubiquitous language within the statistical analysis planning domain for clinical trials.

**Standards Alignment:** CDISC, ICH E3, ICH E9, ICH E9(R1) Addendum on Estimands

---

## Executive Summary

The eSAP domain represents a complex, highly regulated environment for planning and executing statistical analyses in clinical trials. The domain exhibits clear separation of concerns across eight primary bounded contexts, each with distinct responsibilities, workflows, and regulatory requirements. The core domain model centers around the **Study Protocol** as the source of truth, with the **Statistical Analysis Plan** acting as the detailed operational specification derived from the protocol.

---

## 1. Bounded Contexts

### 1.1 Study Design Context

**Responsibility:** Defines the fundamental structure, objectives, and methodology of a clinical trial.

**Core Concepts:**
- Protocol definition and versioning
- Study objectives hierarchy (Primary, Secondary, Exploratory)
- Endpoints and Estimands framework
- Study configuration and experimental design
- Randomization and blinding strategies

**Key Interactions:**
- **Upstream:** Regulatory requirements, Clinical development plans
- **Downstream:** Statistical Analysis Context, Data Management Context
- **Anti-Corruption Layer:** Protocol amendments must be tracked and reconciled with SAP versions

**Invariants:**
- A Protocol must have at least one Primary Objective
- Each Objective must be linked to at least one Endpoint
- Protocol version and date must be immutable once finalized
- Estimands must address all relevant Intercurrent Events

---

### 1.2 Statistical Analysis Context

**Responsibility:** Defines the statistical methods, models, and analytical approaches for evaluating study objectives.

**Core Concepts:**
- Analysis methods and statistical models
- Hypothesis testing framework (null/alternative)
- Sample size determination and power calculations
- Multiple testing procedures
- Sensitivity and subgroup analyses
- Inference methods (confidence intervals, p-values)

**Key Interactions:**
- **Upstream:** Study Design Context (objectives, endpoints)
- **Downstream:** Reporting Context (statistical outputs)
- **Shared Kernel:** Estimand framework with Study Design Context

**Invariants:**
- Primary analysis method must align with primary estimand
- Statistical significance level must be pre-specified
- Sample size justification must reference power calculations
- Analysis method assumptions must be documented and testable

---

### 1.3 Data Management Context

**Responsibility:** Manages analysis datasets, data derivations, missing data handling, and data quality for statistical analyses.

**Core Concepts:**
- Analysis Sets (Full Analysis Set, Safety Analysis Set, Per-Protocol)
- Analysis Data Sets (estimand-specific data subsets)
- Derived variables and computations
- Missing data mechanisms and imputation strategies
- Data quality rules and validation
- Visit windows and time-point mapping

**Key Interactions:**
- **Upstream:** Study Design Context (protocol requirements), Case Report Forms
- **Downstream:** Statistical Analysis Context, Safety Monitoring Context, Efficacy Assessment Context
- **Integration:** ADaM (Analysis Data Model) standard from CDISC

**Invariants:**
- Analysis Set membership must be assigned before database lock
- Derived variables must have documented derivation logic
- Missing data handling must align with estimand strategy
- Subject inclusion/exclusion status must be blinded assignment

---

### 1.4 Safety Monitoring Context

**Responsibility:** Captures, codes, analyzes, and reports safety data throughout the clinical trial lifecycle.

**Core Concepts:**
- Adverse Events (AE) and Treatment-Emergent Adverse Events (TEAE)
- Serious Adverse Events (SAE)
- Clinical laboratory evaluations
- Vital signs and ECG monitoring
- Exposure and treatment compliance
- Pregnancy tracking

**Key Interactions:**
- **Upstream:** Data Management Context (safety analysis sets)
- **Downstream:** Regulatory Compliance Context (safety reporting)
- **External Systems:** MedDRA coding dictionary, laboratory reference ranges

**Invariants:**
- All AEs must be coded using MedDRA
- Treatment-emergent status must be determined by temporal relationship to dosing
- SAEs must be reported according to regulatory timelines
- Severity and relationship to treatment must be assessed

---

### 1.5 Efficacy Assessment Context

**Responsibility:** Analyzes and evaluates treatment effects on efficacy endpoints to support study objectives.

**Core Concepts:**
- Primary efficacy analyses (confirmatory)
- Secondary efficacy analyses (supportive/confirmatory)
- Exploratory efficacy analyses (hypothesis-generating)
- Treatment effect estimation
- Subgroup and interaction analyses
- Responder analyses

**Key Interactions:**
- **Upstream:** Study Design Context (estimands), Data Management Context (analysis datasets)
- **Downstream:** Reporting Context (efficacy tables and figures)
- **Shared:** Statistical Analysis Context (methods)

**Invariants:**
- Primary efficacy analysis must be pre-specified
- Analysis population must align with estimand population attribute
- Intercurrent events must be handled per estimand strategy
- Multiple comparisons must be controlled if multiple primary endpoints

---

### 1.6 Interim Analysis Context

**Responsibility:** Manages planned interim looks at accumulating data for adaptive decision-making while preserving trial integrity.

**Core Concepts:**
- Data Monitoring Committee (DMC) governance
- Stopping rules (futility, efficacy, safety)
- Alpha spending functions
- Conditional power calculations
- Sample size re-estimation
- Blinding and unblinding procedures
- Bias minimization strategies

**Key Interactions:**
- **Upstream:** Study Design Context (adaptive design features)
- **Downstream:** Statistical Analysis Context (adjusted analyses)
- **External:** Independent statistical support group

**Invariants:**
- Interim analysis schedule must be pre-specified
- Alpha spending must preserve overall Type I error
- Unblinding must be limited to designated personnel
- All interim decisions must be documented before database lock

---

### 1.7 Regulatory Compliance Context

**Responsibility:** Ensures the SAP and all analyses conform to regulatory guidelines, protocol specifications, and quality standards.

**Core Concepts:**
- ICH guideline adherence (E3, E9, E9(R1))
- Protocol deviations and their impact
- SAP amendments and change control
- Quality control and validation
- Audit trail and documentation
- SOP compliance

**Key Interactions:**
- **Upstream:** All other contexts (compliance oversight)
- **Downstream:** Regulatory submissions
- **External:** Health authorities (FDA, EMA, etc.)

**Invariants:**
- All SAP amendments must be documented with rationale
- Changes to protocol-planned analyses must be justified
- Analysis populations must be defined before unblinding
- All statistical software versions must be documented

---

### 1.8 Reporting Context

**Responsibility:** Produces standardized outputs (Tables, Figures, Listings) that communicate study results according to regulatory and scientific standards.

**Core Concepts:**
- Tables, Figures, and Listings (TFLs)
- Reporting conventions (precision, formatting)
- CONSORT diagrams
- Forest plots for subgroup analyses
- Descriptive statistics presentations
- Output specifications and shells

**Key Interactions:**
- **Upstream:** All analytical contexts (source data and results)
- **Downstream:** Clinical Study Report (CSR)
- **Standards:** ICH E3 Section 11 (Efficacy Evaluation), Section 12 (Safety Evaluation)

**Invariants:**
- TFL numbering must follow CSR structure
- Reporting precision must be pre-specified
- All outputs must reference analysis population
- Output specifications must be validated before production

---

## 2. Core Domain Aggregates

### 2.1 Study Protocol Aggregate

**Aggregate Root:** Protocol

**Entities:**
- Protocol (root)
- ProtocolVersion
- StudyObjective
- Endpoint
- Estimand
- IntercurrentEvent

**Value Objects:**
- ProtocolNumber
- ProtocolDate
- ProtocolTitle
- ObjectiveType (Primary, Secondary, Exploratory)
- TreatmentCondition
- PopulationDefinition
- PopulationLevelSummary

**Relationships:**
```
Protocol (1) --- (*) ProtocolVersion
Protocol (1) --- (*) StudyObjective
StudyObjective (1) --- (*) Endpoint
StudyObjective (1) --- (*) Estimand
Estimand (1) --- (*) IntercurrentEvent
```

**Business Rules:**
- Protocol versions are immutable once approved
- Each objective must be classified as Primary, Secondary, or Exploratory
- Primary objectives must have confirmatory endpoints
- Estimands must define all five attributes: Population, Treatment, Endpoint, Intercurrent Events, Population-level Summary

**Lifecycle:**
1. Protocol Draft → Protocol Review → Protocol Finalization → Protocol Amendment (if needed)

---

### 2.2 Statistical Analysis Plan Aggregate

**Aggregate Root:** StatisticalAnalysisPlan

**Entities:**
- StatisticalAnalysisPlan (root)
- SAPVersion
- SAPAmendment
- AnalysisSpecification
- SensitivityAnalysis
- SubgroupAnalysis

**Value Objects:**
- SAPNumber
- SAPDate
- SAPStatus (Draft, Final, Amended)
- SignificanceLevel
- StatisticalModel
- HypothesisTest

**Relationships:**
```
StatisticalAnalysisPlan (1) --- (1) Protocol [reference]
StatisticalAnalysisPlan (1) --- (*) SAPVersion
SAPVersion (1) --- (*) SAPAmendment
StatisticalAnalysisPlan (1) --- (*) AnalysisSpecification
AnalysisSpecification (1) --- (*) SensitivityAnalysis
AnalysisSpecification (1) --- (*) SubgroupAnalysis
```

**Business Rules:**
- SAP must reference a specific Protocol version
- Changes to protocol-planned analyses must be documented in Section 15
- All analysis specifications must link to study objectives
- Statistical models must document all covariates and stratification factors
- Amendments must include rationale and summary of changes

**Lifecycle:**
1. SAP Draft → Internal Review → Client Review → Finalization → Amendment (if needed)

---

### 2.3 Analysis Set Aggregate

**Aggregate Root:** AnalysisSet

**Entities:**
- AnalysisSet (root)
- ParticipantAnalysisSet (Full Analysis Set, Safety Analysis Set, Per-Protocol Set)
- AnalysisDataSet (estimand-specific)
- SubjectInclusion
- SubjectExclusion

**Value Objects:**
- AnalysisSetName
- InclusionCriteria
- ExclusionCriteria
- TreatmentAssignment (Planned vs Actual)
- DataInclusionRules

**Relationships:**
```
AnalysisSet (1) --- (*) Subject
AnalysisSet (1) --- (*) SubjectInclusion
AnalysisSet (1) --- (*) SubjectExclusion
AnalysisDataSet (*) --- (1) ParticipantAnalysisSet [subset of]
AnalysisDataSet (1) --- (1) Estimand [aligned with]
```

**Business Rules:**
- Subject analysis set membership must be assigned before database lock
- Full Analysis Set follows intention-to-treat principle
- Safety Analysis Set uses actual treatment received
- Analysis Data Sets must align with estimand intercurrent event strategies
- Post-discontinuation data inclusion depends on estimand strategy

---

### 2.4 Derived Variable Aggregate

**Aggregate Root:** DerivedVariable

**Entities:**
- DerivedVariable (root)
- DerivationRule
- SourceVariable
- TransformationStep

**Value Objects:**
- VariableName
- VariableType (Continuous, Categorical, Binary, Time-to-Event)
- DerivationFormula
- VisitWindow
- TimePoint

**Relationships:**
```
DerivedVariable (1) --- (1) DerivationRule
DerivationRule (*) --- (*) SourceVariable
DerivationRule (1) --- (*) TransformationStep
DerivedVariable (*) --- (1) Endpoint [supports]
```

**Business Rules:**
- Derivation logic must be reproducible and unambiguous
- Visit windows must be pre-specified for time-based derivations
- Change from baseline requires baseline definition
- Multiple measurements within visit window require aggregation rule
- Missing component handling must be specified for composite scores

---

### 2.5 Adverse Event Aggregate

**Aggregate Root:** AdverseEvent

**Entities:**
- AdverseEvent (root)
- SeriousAdverseEvent (specialization)
- TreatmentEmergentAE (specialization)

**Value Objects:**
- AEStartDate
- AEStopDate
- Severity (Mild, Moderate, Severe)
- Relationship (Not Related, Related)
- Outcome
- MedDRACode (System Organ Class, Preferred Term)
- ActionTaken

**Relationships:**
```
AdverseEvent (*) --- (1) Subject
AdverseEvent (*) --- (1) MedDRATerm
TreatmentEmergentAE extends AdverseEvent
SeriousAdverseEvent extends AdverseEvent
```

**Business Rules:**
- All AEs must be coded using MedDRA
- Treatment-emergent status determined by temporal relationship to first dose
- Partial dates imputed conservatively (earliest for start, latest for stop)
- Missing relationship assumed as "Related"
- Missing severity assumed as "Severe"
- Each subject counted once per SOC/PT combination in summaries

---

### 2.6 Estimand Aggregate

**Aggregate Root:** Estimand

**Entities:**
- Estimand (root)
- IntercurrentEvent
- HandlingStrategy

**Value Objects:**
- Population (population attribute)
- Treatment (treatment attribute)
- Variable (endpoint attribute)
- PopulationLevelSummary (summary attribute)
- StrategyType (Treatment Policy, Hypothetical, Composite, While-on-Treatment, Principal Stratum)
- ClinicalQuestion

**Relationships:**
```
Estimand (1) --- (1) StudyObjective
Estimand (1) --- (*) IntercurrentEvent
IntercurrentEvent (1) --- (1) HandlingStrategy
Estimand (1) --- (1) AnalysisDataSet [defines]
```

**Business Rules:**
- All five estimand attributes must be specified
- All anticipated intercurrent events must be addressed
- Handling strategy must be scientifically justified
- Primary estimand must support regulatory decision
- Analysis method must target the estimand

---

### 2.7 Sample Size Calculation Aggregate

**Aggregate Root:** SampleSizeCalculation

**Entities:**
- SampleSizeCalculation (root)
- SampleSizeAssumption
- PowerAnalysis
- SampleSizeReestimation (for adaptive designs)

**Value Objects:**
- TargetSampleSize
- PowerValue
- SignificanceLevel
- EffectSize
- DropoutRate
- AllocationRatio

**Relationships:**
```
SampleSizeCalculation (1) --- (1) PrimaryEndpoint
SampleSizeCalculation (1) --- (*) SampleSizeAssumption
SampleSizeCalculation (1) --- (1) PowerAnalysis
SampleSizeCalculation (0..1) --- (1) InterimAnalysis [for re-estimation]
```

**Business Rules:**
- Sample size must be justified for primary endpoint
- Power calculation must document all assumptions
- Dropout rate must be accounted for
- Multi-arm studies must account for multiple comparisons
- Re-estimation rules must preserve blinding and trial integrity

---

### 2.8 TFL (Tables, Figures, Listings) Aggregate

**Aggregate Root:** OutputSpecification

**Entities:**
- OutputSpecification (root)
- Table
- Figure
- Listing
- OutputShell

**Value Objects:**
- OutputNumber (CSR numbering)
- OutputTitle
- OutputType (Table, Figure, Listing)
- AnalysisPopulation
- DeliverableType (CSR, Interim, DMC)
- ProgrammingNotes

**Relationships:**
```
OutputSpecification (1) --- (*) Table
OutputSpecification (1) --- (*) Figure
OutputSpecification (1) --- (*) Listing
Table|Figure|Listing (1) --- (1) AnalysisSpecification [implements]
Table|Figure|Listing (1) --- (1) OutputShell [template]
```

**Business Rules:**
- Output numbering must follow CSR structure
- Each output must reference analysis population
- Conditional outputs must be flagged in programming notes
- All outputs must have pre-specified shells before production

---

## 3. Domain Entities (Detailed)

### 3.1 Protocol
- **Identity:** ProtocolNumber
- **Attributes:** ProtocolTitle, ProtocolVersion, ProtocolDate, SponsorName
- **Lifecycle:** Draft → Review → Approved → Amended
- **Invariants:** Immutable once approved; amendments create new versions

### 3.2 StatisticalAnalysisPlan
- **Identity:** SAPNumber
- **Attributes:** SAPVersion, SAPDate, SAPStatus, ProtocolReference
- **Lifecycle:** Draft → Internal Review → Sponsor Review → Final → Amended
- **Invariants:** Must reference approved Protocol; amendments must justify changes

### 3.3 Subject
- **Identity:** SubjectID
- **Attributes:** SiteID, RandomizationNumber, RandomizedTreatment, ActualTreatment, DemographicData
- **Lifecycle:** Screened → Enrolled → Randomized → Treated → Completed/Discontinued
- **Invariants:** SubjectID unique within study; randomization assignment immutable

### 3.4 StudyObjective
- **Identity:** ObjectiveID
- **Attributes:** ObjectiveType, ObjectiveDescription, ClinicalQuestion
- **Types:** Primary, Secondary, Exploratory
- **Invariants:** At least one Primary objective required per protocol

### 3.5 Endpoint
- **Identity:** EndpointID
- **Attributes:** EndpointName, EndpointType, MeasurementScale, AssessmentTimepoint
- **Types:** Primary, Secondary, Exploratory, Safety
- **Invariants:** Must link to at least one objective

### 3.6 Estimand
- **Identity:** EstimandID
- **Attributes:** Population, Treatment, Variable, IntercurrentEvents, PopulationLevelSummary
- **Lifecycle:** Defined in Protocol → Operationalized in SAP → Estimated in Analysis
- **Invariants:** All five attributes must be specified; ICH E9(R1) compliant

### 3.7 AnalysisSpecification
- **Identity:** AnalysisID
- **Attributes:** AnalysisName, AnalysisType, StatisticalModel, AnalysisDataSet, EstimandReference
- **Types:** Primary, Secondary, Exploratory, Sensitivity, Subgroup
- **Invariants:** Primary analysis must be pre-specified before unblinding

### 3.8 AdverseEvent
- **Identity:** AEID
- **Attributes:** SubjectID, AEStartDate, AEStopDate, Severity, Relationship, MedDRACode, TreatmentEmergent
- **Lifecycle:** Onset → Assessment → Resolution/Ongoing
- **Invariants:** Must be coded with MedDRA; treatment-emergent flag derived from timing

---

## 4. Value Objects (Domain Concepts)

### 4.1 Measurement and Scale Value Objects

**VisitWindow**
- Attributes: WindowStart, WindowEnd, NominalDay, VisitLabel
- Immutable: Yes
- Equality: Based on all attributes

**TimePoint**
- Attributes: StudyDay, CalendarDate, RelativeToRandomization
- Immutable: Yes
- Equality: Based on temporal value

**MeasurementValue**
- Attributes: NumericValue, Unit, LowerLimit, UpperLimit
- Immutable: Yes
- Equality: Based on value and unit

**CategoricalResponse**
- Attributes: CategoryLevel, CategoryLabel, Ordinal
- Immutable: Yes
- Equality: Based on category level

### 4.2 Statistical Value Objects

**ConfidenceInterval**
- Attributes: PointEstimate, LowerBound, UpperBound, ConfidenceLevel
- Immutable: Yes
- Derived: From statistical estimation
- Equality: Based on all attributes

**PValue**
- Attributes: Value, OneSidedTwoSided, Adjusted, AdjustmentMethod
- Immutable: Yes
- Constraints: 0 ≤ Value ≤ 1
- Equality: Based on value and test specification

**EffectSize**
- Attributes: Magnitude, EffectType (Mean Difference, Odds Ratio, Hazard Ratio), StandardError
- Immutable: Yes
- Equality: Based on magnitude and type

**HypothesisTest**
- Attributes: NullHypothesis, AlternativeHypothesis, TestStatistic, SignificanceLevel
- Immutable: Yes
- Equality: Based on hypothesis specification

### 4.3 Treatment and Intervention Value Objects

**TreatmentArm**
- Attributes: TreatmentName, Dose, DoseUnit, RouteOfAdministration, Frequency
- Immutable: Yes
- Equality: Based on all treatment specifications

**TreatmentCondition**
- Attributes: ConditionDescription, StrategyType (Treatment Policy, Hypothetical, etc.)
- Immutable: Within estimand definition
- Equality: Based on condition description

**DoseLevel**
- Attributes: DoseAmount, DoseUnit, DosingRegimen
- Immutable: Within protocol
- Equality: Based on amount, unit, and regimen

### 4.4 Population and Cohort Value Objects

**PopulationDefinition**
- Attributes: InclusionCriteria, ExclusionCriteria, PopulationDescription
- Immutable: Within estimand
- Equality: Based on criteria specifications

**StratificationFactor**
- Attributes: FactorName, FactorLevels, Justification
- Immutable: After randomization starts
- Equality: Based on factor name and levels

**Subgroup**
- Attributes: SubgroupName, DefiningCharacteristic, CutoffValue
- Immutable: When pre-specified
- Equality: Based on definition

### 4.5 Temporal and Event Value Objects

**IntercurrentEvent**
- Attributes: EventType, EventDefinition, TimingRelativeToTreatment
- Examples: Treatment discontinuation, Rescue medication, Death, Protocol deviation
- Immutable: Within estimand definition
- Equality: Based on event type and definition

**StudyPeriod**
- Attributes: PeriodName, StartCriterion, EndCriterion, Duration
- Examples: Screening, Baseline, Treatment, Follow-up
- Immutable: Within protocol
- Equality: Based on period definition

### 4.6 Coding and Classification Value Objects

**MedDRACode**
- Attributes: SystemOrganClass (SOC), HighLevelGroupTerm (HLGT), HighLevelTerm (HLT), PreferredTerm (PT), LowestLevelTerm (LLT)
- Immutable: Yes (version-specific)
- Version: MedDRA version must be tracked
- Equality: Based on PT code and version

**WHODDCode**
- Attributes: AnatomicalMainGroup, TherapeuticSubgroup, PharmacologicalSubgroup, ChemicalSubstance, PreferredTerm
- Immutable: Yes (version-specific)
- Equality: Based on code and version

### 4.7 Quality and Compliance Value Objects

**ProtocolDeviation**
- Attributes: DeviationType, Severity (Minor, Major), Description, Impact
- Immutable: Once classified
- Equality: Based on deviation instance

**SignificanceLevel**
- Attributes: AlphaValue, OneSidedTwoSided, AdjustmentMethod
- Immutable: Pre-specified
- Constraints: 0 < AlphaValue < 1 (typically 0.05, 0.01, 0.025)
- Equality: Based on alpha value and specification

**DateImputation**
- Attributes: OriginalDate (partial), ImputedDate (complete), ImputationRule
- Immutable: Once applied
- Equality: Based on original and imputed values

---

## 5. Ubiquitous Language

### 5.1 Study Design Vocabulary

**Protocol**
> A document that describes the objective(s), design, methodology, statistical considerations, and organization of a trial. The protocol usually also gives the background and rationale for the trial.

**Statistical Analysis Plan (SAP)**
> A document that contains a more technical and detailed elaboration of the principal features of the analysis described in the protocol, and includes detailed procedures for executing the statistical analysis of the primary and secondary variables and other data.

**Estimand**
> A precise description of the treatment effect reflecting the clinical question posed by a given clinical trial objective. An estimand consists of five attributes: population, treatment, variable (endpoint), intercurrent events, and population-level summary.

**Intercurrent Event**
> An event occurring after treatment initiation that affects either the interpretation or the existence of the measurements associated with the clinical question of interest. Examples include treatment discontinuation, rescue medication, death, or protocol deviation.

**Primary Objective**
> The main objective of a clinical trial, usually to test the primary hypothesis regarding the treatment effect on the primary endpoint.

**Secondary Objective**
> An objective of secondary importance, often supporting or extending the primary objective.

**Exploratory Objective**
> An objective aimed at hypothesis generation or investigation of additional questions, not intended to provide confirmatory evidence.

**Endpoint**
> A precisely defined variable intended to reflect outcomes of interest that are specified in the clinical trial protocol. Endpoints are measurements or assessments made on study participants.

**Treatment Policy Strategy**
> An intercurrent event handling strategy where the treatment effect is defined regardless of whether intercurrent events occur; data collected after the intercurrent event are included in the analysis.

**Hypothetical Strategy**
> An intercurrent event handling strategy where the treatment effect is defined under the hypothetical scenario that the intercurrent event would not occur.

**Composite Strategy**
> An intercurrent event handling strategy where the occurrence of the intercurrent event itself contributes to the definition of the variable.

**While-on-Treatment Strategy**
> An intercurrent event handling strategy where the treatment effect is defined based on measurements prior to the intercurrent event; data collected after the intercurrent event are not used.

**Principal Stratum Strategy**
> An intercurrent event handling strategy where the treatment effect is defined within a principal stratum, defined as a subgroup based on the intercurrent event status under both treatment conditions.

### 5.2 Analysis Population Vocabulary

**Full Analysis Set (FAS)**
> The set of subjects that is as close as possible to the intention-to-treat ideal of including all randomized subjects. Subjects are analyzed according to their randomized treatment assignment.

**Safety Analysis Set**
> The set of subjects used for safety analyses, typically all subjects who received at least one dose of study treatment. Subjects are analyzed according to the treatment actually received.

**Per-Protocol Set**
> The subset of the Full Analysis Set consisting of subjects who complied sufficiently with the protocol to ensure that their data would be likely to exhibit the effects of treatment according to the underlying scientific model.

**Analysis Data Set**
> An estimand-specific dataset that implements the intercurrent event handling strategy and data inclusion rules aligned with a specific estimand.

**Treatment-Emergent**
> Describing an event (typically an adverse event) that begins or worsens after initiation of study treatment. The temporal boundary is defined by the first dose of study treatment.

### 5.3 Statistical Methodology Vocabulary

**Intention-to-Treat (ITT)**
> The principle that subjects should be analyzed according to the treatment group to which they were randomized, regardless of the treatment actually received. Note: ITT describes treatment assignment principle, not an analysis set.

**Analysis of Covariance (ANCOVA)**
> A statistical method that combines analysis of variance with regression to adjust treatment comparisons for baseline covariates.

**Mixed Model for Repeated Measures (MMRM)**
> A statistical model for longitudinal data that accounts for within-subject correlation over time and can accommodate missing data under the Missing At Random assumption.

**Multiple Imputation**
> A statistical technique for handling missing data where each missing value is replaced by multiple plausible values, creating multiple complete datasets that are analyzed separately and results combined.

**Missing at Random (MAR)**
> A missing data mechanism where the probability of data being missing depends on observed data but not on the missing values themselves, conditional on observed data.

**Missing Not at Random (MNAR)**
> A missing data mechanism where the probability of data being missing depends on the unobserved missing values themselves, even after conditioning on observed data.

**Last Observation Carried Forward (LOCF)**
> A simple imputation method where the last observed value is used to replace missing subsequent values. Generally discouraged due to strong, often unjustified assumptions.

**Type I Error**
> The probability of rejecting the null hypothesis when it is true (false positive). Controlled by the significance level (alpha), typically set at 0.05 (5%) or 0.025 (one-sided).

**Type II Error**
> The probability of failing to reject the null hypothesis when it is false (false negative). Related to statistical power: Power = 1 - Type II Error (beta).

**Statistical Power**
> The probability of correctly rejecting the null hypothesis when it is false (true positive). Typically targeted at 80% or 90% in clinical trial design.

**Multiple Testing Adjustment**
> Statistical methods to control the overall Type I error rate when performing multiple hypothesis tests. Examples include Bonferroni correction, Hochberg procedure, Holm procedure, and graphical testing strategies.

**Alpha Spending Function**
> A function that allocates the overall Type I error rate across multiple interim analyses and the final analysis in a group sequential design.

**Conditional Power**
> The probability of rejecting the null hypothesis at the final analysis, conditional on the data observed at an interim analysis and assumptions about the remaining unobserved data.

**Least Squares Mean (LS Mean)**
> An adjusted mean derived from a statistical model (e.g., ANCOVA), representing the marginal mean holding covariates at their average values.

### 5.4 Safety Monitoring Vocabulary

**Adverse Event (AE)**
> Any untoward medical occurrence in a patient or clinical investigation subject administered a pharmaceutical product, which does not necessarily have a causal relationship with the treatment.

**Serious Adverse Event (SAE)**
> An adverse event that results in death, is life-threatening, requires inpatient hospitalization or prolongation of existing hospitalization, results in persistent or significant disability/incapacity, is a congenital anomaly/birth defect, or is otherwise medically significant.

**Treatment-Emergent Adverse Event (TEAE)**
> An adverse event that emerges during treatment, having been absent pre-treatment, or worsens relative to the pre-treatment state.

**Relationship to Treatment**
> An assessment of the likelihood that a study treatment caused or contributed to an adverse event. Categories typically include: Not Related, Unlikely Related, Possibly Related, Probably Related, Definitely Related.

**Severity (Intensity)**
> The degree of an adverse event's impact on a subject's daily functioning. Standard categories: Mild (awareness of event but easily tolerated), Moderate (sufficient discomfort to cause interference with usual activity), Severe (prevents usual activity).

**System Organ Class (SOC)**
> The highest level of the MedDRA hierarchy, grouping adverse events by anatomical or physiological system, etiology, or purpose (e.g., "Cardiac disorders," "Infections and infestations").

**Preferred Term (PT)**
> A distinct descriptor for a symptom, sign, disease diagnosis, indication, investigation, or medical/surgical procedure in the MedDRA hierarchy. The primary level for reporting adverse events.

**Medical Dictionary for Regulatory Activities (MedDRA)**
> A clinically validated international medical terminology dictionary used for regulatory communication and evaluation of data in medical products including adverse event reporting.

### 5.5 Efficacy Assessment Vocabulary

**Change from Baseline**
> The difference between a post-baseline measurement and the baseline measurement for a continuous endpoint. Calculated as: Post-baseline Value - Baseline Value.

**Responder**
> A subject who achieves a pre-defined clinically meaningful response on an endpoint, typically a binary classification based on a threshold (e.g., ≥50% reduction from baseline, achievement of target value).

**Time-to-Event**
> An endpoint measuring the time from randomization (or other defined origin) until the occurrence of a specific event. Analyzed using survival analysis methods (Kaplan-Meier, Cox regression).

**Sensitivity Analysis**
> An analysis conducted to assess the robustness of the primary analysis results to different assumptions, particularly regarding missing data mechanisms or model specifications.

**Subgroup Analysis**
> An analysis of the treatment effect within specific subsets of the study population defined by baseline characteristics (e.g., age group, sex, disease severity). Focus should be on interaction effects, not subgroup-specific p-values.

**Interaction Effect**
> A statistical phenomenon where the treatment effect differs across subgroups. Tested using interaction terms in statistical models (e.g., treatment × subgroup).

**Forest Plot**
> A graphical display of estimated treatment effects and confidence intervals across multiple subgroups, used to assess consistency of treatment effect.

### 5.6 Interim Analysis Vocabulary

**Data Monitoring Committee (DMC)** / **Data Safety Monitoring Board (DSMB)**
> An independent group of experts who review accumulating data from ongoing trials to monitor participant safety and treatment efficacy.

**Futility**
> The determination that an ongoing trial is unlikely to demonstrate the hypothesized treatment effect, even if conducted to its planned completion. May lead to early termination.

**Stopping Boundary**
> A threshold in a group sequential design that, if crossed at an interim analysis, triggers consideration of stopping the trial for efficacy, futility, or safety.

**Group Sequential Design**
> A study design with pre-planned interim analyses where the trial may be stopped early for efficacy or futility based on pre-specified stopping rules.

**Adaptive Design**
> A clinical trial design that allows for prospectively planned modifications to trial procedures based on accumulating data while maintaining trial validity and integrity.

**Unblinding**
> The process of revealing treatment assignments that were previously masked. In interim analyses, typically limited to independent statisticians supporting the DMC.

### 5.7 Data Management Vocabulary

**Baseline**
> The last measurement taken before the first administration of study treatment, used as the reference point for evaluating change.

**Derived Variable**
> A variable calculated or transformed from source data collected directly in the Case Report Form (CRF). Examples: change from baseline, BMI, estimated glomerular filtration rate.

**Visit Window**
> A pre-specified time interval around the scheduled nominal visit day during which assessments are considered to belong to that visit.

**Analysis Dataset Model (ADaM)**
> A CDISC standard for organizing analysis datasets. Specifies structure and content for datasets used in regulatory submissions.

**Case Report Form (CRF)**
> A printed, optical, or electronic document designed to record all protocol-required information on each trial subject.

**Database Lock**
> The point at which the study database is frozen and no further changes are permitted. Occurs before unblinding for analysis.

**Data Cleaning**
> The process of identifying and correcting errors, inconsistencies, and missing data in the clinical trial database.

### 5.8 Quality and Compliance Vocabulary

**Protocol Deviation**
> Any departure from the study protocol procedures. May be classified as minor (no significant impact on subject safety or data integrity) or major (potentially impacts interpretation or safety).

**Good Clinical Practice (GCP)**
> An international ethical and scientific quality standard for designing, conducting, recording, and reporting trials involving human subjects.

**International Council for Harmonisation (ICH)**
> An organization bringing together regulatory authorities and pharmaceutical industry to discuss scientific and technical aspects of drug registration. Publishes harmonized guidelines (e.g., ICH E3, E9).

**Validation**
> The process of checking that statistical programs produce correct results. Typically involves independent programming and comparison of outputs.

**Audit Trail**
> A chronological record of data changes, including who made the change, when, and why. Essential for regulatory compliance.

**Standard Operating Procedure (SOP)**
> A set of step-by-step instructions to perform routine operations. SOPs ensure consistency and compliance with regulatory requirements.

### 5.9 Reporting Vocabulary

**Tables, Figures, and Listings (TFLs)**
> The standardized outputs that present study data and analysis results in the Clinical Study Report.

**Clinical Study Report (CSR)**
> A comprehensive document that presents the study protocol, conduct, results, and conclusions in a format suitable for regulatory submission.

**CONSORT Diagram**
> A flow diagram showing the progress of subjects through the phases of a randomized trial (enrollment, allocation, follow-up, analysis). CONSORT = Consolidated Standards of Reporting Trials.

**Descriptive Statistics**
> Summary measures that describe the distribution of data, including: n (sample size), mean, median, standard deviation, minimum, maximum, quartiles.

**Reporting Precision**
> The number of decimal places or significant figures used when presenting numeric results. Should be pre-specified in the SAP.

### 5.10 CDISC Terminology

**CDISC (Clinical Data Interchange Standards Consortium)**
> A global, open, multidisciplinary nonprofit organization that develops data standards for medical research to streamline processes from data acquisition to regulatory submission and analysis.

**SDTM (Study Data Tabulation Model)**
> A CDISC standard for organizing and formatting data collected in clinical trials for submission to regulatory authorities. Focuses on data collection structure.

**ADaM (Analysis Data Model)**
> A CDISC standard for analysis datasets. Defines dataset and metadata standards that support efficient generation, replication, and review of clinical trial analysis results.

**Controlled Terminology**
> Standardized vocabularies maintained by CDISC (and other organizations like CDISC CT or NCI EVS) to ensure consistent representation of data elements across studies and sponsors.

---

## 6. Domain Events

Domain events represent significant occurrences within the eSAP domain that other bounded contexts may need to react to.

### 6.1 Study Design Context Events

**ProtocolFinalized**
- Attributes: ProtocolNumber, ProtocolVersion, ProtocolDate, ApprovalDate
- Triggers: SAP development can begin

**ProtocolAmended**
- Attributes: ProtocolNumber, NewVersion, AmendmentRationale, ChangeSummary
- Triggers: SAP amendment may be required; impact assessment needed

**EstimandDefined**
- Attributes: EstimandID, ObjectiveID, EstimandAttributes
- Triggers: Analysis specification creation; analysis dataset definition

**RandomizationSchemeGenerated**
- Attributes: RandomizationID, StratificationFactors, BlockSize, AllocationRatio
- Triggers: Treatment assignment process; blinding procedures

### 6.2 Statistical Analysis Context Events

**SAPFinalized**
- Attributes: SAPNumber, SAPVersion, FinalizationDate, ApprovedBy
- Triggers: TFL shell creation; programming can begin

**SAPAmended**
- Attributes: SAPNumber, AmendmentNumber, AmendmentRationale, ChangeSummary
- Triggers: Program updates; re-validation required

**AnalysisMethodSpecified**
- Attributes: AnalysisID, EstimandID, StatisticalModel, Covariates
- Triggers: Programming specification; validation plan update

**SampleSizeCalculationCompleted**
- Attributes: TargetSampleSize, PowerValue, Assumptions
- Triggers: Enrollment target set; trial feasibility assessment

### 6.3 Data Management Context Events

**DatabaseLocked**
- Attributes: DatabaseVersion, LockDate, RecordCount
- Triggers: Analysis set definition; unblinding preparation; statistical analysis begins

**AnalysisSetsDefined**
- Attributes: AnalysisSets, SubjectCounts, DefinitionDate
- Triggers: Analysis dataset creation; subject disposition reporting

**BaselineDataCompleted**
- Attributes: CompletionDate, SubjectCount, VariablesCaptured
- Triggers: Baseline characteristic analysis; covariate availability confirmed

**DerivedVariableCreated**
- Attributes: VariableName, DerivationLogic, ValidationStatus
- Triggers: Analysis dataset update; documentation update

### 6.4 Safety Monitoring Context Events

**SeriousAdverseEventReported**
- Attributes: SAEID, SubjectID, EventDate, Severity, Outcome
- Triggers: Expedited reporting; DMC notification; causality assessment

**SafetySignalDetected**
- Attributes: SignalType, AffectedSubjects, StatisticalThreshold
- Triggers: Safety review; potential protocol amendment; regulatory notification

**ExposureDataCompleted**
- Attributes: CompletionDate, TotalExposureDays, ComplianceMetrics
- Triggers: Safety rate denominator available; exposure-adjusted analyses possible

### 6.5 Efficacy Assessment Context Events

**PrimaryEndpointAnalysisCompleted**
- Attributes: AnalysisDate, TreatmentEffect, ConfidenceInterval, PValue
- Triggers: Secondary analyses; clinical interpretation; regulatory decision support

**SubgroupInteractionDetected**
- Attributes: SubgroupVariable, InteractionPValue, SubgroupEffects
- Triggers: Additional investigation; clinical interpretation; potential label implications

### 6.6 Interim Analysis Context Events

**InterimAnalysisScheduled**
- Attributes: InterimNumber, ScheduledDate, TriggerCriterion (e.g., event count)
- Triggers: DMC meeting preparation; independent statistician activation

**InterimAnalysisCompleted**
- Attributes: InterimNumber, CompletionDate, Recommendations
- Triggers: DMC decision; potential study modification; continuation or stopping

**StudyStoppedEarly**
- Attributes: StopDate, StopReason (Efficacy, Futility, Safety), InterimDataSnapshot
- Triggers: Final analysis planning; early CSR preparation; regulatory notification

**SampleSizeReestimated**
- Attributes: OriginalSampleSize, RevisedSampleSize, ReestimationRationale
- Triggers: Enrollment target update; trial timeline revision

### 6.7 Regulatory Compliance Context Events

**ProtocolDeviationIdentified**
- Attributes: DeviationID, SubjectID, DeviationType, Severity, Impact
- Triggers: Impact assessment; analysis set membership review; corrective action

**RegulatoryInspectionScheduled**
- Attributes: InspectionDate, RegulatoryAuthority, Scope
- Triggers: Documentation review; audit preparation

**AuditFindingRaised**
- Attributes: FindingID, FindingType, Severity, CAPARequired
- Triggers: Corrective action; preventive action; SOP update

### 6.8 Reporting Context Events

**TFLShellsApproved**
- Attributes: ApprovalDate, NumberOfShells, ApprovedBy
- Triggers: Programming begins; validation plan finalized

**TFLProductionCompleted**
- Attributes: CompletionDate, NumberOfOutputs, QCStatus
- Triggers: CSR writing; medical review; regulatory submission preparation

**OutputValidationFailed**
- Attributes: OutputNumber, ValidationIssue, Severity
- Triggers: Issue investigation; program correction; re-validation

---

## 7. Context Mapping and Integration Patterns

### 7.1 Study Design ↔ Statistical Analysis Context

**Relationship:** Shared Kernel
**Shared Concepts:** Estimand framework, Endpoints, Study Objectives
**Integration Pattern:**
- Protocol serves as Published Language
- Statistical Analysis Context conforms to Study Design specifications
- Bi-directional collaboration during estimand definition

**Anti-Corruption Layer:**
- Protocol amendments must be reconciled with SAP
- Changes to objectives or endpoints trigger SAP review

### 7.2 Statistical Analysis ↔ Data Management Context

**Relationship:** Customer-Supplier
**Pattern:** Data Management (Supplier) provides analysis-ready datasets to Statistical Analysis (Customer)
**Integration:**
- Analysis Data Sets defined by estimand requirements
- ADaM standard serves as Published Language
- Data Management must meet specifications from Statistical Analysis Context

### 7.3 Statistical Analysis ↔ Safety Monitoring Context

**Relationship:** Separate Ways with coordination
**Pattern:** Independent but parallel analyses
**Integration:**
- Share subject-level data through Data Management Context
- Use common analysis sets but different analytical approaches
- Integrated reporting in CSR

### 7.4 Statistical Analysis ↔ Efficacy Assessment Context

**Relationship:** Partnership
**Pattern:** Close collaboration with shared statistical methods
**Integration:**
- Efficacy Assessment uses methods defined in Statistical Analysis Context
- Share analysis specifications and programming infrastructure
- Coordinated multiple testing strategies

### 7.5 All Contexts ↔ Regulatory Compliance Context

**Relationship:** Conformist
**Pattern:** All contexts conform to regulatory requirements
**Integration:**
- ICH guidelines serve as Published Language
- Regulatory Compliance Context audits all other contexts
- Non-negotiable compliance requirements

### 7.6 Data Management ↔ Safety Monitoring Context

**Relationship:** Customer-Supplier
**Pattern:** Data Management provides Safety Analysis Set and coded safety data
**Integration:**
- MedDRA coding applied in Data Management, consumed by Safety Monitoring
- Treatment-emergent derivations in Data Management
- Safety Analysis Set defined and maintained by Data Management

### 7.7 Interim Analysis ↔ Multiple Contexts

**Relationship:** Orchestration
**Pattern:** Interim Analysis Context orchestrates temporary data snapshots from multiple contexts
**Integration:**
- Coordinates with Data Management for interim database lock
- Uses Statistical Analysis methods with adjustments
- Feeds decisions back to Study Design (for adaptations)
- Strict access control and blinding maintained

### 7.8 Reporting ↔ All Analytical Contexts

**Relationship:** Customer-Supplier
**Pattern:** Reporting consumes outputs from all analytical contexts
**Integration:**
- TFL specifications serve as contracts
- Analytical contexts produce standardized outputs
- Reporting Context aggregates into Clinical Study Report

---

## 8. Domain Services

Domain services represent operations that don't naturally belong to a single entity or value object but are important domain concepts.

### 8.1 EstimandSpecificationService

**Responsibility:** Guides proper definition of estimands according to ICH E9(R1)
**Operations:**
- `validateEstimandCompleteness(estimand)`: Ensures all five attributes are defined
- `identifyIntercurrentEvents(protocol, clinicalContext)`: Systematic identification of potential intercurrent events
- `recommendHandlingStrategy(intercurrentEvent, clinicalQuestion)`: Suggests appropriate strategies
- `alignAnalysisMethodToEstimand(estimand, analysisMethod)`: Validates alignment

### 8.2 MissingDataHandlingService

**Responsibility:** Determines appropriate missing data methods based on estimand and mechanism
**Operations:**
- `assessMissingDataMechanism(data, pattern)`: Evaluates MAR vs MNAR
- `selectImputationMethod(estimand, mechanism, sensitivity)`: Recommends imputation approach
- `implementTreatmentPolicyStrategy(data, intercurrentEvents)`: Applies treatment policy handling
- `implementHypotheticalStrategy(data, intercurrentEvents)`: Applies hypothetical strategy handling

### 8.3 MultipleTestingControlService

**Responsibility:** Manages Type I error across multiple endpoints and analyses
**Operations:**
- `defineTestingSequence(endpoints, objectives)`: Establishes hierarchical testing order
- `allocateAlpha(testingStrategy, numberOfTests)`: Distributes alpha across tests
- `adjustConfidenceIntervals(results, testingStrategy)`: Produces adjusted CIs
- `applyGatekeepingProcedure(hypotheses, sequence)`: Implements gatekeeping logic

### 8.4 AnalysisSetDefinitionService

**Responsibility:** Defines subject membership in analysis sets before unblinding
**Operations:**
- `defineFullAnalysisSet(randomizedSubjects, inclusionCriteria)`: Creates FAS
- `defineSafetyAnalysisSet(treatedSubjects, treatmentReceived)`: Creates Safety Set
- `defineAnalysisDataSet(participantSet, estimand, dataInclusionRules)`: Creates estimand-specific datasets
- `validateSetDefinitionBlinding()`: Ensures definitions made before unblinding

### 8.5 DerivedVariableComputationService

**Responsibility:** Executes derivation logic for analysis variables
**Operations:**
- `computeChangeFromBaseline(baseline, postBaseline)`: Calculate change scores
- `applyVisitWindowMapping(assessmentDate, visitWindows)`: Map dates to visits
- `handleMultipleMeasurements(measurements, windowRule)`: Aggregate within-window measurements
- `imputePartialDates(partialDate, imputationRules)`: Apply date imputation

### 8.6 SafetyCodedDataService

**Responsibility:** Applies medical coding dictionaries to safety data
**Operations:**
- `codeAdverseEvent(aeText, meddraVersion)`: Code AE to MedDRA terms
- `codeMedication(medicationText, whoddVersion)`: Code medication to WHODD
- `codeMedicalHistory(conditionText, meddraVersion)`: Code medical history
- `validateCodingConsistency(codedData)`: Check coding quality and consistency

### 8.7 TreatmentEmergenceService

**Responsibility:** Determines treatment-emergent status of events
**Operations:**
- `determineTreatmentEmergence(event, firstDoseDate)`: Classify AE as TEAE or not
- `imputePartialEventDates(aeStartDate, aeStopDate, firstDoseDate)`: Apply conservative imputation for missing dates
- `assessWorsening(baselineEvent, onTreatmentEvent)`: Determine if event worsened

### 8.8 InterimAnalysisManagementService

**Responsibility:** Coordinates interim analysis procedures and decision rules
**Operations:**
- `evaluateStoppingRules(interimData, boundaryValues)`: Apply stopping boundaries
- `calculateConditionalPower(interimData, assumptions)`: Compute conditional power for futility
- `adjustConfidenceForGroupSequential(results, spendingFunction)`: Adjust for multiple looks
- `prepareBlindedDMCReport(data, unblindedStatistician)`: Generate DMC materials

### 8.9 SubgroupAnalysisService

**Responsibility:** Conducts and interprets subgroup analyses focusing on interactions
**Operations:**
- `testTreatmentBySubgroupInteraction(data, subgroupVariable)`: Test interaction effect
- `generateForestPlot(subgroupResults)`: Visualize subgroup effects with CIs
- `assessConsistencyOfEffect(interactionPValue, subgroupEstimates)`: Interpret consistency
- `flagSmallSubgroups(subgroupCounts, threshold)`: Identify underpowered subgroups

### 8.10 OutputValidationService

**Responsibility:** Validates statistical outputs against specifications
**Operations:**
- `validateAgainstShell(producedOutput, outputShell)`: Check conformance to shell
- `compareProductionVsQC(productionOutput, qcOutput, tolerance)`: Independent validation
- `checkReportingPrecision(outputValues, precisionRules)`: Verify decimal places
- `validateAnalysisPopulationLabels(output, analysisSets)`: Ensure correct population references

---

## 9. Domain Constraints and Business Rules

### 9.1 Estimand Framework Rules

**Rule 9.1.1:** Every confirmatory objective must have at least one well-defined estimand.

**Rule 9.1.2:** An estimand must specify all five attributes: Population, Treatment, Variable, Intercurrent Events, Population-level Summary.

**Rule 9.1.3:** All anticipated intercurrent events relevant to the clinical question must be addressed in the estimand definition.

**Rule 9.1.4:** The handling strategy for each intercurrent event must be scientifically justified and aligned with the clinical question.

**Rule 9.1.5:** The analysis method must target the defined estimand; misalignment invalidates the analysis.

### 9.2 Analysis Set Rules

**Rule 9.2.1:** Subject membership in all analysis sets must be determined and documented before database unblinding.

**Rule 9.2.2:** Full Analysis Set must include all randomized subjects unless justified exclusions are pre-specified.

**Rule 9.2.3:** Subjects in Full Analysis Set must be analyzed according to randomized treatment (intention-to-treat principle).

**Rule 9.2.4:** Safety Analysis Set must analyze subjects according to actual treatment received.

**Rule 9.2.5:** Analysis Data Sets must implement the intercurrent event handling strategy specified in the corresponding estimand.

### 9.3 Statistical Testing Rules

**Rule 9.3.1:** The primary analysis method must be pre-specified in the SAP before database lock.

**Rule 9.3.2:** Significance level (alpha) must be pre-specified; conventionally 0.05 (two-sided) or 0.025 (one-sided).

**Rule 9.3.3:** One-sided tests require strong scientific justification.

**Rule 9.3.4:** Multiple primary endpoints require alpha adjustment or hierarchical testing to control Type I error.

**Rule 9.3.5:** Subgroup analyses must focus on interaction tests, not subgroup-specific p-values.

**Rule 9.3.6:** Post-hoc analyses must be clearly labeled as exploratory.

### 9.4 Missing Data Rules

**Rule 9.4.1:** Missing data handling must align with the estimand's intercurrent event strategy.

**Rule 9.4.2:** The assumed missing data mechanism (MAR, MNAR) must be stated and justified.

**Rule 9.4.3:** Sensitivity analyses must explore robustness to missing data assumptions.

**Rule 9.4.4:** Last Observation Carried Forward (LOCF) requires strong justification due to problematic assumptions.

**Rule 9.4.5:** Partial dates must be imputed conservatively: earliest plausible date for start dates when determining treatment-emergence, latest plausible date for stop dates.

### 9.5 Safety Reporting Rules

**Rule 9.5.1:** All adverse events must be coded using MedDRA (version specified and documented).

**Rule 9.5.2:** Treatment-emergent status must be based on temporal relationship to first dose.

**Rule 9.5.3:** When dates are partial or missing, conservative assumptions must be applied: assume treatment-emergent unless clear evidence otherwise.

**Rule 9.5.4:** Missing severity must be assumed as "Severe" for summary purposes.

**Rule 9.5.5:** Missing relationship must be assumed as "Related" for summary purposes.

**Rule 9.5.6:** Each subject counted once per System Organ Class / Preferred Term combination in incidence summaries.

**Rule 9.5.7:** Serious Adverse Events must be reported to regulatory authorities according to expedited timelines.

### 9.6 Interim Analysis Rules

**Rule 9.6.1:** All interim analyses must be pre-specified in protocol and SAP before trial initiation.

**Rule 9.6.2:** Alpha spending functions must preserve the overall Type I error rate at or below the nominal level.

**Rule 9.6.3:** Unblinding for interim analyses must be restricted to independent statisticians and DMC members.

**Rule 9.6.4:** All interim analysis results and DMC decisions must be documented in secure audit trail.

**Rule 9.6.5:** Sample size re-estimation rules must be specified prospectively and must not depend on treatment effect estimates in a way that inflates Type I error.

**Rule 9.6.6:** Conditional power calculations for futility must document assumptions about future data.

### 9.7 Protocol and SAP Version Control Rules

**Rule 9.7.1:** SAP must reference a specific protocol version and date.

**Rule 9.7.2:** Protocol amendments that affect statistical analyses require SAP amendment.

**Rule 9.7.3:** All SAP amendments must document rationale and summary of changes.

**Rule 9.7.4:** Changes from protocol-planned analyses must be justified in SAP Section 15.

**Rule 9.7.5:** SAP must be finalized before database lock and unblinding.

**Rule 9.7.6:** SAP amendments after database lock require exceptional justification and regulatory transparency.

### 9.8 Reporting and Documentation Rules

**Rule 9.8.1:** All TFLs must be specified in the SAP with shells approved before production.

**Rule 9.8.2:** TFL numbering must follow Clinical Study Report structure (ICH E3).

**Rule 9.8.3:** Analysis population must be clearly labeled on every output.

**Rule 9.8.4:** Reporting precision (decimal places) must be pre-specified for all statistics.

**Rule 9.8.5:** P-values < 0.001 reported as "<0.001"; p-values ≥ 0.001 reported to 3 decimal places.

**Rule 9.8.6:** All statistical programs must be validated by independent programmer.

**Rule 9.8.7:** Validation discrepancies beyond pre-specified tolerance require investigation and resolution.

### 9.9 Sample Size and Power Rules

**Rule 9.9.1:** Sample size must be justified based on the primary endpoint.

**Rule 9.9.2:** Power calculation must document: effect size, significance level, power target, dropout rate, allocation ratio.

**Rule 9.9.3:** Conventional power targets are 80% or 90%.

**Rule 9.9.4:** Sample size must account for anticipated dropout/withdrawal.

**Rule 9.9.5:** Multi-arm or multi-endpoint studies must account for multiple comparisons in sample size.

### 9.10 Baseline and Covariate Rules

**Rule 9.10.1:** Baseline is defined as the last measurement before first dose of study treatment.

**Rule 9.10.2:** Variables used for randomization stratification should be included as covariates in primary analysis unless justified otherwise.

**Rule 9.10.3:** Covariate selection for adjusted analyses must be pre-specified.

**Rule 9.10.4:** Stepwise covariate selection procedures must be pre-specified if used.

**Rule 9.10.5:** Baseline imbalances should be documented but do not invalidate randomization.

---

## 10. Aggregates and Their Lifecycle Diagrams

### 10.1 Study Protocol Aggregate Lifecycle

```
[Protocol Concept]
       ↓
   [Drafting] ← ──────────┐
       ↓                  │
 [Internal Review]        │
       ↓                  │
 [Sponsor Review]         │
       ↓                  │
[Medical/Ethical Review]  │
       ↓                  │
   [Finalized] ───────────┘ (amendments create new version)
       ↓
  [In Execution]
       ↓
   [Completed]
       ↓
    [Archived]
```

**State Transitions:**
- Draft → Review: Completeness check triggers
- Review → Finalized: All approvals obtained
- Finalized → Amended: Protocol deviation, new information, regulatory feedback
- In Execution → Completed: Last subject last visit (LSLV)
- Completed → Archived: CSR finalized and submitted

**Invariants at Each State:**
- **Draft:** May be modified freely
- **Finalized:** Immutable; amendments required for changes
- **In Execution:** Subject safety and data integrity paramount
- **Completed:** Database locked; no new subject data
- **Archived:** Read-only; regulatory retention requirements

### 10.2 Statistical Analysis Plan Aggregate Lifecycle

```
[SAP Initiation]
       ↓
   [Drafting] ← ──────────┐
       ↓                  │
[Internal Review]         │
       ↓                  │
[Biostatistician QC]      │
       ↓                  │
[Sponsor Review]          │
       ↓                  │
[Medical Writer Review]   │
       ↓                  │
  [Finalized] ────────────┘ (amendments if needed)
       ↓
[Programming & Validation]
       ↓
[Database Lock/Unblinding]
       ↓
   [Analysis Execution]
       ↓
  [Reporting]
       ↓
   [Archived]
```

**State Transitions:**
- Initiation → Drafting: Protocol finalized, SAP development begins
- Drafting → Review: SAP draft complete
- Review → Finalized: All reviewers approve
- Finalized → Programming: TFL shells created, programs developed
- Programming → Analysis: Database locked, unblinding occurs
- Analysis → Reporting: Statistical outputs produced and validated
- Reporting → Archived: CSR complete, regulatory submission

**Critical Constraints:**
- SAP must be finalized **before** database lock
- Post-database-lock amendments require exceptional justification
- Analysis methods locked before seeing unblinded data

### 10.3 Analysis Set Aggregate Lifecycle

```
[Protocol Criteria Definition]
       ↓
[Subject Enrollment & Data Collection]
       ↓
[Data Cleaning & Database Lock]
       ↓
[Analysis Set Membership Assignment] ← (BLINDED)
       ↓
[Independent QC Review of Membership]
       ↓
[Final Assignment Documentation]
       ↓
[Unblinding]
       ↓
[Analysis Set Usage in Statistical Analysis]
       ↓
[Reporting in CSR]
```

**Critical Control Point:** Analysis set membership assignment must occur **before** unblinding.

**Quality Gates:**
- Criteria must be pre-specified in protocol/SAP
- Membership determination blinded to treatment assignment
- Independent review validates membership assignment
- Discrepancies resolved before unblinding

### 10.4 Adverse Event Aggregate Lifecycle

```
[Event Onset]
       ↓
[Initial Detection & Reporting]
       ↓
[Investigator Assessment] (Severity, Relationship)
       ↓
[Medical Coding] (MedDRA)
       ↓
[Treatment-Emergent Determination]
       ↓
[Serious AE Classification?] ─Yes→ [Expedited Reporting]
       ↓ No
[Ongoing Monitoring]
       ↓
[Event Resolution / Ongoing / Fatal]
       ↓
[Database Entry & Quality Control]
       ↓
[Analysis & Summary]
       ↓
[CSR Reporting]
```

**Special Pathways:**
- **Serious AE:** Immediate reporting to sponsor → regulatory authority (as required)
- **Death:** Enhanced documentation, causality assessment, autopsy if available
- **Pregnancy:** Outcome follow-up through delivery and neonatal period

**Quality Controls:**
- MedDRA coding reviewed by medical coder
- Serious AE classification reviewed by medical monitor
- Treatment-emergent logic validated programmatically

---

## 11. Strategic Domain Patterns and Anti-Patterns

### 11.1 Patterns (Recommended Approaches)

**Pattern 11.1.1: Estimand-First Design**
- **Intent:** Define estimands clearly before designing analysis methods
- **Implementation:** ICH E9(R1) framework applied systematically
- **Benefit:** Ensures alignment between clinical question, study design, conduct, analysis, and interpretation
- **Context:** All confirmatory objectives

**Pattern 11.1.2: Treatment Policy as Default**
- **Intent:** Use treatment policy strategy as default for intercurrent events when reflecting real-world effectiveness
- **Implementation:** Include all data regardless of intercurrent events; intention-to-treat analysis
- **Benefit:** Reflects clinical practice, regulatory preference for many indications
- **Context:** Pragmatic trials, regulatory primary estimands

**Pattern 11.1.3: Pre-Specification Before Unblinding**
- **Intent:** Lock down all analysis specifications before seeing unblinded data
- **Implementation:** SAP finalized, analysis set membership assigned, all analysis programs validated before database unlock
- **Benefit:** Prevents data-driven bias, maintains scientific integrity
- **Context:** All confirmatory analyses

**Pattern 11.1.4: Sensitivity Analysis Triangle**
- **Intent:** Assess robustness through three dimensions: model assumptions, missing data mechanisms, outlier influence
- **Implementation:** Pre-specify sensitivity analyses for each dimension
- **Benefit:** Demonstrates robustness or identifies vulnerabilities
- **Context:** Primary efficacy analyses

**Pattern 11.1.5: Interaction-Focused Subgroup Analysis**
- **Intent:** Focus on treatment-by-subgroup interaction rather than within-subgroup p-values
- **Implementation:** Test interaction term; use forest plots for visualization
- **Benefit:** Correct statistical inference about effect heterogeneity
- **Context:** All subgroup analyses

**Pattern 11.1.6: Hierarchical Testing for Multiple Endpoints**
- **Intent:** Control Type I error through pre-specified testing sequence
- **Implementation:** Fixed sequence, fallback, or graphical testing procedures
- **Benefit:** Maintains strong control of family-wise error rate while preserving power
- **Context:** Multiple primary or key secondary endpoints

**Pattern 11.1.7: DMC Independence**
- **Intent:** Maintain strict separation between DMC and sponsor/investigators
- **Implementation:** Independent statisticians, limited unblinding, documented decision-making
- **Benefit:** Protects trial integrity while enabling safety oversight
- **Context:** All trials with interim analyses

**Pattern 11.1.8: ADaM-Compliant Analysis Datasets**
- **Intent:** Structure analysis datasets according to CDISC ADaM standard
- **Implementation:** ADSL (subject-level), ADAE (adverse events), BDS (basic data structure), OCCDS (occurrence data structure)
- **Benefit:** Regulatory expectations, reproducibility, clarity
- **Context:** Regulatory submissions

### 11.2 Anti-Patterns (Approaches to Avoid)

**Anti-Pattern 11.2.1: Post-Hoc Primary Analysis**
- **Problem:** Defining or changing the primary analysis method after seeing unblinded data
- **Consequence:** Invalidates statistical inference; regulatory rejection likely
- **Mitigation:** Strict SAP finalization and approval process before database lock

**Anti-Pattern 11.2.2: P-Value Shopping in Subgroups**
- **Problem:** Presenting subgroup-specific p-values without testing interaction; claiming efficacy in subgroup with p<0.05
- **Consequence:** False positive findings; incorrect interpretation of heterogeneity
- **Mitigation:** Pre-specify interaction tests; use forest plots; focus on consistency of effect

**Anti-Pattern 11.2.3: Uncritical LOCF Imputation**
- **Problem:** Applying Last Observation Carried Forward without justifying the strong assumption that outcomes remain constant after dropout
- **Consequence:** Biased estimates; misleading inference
- **Mitigation:** Use modern missing data methods (MMRM, multiple imputation); justify assumptions

**Anti-Pattern 11.2.4: Analysis Set Assignment After Unblinding**
- **Problem:** Determining which subjects belong to Per-Protocol or other analysis sets after treatment codes are revealed
- **Consequence:** Potential bias; regulatory concerns about data integrity
- **Mitigation:** Blinded review and assignment; independent QC; documentation

**Anti-Pattern 11.2.5: Ignoring Intercurrent Events in Estimand**
- **Problem:** Failing to address intercurrent events (treatment discontinuation, rescue medication) in estimand definition
- **Consequence:** Ambiguous clinical question; unclear interpretation; misalignment between objective and analysis
- **Mitigation:** Systematic ICH E9(R1) framework application; stakeholder collaboration

**Anti-Pattern 11.2.6: Alpha Inflation Through Uncorrected Multiple Testing**
- **Problem:** Testing multiple endpoints at nominal alpha without adjustment
- **Consequence:** Inflated Type I error; false positive claims
- **Mitigation:** Hierarchical testing, Bonferroni adjustment, or gatekeeping procedures

**Anti-Pattern 11.2.7: Undocumented SAP Amendments**
- **Problem:** Making changes to planned analyses without formal SAP amendment process
- **Consequence:** Lack of transparency; regulatory questions; audit findings
- **Mitigation:** Formal change control; documented rationale; version control

**Anti-Pattern 11.2.8: DMC Result Leakage**
- **Problem:** Sharing interim analysis results with sponsor operational team or investigators
- **Consequence:** Biased recruitment, assessment, or conduct; trial validity compromised
- **Mitigation:** Strict access controls; independent statisticians; documented procedures

**Anti-Pattern 11.2.9: Missing Data Deletion Without Justification**
- **Problem:** Complete-case analysis without acknowledging or justifying the Missing Completely At Random assumption
- **Consequence:** Biased results if MCAR violated (usually is); reduced power
- **Mitigation:** Document missing data mechanism assessment; use appropriate imputation or model-based methods

**Anti-Pattern 11.2.10: Inconsistent Coding Across Sites or Time**
- **Problem:** Using different MedDRA or WHODD versions during the trial, or applying inconsistent coding logic
- **Consequence:** Incomparable safety data; biased summaries
- **Mitigation:** Lock coding dictionary version at study start; centralized medical coding; quality control

---

## 12. Technology and Implementation Considerations

### 12.1 Statistical Software

**SAS**
- Industry standard for regulatory submissions
- Extensive statistical procedures
- ADaM dataset creation and management
- Regulatory validation and acceptance

**R**
- Growing acceptance in regulatory environment
- Flexible for advanced methods (multiple imputation, Bayesian, machine learning)
- Reproducibility through R Markdown
- Validation requires careful documentation

**Phoenix WinNonlin**
- Standard for pharmacokinetic non-compartmental analysis (NCA)
- Integration with PK/PD modeling

### 12.2 Data Standards

**CDISC SDTM (Study Data Tabulation Model)**
- Standardized structure for collected data
- Regulatory submission requirement
- Maps from EDC (Electronic Data Capture) systems

**CDISC ADaM (Analysis Data Model)**
- Standardized structure for analysis datasets
- Key datasets: ADSL (subject-level), ADAE (adverse events), BDS/ADTTE (efficacy/time-to-event)
- Traceability from SDTM to ADaM to TFLs required

**CDISC Controlled Terminology**
- Standardized vocabularies for variables and values
- Consistent representation across studies and sponsors

### 12.3 Medical Coding Dictionaries

**MedDRA (Medical Dictionary for Regulatory Activities)**
- Adverse events and medical history coding
- Hierarchical structure: SOC → HLGT → HLT → PT → LLT
- Version management critical (lock version at study start)

**WHO Drug Dictionary (WHODD)**
- Medication coding
- Hierarchical structure: Anatomical Main Group → Therapeutic Subgroup → Preferred Term

### 12.4 Quality and Validation Infrastructure

**Independent Statistical Programming**
- Production and QC programmers use different code
- Comparison of outputs within tolerance
- Discrepancies investigated and resolved

**Version Control**
- Programs, datasets, outputs tracked in version control systems (e.g., Git)
- Audit trail for regulatory inspections
- Reproducibility of analyses

**Validation Documentation**
- Test plans and test cases for statistical programs
- Validation reports documenting QC process
- Deviation logs for any tolerance exceedances

### 12.5 Blinding and Access Control

**Randomization Systems**
- Separate from analysis systems
- Access restricted to designated personnel
- Audit trail of all access

**Interim Analysis Isolation**
- Separate computing environment for independent statisticians
- No access by operational team or primary statisticians
- Documented data transfers with checksums

**Database Access Controls**
- Role-based access during blinded phase
- Unblinding process documented and controlled
- Post-unblinding access audit trail

---

## 13. Mapping to CDISC Standards

### 13.1 SDTM Domain Mappings

**Demographics (DM)**
- Maps to: Subject entity, Demographic baseline variables
- Key for: Analysis set definition, subgroup analyses

**Adverse Events (AE)**
- Maps to: AdverseEvent aggregate
- Includes: Dates, severity, relationship, outcome, action taken
- Post-processing: MedDRA coding, treatment-emergent derivation

**Concomitant Medications (CM)**
- Maps to: Medication entity (Prior and Concomitant)
- Post-processing: WHODD coding, prior vs concomitant classification

**Exposure (EX)**
- Maps to: Treatment exposure entity
- Used for: Extent of exposure analyses, treatment compliance

**Laboratory (LB)**
- Maps to: Clinical laboratory evaluation entity
- Processing: Shift tables, reference range flags

**Vital Signs (VS)**
- Maps to: Vital signs entity
- Processing: Change from baseline, summary statistics

**Disposition (DS)**
- Maps to: Subject disposition entity
- Key for: CONSORT diagram, analysis set assignment

### 13.2 ADaM Dataset Mappings

**ADSL (Subject-Level Analysis Dataset)**
- **Purpose:** One record per subject with demographic, baseline, and treatment variables
- **Maps to:** Subject entity, AnalysisSet membership, baseline characteristics
- **Key Variables:**
  - USUBJID: Unique subject identifier
  - TRT01P/TRT01A: Planned/Actual treatment
  - SAFFL, ITTFL, PPROTFL: Analysis set flags
  - AGE, SEX, RACE: Demographics
  - Baseline efficacy variables

**ADAE (Adverse Events Analysis Dataset)**
- **Purpose:** One record per adverse event
- **Maps to:** AdverseEvent aggregate
- **Key Variables:**
  - AEDECOD: MedDRA Preferred Term
  - AESOC: System Organ Class
  - AESEV: Severity
  - AEREL: Relationship
  - TRTEMFL: Treatment-emergent flag
  - AESER: Serious AE flag

**BDS (Basic Data Structure) for Efficacy**
- **Purpose:** One record per subject per analysis parameter per analysis visit
- **Maps to:** Endpoint measurements, derived variables
- **Key Variables:**
  - PARAMCD/PARAM: Analysis parameter
  - AVAL: Analysis value
  - BASE: Baseline value
  - CHG: Change from baseline
  - AVISITN/AVISIT: Analysis visit

**ADTTE (Time-to-Event Analysis Dataset)**
- **Purpose:** One record per subject per time-to-event parameter
- **Maps to:** Time-to-event endpoints
- **Key Variables:**
  - PARAMCD/PARAM: Time-to-event parameter
  - AVAL: Time to event (or censoring)
  - CNSR: Censoring indicator (0=event, 1=censored)
  - STARTDT: Start date for time calculation

### 13.3 Terminology Mappings

**Analysis Set Terminology (CDISC Controlled Terminology)**
- FAS → Full Analysis Set (CDISC: FASFL)
- Safety Analysis Set → Safety Population (CDISC: SAFFL)
- Per-Protocol Set → Per-Protocol Population (CDISC: PPROTFL)

**Estimand Attribute Mappings**
- No direct CDISC ADaM mapping yet; documented in Analysis Results Metadata (ARM)
- Estimand strategies reflected in dataset construction rules (e.g., data inclusion/exclusion)

---

## 14. Summary and Recommendations

### 14.1 Core Domain Strengths

The eSAP domain exhibits several characteristics that align well with DDD principles:

1. **Clear Bounded Contexts:** Eight well-defined contexts with distinct responsibilities and clear boundaries.

2. **Rich Ubiquitous Language:** Extensive domain-specific terminology aligned with ICH guidelines and CDISC standards.

3. **Complex Aggregates:** Well-structured aggregates (Protocol, SAP, Estimand, AnalysisSet, AdverseEvent) with clear identity, lifecycle, and invariants.

4. **Regulatory Alignment:** Strong conformance to international standards provides Published Language (ICH E3, E9, E9(R1), CDISC).

5. **Explicit Business Rules:** Numerous domain constraints clearly articulated and traceable to regulatory requirements.

### 14.2 Implementation Recommendations

**Recommendation 14.2.1: Estimand as First-Class Aggregate**
Elevate Estimand to a first-class aggregate with dedicated lifecycle management, validation services, and traceability to analysis specifications. This aligns with ICH E9(R1) emphasis.

**Recommendation 14.2.2: Context-Specific Services**
Implement domain services within each bounded context rather than as cross-cutting concerns. For example, MissingDataHandlingService belongs in Data Management Context, while MultipleTestingControlService belongs in Statistical Analysis Context.

**Recommendation 14.2.3: Event-Driven Integration**
Use domain events (e.g., DatabaseLocked, SAPFinalized) to coordinate across bounded contexts rather than tight coupling. This supports independence and testability.

**Recommendation 14.2.4: Immutable Value Objects**
Implement all value objects (ConfidenceInterval, PValue, MedDRACode, etc.) as immutable to prevent accidental corruption and support reproducibility.

**Recommendation 14.2.5: Explicit Anti-Corruption Layers**
Build anti-corruption layers between Study Design Context and Statistical Analysis Context to handle protocol amendments and version reconciliation cleanly.

**Recommendation 14.2.6: Repository Pattern for Aggregates**
Use Repository pattern for each aggregate root (Protocol, SAP, Subject, AdverseEvent) to abstract persistence and enable testing.

**Recommendation 14.2.7: CDISC as Published Language**
Treat CDISC (SDTM, ADaM, Controlled Terminology) as the Published Language for data interchange between contexts and external systems.

**Recommendation 14.2.8: Validation as Domain Concern**
Treat validation (statistical program QC, output validation) as a core domain concern, not just a technical QA process. Encode validation rules as domain invariants.

### 14.3 Potential Extensions

**Extension 14.3.1: Real-World Evidence (RWE) Context**
As RWE becomes more prominent, consider a separate bounded context for observational studies, registries, and electronic health records integration, with different aggregates and rules than traditional RCTs.

**Extension 14.3.2: Pharmacokinetics/Pharmacodynamics Context**
For PK/PD-intensive programs, elevate PK/PD to a separate bounded context with specialized aggregates (PK Parameters, Compartmental Models, Dose-Response Relationships).

**Extension 14.3.3: Health Economics and Outcomes Research (HEOR) Context**
Cost-effectiveness, quality-adjusted life years (QALYs), and patient-reported outcomes (PROs) may warrant separate bounded context with distinct methodologies.

**Extension 14.3.4: Machine Learning and AI Context**
As AI/ML methods enter clinical trials (adaptive randomization, enrichment, surrogate endpoints), a separate context may be needed with different validation and interpretability requirements.

### 14.4 Anti-Pattern Mitigation Strategies

1. **Code Reviews with DDD Lens:** Review designs and code for anti-patterns (e.g., post-hoc analysis, p-value shopping).

2. **Automated Invariant Checking:** Implement automated checks for domain invariants (e.g., SAP finalized before database lock, analysis sets defined before unblinding).

3. **Training and Ubiquitous Language Adoption:** Ensure all stakeholders (biostatisticians, programmers, data managers, medical writers) use consistent ubiquitous language.

4. **Audit Trail for Compliance:** Maintain comprehensive audit trail for all domain events, state transitions, and decisions to support regulatory inspections.

---

## 15. Conclusion

The eSAP domain for regulated clinical trials biometrics workflows is a rich, complex domain with well-established patterns, standards, and regulatory requirements. Applying Domain-Driven Design principles reveals:

- **Eight bounded contexts** with clear responsibilities and interactions
- **Eight core aggregates** with rich identity, lifecycle, and business rules
- **Extensive ubiquitous language** aligned with ICH and CDISC standards
- **Critical domain events** that coordinate workflows across contexts
- **Numerous business rules** ensuring scientific and regulatory integrity

The domain's maturity, regulatory oversight, and standardization (CDISC, ICH) provide a strong foundation for DDD implementation. The estimand framework (ICH E9(R1)) represents a significant evolution that aligns naturally with DDD's emphasis on explicit domain models and ubiquitous language.

By applying DDD principles, eSAP systems can achieve:
- Greater clarity and traceability from clinical questions to analysis results
- Improved maintainability through clear bounded contexts and aggregates
- Enhanced quality through explicit invariants and validation rules
- Better regulatory compliance through audit trails and reproducibility
- Reduced risk of anti-patterns that compromise scientific integrity

This domain design provides a blueprint for building robust, regulatory-compliant, and scientifically rigorous electronic Statistical Analysis Plan systems.

---

**Document Version:** 1.0
**Date:** 2025-12-06
**Author:** Domain-Driven Design Analysis (Automation Architect Specialist)
**Standards:** CDISC SDTM, ADaM; ICH E3, E9, E9(R1)
