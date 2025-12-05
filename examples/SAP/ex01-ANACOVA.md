# Example 1: Statistical Analysis Plan

This is an excerpt from the CDISC ADaM Examples 1.0 document. This is Example 1

## Statistical Analysis

The study measured lumbar spine bone mineral density (BMD) at baseline and then every 6 months for 3 years, with the goal of assessing the difference in effect between two treatments – Drug ABC and Placebo.  Factors (i.e., machine type and subject’s bone mineral density at baseline) that may influence the response are included in the model and the dataset.  The response variable is the percent change from baseline in bone mineral density, with an increasing BMD indicating a positive effect.  The source datasets (immediate predecessors) for the analysis dataset in this example are assumed to be ADSL and an SDTM domain containing the bone measurements, represented as “XX”  in the example.  Missing data are imputed using last observation carried forward (LOCF).   

## Analysis Results

The following data display illustrates an ANCOVA analysis performed using ADBMD as described above.   As described in the protocol and the SAP, the primary efficacy analysis endpoint is the percent change from baseline at Month 24 in the Bone Mineral Density (BMD) at the Lumbar Spine.  The analysis is conducted  using the Intent-to-Treat (ITT) population, with LOCF imputation for any missing values at Month 24.  As the primary efficacy analysis method, an ANCOVA model is used, with planned treatment (as a categorical variable), baseline BMD value, machine type, and baseline BMD value by machine type interaction included as independent variables, and the percent change from baseline as the dependent variable.  The adjusted least squares (LS) means and 95% confidence interval are presented. 

```
  Table 2.1.3.1 Illustration of Analysis Display Layout for ANCOVA Example[4]

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


