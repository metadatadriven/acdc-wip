# Walkthrough: A Kaplan-Meier Analysis, and the Syntax It Asks For

**Companion to:** [example-kaplan-meier.tsk](example-kaplan-meier.tsk)
**Status:** Proposal / discussion — the syntax in the "Proposed" blocks is **not yet
implemented** in the grammar
**Relates to:** model refinement work in [../../model/](../../model/) and
[GitHub issue #27](https://github.com/metadatadriven/acdc-wip/issues/27)

**Companion documents:**
- New to Thunderstruck? Start with the
  [statistician's TL;DR](example-kaplan-meier-syntax-primer.md).
- Defining reusable methods? See
  [Cubes and Methods](example-kaplan-meier-cubes-and-methods.md).

---

## Why this document exists

[example-kaplan-meier.tsk](example-kaplan-meier.tsk) is a complete, parseable
time-to-event analysis written in **today's** Thunderstruck grammar. Writing it
surfaced the exact places where the language runs out of vocabulary for survival
analysis — the same "known limitations" listed in the
[examples README](README.md#known-limitations):

1. **Statistical methods** — inconsistent representation of method inputs/outputs
2. **Derivations** — unclear line between a derived *cube* and a computed *measure*
3. **Method chaining** — no clean way to compose several statistical operations
4. **Result association** — difficulty linking a method's results back to its source

This walkthrough steps through the KM analysis one stage at a time. At each stage
it shows **what you write today**, **where that falls short**, and **the proposed
syntax** that would close the gap. The goal is a concrete, grammar-level proposal
that can be argued with — not a finished spec.

The clinical scenario is unchanged from the `.tsk` file: an oncology study,
primary endpoint Overall Survival (OS), two arms, ITT population. We want the
per-arm KM survival curve, a log-rank test, a Cox hazard ratio, and a median
survival summary — the standard TTE output package.

---

## The shape of the analysis

Every survival analysis is the same pipeline. Keep this picture in mind; the
proposal is really just "give each box a first-class name."

```
  OverallSurvival concept
      |
  ADTTE cube  (AVAL = time, CNSR = censor)
      |
  OS_ITT slice  (population: PARAMCD=OS, ITTFL=Y)
      |
      +--> Kaplan-Meier estimator ---> survival curve  ---> KM figure
      +--> Log-rank test           ---> p-value
      +--> Cox PH model            ---> hazard ratio + 95% CI
      +--> descriptive summary     ---> N, events, median
```

Three of those four branches are *statistical methods with structured results*.
Today the grammar has a first-class construct for none of them.

---

## Stage 1 — Concepts and structures (these already work)

The bottom two layers need **no** new syntax. The concept layer already lets us
name Overall Survival, the censoring convention, and — crucially — the
**Kaplan-Meier estimator itself** as a `DerivationConcept`:

```thunderstruck
concept KaplanMeierEstimator "Kaplan-Meier Estimator" type_of DerivationConcept {
    namespace: CDISC.Glossary,
    category: Efficacy,
    definition: "Non-parametric product-limit estimator of the survival function..."
}
```

And the ADTTE input cube binds its columns back to those concepts with `is_a`:

```thunderstruck
measures: [
    AVAL: Numeric is_a SurvivalTime,
    CNSR: Flag    is_a CensoringStatus
]
```

That `is_a` binding is the hook the new method syntax will lean on: a method can
*require* that its time input `is_a SurvivalTime`, giving us type-safe methods for
free. So the proposal deliberately builds on the existing concept layer rather
than replacing anything.

---

## Stage 2 — Estimate the survival curve

### What you write today

The KM estimation is forced into a `model` block, because that is the only
construct that takes a `Surv(...)` response:

```thunderstruck
model KaplanMeier "Kaplan-Meier estimate of OS by arm" {
    input: OS_ITT,
    formula: Surv(AVAL, CNSR) ~ TRT01P,
    output: KMEstimates
}
```

### Where it falls short

- `model` is built for **regression** (`formula`, `family`, `link`, `random`).
  Kaplan-Meier is not a regression — there is no link function, and the
  `ModelFamily` enum (`Gaussian | Binomial | Poisson | Gamma | InverseGaussian`)
  has no survival member. So the block is *shaped wrong* and silently drops the
  one thing that matters: **which estimator** produced the curve.
- The `Surv(AVAL, CNSR)` response is just a `FormulaFunction` — the parser accepts
  any `ID(...)`. Nothing checks that `AVAL` is a time and `CNSR` is a censoring
  flag. (Limitation #1.)
- The estimator concept we carefully defined (`KaplanMeierEstimator`) is
  unreferenced — the analysis is not linked to the method that defines it.
  (Limitation #4.)

### Proposed syntax — a first-class `method` block

Introduce a `method` construct for **estimators that are not regressions**. It
names the estimator (resolving to the `DerivationConcept`), declares its role
inputs by name, and — this is the key move — declares its outputs as **typed,
named results** so downstream blocks can refer to them.

```thunderstruck
// PROPOSED — not yet in the grammar
method OSCurve estimate KaplanMeierEstimator {
    input:  OS_ITT,
    time:   AVAL,        // must be `is_a SurvivalTime`
    censor: CNSR,        // must be `is_a CensoringStatus`
    strata: [TRT01P],

    produces: {
        curve:  KMEstimates,          // the survival-function cube (for plotting)
        median: MedianSurvivalResult  // per-stratum median + CI (a result cube)
    }
}
```

What this buys us, mapped to the limitations:

- **#1 (method I/O):** inputs have *roles* (`time`, `censor`, `strata`) instead of
  being smuggled inside a formula. The estimator is named explicitly.
- **#4 (result association):** `produces` gives each output a name (`OSCurve.curve`,
  `OSCurve.median`) that later blocks reference — the results are attached to the
  method that made them, not floating free.
- **#2 (derivation vs. measure):** a `method` always produces **cubes** (`curve`,
  `median` are cube references). A `derive` block, by contrast, computes **measures**
  inside one cube. Making `method` cube-valued draws the line the README says is
  currently blurred.

---

## Stage 3 — Test the treatment difference (log-rank)

### What you write today

Nothing — there is no `test` construct, and no aggregate function computes a
log-rank statistic. In the `.tsk` file this stage is a comment apologising for its
own absence.

### Proposed syntax — a `test` block

A hypothesis test is not an estimator and not a regression, so give it its own
small construct. It shares the survival role-inputs and, again, names its result.

```thunderstruck
// PROPOSED — not yet in the grammar
test OSLogRank logrank {
    input:  OS_ITT,
    time:   AVAL,
    censor: CNSR,
    strata: [TRT01P],

    produces: {
        result: OSLogRankResult   // chi-square, df, p-value
    }
}
```

The test kind (`logrank`) comes from a controlled list so tooling can validate it
and generators know what to emit. This directly addresses limitation #1: a test's
inputs and its single, well-typed result are both explicit.

---

## Stage 4 — Estimate the hazard ratio (Cox PH)

### What you write today

A Cox model *can* be forced through `model` using `Surv(AVAL, CNSR) ~ TRT01P`, but
there is no `CoxPH` family, no place for tie-handling, and — the real problem — no
way to say "the deliverable is a **hazard ratio** with a 95% CI and a p-value."
The result is unnamed and unstructured (limitations #1 and #4).

### Proposed syntax — extend `model`, don't replace it

Cox regression genuinely *is* a regression, so keep it in `model` and extend the
grammar minimally:

1. Add `CoxPH` (and `Weibull`, `Exponential`, `LogNormal` for parametric survival)
   to the `ModelFamily` enum.
2. Allow a structured `output` that names the **estimand** and its result cube,
   instead of only a bare cube reference.

```thunderstruck
// PROPOSED — extends the existing `model` block
model OSCox "Cox proportional hazards for OS" {
    input:   OS_ITT,
    formula: Surv(AVAL, CNSR) ~ TRT01P,
    family:  CoxPH,          // NEW family member
    ties:    Efron,          // NEW optional key for survival families

    output: OSHazardRatio {  // NEW: structured, named result
        estimand:   HazardRatio,   // resolves to an AnalysisConcept
        reference:  "PLACEBO",     // the arm the HR is against
        confidence: 0.95
    }
}
```

Because this is a *superset* of today's `model` grammar (the new `family` member,
`ties` key, and structured `output` are all optional additions), every existing
`.tsk` model block keeps parsing unchanged — an important compatibility property
for a live language.

---

## Stage 5 — Descriptive summary

### What you write today

This one *mostly* works with `aggregate`, but two things leak:

```thunderstruck
aggregate MedianSurvival "OS event summary by arm" {
    input: OS_ITT,
    groupBy: [TRT01P],
    statistics: [
        N_SUBJ       = count(USUBJID),
        N_CENSORED   = sum(CNSR),
        MEDIAN_NAIVE = median(AVAL)   // WRONG for censored data
    ]
}
```

- `events = N_SUBJ - sum(CNSR)` cannot be written, because a `Statistic` is exactly
  one `function(measure)` — no arithmetic. (Limitation #2, in miniature.)
- `median(AVAL)` computes a naïve median that ignores censoring; the *correct*
  KM median comes from Stage 2's estimator, not from here.

### Proposed syntax — allow expressions in aggregate statistics

Relax `Statistic` so its right-hand side is an **expression over aggregate
functions**, not a single call:

```thunderstruck
// PROPOSED — Statistic RHS becomes an expression
statistics: [
    N_SUBJ     = count(USUBJID),
    N_EVENTS   = count(USUBJID) - sum(CNSR),   // now expressible
    N_CENSORED = sum(CNSR)
]
```

And for the censoring-aware median, **reference the method result** rather than
recomputing — which is exactly the composition the next section is about. The
naïve `median(AVAL)` simply goes away.

---

## Stage 6 — Compose and present

### The chaining problem

The four branches above are independent today; there is no way to say "the figure
plots the KM curve *and* annotates it with the log-rank p-value and the Cox HR."
Each result is stranded in its own block (limitation #3).

### Proposed syntax — reference named results

Because every method/test/model in the proposal `produces` **named** results,
composition falls out for free: downstream blocks just reference them with dotted
names. The `display` gains an optional `annotations` list that can cite results:

```thunderstruck
// PROPOSED — display cites named results from other blocks
display figure "Figure 14.2.1" "Kaplan-Meier Curve - Overall Survival" {
    source: OSCurve.curve,        // the cube produced by the KM method
    xAxis:  ADT,
    yAxis:  SURVPROB,
    groupBy: TRT01P,
    aesthetics: {
        plotType: "step",
        confidenceBand: "true",
        atRiskTable: "true"
    },
    annotations: [
        OSLogRank.result,         // log-rank p-value on the plot
        OSCox.output              // hazard ratio + 95% CI on the plot
    ],
    footnotes: [
        "Survival estimated by the Kaplan-Meier product-limit method.",
        "Between-arm comparison by log-rank test; hazard ratio from Cox PH."
    ]
}
```

This is the payoff for naming results in Stages 2-4: a single figure now traces to
three distinct methods, each of which traces back to the same `OS_ITT` slice and,
below it, the `OverallSurvival` concept.

---

## The full analysis, in proposed syntax

Putting every stage together, the complete survival package reads like this. The
concepts and cubes are identical to [example-kaplan-meier.tsk](example-kaplan-meier.tsk)
and are elided here; only the derivation layer changes.

```thunderstruck
// ---- Derivations (PROPOSED syntax) ----

slice OS_ITT from ADTTE "Overall Survival, ITT population" {
    fix:      { PARAMCD: "OS", ITTFL: "Y" },
    vary:     [USUBJID, TRT01P],
    measures: [AVAL, CNSR]
}

method OSCurve estimate KaplanMeierEstimator {
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { curve: KMEstimates, median: MedianSurvivalResult }
}

test OSLogRank logrank {
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { result: OSLogRankResult }
}

model OSCox "Cox proportional hazards for OS" {
    input:   OS_ITT,
    formula: Surv(AVAL, CNSR) ~ TRT01P,
    family:  CoxPH,
    ties:    Efron,
    output:  OSHazardRatio { estimand: HazardRatio, reference: "PLACEBO", confidence: 0.95 }
}

display figure "Figure 14.2.1" "Kaplan-Meier Curve - Overall Survival" {
    source: OSCurve.curve,
    xAxis: ADT, yAxis: SURVPROB, groupBy: TRT01P,
    aesthetics: { plotType: "step", confidenceBand: "true", atRiskTable: "true" },
    annotations: [OSLogRank.result, OSCox.output]
}
```

Bottom-up, the trace for the annotated figure is now:

```
  Figure 14.2.1
    <- OSCurve.curve   (KaplanMeierEstimator on OS_ITT)
    <- OSLogRank.result (logrank test on OS_ITT)
    <- OSCox.output     (CoxPH model on OS_ITT)
         |
     all three <- OS_ITT slice <- ADTTE cube <- OverallSurvival concept
```

Every result is named, typed, attached to its method, and composable — the four
limitations, addressed in one coherent set of additions.

---

## Proposed grammar changes (Langium)

For reviewers who want the precise delta against
[thunderstruck.langium](../../thunderstruck/packages/thunderstruck-language/src/grammar/thunderstruck.langium).
These are additive; existing rules are unchanged except where noted.

```langium
// 1. New top-level elements
ProgramElement:
    ... | MethodDefinition | TestDefinition ;   // ADD these two

// 2. Estimators that are not regressions (Kaplan-Meier, Nelson-Aalen, ...)
MethodDefinition:
    'method' name=ID 'estimate' estimator=[ConceptDefinition:QualifiedName]
    (description=STRING)? '{'
        'input'  ':' inputRef=[ProgramElement:ID] (',' | ';')
        'time'   ':' time=ID (',' | ';')?
        ('censor' ':' censor=ID (',' | ';')?)?
        ('strata' ':' strata=DimensionList (',' | ';')?)?
        'produces' ':' produces=ResultBindings (',' | ';')?
    '}';

// 3. Hypothesis tests (log-rank, ...)
TestDefinition:
    'test' name=ID kind=TestKind (description=STRING)? '{'
        'input'  ':' inputRef=[ProgramElement:ID] (',' | ';')
        'time'   ':' time=ID (',' | ';')?
        ('censor' ':' censor=ID (',' | ';')?)?
        ('strata' ':' strata=DimensionList (',' | ';')?)?
        'produces' ':' produces=ResultBindings (',' | ';')?
    '}';

TestKind returns string: 'logrank' | 'wilcoxon' | 'tarone' ;

// 4. Named, typed outputs shared by method/test
ResultBindings:
    '{' (bindings+=ResultBinding (',' bindings+=ResultBinding)*)? '}';
ResultBinding:
    role=ID ':' cube=[CubeDefinition:ID] ;

// 5. Extend the regression model (all additions optional -> backward compatible)
ModelFamily returns string:
    'Gaussian' | 'Binomial' | 'Poisson' | 'Gamma' | 'InverseGaussian'
    | 'CoxPH' | 'Weibull' | 'Exponential' | 'LogNormal' ;   // ADD survival families

ModelDefinition:
    'model' ... 
        ('ties' ':' ties=TieMethod (',' | ';')?)?           // ADD (survival only)
        ('output' ':' output=StructuredOutput (',' | ';')?) // WIDEN output
    '}';

TieMethod returns string: 'Efron' | 'Breslow' | 'Exact' ;

StructuredOutput:
    cube=[CubeDefinition:ID] ('{'
        ('estimand'   ':' estimand=[ConceptDefinition:QualifiedName] (',' | ';')?)?
        ('reference'  ':' reference=STRING (',' | ';')?)?
        ('confidence' ':' confidence=NUMBER (',' | ';')?)?
    '}')? ;

// 6. Aggregate statistics may be expressions over aggregate functions
Statistic:
    name=ID '=' expression=AggregateExpression ;   // was: function=... '(' measure=ID ')'

// 7. Displays may annotate with named results
DisplayDefinition:
    'display' ... 
        ('annotations' ':' annotations=ResultRefList (',' | ';')?)?
    '}';
ResultRefList:
    '[' (refs+=ResultRef (',' refs+=ResultRef)*)? ']';
ResultRef:
    producer=[ProgramElement:ID] '.' role=ID ;   // e.g. OSLogRank.result
```

---

## Open questions for review

- **`method` vs. extending `model`.** Is a separate `method` construct worth it,
  or should non-regression estimators also live under a widened `model`? The
  argument for splitting: KM/Nelson-Aalen have no `formula`, `family`, or `link`,
  so overloading `model` re-creates the "shaped wrong" problem from Stage 2.
- **Result cubes vs. result records.** `produces`/`output` currently point at
  `cube` definitions. A hazard ratio (one number + CI + p) is a degenerate cube.
  Do we want a lighter-weight `result` element for scalars-per-stratum?
- **Where do estimator parameters live?** Tie-handling sits on `model`; confidence
  level sits on the output. Should there be a single `options { ... }` block per
  method instead, to avoid scattering knobs?
- **Validation of role inputs.** Should the validator *enforce* that `time`
  `is_a SurvivalTime` and `censor` `is_a CensoringStatus`, or only warn? Enforcing
  makes methods type-safe but demands the concept links always be present.

Feedback welcome on the [issue #27 thread](https://github.com/metadatadriven/acdc-wip/issues/27).
