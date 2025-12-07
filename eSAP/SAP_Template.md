# STATISTICAL ANALYSIS PLAN

**Protocol:** `<Protocol Number>`
**Protocol Version and Date:** `<Protocol Version and Date>`
**Protocol Title:** `<Protocol Title>`

| SAP/Amendment Number | Date |
|---------------------|------|
| Final SAP | `<DD MMM YYYY>` |
| `<Amendment 1>` | `<DD MMM YYYY>` |

**Prepared for:** `<Client Name>`
**Prepared by:** `<Author Name>`

Veramed Limited
5th Floor, Regal House
70 London Road
Twickenham
TW1 3QS

| Approved by | Signature | Date |
|------------|-----------|------|
| `<Name>` `<Title>` | | |
| `<Name>` `<Title>` | | |
| `<Name>` `<Title>` | | |

---

**Document:** FOR-039 v3.0
**Effective:** 09SEP2024
**Status:** Restricted
**Page:** 1 of 31

---

## Guidelines

Refer to SOP-SP-003, Development of the Statistical Analysis Plan. Fill in the details as dictated by the protocol and case report form and consult with client and study team members, including the medical writer to ensure this document will meet the needs of the final report. The key document for regulatory requirements is the International Conference on Harmonisation of Technical Requirements for Registration of Pharmaceuticals for Human Use (ICH) guidelines E9-Statistical Principles for Clinical Trials, to which is referred frequently throughout this template.

Depending on the study, some sections may be not applicable in which case they may be deleted. Guidance notes are provided at the start of each section in blue and in square parentheses and should be deleted.

Text shown in red is to be updated with correct information.

Example text is provided in italics. The purpose of example text is to provide a guide to the level of detail, but it is not intended to suggest any standard or default.

**Delete this section before circulating any draft or final version of a SAP.**

---

## Table of Contents

1. [Table of Contents](#table-of-contents)
2. [Abbreviations and Definitions](#2-abbreviations-and-definitions)
3. [Introduction](#3-introduction)
4. [Study Objectives, Endpoints <and Estimands>](#4-study-objectives-endpoints-and-estimands)
   - 4.1 [Primary Objective](#41-primary-objective)
   - 4.2 [Secondary Objectives](#42-secondary-objectives)
   - 4.3 [Tertiary / Exploratory Objectives](#43-tertiary--exploratory-objectives)
5. [Study Methods](#5-study-methods)
   - 5.1 [General Study Design and Plan](#51-general-study-design-and-plan)
   - 5.2 [Randomisation and Blinding](#52-randomisation-and-blinding)
   - 5.3 [Derived variables](#53-derived-variables)
6. [Sample Size](#6-sample-size)
7. [General Considerations](#7-general-considerations)
   - 7.1 [Analysis Sets](#71-analysis-sets)
   - 7.2 [Covariates and Subgroups](#72-covariates-and-subgroups)
   - 7.3 [Missing Data](#73-missing-data)
   - 7.4 [Interim Analyses and Data Monitoring](#74-interim-analyses-and-data-monitoring)
     - 7.4.1 [Purpose of Interim Analyses](#741-purpose-of-interim-analyses)
     - 7.4.2 [Planned Schedule of Interim Analyses](#742-planned-schedule-of-interim-analyses)
     - 7.4.3 [Scope of Adaptations](#743-scope-of-adaptations)
     - 7.4.4 [Stopping Rules](#744-stopping-rules)
     - 7.4.5 [Analysis Methods to Minimise Bias](#745-analysis-methods-to-minimise-bias)
     - 7.4.6 [Adjustment of Confidence Intervals and p-values](#746-adjustment-of-confidence-intervals-and-p-values)
     - 7.4.7 [Interim Analysis for Sample Size Adjustment](#747-interim-analysis-for-sample-size-adjustment)
     - 7.4.8 [Practical Measures to Minimise Bias](#748-practical-measures-to-minimise-bias)
     - 7.4.9 [Documentation of Interim Analyses](#749-documentation-of-interim-analyses)
   - 7.5 [Multi-centre Studies](#75-multi-centre-studies)
   - 7.6 [Multiple Testing](#76-multiple-testing)
8. [Summary of Study Data](#8-summary-of-study-data)
   - 8.1 [Subject Disposition](#81-subject-disposition)
   - 8.2 [Protocol Deviations](#82-protocol-deviations)
   - 8.3 [Demographic and Baseline Variables](#83-demographic-and-baseline-variables)
   - 8.4 [Concurrent Illnesses and Medical Conditions](#84-concurrent-illnesses-and-medical-conditions)
   - 8.5 [Prior and Concomitant Medications](#85-prior-and-concomitant-medications)
   - 8.6 [Treatment Compliance](#86-treatment-compliance)
9. [Efficacy Analyses](#9-efficacy-analyses)
   - 9.1 [Primary Efficacy Analysis](#91-primary-efficacy-analysis)
     - 9.1.1 [Main Analytical Approach](#911-main-analytical-approach)
     - 9.1.2 [Sensitivity Analyses](#912-sensitivity-analyses)
     - 9.1.3 [Subgroup Analyses](#913-subgroup-analyses)
   - 9.2 [Secondary Efficacy Analyses](#92-secondary-efficacy-analyses)
   - 9.3 [Exploratory Efficacy Analyses](#93-exploratory-efficacy-analyses)
10. [Safety Analyses](#10-safety-analyses)
    - 10.1 [Extent of Exposure](#101-extent-of-exposure)
    - 10.2 [Adverse Events](#102-adverse-events)
    - 10.3 [Deaths, Serious Adverse Events and other Significant Adverse Events](#103-deaths-serious-adverse-events-and-other-significant-adverse-events)
    - 10.4 [Pregnancies](#104-pregnancies)
    - 10.5 [Clinical Laboratory Evaluations](#105-clinical-laboratory-evaluations)
    - 10.6 [Other Safety Measures](#106-other-safety-measures)
11. [Pharmacokinetics](#11-pharmacokinetics)
12. [Other Analyses](#12-other-analyses)
13. [Reporting Conventions](#13-reporting-conventions)
14. [Technical Details](#14-technical-details)
15. [Summary of Changes to the Protocol](#15-summary-of-changes-to-the-protocol)
16. [References](#16-references)
17. [Amendment(s) to the Statistical Analysis Plan](#17-amendments-to-the-statistical-analysis-plan)
    - 17.1 [Amendment 1](#171-amendment-1)
18. [Appendix 1: List of Tables, Figures and Listings](#18-appendix-1-list-of-tables-figures-and-listings)
    - 18.1 [Study Population](#181-study-population)
      - 18.1.1 [Tables](#1811-tables)

---

## 2. Abbreviations and Definitions

[Guidance notes: Provide a list of the abbreviations and acronyms used in the Statistical Analysis Plan (SAP) with definitions. All terms will appear in alphabetical order.

This section should be completed on an on-going basis during the preparation of the document and checked carefully after preparing the rest of the SAP to ensure that all the abbreviations are captured. Although the abbreviations are listed, it is standard practice to spell out abbreviated terms and to indicate the abbreviation in parentheses at their first appearance in the text.]

| Abbreviation | Definition |
|--------------|------------|
| AE | Adverse Event |
| CRF | Case Report Form |
| IMP | Investigational Medical Product |
| SAP | Statistical Analysis Plan |

---

## 3. Introduction

[Guidance notes: Brief introduction as to the purpose of the SAP including reference to current version and date of the protocol. Example text:

*The purpose of this SAP is to provide all information that is necessary to perform the required statistical analyses of study X. It also defines the summary TFLs to be included in the final clinical study report according to the protocol. The SAP is based upon, and assumes familiarity, with the study protocol, version X, date X.*

*Changes to the protocol-planned analyses are described in Section 15 / There are no changes to the analyses described in the protocol.*

*If a future protocol amendment necessitates a substantial change to the statistical analysis of the study data, this SAP will be amended accordingly. The content of this SAP is compatible with the ICH E9 Guidance document.*]

`<Enter text>`

---

## 4. Study Objectives, Endpoints <and Estimands>

[Guidance notes: List separately the primary, secondary, exploratory endpoints for the study as taken directly from the protocol. If possible, each endpoint should be linked to the study objective it is associated with. This could be done in table form for ease of presentation. The formatting of this section could copy (and potentially expand on) that of the corresponding section(s) of the protocol rather than using the format below, if appropriate.]

**Example text for studies not following the Estimand framework:**

| Objectives | Endpoints |
|------------|-----------|
| **Primary** | |
| To demonstrate superior efficacy of drug x vs placebo in change from baseline to Week 26 in glycated hemoglobin (HbA1c) in participants with type 2 diabetes mellitus treated with diet and exercise only | Primary: change from baseline to Week 26 in HbA1c |
| **Secondary** | |
| To demonstrate superior efficacy of drug x vs placebo on body weight in participants with type 2 diabetes mellitus treated with diet and exercise only | Confirmatory: change from baseline to Week 26 in body weight |
| To compare the efficacy of drug x vs placebo with respect to other glycemic control endpoints | • Change from baseline to Week 26 in fasting plasma glucose (FPG)<br>• HbA1c < 7% at Week 26 |
| To compare the efficacy of drug x vs placebo with respect to other weight-related endpoints | • Body weight loss ≥ 5% at Week 26<br>• Change from baseline to Week 26 in body mass index (BMI)<br>• Change from baseline to Week 26 in waist circumference |
| To compare the safety and tolerability of drug x vs placebo in participants with type 2 diabetes mellitus treated with diet and exercise only | • Number of adverse events from baseline to Week 26<br>• Number of hypoglycemic episodes from baseline to Week 26 |

`<Enter text>`

### 4.1 Primary Objective

**Example text for studies following an estimand framework:**

**Primary Objective:** To demonstrate superiority efficacy of drug x vs placebo in change from baseline to Week 26 in glycated hemoglobin (HbA1c) in participants with type 2 diabetes mellitus treated with diet and exercise only

- **Clinical/scientific question of interest:** What is the treatment difference between drug x and placebo in change from baseline to Week 26 in HbA1c in patients with type 2 diabetes mellitus treated with diet and exercise only regardless of treatment discontinuation for any reason and regardless of initiation of rescue or other medication that will influence HbA1c values?

- **Primary Estimand:**
  - **Treatment condition:** the randomised treatment regardless of adherence and with or without use of rescue or other medication that will influence HbA1c values (treatment policy strategy). Further details can be found in Section X.
  - **Population:** patients with type 2 diabetes mellitus treated with diet and exercise only. Further details can be found in Section Y.
  - **Endpoint:** change from baseline to Week 26 in HbA1c
  - **Intercurrent events:**
    - ICE 1: treatment discontinuation for any reason is addressed by the treatment condition of interest attribute
    - ICE 2: initiation of rescue or other medication is addressed by the treatment condition of interest attribute
  - **Population Level Summary:** difference in mean changes between treatment conditions

- **Rationale:** The primary estimand was requested by Regulator X; it aims at reflecting how patients with type 2 diabetes mellitus are treated in clinical practice and takes into account both safety and efficacy. HbA1c is the most widely accepted measure of overall, long-term blood glucose control in patients with diabetes. Since patients are not expected to benefit once treatment is discontinued (e.g. due to adverse events) the treatment effect should be estimated based on observed or modelled data reflecting adherence to treatment as observed in the clinical trial.

- **Co-Primary/multiple Estimands:**
  - description same as above

- **Additional Estimand(s):**

[Guidance notes: that this could be presented as a secondary estimand rather than an additional estimand.]

An additional clinical question of interest is: What is the treatment difference between drug x and placebo in change from baseline to Week 26 in HbA1c in patients with type 2 diabetes mellitus treated with diet and exercise only regardless of treatment discontinuation for any reason and had rescue or other medication that will influence HbA1c values not been available?

The attributes for the additional estimand are the same as for the primary estimand except for the below:

- **Treatment condition:** the randomised treatment regardless of adherence (treatment policy strategy) and without the effect of any rescue or other medication that will influence HbA1c values (hypothetical strategy). Further details can be found in Section X.
- **Intercurrent events:** The 2 intercurrent events treatment discontinuation for any reason and initiation of rescue or other medication are both addressed by the treatment condition of interest attribute. The former is handled by the treatment policy strategy and the latter is handled by the hypothetical strategy.

**Rationale for estimand:** The additional estimand is free from the confounding effect of rescue or other medication that will influence HbA1c values.

`<Enter text>`

### 4.2 Secondary Objectives

**Example text for studies following an estimand framework:**

**Secondary Objective 1:** To demonstrate superiority efficacy of drug x vs placebo on body weight in participants with type 2 diabetes mellitus treated with diet and exercise only

- **Clinical/scientific question of interest:** What is the treatment difference between drug x and placebo in change from baseline to Week 26 in body weight in patients with type 2 diabetes mellitus treated with diet and exercise only regardless of treatment discontinuation for any reason and regardless of initiation of any interventions affecting body weight, e.g., weight-reducing medication or bariatric surgery?

- **Primary Estimand:**
  - **Treatment condition:** the randomised treatment regardless of adherence with or without any other weight-management interventions (treatment policy strategy). Further details can be found in Section X.
  - **Population:** patients with type 2 diabetes mellitus treated with diet and exercise only. Further details can be found in Section Y.
  - **Endpoint:** change from baseline to Week 26 in body weight
  - **Intercurrent events:**
    - ICE 1: treatment discontinuation for any reason is addressed by the treatment condition of interest attribute
    - ICE 2: any intervention affecting body weight is addressed by the treatment condition of interest attribute
  - **Population Level Summary:** difference in mean changes between treatment conditions

- **Rationale:** The secondary estimand was requested by Regulator X; it aims at reflecting how patients with type 2 diabetes mellitus are treated in clinical practice and takes into account both safety and efficacy. Weight loss can improve type 2 diabetes and related comorbidities.

**Secondary Objective 2:** …

`<Enter text>`

### 4.3 Tertiary / Exploratory Objectives

[Guidance notes: Structured as above]

`<Enter text>`

---

## 5. Study Methods

### 5.1 General Study Design and Plan

*(ICH E3;9)*

[Guidance notes: Identify the study design using details from the protocol, including the following:

- Study configuration and experimental design: x-period cross-over, longitudinal, 2x2 factorial, observational, cohort. However, not every design can be abbreviated to a label of few words, and enough detail should always be given to eliminate any ambiguities.
- Type of control(s): placebo, no treatment, active drug, different dose or administration, historical.
- Level and method of blinding: double-blind double-dummy. However, not every method can be abbreviated to a label of few words, and enough detail should always be given to eliminate any ambiguities.
- Method of treatment assignment: randomisation with stratification, minimisation.
- At what point in time subjects are randomised relative to treatments, events and study periods.
- Sequence and duration of all study periods: screening, baseline, active treatment, follow-up.

The last two points can be represented by a study flow-chart, which can be copied directly from the protocol.]

`<Enter text>`

### 5.2 Randomisation and Blinding

*(ICH E3; 9.4.3, 9.4.6. ICH E9; 2.3.1, 2.3.2)*

[Guidance notes: Describe essential components of the randomisation and blinding methodology in enough detail to enable its reproduction. Include any minimisation, stratification or blocking procedures used to avoid or minimise bias. This section may be copied from the protocol but it may be necessary to include additional information details, particularly regarding block size. However, in a double-blind study it may be appropriate not to include such information in the SAP but document it within the final study report, in which case document that these details will be provided in the final study report. Document any software packages used to perform the randomisation.]

`<Enter text>`

### 5.3 Derived variables

[Guidance notes: If any endpoints are derived from a variable or variables calculated from source data recorded in the CRF, then their definition should be provided. Ensure that a primary endpoint that is such a derived variable is clearly identified with a consistent name. An example of a derived variable is a binary variable indicating if an ordered categorical variable has increased from baseline.

Define the time-windows to be used for converting dates into visit numbers for scheduled assessments (e.g. assessments collected from 26 to 30 days post-randomisation are identified as the 4-week visit). Describe the decision rules that will be used to classify measurements obtained outside of scheduled assessment times. Describe the methods for handling multiple measurements that occur within the same assessment time window.

This section will go beyond the description of variables provided in the protocol in that it will list and describe all important study variables from a statistical perspective. The description of each variable should include:

- Identification of any number ranges for numeric endpoints along with their corresponding text descriptors.
  - *Items are measure on a 0-100 visual analogue scale (VAS) for which 0=no pain and 100=worst pain imaginable*
  - *Items are measured on a 1-4 ordered categorical scale for which 1=no pain, 2= slight pain, 3=moderate pain, 4=extreme pain*
- The method for computing the variable including any special techniques used in the computation (e.g. carrying forward values into missing observations, transformation of values) and specific methods for combining multiple variables into a single value (e.g. EQ-5D Quality of Life questionnaire)
- How to handle any missing components in the calculation of overall total scores

If there are numerous variables it may be useful to create subsections corresponding to each variable which are grouped together as in the protocol (e.g. efficacy, safety) and sections 8-12 of this document.

Note that this section may be deleted in its entirety if preferable to provide this information in the relevant subsequent sections.]

`<Enter text>`

---

## 6. Sample Size

*(ICH E3; 9.7.2. ICH E9; 3.5)*

[Guidance notes: This section should reproduce the relevant section from the protocol. If any amendments to the sample size have been made during the study, these should be documented and explained here. If any techniques are used to adjust the primary analysis for sample size adjustment they should be described in the relevant section (9.1).]

`<Enter text>`

---

## 7. General Considerations

[Guidance notes: Specify the methods of describing the data that will be used in the final report. This section includes general descriptions of the methods. If any of the items require a unique approach then this should be noted in the appropriate subsection.

Specify:
- Descriptive statistics that will be displayed for continuous data and for categorical data.
- Grouping of summary table information (e.g. by treatment group and in what order, possibly adding a combined "all subjects" column)
- Sort order of any listings.
- Baseline derivation]

### 7.1 Analysis Sets

*(ICH E3; 9.7.1, 11.4.2.5. ICH E9; 5.2)*

[Guidance notes: This section is designed to identify the characteristics needed for inclusion of data used in the analyses and may be specified in the protocol. Clearly define all the analysis sets with a formal title (e.g. Full Analysis, Per Protocol, Safety) and give criteria to determine if a subject or observational unit belongs to that set. The criteria need to align with the corresponding estimand for studies following an estimand framework.

Note that "intention to treat" refers to how subjects are assigned to a treatment group for the purposes of the study (i.e. the treatment they are randomised to but not necessarily the one received); it can be used within any analysis set and thus is not a suitable description for a set itself. ICH E9 does not reference an ITT Set.

It is not enough just to use a standard label for analysis sets. Such labels are vague and need further precise definitions within each trial. It is important to note that the selection of participants *and* the selection of participant data points are clearly described for each estimand for studies following an estimand framework. Examples are given below.

**Example text:**

For the purposes of analysis, the following participant analysis sets are defined:

| Participant Analysis Set | Description |
|-------------------------|-------------|
| Full analysis set | • All randomised participants. Participants will be included in the analyses according to the planned intervention. |
| Safety analysis set | • All participants who are exposed to study intervention. Participants will be included in the analyses according to the intervention they actually received. |

The full analysis set is used to analyse endpoints related to the efficacy objectives, and the safety analysis set is used to analyse endpoints related to the safety objectives.

The following analysis data sets are defined to estimate the estimands defined in the protocol.

| Analysis Data Sets | Description |
|-------------------|-------------|
| Analysis set 1, used for the primary estimand and for the secondary estimand 1 | • Full Analysis Set<br>• For participants who discontinue study intervention and/or receive rescue therapy, all post-discontinuation or post-rescue observations will be included in the analysis set. |
| Analysis set 2, used for the additional estimand for the primary objective | • Full Analysis Set<br>• For participants who discontinue study intervention and/or receive rescue therapy, post-discontinuation or post-rescue observations will not be included. |
| Analysis set 3 to be used for safety assessments with a long lag-time | • Safety Analysis Set.<br>• All observed data will be included in the analysis set. |
| Analysis set 4 to be used for safety assessments with an acute onset | • Safety Analysis Set: All participants who are exposed to study intervention. Participants will be included in the analyses according to the intervention they actually received.<br>• All observed data until discontinuation of intervention will be included in the analysis set. |

It is crucial to assign each subject's inclusion or exclusion status with regard to each participant analysis set prior to breaking the blind. Such a statement should be included in this section. The exact process for assigning the statuses will be defined and documented prior to breaking the blind along with any predefined reasons for eliminating a subject from a particular set.]

`<Enter text>`

### 7.2 Covariates and Subgroups

*(ICH E3; 9.7.1, 11.4.2.1. ICH E9; 5.7)*

[Guidance notes: Provide a general comment identifying the covariates (continuous or categorical, including subgroups) that are expected to have an important influence on specific endpoints (e.g. demographic or baseline measurements, concomitant therapy). Document any model selection procedures (e.g. forward stepwise selection).

Any variables used to stratify or minimise over in treatment allocation should be adjusted for in the primary analysis; otherwise specific reasons should be included (for example, a categorical variable used in a minimisation treatment allocation process could be omitted if it introduced too many categories).

State which important demographic or baseline-value-defined subgroups are to be analysed for different treatment effects (for example comparison of effects by age, gender, ethnic group, prognosis, prior treatment). If there exists an a priori hypothesis of subgroup differences, it should be noted in this section. Likewise, it should be noted if subgroup analyses are exploratory.

Subgroup analyses should focus on the evidence for a difference in treatment effects: the interaction effect. It is flawed to present an analysis that provides two p-values, one for each of the two subgroups, and then report that only one subgroup showed a statistically significant difference. Only if the interaction effect is judged to be statistically and clinically significant should subgroup-specific treatment effect estimates be presented. It is acceptable to present exploratory subgroup-specific summary statistics. The use of forest plot figures is a highly effective way of communicating the relevant information about possible subgroup effects and interactions.

Where applicable, discuss the impact of the sample size on the power of subgroup analyses or reference section 6 if discussed there.

**Example text:** Subgroup analyses of the primary endpoint and confirmatory secondary endpoints will be made to assess consistency of the intervention effect across the following subgroups:

- Age group: < 65 vs ≥ 65 years
- Sex: female vs male
- Race: white vs black vs other

If the number of participants is too small (less than [10%]) within a subgroup, then the subgroup categories may be redefined prior to unblinding the study.]

`<Enter text>`

### 7.3 Missing Data

*(ICH E3; 9.7.1, 11.4.2.2. ICH E9;5.3. EMA Guideline on Missing Data in Confirmatory Clinical Trials)*

[Guidance notes: The E9(R1) addendum defines missing data as "Data that would be meaningful for the analysis of a given estimand but were not collected. They should be distinguished from data that do not exist or data that are not considered meaningful because of an intercurrent event." The methodology for handling missing data should be aligned to the estimand of interest.

Describe procedures to be used for dealing with premature discontinuation from the study and the handling of spurious or other missing data (e.g. use of multiple imputation, random effects models or complete case analyses). Describe any possible biases these techniques may introduce. Describe the underlying assumptions (e.g. Missing At Random) in both statistical and non-statistical terms. Describe procedures to be used for describing the pattern of permanent (i.e. dropout) or transient missing data.

This section is intended to be a general discussion of the approach to missing data. Variable-specific information for imputing missing data, where appropriate, will be documented in section 5.3; analytical methods may be further detailed in section 8.

Include guidance on how to handle missing dates for AEs (or concomitant medication) for calculation of duration, assessment of treatment emergence.]

**Example text:**

**Dates:**

Partial dates may be imputed for statistical analyses for specific outcomes according to the following rules. Imputed dates should not be shown in the listing.

**Imputation of partial start dates:**

- If only the month and year are specified and the month and year of dosing is not the same as the month and year of the start date, then use the 1st of the month.
- If only the month and year are specified and the month and year of dosing is the same as the month and year of the start date, then use the date of dosing.
- If only the year is specified, and the year of dosing is not the same as the year of the start date, then use January 1 of the year of the start date.
- If only the year is specified, and the year of dosing is the same as the year of the start date, then use the date of dosing.
- If the start date is completely unknown, then use the date of dosing.

**Imputation of partial stop dates:**

- If only the month and year are specified, then use the last day of the month.
- If only the year is specified, then use December 31 of that year.
- If the stop date is completely unknown, do not impute the stop date.

`<Enter text>`

### 7.4 Interim Analyses and Data Monitoring

*(ICH E3; 9.7.1, 11.4.2.3. ICH E9; 4.1, FDA Feb 2010 "Guidance for Industry Adaptive Design Clinical Trials for Drugs and Biologics")*

#### 7.4.1 Purpose of Interim Analyses

[Guidance notes: Give a description of why the interim analyses are to be performed. Typically the reason is due to uncertainty about some aspect or aspects of the treatment or treatments and the interim will allow learning to influence the subsequent design of the study at Data Monitoring Committees. This can range from simple uncertainty about safety aspects, the primary estimand treatment effect that leads to early termination for futility of efficacy, to decisions regarding the choice of dose, endpoint, treatment arm, randomisation weighting, subgroup enrichment. The data to be analysed in the interim analyses should be explicitly specified (for example, baseline data, treatment received, safety)

**Example text:** An interim analysis of the primary estimand will be performed by the independent data monitoring committee (IDMC), consisting of [X] clinicians and 1 statistician who are independent experts not otherwise involved in the study, when approximately [X] primary events have occurred. The analysis method for the primary estimand described in Section 9.1 Primary Efficacy Analysis will be used for the interim analysis. Based on the group sequential design with the [O'Brian Fleming] alpha spending approach, a 2-sided alpha of [X] will be allocated to the interim analysis. In addition, if the conditional power for the final analysis (based on the original assumption for the remaining study) is [X] or lower, the study may be stopped for futility.

The interim analysis will be conducted such that the ongoing study integrity is maintained. Only the independent statistical support group, who is responsible for providing the interim analysis results to the IDMC will be unblinded to the individual treatment group assignments. Interim analysis results will not be shared with investigators, participants, or the study team who are involved in the conduct of the study before the final database lock.]

`<Enter text>`

#### 7.4.2 Planned Schedule of Interim Analyses

[Guidance notes: It must be detailed when the first interim analysis will occur, and what scope of decisions will be taken at future interim analyses. Technically, details of the interim analysis beyond the next interim can be left open to be decided sequentially at each interim, under the proviso that rules for the analysis to combine the future data at each stage are defined and the scope for adaptations is not enlarged. However, it is recommended to plan as much as possible in advance and give a full predicted schedule of all interim analyses.]

`<Enter text>`

#### 7.4.3 Scope of Adaptations

[Guidance notes: Give an explicit list of which aspects of the trial may be revised at an interim analysis. Document any formal rules governing these adaptations. If an interim SAP will not be produced, or it is appropriate to document the interim analysis in the main SAP, then specify what analyses, summaries or figures will be used to inform the choice of adaptations.]

`<Enter text>`

#### 7.4.4 Stopping Rules

[Guidance notes: Document any formal stopping rules for futility, efficacy or lack of power. Document the probability of each possible eventuality under the null and alternative hypothesis e.g. the probability of stopping for futility or efficacy, or continuing to the next stage.]

`<Enter text>`

#### 7.4.5 Analysis Methods to Minimise Bias

[Guidance notes: It is generally advised to perform a naïve analysis that pools all data at the final analysis as if it were collected in a fixed design. However this may induce biases in estimation. For example in group sequential designs the estimate of treatment effects will be biased away from the stopping region; for sample sizes that are revised to reflect the estimated treatment effect at the first interim, the naïve pooled estimate will be biased away from the null.

Any known biases must be discussed, and any methods proposed to correct the biases must be documented. It must be stated in advance which analysis will be the primary analysis used in the case of conflicting interpretations and for "headline" reporting of the trial.]

`<Enter text>`

#### 7.4.6 Adjustment of Confidence Intervals and p-values

[Guidance notes: In a design where formal hypothesis testing is used and the interim analyses provide multiple opportunities to stop for efficacy, the overall trial significance level will be greater than nominal significance levels used at each stage. Any stopping rules should adjust for this, and correspondingly any confidence intervals or p-values presented must be calculated to adjust for the possibility of stopping earlier and for having reached the observed stage in the trial.

Conversely, a trial that only has the option to stop early for futility will conservatively preserve the overall significance level. Here the nominal confidence interval and p-value at the end of the trial can be used. Investigations should be made into the effect on the power of the trial, and only if the power is substantially reduced should adjustments be used.]

`<Enter text>`

#### 7.4.7 Interim Analysis for Sample Size Adjustment

[Guidance notes: If the sample size is to be adjusted at an interim, specify any rules: for example conditional power calculations.

The weighting of data from different stages of the trial needs to either, be set in advance independently of (random) sample sizes, or rules given for how the weighting will be determined. The final analyses must specify how these weightings will be used, see section 7.4.5.]

`<Enter text>`

#### 7.4.8 Practical Measures to Minimise Bias

[Guidance notes: It is important to establish and control who will have access to what information at each stage of the trial. Uncontrolled reporting of interim analyses to study centres could lead to investigators responsible for recruiting subjects to change their desire to recruit to a trial, which would induce uncontrollable biases into the subject population. The final analyses could be biased by knowledge of interim results by the analyst. Any level of unblinding, either of individual subjects or of treatment estimates, could induce biases.

It should be explicitly documented:
- who will perform any interim analysis
- who will see any data or analyses at the interim and make decisions
- what information will be publicly available following an interim analysis
- what information will be provide to the sponsor and investigators
- who will be unblinded at any point in the trial
- who will perform any final analyses and remain blinded
- if any safety monitoring decision making will remain isolated from efficacy information]

`<Enter text>`

#### 7.4.9 Documentation of Interim Analyses

[Guidance notes: Snapshots of the data available at each interim analysis should be preserved, as should all documentation of analysis plans, programming code and reporting provided at each interim. It should be possible to recreate the decision process from the trial archive.

Record what documents will be created and stored thus.]

`<Enter text>`

### 7.5 Multi-centre Studies

*(ICH E3;9.7.1, 11.4.2.4. ICH E9; 3.2)*

[Guidance notes: This section may be copied directly from the protocol, if appropriate.

Where a multi-centre study is intended to be analysed as a whole, describe the following:

- Procedures to combine individual centre results into more usable pseudo-centres with greater numbers of subjects
- Rationale for the combining of centres and the decision rule for whether or not the grouping will be necessary
- Methods to test for qualitative or quantitative treatment-by-centre interactions
- Analyses of treatment comparisons that will allow for centre differences with respect to response
- Centre effects should be considered exploratory in analyses of studies that have not been explicitly designed with enough power to detect centre effects.

The general discussion about the analysis of subgroups in section 7.2 is applicable to centre effects.]

`<Enter text>`

### 7.6 Multiple Testing

*(ICH E3; 9.7.1, 11.4.2.5. ICH E9; 2.2.5)*

[Guidance notes: This section can be copied from the protocol, if available.

In a confirmatory trial, the choice of sample size will be justified in terms of the power, which focuses on a single analysis, which in turn focuses only on one primary endpoint. This means there should only be one primary endpoint.

However, exceptions to this maxim do occur. In such circumstances the most acceptable statistical methodology is to either, combine the co-primary endpoints through a deterministic function into a single endpoint, or adopt a formal closed-testing procedure that examines a variety of hypotheses in such a way that preserves the overall significance level of the analyses; for example, Bonferonni adjustments of the nominal significance level, or gate-keeping approaches to a pre-specified order of hypothesis tests.

In trials that are focused on learning and hypothesis generation, the preservation of the overall significance level is of lesser importance, however there should be a statistical discussion that reflects awareness of the issues, and the analyses should present confidence intervals rather than p-values.

Identical issues arise if there are:
- more than two treatment groups,
- subset analyses,
- multiple time points,
- multiple methods of analysis,
- sensitivity analyses for missing data.]

`<Enter text>`

---

## 8. Summary of Study Data

[Guidance notes: Specify the method of describing the study data that will be presented in the final study report. This section provides a general overview of the methods. If any of the items require a unique approach that differs from the general overview, then it should be noted in the appropriate section.

Specify:
- How data will be ordered
- How summary tables will be structured (e.g. columns for each treatment and overall in the order: Placebo, Experimental Low Dose, Experimental High Dose, All Subjects, See Table 1)
- Descriptive or summary statistics that will be displayed for continuous data and for categorical data.
- The analysis populations upon which the tables and figures will be based.

**Example text:**

All continuous variables will be summarised using the following descriptive statistics: n (non-missing sample size), mean, standard deviation, median, maximum and minimum. The frequency and percentages (based on the non-missing sample size) of observed levels will be reported for all categorical measures. In general, all data will be listed, sorted by site, treatment and subject, and when appropriate by visit number within subject. All summary tables will be structured with a column for each treatment in the order (Control, Experimental) and will be annotated with the total population size relevant to that table/treatment, including any missing observations.

**Table 1: Treatment Group Label Conventions for TFLs**

| Output ordered by | Label for use in output | Description |
|------------------|------------------------|-------------|
| Treatment group | Placebo | Placebo subjects |
| | ABC1234 5mg | ABC1234 5mg |
| | ABC1234 10mg | ABC1234 10mg |
| | ABC1234 Total | ABC1234 pooled across all active arms |
| | All Subjects | All subjects pooled |

Only deviations from the general overview will be noted in the subsequent sub-sections within section 8. However, all variables to be summarised need to be documented below.]

`<Enter text>`

### 8.1 Subject Disposition

[Guidance notes: This section may include the following outputs:

- Listing and summary of subject disposition (Numbers of subjects belonging to each analysis set defined in Section 7.1)
- Summary of reasons for screen failure (if applicable)
- List of subjects who discontinued
- List of visit dates
- List of subject analysis sets

If there is any ambiguity arising from multiple sources of visit date, document how this will be resolved.

A skeleton CONSORT diagram should be provided in this section that provides an explicit statement of what statistics are to be provided.

If appropriate use standard text: 'The summary statistics will be produced in accordance with section 8.']

`<Enter text>`

### 8.2 Protocol Deviations

[Guidance notes: Protocol deviations can be an intercurrent event (e.g. taking prohibited medication) and/or lead to missing data (e.g. missing a visit within a time window). Define the specific protocol deviations that could affect the interpretation or existence of measurements and thus impact the analysis (e.g. major deviations and a definition of a major deviation) and specify the methods used to describe and analyse them. Clearly define which deviations will exclude data from each of the analysis data sets defined in section 7.1. Handling of protocol deviations.

If appropriate use standard text: 'The summary statistics will be produced in accordance with section 8.']

`<Enter text>`

### 8.3 Demographic and Baseline Variables

[Guidance notes: Identify all variables that will be considered as demographic or baseline variables, recorded at, or shortly, before randomisation or first treatment administration. If transformation of data will occur (e.g. age coarsening into 18-40, 41-65, over 65) then define this exactly in this section. It may be appropriate to summarise these data by centre.

If appropriate use standard text: 'The summary statistics will be produced in accordance with section 8.']

`<Enter text>`

### 8.4 Concurrent Illnesses and Medical Conditions

[Guidance notes: Include a description of which, if any, coding system was used (e.g. MedDRA, WHO drug dictionary). If appropriate use standard text: 'The summary statistics will be produced in accordance with section 8.'

**Example text:**

Adverse events and medical history will be coded using the latest available version of the Medical Dictionary for Regulatory Activities (MedDRA®). Medical history will be listed and summarized for the FAS by treatment group and MedDRA system organ class (SOC) and preferred term (PT).]

`<Enter text>`

### 8.5 Prior and Concomitant Medications

[Guidance notes: The definitions used to distinguish prior and concurrent should be provided. Include a description of which, if any, coding system was used (e.g. MedDRA, WHO drug dictionary).

**Example text:**

Medications will be coded according to the latest available version of the World Health Organization Drug Dictionary (WHODD). Medical procedures will not be coded. Prior and concomitant medications will be listed and summarized for the FAS by treatment group and by WHODD Anatomical Main Group [Level 1], Therapeutic Subgroup [Level 2], preferred term, and reported term. Procedure history will be listed separately by the procedure reported term for the FAS by treatment group. Concomitant medical procedures carried out during the study will be listed for the FAS.

**Prior medication definition**

If a subject takes a medication between the Screening date and before the date of administration of study drug, this medication will be classified as 'prior medication'. With this definition, any medication recorded that has been taken for at least 1 day and has been stopped before the study treatment period will be considered as prior.

**Concomitant medication definition**

Prior medication not stopped before the date of administration of study drug will be classified as 'concomitant medication'. Medication will be labelled as 'concomitant medication' when the start date is between the date (including the date) of administration of study drug and the final study visit or, in case of early termination, on the date of the subject's last visit. With this definition, any medication that has been taken for at least 1 day during the study period will be considered as concomitant.]

`<Enter text>`

### 8.6 Treatment Compliance

[Guidance notes: Examples of the assessment of treatment compliance include: remaining pill count, diary records of medication. Any method for calculating a measure of treatment compliance should be defined clearly here. The variables used to assess treatment compliance should be identified.]

`<Enter text>`

---

## 9. Efficacy Analyses

[Guidance notes: Specify the method of summarising and formally analysing the efficacy data that will be used. This section includes a description of the general methods that will be used repeatedly for different estimands. If any items need to be handled in a different manner then this should be clarified in the appropriate section below.

The following should be specified in this section if it differs to what is described in the 'General Considerations' section.

- Sort order of the data listings
- Grouping of summary table information (e.g. by treatment group and in what order, possibly adding a combined "all subjects" column)
- Summary statistics that will be produced for continuous and categorical data
- Analysis datasets that will be used.

The following details of the statistical analyses should be considered and included as needed. The details should be placed either in section 9, if broadly applicable across most analyses, or in the relevant subsections below.

- The statistical model underlying the analysis including, strata, covariates, baseline values and interaction terms.
- A statement of the clinical objective rephrased in precise statistical terms (null and alternative hypotheses).
- The nature of the hypothesis: descriptive, exploratory or confirmatory.
- The methods used to obtain parameter estimates, confidence intervals and, if required, p-values.
- Methods used to check any assumptions behind the analyses (histograms, box plots) and approaches to be taken if the data do not meet the assumptions.
- The rationale for the choice of statistical procedures.
- The test statistics, the sampling distribution of the test statistic under the null hypothesis, significance level, alternative hypothesis, whether the test is 1- or 2-sided. If a 1-sided test is to be used, provide justification.
- If Bayesian techniques are to be used, specify which prior distributions will be considered, or how the prior(s) will be obtained, with justification.
- Any procedures for removing non-significant covariates from the model or model selection procedures in general.
- Methods for handling longitudinal data or missing data.

**Example text:**

All efficacy variables will be listed by subject within study centre. Data will be summarised by treatment group. N, Mean, Standard Deviation, Minimum and Maximum will summarise continuous efficacy variables, whereas number and percent will summarise categorical efficacy variables.

All analyses of the continuous efficacy variables (e.g. VAS pain score) will be performed as analysis of variance with treatment group adjusting for study centre and surgical category. Treatment groups will be tested at the 2-sided 5% significance level.

All assumptions for regression models will be assessed by viewing plots of the residual values.

All analyses of categorical efficacy measures will be performed using logistic regression with treatment group and adjustments for study centre.

In some cases it may be more appropriate to clarify items that do not conform to the general methods in individual sections below.

All the variables being considered should be mentioned explicitly in the subsections below even if they are mentioned in this section.]

`<Enter text>`

### 9.1 Primary Efficacy Analysis

[Guidance notes: Define the primary analysis that will provide the main result of the trial in this section. Note the use of "analysis" singular. This section of the document should be structured in parallel with 4.2 in terms of the ordering of endpoints considered.]

#### 9.1.1 Main Analytical Approach

[Guidance notes: Describe the primary analysis that will be performed on the primary endpoint/estimand. These should include:

- The analysis dataset used
- Any summary measures
- Analytical approach (e.g. statistical model to be fitted to the data)
- Statistics to be extracted from the analysis (e.g. LS means, standard error and 95% CI)
- Details of strategies to be employed for intercurrent events
- Details of strategies to be employed in the event of missing data
- Any model checking to be performed (e.g. checking of distributional assumptions)]

#### 9.1.2 Sensitivity Analyses

[Guidance notes: Describe any sensitivity analyses to be performed on the primary endpoint/estimand, this could include sensitivity to:

- Distributional assumptions
- Outlying or influential observations
- Assumptions about missing data mechanisms and alternative approaches to dealing with missing data

This section can be removed if not required or may likely lead to a new estimand rather than a sensitivity analysis for the primary estimand.]

#### 9.1.3 Subgroup Analyses

[Guidance notes: Describe any subgroup analyses to be performed on the primary estimand. This section can be removed if not required.]

### 9.2 Secondary Efficacy Analyses

[Guidance notes: Include all secondary efficacy analyses. Consider further subsections for any key secondary estimands in order to define the estimand and analytical approach for each one.]

`<Enter text>`

### 9.3 Exploratory Efficacy Analyses

[Guidance notes: Descriptions of further analyses used for hypothesis generation and exploration should be included here.]

`<Enter text>`

---

## 10. Safety Analyses

[Guidance notes: Specify the methods of describing the safety data that will be used in the final report. This section includes general descriptions of the methods. If any of the items require a unique approach then this should be noted in the appropriate subsection below. The estimand framework may also be applicable to safety objectives.

The following should be specified in this section if it differs to what is described in the 'General Considerations' section.

- Sort order of any listings
- Grouping of summary information (e.g. by preferred terms and treatment group, including an "All Subjects" column)
- Descriptive statistics that will be displayed for continuous data and for categorical data.
- Analysis data sets on which the descriptions will be based.
- How repeat events will be handled when producing summary statistics. For example: "When calculating the incidence of adverse events, or any sub-classification thereof by treatment, time period, severity, etc., each subject will only be counted once and any repetitions will be ignored; the denominator will be the total population size."

Only deviations from the aforementioned analytical and summary approaches will be noted in the subsequent subsections of section 10.

Variables being summarised should be listed in the subsections below.]

`<Enter text>`

### 10.1 Extent of Exposure

[Guidance notes: Provide details of how exposure will be calculated and summarized.

**Example text:**

All study drug administration details (including date and time, interruption, and discontinuations) will be listed. The percent of planned dose administered will be included in the listing and will be calculated as follows:

Percent of Planned Dose Administered = 100 × (Total Volume Delivered (mL) / Total Volume Planned (mL)) %]

`<Enter text>`

### 10.2 Adverse Events

[Guidance notes: It is useful to include an identification of the components of the numerator and denominator that will be used to calculate incidence rates and percentages. For example: "When calculating the incidence of adverse events, or any sub-classification thereof by treatment, time period, severity, etc., each subject will only be counted once and any repetitions of adverse events will be ignored; the denominator will be the total population size."

Be certain to specify those adverse events that will be included in the summary and analysis. For example, treatment emergent adverse events are those events that occur after the baseline assessment, and some definitions also include those adverse events that worsen post-treatment.

It may be appropriate only to report the incidence of specific AEs of interest, in which case document these specific AEs. Or it may be appropriate only to report the incidence of AEs that are judged to be related to the treatment.

**Example text:**

Adverse events will be recorded from the time informed consent is given until study completion or study termination. All AEs will be coded using the latest available version of the Medical Dictionary for Regulatory Activities (MedDRA®) and will be categorized by intensity (mild/moderate/severe) and relationship.

Listings will be presented by treatment group for all AEs, serious adverse events (SAE), AEs leading to death and AEs leading to withdrawal.

A treatment-emergent adverse event (TEAE) is defined as any event not present prior to the administration of study drug or any unresolved event already present before administration of study drug that worsens in intensity following exposure to the treatment. Where dates are missing or partially missing, AEs will be assumed to be treatment-emergent, unless there is clear evidence (through comparison of partial dates, see Section 7.3) to suggest that the AE started prior to dosing.

Summary tables will contain counts of subjects, percentages of subjects in parentheses and the number of events where applicable. A subject who has multiple events in the same SOC and PT will be counted only once in the subject counts but all events will be included. Adverse event summaries will be ordered by alphabetical SOC, and decreasing frequency of PT within SOC, in the active arm overall column.

Summaries of TEAEs will include the following:

- Incidence of AEs - Overview
- Incidence of TEAEs
- Incidence of serious TEAEs
- Incidence of related TEAEs
- Incidence of TEAEs by maximum relationship
- Incidence of TEAEs by maximum intensity

In summaries including relationship to study treatment, the following relationships will be summarized: 'Not related', 'Related'. Subjects who experience the same event multiple times will be included in the most related category. Events with missing relationship will be considered as 'Related' to the last given study product for summary purposes but recorded as missing in the listings.

In summaries including intensity, the following intensity categories will be summarized: 'Mild', 'Moderate', 'Severe'. Subjects who experience the same event multiple times will be included in the most severe category. Events with missing intensity will be considered as 'Severe' events for summary purposes but recorded as missing in the listings.]

`<Enter text>`

### 10.3 Deaths, Serious Adverse Events and other Significant Adverse Events

[Guidance notes: Outline and significant AEs that have been identified in the protocol.]

`<Enter text>`

### 10.4 Pregnancies

[Guidance notes: If the study did not perform any pregnancy tests or pregnancies are impossible, for example if it was limited to male or post-menopausal subjects only, then explain this succinctly. List any data collected]

`<Enter text>`

### 10.5 Clinical Laboratory Evaluations

[Guidance notes: Address the issues of:

- Normal ranges that differ between study centres. Explicitly tabulating the normal ranges when producing the SAP may be useful and timely to ensure the normal ranges have been provided by all centres.
- How to handle duplicate laboratory test within study periods. Normally summaries are only provided over scheduled laboratory tests. Any unscheduled follow-up tests performed for medical or safety concerns, are normally only listed.

Laboratory tests are often summarised using shift tables. Shift tables may show the change in laboratory values from baseline to either each subsequent visit, the final visit, or the most extreme post-baseline value. An alternative may be a figure showing a scatter plot of the baseline value on the horizontal axis versus the subsequent values, as considered above, with different plotting symbols used to distinguish different treatment groups.

Consider plotting figures of key mean laboratory parameters (or change or change from baseline) by treatment group over time.]

`<Enter text>`

### 10.6 Other Safety Measures

[Guidance notes: Vital signs, ECGs, other safety parameters (chest x-ray, physical examination) might be appropriately included in this subsection. Many of the points made regarding laboratory tests in section 10.5 are relevant here.]

**Example text:**

All standard 12-lead ECG recordings should be taken in triplicate. The mean of the triplicate measurements will be reported in the by-subject listings. The listing will also include change from Baseline and percentage change from Baseline (based on the mean of the triplicate measurements at each timepoint) and will be presented by treatment group and timepoint.

Measured values, changes, and percentage changes from Baseline will be summarized by treatment group and timepoint and by ECG variable (mean of the triplicate value). Mean change from Baseline and percentage change from Baseline in QT corrected for heart rate using Fridericia's formula (QTcF) will be summarized and plotted over time by treatment group.

Additional laboratory tests (including serology, urine alcohol, drugs, pregnancy, and tuberculosis) and subjects with physical examination abnormalities will be listed.

`<Enter text>`

---

## 11. Pharmacokinetics

[Guidance notes: Describe pharmacokinetic and pharmacodynamic parameters to be analysed and the approach to the data summaries and analyses. Include pharmacodynamic data in section 11 only if it is not considered as efficacy data included in section 9. If there are no such data collected then this section may be deleted.

If there are a number of variables observed then it may be necessary to generate subsections below. All variables being summarised must be explicitly mentioned.]

`<Enter text>`

---

## 12. Other Analyses

[Guidance notes: Variables that cannot be easily included in the preceding sections should have their own section here. Replace the heading "Other Analyses" with more appropriate text. Some examples of such data are: health economic data, quality of life data, patient satisfaction data.

All the comments from section 8 onwards may be relevant.]

`<Enter text>`

---

## 13. Reporting Conventions

[Guidance notes: Describe reporting conventions, for example the precision used for reporting p-values and other numeric values.]

**Example text:**

When reporting relative frequencies or other percentage values, the following rules apply:

- For values where all subjects fulfil certain criteria, the percentage value will be displayed as 100
- For values where the absolute frequency is 0, there will be no percentage presented at all
- All other percentage displays will use 1 decimal place

When reporting descriptive statistics, the following rules will apply in general:

- n will be an integer
- Mean (arithmetic and geometric) and median will use 1 decimal place more than the original data
- SD will use 2 decimal places more than the original data
- Coefficient of variation and geometric CV (geoCV) will be reported as a percentage to 1 decimal place
- Minimum and maximum will be reported using the same number of decimal places as the original value
- If no subjects have data at a given timepoint, for example, then only n=0 will be presented. However, if n<3, present the n, min and maximum only. If n=3, n, mean, median, minimum and maximum will be presented only. The other descriptive statistics will be left blank

When reporting estimated statistics from inferential tests and models, the following rules will apply in general:

- P-values ≥0.001 will be reported to 3 decimal places; p-values less than 0.001 will be reported as "<0.001".
- Estimated parameters, not on the same scale as raw observations (e.g. regression coefficients) will be reported to 3 significant figures.

`<Enter text>`

---

## 14. Technical Details

[Guidance notes: Include a brief statement of which software package or packages used.]

**Example text:**

Statistical evaluation will be performed by Veramed Limited and supervised by the Statistics Department of CLIENT unless otherwise indicated.

The datasets will follow analysis dataset model (ADaM) data specifications.

All analyses will be performed using SAS version 9.2 or higher (SAS Institute, Cary, NC, USA) or R version 2.10.1 (R Development Core Team) or higher, or WinBUGS version 1.4. The PK NCA will be performed using Pharsight Phoenix® WinNonlin® version 6.2 (or higher).

If re-sampling or simulation analysis methods (e.g. Bayesian, multiple imputation) are being conducted, consider specifying something such as 'the production and quality control (QC) programmers will select different seeds and there is no expectation of an exact match between the production and QC programming. The statistical outputs will be confirmed as having passed QC as long as the differences between production and QC data are within the following tolerance limits: XXXXXX'.

`<Enter text>`

---

## 15. Summary of Changes to the Protocol

[Guidance notes: If the statistical analysis plan proposes changes to the statistical approach described in the protocol then summarise those changes in this section. Analyses are usually faithful to those specified in the protocol, but occasionally different, or supplemental, analyses are needed. Explain the reason for such changes. You may choose to identify those analyses that are not from the protocol in the relevant sections above. However, documenting the changes here greatly aids clarity.

Other important, non-statistical changes to the protocol should also be noted in this section, for example the introduction of an additional treatment group.]

`<Enter text>`

---

## 16. References

[Guidance notes: Provide references for any citations in the main body of the SAP.]

**Example:**

Smith BP, Vandenhende F, DeSante KA, Farid NA, Welch PA, Callaghan JT, et al. Confidence interval criteria for assessment of dose proportionality. Pharm Res. 2000;17:1278-83.

`<Enter text>`

---

## 17. Amendment(s) to the Statistical Analysis Plan

### 17.1 Amendment 1

**Rationale for the amendment**

[Guidance notes: List the main reasons for amending the SAP.]

`<Enter text>`

**Modifications and changes**

**Global changes**

[Guidance notes: List any global changes that have been made throughout. E.g. Subject has been replaced with patient throughout.]

`<Enter text>`

**Specific changes**

**Change #1**

[Guidance notes: Enter text from original version that was replaced. Repeat for each section/paragraph/text that has been updated]

`<Enter text>`

**Has been changed to:**

[Guidance notes: Enter new text.]

`<Enter text>`

---

## 18. Appendix 1: List of Tables, Figures and Listings

[Guidance notes: List all outputs to be created as described in the rest of the SAP above. If multiple deliveries are being made (e.g. interim analysis and final analysis) and not all TFLs will be delivered at each then use the deliverable column to flag which outputs will be delivered when. Similarly, if some TFLs will only be produced if a specific condition is met (e.g. only produce a subgroup table if there is a significant treatment*subgroup interaction in a model) then these should also be flagged in the programming notes.

Use separate sections for each sub section of data e.g. Study population, efficacy, safety, PK, PK/PD etc. Further subsection into type of output.

Use CSR numbering for the TFLs unless otherwise requested by the client.

This section is optional]

**Example text:**

All outputs detailed in the following sections will be produced for the final analysis. The deliverable column indicates the deliverable that each output will be produced for. Note that not all outputs are required for all deliverables.

`<Enter text>`

### 18.1 Study Population

#### 18.1.1 Tables

| Number | Title | Analysis Set | Deliverable | | |
|--------|-------|--------------|---------|-----|-----|
| | | | CSR | Interim | DMC |
| 14.1.1.1 | Summary of Disposition | FAS | X | X | |

---

## Signature Manifest

**Document Number:** FOR-039
**Revision:** 03
**Title:** Statistical Analysis Plan Template
**Effective Date:** 12 Jun 2025

All dates and times are in UK Timezone.

**SOP-SP-003 Development of the Statistical Analysis Plan and TFL Shells**

### Change Request Approval

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Maria Atienza (CARMELLIE.ATIENZA) | QA and Training Administrator | 11 Aug 2023, 12:01:34 PM | Approved |

### Author Approval

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Emiko Kemp (EMIKO.KEMP) | Senior Statistician I | 12 Aug 2024, 09:44:07 AM | Approved |

### Management Approval

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Zainab Walsh (ZAINAB.WALSH) | Director, Statistics (VIP & DMC Teams) | 13 Aug 2024, 08:51:36 AM | Approved |

### Training Checkpoint

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Gabi Russell (GABI.RUSSELL) | QA & Training Administrator | 13 Aug 2024, 09:22:11 AM | Approved |

### QA Approval and Set Dates

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Gabi Russell (GABI.RUSSELL) | QA & Training Administrator | 13 Aug 2024, 09:22:38 AM | Approved |

### Quick Approval

| Name/Signature | Title | Date | Meaning/Reason |
|---------------|-------|------|----------------|
| Gabriella Russell (GABI.RUSSELL) | Senior QA & Compliance Administrator | 02 May 2025, 08:46:01 AM | Approved |
| Gabriella Russell (GABI.RUSSELL) | Senior QA & Compliance Administrator | 12 Jun 2025, 12:27:51 PM | Approved |
