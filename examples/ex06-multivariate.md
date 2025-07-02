# Example 6: Multivariate Analysis of Variance

The Analysis Derivation and Analysis Results sections of this document are taken from page 34 of the [ADaM Examples](../docs/adam_examples_final.pdf) source document.

The second half of this document describes how this example can be modelled using [Statistical Data and Metadata eXchange](https://sdmx.org/) (SDMX)

## Analysis Derivation

This example illustrates an analysis dataset (ADMOOD) that contains subscale scores as well as a total score assessing mood.

The analysis to be performed will produce estimates of treatment effect for each subscale as well as an assessment of overall treatment effect (i.e., a test of the main effect of study drug on the combined subscales).

This example illustrates analysis results metadata for specific items on a summary table.

In the following example, mood is measured using a total mood disturbance score and six subscale scores. The instrument used is the Profile of Mood States (POMS) Assessment form which contains 65 items rated on a 5-point Likert scale where 
- 0=Not at all, 
- 1=a little, 
- 2=moderately, 
- 3=quite a bit, and 
- 4=extremely. 

The six subscales that make up the factor analysis are as follows:
- tension-anxiety (9 items with total score ranging from 0 to 36), 
- depression (15 items with total score ranging from 0 to 60), 
- anger-hostility (12 items with total score ranging from 0 to 48), 
- vigor-activity (8 items with total score ranging from 0 to 32), 
- fatigue (7 items with total score ranging from 0 to 28), and 
- confusion-bewilderment (7 items with total score ranging from 0 to 28). 

The total mood disturbance score ranging from 0 to 200 is calculated by adding up tension-anxiety, depression, anger-hostility, fatigue, and confusion-bewilderment subscale scores and subtracting the vigor subscale score. 

The analyses performed are based on the subscale and total scores, not on the individual item scores.

## Analysis Results

In Table 2.6.3.1, the mean change from baseline for each subscale is displayed. The p-value reflects a test for overall treatment effect (i.e., a test of the effect of study drug on the combined subscales).
```
Table 2.6.3.1
Multivariate Analysis of Variance Testing the Hypothesis of No Overall Treatment Effect at Week 6
                                        (ITT Population)

                                                                          Placebo      Drug ZZZ
  Week 6 Change from Baseline Effect Estimate (SE) [1]                   (N=xxx)      (N=xxx)
  ═══════════════════════════════════════════════════════════════════════════════════════════
  Tension/Anxiety Total Score                                          x.xx (x.xx)  x.xx (x.xx)
  Depression/Rejection Total Score                                     x.xx (x.xx)  x.xx (x.xx)
  Anger/Hostility Total Score                                          x.xx (x.xx)  x.xx (x.xx)
  Vigor/Activity Total Score                                           x.xx (x.xx)  x.xx (x.xx)
  Fatigue/Inertia Total Score                                          x.xx (x.xx)  x.xx (x.xx)
  Confusion/Bewilderment Total Score                                   x.xx (x.xx)  x.xx (x.xx)

  Test for Overall Treatment Effect [2]
      Wilks' Lambda                                                                       x.xx
      p-value                                                                           x.xxxx
  ═══════════════════════════════════════════════════════════════════════════════════════════

                                                                                 Page 1 of 1

  N=ITT Population
  [1] Mixed Model Repeated Measures Analysis
  [2] Wilks' Lambda multivariate test of treatment effect, with the six mood subscale scores as the dependent
      variables in the model and treatment the only independent variable.
```

# SDMX Modelling

Modelling the analysis using SDMX is split into two parts - first we define the informational model foundational parts - Concepts, Codelists and Data Formats, and second we define the structure (Dimensions, Measures and Attributes) with reference to the Concepts, Codelists and Formats.

## Concepts

- Multivariate Variance (codelist STATO:MANOVA)
- Profile of Mood (codelist SNOWMED-CT:POMS)
- Profile of Mood Subscale (codelist POMS-Subscale)
- Subscale score (format Integer)
- Total score (format Total_score)

## Codelists
- Likert scale [0,4]
- Visit [Baseline, Week6]
- STATO [MANOVA]
- SNOWMED-CT [POMS]
- CDISC-CT [Likert]
- POMS-Subscale [
    - tension-anxiety
    - depression
    - anger-hostility
    - vigor-activity
    - fatigue
    - confusion-bewilderment
    ]

## Data Formats
- Integer
- total_score [Range -32,200]

## Dimenstions

- Subject
- Scale
- Visit
- Measure

## Measures

- Score
- Change from Baseline

## Attributes

- Treatment
- Population