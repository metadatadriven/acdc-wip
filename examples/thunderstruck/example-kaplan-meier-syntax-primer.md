# TL;DR: Reading the Thunderstruck KM Proposal as a Statistician

**Companion to:** [example-kaplan-meier.md](example-kaplan-meier.md) (the proposal)
and [example-kaplan-meier.tsk](example-kaplan-meier.tsk) (the code)
**Audience:** you know survival analysis; you have never seen Thunderstruck.
**Goal:** in ~5 minutes, enough of the language to review the proposal on its merits.

---

## The one idea to hold onto

**Everything is a cube, and a cube is just a tidy dataset with typed columns.**

If you think in `data.frame`s / tibbles, you already understand cubes. The only
new habit is that each column has a declared *role*:

| Cube role      | What it is                                    | ADaM / R analogy                    |
|----------------|-----------------------------------------------|-------------------------------------|
| **dimension**  | identifies/indexes a row                       | key columns: `USUBJID`, `TRT01P`, visit |
| **measure**    | the numbers you analyse                        | `AVAL`, `CNSR`, `CHG`               |
| **attribute**  | flags/labels that qualify a row                | `ITTFL`, `SAFFL`, `PARAM`           |

That's it. A cube declares its columns once; everything else in the language
reads from or writes to cubes.

---

## The vocabulary map

Read the left column in your head; the right column is what it's called here.

| You already know…                          | Thunderstruck construct | In the KM example              |
|--------------------------------------------|-------------------------|--------------------------------|
| A dataset / `data.frame`                    | **`cube`**              | `ADTTE`, `KMEstimates`         |
| The clinical *meaning* of a variable        | **`concept`**           | `OverallSurvival`, `SurvivalTime` |
| `subset()` / filtering to an analysis set   | **`slice`**             | `OS_ITT` (OS param, ITT pop.)  |
| `survfit()` — the KM estimator              | **`method`** *(proposed)* | `OSCurve`                    |
| `survdiff()` — the log-rank test            | **`test`** *(proposed)* | `OSLogRank`                    |
| `coxph()` / `lm()` / `glm()` — a regression | **`model`**             | `OSCox`                        |
| `summarise()` / `PROC MEANS`                | **`aggregate`**         | `MedianSurvival`               |
| A table or figure in the TLFs               | **`display`**           | `Figure 14.2.1`                |

If you can read a survival script — fit a curve, test the difference, estimate a
hazard ratio, plot it — you can read the proposal. It is the same five steps.

---

## The five steps, in the proposed syntax

Each block below is the whole idea. Don't worry about punctuation; read them like
function calls with named arguments.

**1. Pick your analysis population** (a `slice` = a filter):

```thunderstruck
slice OS_ITT from ADTTE {
    fix:  { PARAMCD: "OS", ITTFL: "Y" },   // OS parameter, ITT population
    vary: [USUBJID, TRT01P],                // one row per subject per arm
    measures: [AVAL, CNSR]                  // carry time + censoring flag
}
```
R equivalent: `adtte %>% filter(PARAMCD=="OS", ITTFL=="Y")`.

**2. Estimate the KM curve** (a `method` = a named estimator):

```thunderstruck
method OSCurve estimate KaplanMeierEstimator {
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { curve: KMEstimates, median: MedianSurvivalResult }
}
```
R equivalent: `survfit(Surv(AVAL, 1-CNSR) ~ TRT01P, data = os_itt)`.
The `produces:` line is the important bit — it *names* the outputs so you can use
them later.

**3. Test the difference** (a `test`):

```thunderstruck
test OSLogRank logrank {
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { result: OSLogRankResult }
}
```
R equivalent: `survdiff(Surv(AVAL, 1-CNSR) ~ TRT01P, data = os_itt)`.

**4. Estimate the hazard ratio** (a `model` = a regression):

```thunderstruck
model OSCox {
    input: OS_ITT,
    formula: Surv(AVAL, CNSR) ~ TRT01P,
    family: CoxPH, ties: Efron,
    output: OSHazardRatio { estimand: HazardRatio, reference: "PLACEBO", confidence: 0.95 }
}
```
R equivalent: `coxph(Surv(AVAL, 1-CNSR) ~ TRT01P, data = os_itt, ties = "efron")`.
`formula:` is ordinary Wilkinson notation — the same `~` you write in R.

**5. Plot it** (a `display`), pulling the three results together:

```thunderstruck
display figure "Figure 14.2.1" {
    source: OSCurve.curve,                    // the estimated curve
    xAxis: ADT, yAxis: SURVPROB, groupBy: TRT01P,
    aesthetics: { plotType: "step", confidenceBand: "true", atRiskTable: "true" },
    annotations: [OSLogRank.result, OSCox.output]   // p-value + HR on the plot
}
```
R equivalent: a `ggsurvfit()` plot annotated with the log-rank p and the Cox HR.

---

## The one convention that isn't obvious

`OSCurve.curve`, `OSLogRank.result`, `OSCox.output` are **dotted references**:
"the output named *curve* produced by the method named *OSCurve*." This is how the
figure in step 5 reuses the results from steps 2-4 without recomputing them. In R
you'd juggle these as separate objects (`fit`, `sd`, `cox`); here each result has
a stable name attached to the analysis that produced it.

---

## What's real vs. what's proposed

- **Already implemented today:** `cube`, `concept`, `slice`, `model` (for standard
  GLMs), `aggregate`, `display`.
- **Proposed in this package (not yet built):** the `method` and `test` blocks,
  the survival families (`CoxPH`, Weibull, …) and `output { estimand … }` on
  `model`, and the `annotations:` on `display`.

The proposal exists because survival analysis has three "methods with structured
results" — KM estimator, log-rank test, Cox HR — and today the language can only
express regressions cleanly. The full argument, stage by stage, is in
[example-kaplan-meier.md](example-kaplan-meier.md).

---

## Reviewer's 60-second checklist

When you read the proposal, the questions worth your statistical eye are:

- Do the **role inputs** (`time`, `censor`, `strata`) capture everything a real KM
  / log-rank / Cox call needs? (Left-truncation? Competing risks? Weights?)
- Is putting Cox under `model` (a regression) but KM under `method` (an estimator)
  the right cut, or an arbitrary one?
- Are the **named outputs** (`curve`, `median`, `result`, hazard ratio) the right
  deliverables, and is a "result cube" a sensible container for a scalar like an HR?
- Would this let you express *your* standard survival analyses without dropping to
  free-text?

Those are the open questions listed at the end of the proposal — your feedback on
them is exactly what's wanted.
