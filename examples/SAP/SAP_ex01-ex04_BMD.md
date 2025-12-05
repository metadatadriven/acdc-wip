# Statistical Analysis Plan

This is an excerpt from the CDISC ADaM Examples 1.0 document. This document contains Example 1, 2, 3 and 4 which are examples of Primary, Secondary and Ad-Hoc analyses for the same clinical trial.

## Primary Analysis

### Section 2.1 Example 1 

The study measured lumbar spine bone mineral density (BMD) at baseline and then every 6 months for 3 years, with the goal of assessing the difference in effect between two treatments – Drug ABC and Placebo.  Factors (i.e., machine type and subject’s bone mineral density at baseline) that may influence the response are included in the model and the dataset.  The response variable is the percent change from baseline in bone mineral density, with an increasing BMD indicating a positive effect.  The source datasets (immediate predecessors) for the analysis dataset in this example are assumed to be ADSL and an SDTM domain containing the bone measurements, represented as “XX”  in the example.  Missing data are imputed using last observation carried forward (LOCF).   

The display Table 2.1.3.1 illustrates an ANCOVA analysis performed using ADBMD as described above.   As described in the protocol and the SAP, the primary efficacy analysis endpoint is the percent change from baseline at Month 24 in the Bone Mineral Density (BMD) at the Lumbar Spine.  The analysis is conducted  using the Intent-to-Treat (ITT) population, with LOCF imputation for any missing values at Month 24.  As the primary efficacy analysis method, an ANCOVA model is used, with planned treatment (as a categorical variable), baseline BMD value, machine type, and baseline BMD value by machine type interaction included as independent variables, and the percent change from baseline as the dependent variable.  The adjusted least squares (LS) means and 95% confidence interval are presented. 

### Section 2.4 Example 4

Another common analysis technique is to simply describe the data using summary statistics.  Examples of descriptive statistics for a continuous endpoint are mean, standard deviation, median, and range.  Examples of descriptive statistics for a categorical endpoint are count and percentage.  The BDS supports the majority of analyses based on descriptive as well as inferential statistics.   

The analysis illustrated in Table 2.4.1.1 is a summary analysis presenting the mean, standard deviation, median, and range for the Lumbar Spine BMD for each treatment group at each scheduled time point.  

In addition, a boxplot (Figure 2.4.1.1) showing the distribution of the Lumbar Spine BMD at Month 36 is presented.  

These analyses use the ITT population, with no imputation for missing values at any time point.   This descriptive statistics example uses the analysis dataset described in Example 1 (i.e., ADBMD, see Section 2.1.1), illustrating how the same analysis dataset can be used for multiple analyses, including simple summary statistics and graphical displays.

## Secondary Analysis

### Section 2.2 Example 2

As described in the SAP, a secondary efficacy analysis of the BMD at the Lumbar Spine endpoint is a comparison of the percentage in each treatment group of the number of subjects with non-missing percent change data at Month 36 who had >3% change in BMD from Baseline.  Fisher’s exact test is used to compare the proportions between the two treatment groups using the ITT population, with no imputation for missing values, i.e., observed case (OC) data.     
This categorical analysis example (Table 2.2.1.1) uses the analysis dataset described in the Primary Analysis (i.e., ADBMD, see Section 2.1.1), illustrating how the same analysis dataset can be used for multiple analyses

## Ad-Hoc Analysis

### Section 2.3 Example 3

The analysis described in this example is an ad hoc analysis.  The likelihood based repeated measures analysis of BMD change from baseline at Month 24 uses windowed values with no imputation for missing values (i.e., data as observed) from the ITT population.
This repeated measures analysis example uses the analysis dataset described in Example 1 (i.e., ADBMD, see Section 2.1.1), illustrating how the same analysis dataset can be used for multiple analyses. 


## List of Displays

### Table 2.1.3.1 Illustration of Analysis Display Layout for ANCOVA Example
```
                                Summary E.1
 
      Lumbar Spine Bone Mineral Density Percent Change From Baseline at Month 24
                (ITT Population, LOCF Data, ANCOVA Model)

                           % Change From Baseline      Treatment Difference 
                                                        (Drug ABC - Placebo)
  |                    -----------------------------  --------------------------+
                    n    LS Mean[a]   95% CI[a]       LS Mean[a]   95% CI[a]     p-value[a]
  Drug ABC (N=xxx)  xxx    x.x      (x.x, x.x)
  Placebo (N=xxx)   xxx    x.x      (x.x, x.x)        x.x       (x.x, x.x)     x.xxxx
 
 Footnotes:
  N = ITT population, n = number of subjects with non-missing percent change from baseline at month 24
  CI = Confidence interval
  LS = Least squares
  [a]Based on ANCOVA model adjusting for planned treatment, baseline BMD value, machine type, and baseline BMD value by machine type interaction.

```

### Table 2.2.1.1 Illustration of Analysis Display Layout for Categorical Analysis Example
```

                                  Summary E.2
          Subjects with >3% Change from Baseline in Lumbar Spine Bone Mineral Density at Month 36
                                  (ITT Population, OC Data)

                                                      Drug ABC        Placebo
                                                      (N=xxx)         (N=xxx)
  Subjects completing Month 36                        xxx             xxx
  Subjects with >3% change from baseline             xxx (xx.x%)     xxx (xx.x%)
  P-value [1]                                                         x.xxxx

Footnotes:
  N=ITT population
  OC Data are data as observed (i.e., no imputation for missing values)
  Subjects with missing BMD data at Month 36 are excluded from the analysis.
  [1] p-value computed using Fisher's Exact Test.
```


### Table 2.3.1.1 Illustration of Analysis Display Layout for Repeated Measures Analysis Example

```
                                  Summary E.3
          Lumbar Spine Bone Mineral Density Percent Change From Baseline to Month 24
                      (ITT Population, OC Data, Repeated Measures Analysis)

                          % Change From Baseline          Treatment Difference (Drug ABC - Placebo)
                          LS Mean^a       95% CI^a        LS Mean^a       95% CI^a        p-value^a
  Drug ABC (N = xxx)      x.x             (x.x, x.x)      x.x             (x.x, x.x)      x.xxxx
  Placebo (N = xxx)       x.x             (x.x, x.x)      x.x             (x.x, x.x)      x.xxxx

Footnotes:
  N = ITT population
  OC Data = Observed Cases Data (i.e., data as observed with no imputation for missing values)
  LS = Least squares
  ^a Based on mixed-effects model repeated measures analysis, adjusting for planned treatment, time
  and treatment by
  time interaction, baseline BMD value, and baseline BMD value by time interaction.
```

### Table 2.4.1.1 Illustration of Analysis Display Layout for Descriptive Statistics Example
```

                                  Summary E.4
              Summary of Lumbar Spine Bone Mineral Density (g/cm^2) Over Time
                              (ITT Population, OC Data)

                                          Drug ABC            Placebo
                                          (N=xxx)             (N=xxx)
  Baseline
    n                                     xxx                 xxx
    Mean (SD)                             x.xxxx (x.xxxxx)    x.xxxx (x.xxxxx)
    Median                                x.xxxx              x.xxxx
    Min                                   x.xxx               x.xxx
    Max                                   x.xxx               x.xxx

  Month 6
    n                                     xxx                 xxx
    Mean (SD)                             x.xxxx (x.xxxxx)    x.xxxx (x.xxxxx)
    Median                                x.xxxx              x.xxxx
    Min                                   x.xxx               x.xxx
    Max                                   x.xxx               x.xxx

  etc....

Footnotes:
  N=ITT population
  OC Data are data as observed (i.e., no imputation for missing values)
```

### Figure 2.4.1.1 Illustration of Analysis Display Graph for Descriptive Statistics Example 
```
                            Figure E.4.1
        Boxplot of Lumbar Spine Bone Mineral Density at Month 36
                      (ITT Population, OC Data)

DXA BMD at Lumbar Spine [g/cm^2]
       |
  1.05 +                    -----------
       |                         |
       |                    +---------+
  1.00 +                    |    -    |
       |                    |         |
       |                    +---------+
  0.95 +                        |
       |                        |
       |                    -----------
  0.90 +                                              -----------
       |                                                  |
       |                                                  |
  0.85 +                                              -----------
       |                                              |         |
       |                                              |    -    |
  0.80 +                                              |         |
       |                                              -----------
       |                                                  |
  0.75 +                                              -----------
       |
       +---------------------------+---------------------------+
                    Drug ABC                    Placebo
                                Treatment
```
