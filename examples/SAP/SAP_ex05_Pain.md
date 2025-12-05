# Statistical Analysis Plan

This is an excerpt from the CDISC ADaM Examples 1.0 document. This document contains Example 5 which is an example Primary Analysis.

## Primary Analysis

This example illustrates an analysis dataset (ADPAIN) that supports a logistic regression including covariates.  

Included in this example is an illustration of the use of the analysis criterion and criterion evaluation result variables CRITy and CRITyFL, and one way they can be used in supporting a categorical analysis.  

The study assessed the effect of study drug during a single pain attack.  The study measured pain severity (on a scale of 0=no pain to 3=severe pain) at baseline (immediately prior to taking a single dose of randomized study drug) and then every 30 minutes for 2 hours, with the goal of assessing the difference in effect between two treatments – Placebo and Drug XYZ.  Factors that might influence the response include age, sex, and the subject’s pain level at baseline; therefore they are included as terms in the model and as variables in the analysis dataset.  The response variable is whether or not the subject achieved pain relief at 2 hours post-baseline.  

Pain relief is defined as a reduction in pain from moderate or severe at baseline (i.e., pain severity of at least 2) to mild or no pain (i.e., pain severity of no more than 1) at the specified time, with no use of rescue medication from baseline up to the specified time point.  The source datasets (immediate predecessors) for the analysis dataset in this example are assumed to be ADSL and an SDTM domain (represented as “XX” in the example) containing the subject’s responses to questions regarding pain severity and rescue medication usage (Yes or No) at each time point.  Missing data are imputed using LOCF.

The following data display (Table 2.5.3.1) illustrates the logistic regression analysis performed using ADPAIN as described above.   As described in the protocol and the SAP, the primary efficacy endpoint is the percentage of subjects with pain relief at 2 hours.  A logistic regression analysis is used to compare this percentage between the Drug XYZ and placebo treatment groups.  The logistic regression model includes planned treatment, age, sex, and baseline pain severity as independent variables and  whether or not the subject achieved pain relief at 2 hours as the response variable.  A subject is defined to have obtained pain relief if their baseline pain is moderate or severe (i.e., pain severity of at least 2) and the pain at the specified time point is mild or none (i.e., pain severity of no more than 1).  The odds ratio and 95% confidence interval are presented. 

## List of Planned Displays

### Table 2.5.3.1 Illustration of Analysis Display Layout for Logistic Regression Analysis Example
```
                              Summary E.5
                          Pain Relief at 2 Hours
                    (ITT Population, LOGISTIC Model)

                                      Placebo         Drug XYZ
                                      (N=xxx)         (N=xxx)
  Number (%) with pain relief        xx (xx.x%)      xx (xx.x%)
  Odds ratio                                          x.xx
  95% CI of odds ratio                                (x.xx,x.xx)
  p-value                                             x.xxxx

Footnotes:
  N=ITT population
  Note: Analysis is based on a logistic regression model adjusting for treatment, age, sex,
  and baseline pain severity.
```

