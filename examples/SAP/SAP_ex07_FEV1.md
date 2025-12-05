# Statistical Analysis Plan

This document is an extract taken from page 34 of the [ADaM Examples](../docs/adam_examples_final.pdf) source document, Example 7

This example illustrates a randomized, double-blinded, placebo controlled, 4-way crossover design study using a mixed effect model.   

## Primary Analysis

The primary criterion for evaluation is the measurement of forced expiratory volume in one second (FEV1) obtained during pulmonary function testing (PFT).  FEV1 measurements are collected from 1 hour pre-dose to 23 hours 50 minutes post-dose. 

The co-primary efficacy endpoints are the FEV1 AUC(0-12) response and AUC(12-24) response after 6 weeks of treatment.  FEV1 AUC is defined as the area under the FEV1 curve (AUC) normalized for time.  It is calculated from zero time to 12 h [FEV1 AUC(0-12)] and from 12 h to 24 h [FEV1 AUC(12-24)], respectively, using the trapezoidal rule divided by the corresponding duration (i.e., 12 h) to give the results in liters. This study includes 4 periods with three 14 day wash-out periods.  

In addition, both study and period baselines are defined to allow for sensitivity analyses.  The "study" baseline is defined as the average of two FEV1 measurements (i.e., -1 hour and -10 minute) prior to treatment at Visit 2 and to the administration of the morning dose of randomized treatment.  The "Period" baselines are defined as the average of the two FEV1 measurements (i.e., -1 hour and -10 minute) at each treatment period (i.e., Visits 2, 5, 8 and 11), prior to administration of the morning dose of randomized treatment.  Table 2.7.1 describes the visit schedule, periods, planned study day and calculated relative study day that are used to derive the Study and Period baselines.

This trial includes two efficacy endpoints.  The efficacy endpoints are the FEV1 AUC(0-12) response and AUC(12-24) response after 6 weeks of treatment

### Table 2.7.1 Trial Diagram of Visit Schedule and Baseline Derivations
```
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |       |        | Baseline Relative to Study Start                             | Baseline Relative to Period Start                            |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  | Visit | Period | Planned study day       | Calculation of relative study day  | Planned study day       | Calculation of relative study day  |
  |       |        | for trial period        | for trial period                   | for each period         | for each period                    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |   2   |   1    |           1             |               1                    |           1             |               1                    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |   4   |   1    |          43             | Visit 4 date - Visit 2 date + 1    |          43             | Visit 4 date - Visit 2 date + 1    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |                                                           14 Day Washout period                                                              |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |   5   |   2    |          57             | Visit 5 date - Visit 2 date + 1    |           1             |               1                    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |   7   |   2    |          99             | Visit 7 date - Visit 2 date + 1    |          43             | Visit 7 date - Visit 5 date + 1    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |                                                           14 Day Washout period                                             |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |   8   |   3    |         113             | Visit 8 date - Visit 2 date + 1    |           1             |               1                    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |  10   |   3    |         155             | Visit 10 date - Visit 2 date + 1   |          43             | Visit 10 date - Visit 8 date + 1   |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |                                                           14 Day Washout period                                                              |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |  11   |   4    |         169             | Visit 11 date - Visit 2 date + 1   |           1             |               1                    |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
  |  13   |   4    |         211             | Visit 13 date - Visit 2 date + 1   |          43             | Visit 13 date - Visit 11 date + 1  |
  +-------+--------+-------------------------+------------------------------------+-------------------------+------------------------------------+
```

## List of Planned Displays

### Table 2.7.4.1 Illustration of Analysis Display Layout for Repeated Measures Analysis of Crossover Example
```
                                                      Summary E.7
        FEV1 AUC(0-12) and AUC(12-24) Adjusted Mean (SE) Responses and Comparisons to Placebo After 6 weeks Treatment
                                          (FAS Population, Repeated Measures Analysis)

  Time                              Treatment                                        Difference
  Interval    Treatment       N     Mean (SE)         Mean (SE)         p-value     95% C.I.
  0-12 hr     Placebo        xxx    x.xxx (x.xxx)
              Drug A         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)
              Drug B         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)
              Drug C         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)

  12-24 hr    Placebo        xxx    x.xxx (x.xxx)
              Drug A         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)
              Drug B         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)
              Drug C         xxx    x.xxx (x.xxx)     x.xxx (x.xxx)     x.xxxx      (x.xxx,x.xxx)

Footnotes:
  N= FAS (full analysis set) population
  Based on a mixed effects repeated measures model with terms for site, subject within site,
  treatment and period
  Response is defined as change from baseline; Common Baseline Mean (SE) = x.xxx (x.xxx)
```
