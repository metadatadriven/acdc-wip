# Statistical Analysis Plan

## Safety Analysis

This example illustrates an analysis dataset (ADLBHY) that supports an analysis of laboratory data based on Hy's Law criteria, i.e., an analysis of certain liver function parameters used collectively to ascertain the extent of drug induced liver injury.

Various analysis approaches might be used, including (but not limited to) simple statistical summaries of the data, shift tables, and Cochran-Mantel-Haenszel (CMH) tests.  

The analysis approach used in this example is for illustration purposes only; it is not meant to imply a standard or requirement. Subjects received either Drug XYZ or Placebo and had laboratory assessments performed at each visit.  Subjects are then assessed at each time point as to  whether or not they met Hy’s Law criteria (based on lab values from the same blood sample, i.e., not across visits).  The SAP specified that shifts from baseline (met criteria, did not meet criteria) are to be provided.  CMH tests, stratifying by status at baseline, are to be performed to compare the two treatment groups.  

Two variations of a modified Hy’s Law criteria are to be analyzed.  The first considered subjects with transaminase (alanine transaminase [ALT] or aspartate transaminase [AST]) elevations of greater than 1.5 times upper limit of normal (ULN) as meeting the criteria.  The second further narrowed the assessment of abnormality to require total bilirubin elevations to be greater than 1.5 times ULN in addition to transaminase elevations of greater than 1.5 times ULN.

The following data display (Table XXX) illustrates the Shift table and CMH analysis performed using ADLBHY as described above.  The shift table summarizes whether or not a subject’s status changed from baseline during the treatment period for changes based on threshold ranges and changes based on Hy’s Law and Modified Hy's Law.  Comparisons between Placebo and Treatment are illustrated by CMH test at each visit. 

## List of Planned Displays

### Table 2.8.3.1 Illustration of Analysis Display Layout for Categorical Analysis of Subjects Meeting Hy's Law Criteria Example^33
```
                                                                      Summary E.8
                                                     Shifts of Hy's Law Values During Treatment
                                                              (Safety Population)

                                                                             Placebo                                      Drug XYZ
                                                                             (N=xxx)                                      (N=xxx)

                                                                     Normal at       Met Criteria        Normal at       Met Criteria
  Modified Hy's Law Criteria                            Visit       Shift [1]       Baseline           at Baseline      Baseline        at Baseline     p-value [2]

  Elevated Transminase [3]                             Week 2       n               xxx                xxx              xxx             xxx             x.xxx
                                                                    Normal          xxx (x.x%)         xxx (x.x%)       xxx (x.x%)      xxx (x.x%)
                                                                    Met Criteria    xxx (x.x%)         xxx (x.x%)       xxx (x.x%)      xxx (x.x%)

  Elevated Transminase and Elevated Bilirubin [4]                  n               xxx                xxx              xxx             xxx             x.xxx
                                                                    Normal          xxx (x.x%)         xxx (x.x%)       xxx (x.x%)      xxx (x.x%)
                                                                    Met Criteria    xxx (x.x%)         xxx (x.x%)       xxx (x.x%)      xxx (x.x%)

                                                       Etc.

Footnotes:
  N=Safety Population
  Only subjects with baseline results are included in the summary.
  [1] A change will be considered shifting from normal at baseline to met criteria or from met criteria at baseline to normal at each visit during the treatment.
  [2] CMH test for general association.
  [3] Transaminase 1.5 x ULN (i.e., ALT or AST)
  [4] Transaminase 1.5 x ULN (i.e., ALT or AST) and Total Bili 1.5 x ULN
```
