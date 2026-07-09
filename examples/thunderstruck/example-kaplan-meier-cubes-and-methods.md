# Cubes and Methods: Designing a Standard Library of Statistical Methods

**Companion to:** [example-kaplan-meier.md](example-kaplan-meier.md) (the proposal)
and [example-kaplan-meier-syntax-primer.md](example-kaplan-meier-syntax-primer.md)
(the statistician's TL;DR)
**Audience:** library developers who will define reusable statistical methods
(KM, Cox, MMRM, ANCOVA, …) for others to call.
**Prerequisite:** skim the primer for the `cube` / `slice` / `method` / `model`
vocabulary; this document goes deeper on the one relationship that matters most
for library design — **how a statistical method relates to the cubes around it.**

---

## 1. The core relationship in one sentence

> A statistical method is a **typed transformation between cubes**: it consumes
> one or more input cubes (usually via a slice) and produces one or more output
> cubes, and the *shapes* of those cubes are the method's public contract.

Everything in this document follows from that sentence. If you internalise
"a method is a function from cube-shapes to cube-shapes," you can design library
methods that compose, validate, and generate code cleanly.

```
     input cube(s)                         output cube(s)
   ┌──────────────┐    ┌───────────────┐   ┌──────────────┐
   │  ADTTE / slice│──▶ │   METHOD      │──▶│  KMEstimates │
   │  (time,censor)│    │ (KaplanMeier) │   │  (curve)     │
   └──────────────┘    └───────────────┘   ├──────────────┤
                                            │ MedianResult │
                                            └──────────────┘
        the SIGNATURE of the method is: (shape-in) -> (shape-out)
```

---

## 2. Why a cube is the right unit for a method contract

A cube is not just "a dataset." It is a **typed relation** whose columns carry
declared roles (`dimension`, `measure`, `attribute`) and, optionally, semantic
bindings to concepts (`is_a SurvivalTime`). Those two things — roles and concept
bindings — are exactly what a method needs to state its requirements precisely.

Consider the KM input cube from the example:

```thunderstruck
cube ADTTE "Time-to-Event Analysis Dataset" {
    structure: {
        dimensions: [ USUBJID: Identifier, PARAMCD: CodedValue, TRT01P: CodedValue ],
        measures:   [ AVAL: Numeric is_a SurvivalTime,
                      CNSR: Flag    is_a CensoringStatus ],
        attributes: [ ITTFL: Flag, SAFFL: Flag ]
    }
}
```

A Kaplan-Meier method can state its input requirement as:

- *"a cube with one measure `is_a SurvivalTime`, one measure `is_a CensoringStatus`,
  and at least one dimension to stratify by."*

Because roles and concept bindings are part of the cube's type, the validator can
check that requirement **before** any code is generated. That is the whole reason
methods bind to cubes rather than to raw variable names: **the cube is the type,
and the type is checkable.**

---

## 3. The two halves of a method: input side and output side

### 3.1 Input side — binding by role, not by position

In the proposed `method`/`test` blocks, inputs are bound to cube columns **by
role name**, not by ordinal position:

```thunderstruck
method OSCurve estimate KaplanMeierEstimator {
    input:  OS_ITT,       // WHICH cube (a slice of ADTTE)
    time:   AVAL,         // role: the survival time  -> must be is_a SurvivalTime
    censor: CNSR,         // role: the censoring flag  -> must be is_a CensoringStatus
    strata: [TRT01P],     // role: stratification dimensions
    produces: { ... }
}
```

For a library developer this is the key design lever: **a method declares the
roles it needs; the caller maps their columns onto those roles.** The same
`KaplanMeierEstimator` works for OS, PFS, or time-to-first-AE, because the caller
supplies whichever `time`/`censor` columns their cube happens to use. The method
never hard-codes `AVAL`.

### 3.2 Output side — the output cube IS the result schema

This is the part most easily misunderstood. The output of a method is **not** a
loose bag of numbers; it is **a cube whose structure is the declared schema of the
result**. The KM curve output:

```thunderstruck
cube KMEstimates "Kaplan-Meier Survival Estimates" {
    structure: {
        dimensions: [ TRT01P: CodedValue, ADT: Numeric ],           // per arm, per time
        measures:   [ SURVPROB: Numeric is_a SurvivalProbability,   // S(t)
                      LOWERCI: Numeric, UPPERCI: Numeric,
                      NRISK: Integer, NEVENT: Integer, NCENSOR: Integer ]
    }
}
```

Reading this as a library developer: *the Kaplan-Meier method promises to emit one
row per (arm × event-time), with a survival probability, a confidence band, and
the at-risk-table counts.* That promise is machine-readable. A downstream `display`
can be validated against it (does `SURVPROB` exist? is `ADT` plottable?) without
running anything.

So the output cube plays three simultaneous roles:

1. **Result container** — where the numbers land.
2. **Schema / contract** — what the method guarantees to produce.
3. **Type for the next stage** — what displays and further methods can consume.

---

## 4. A method's signature

Put the two halves together and every method has a **signature**: a shape it
requires and a shape it guarantees. Written informally:

```
KaplanMeierEstimator :
    requires  cube { measure is_a SurvivalTime;
                     measure is_a CensoringStatus;
                     dimension+ (strata) }
    guarantees cube { dimension: strata × time;
                      measure is_a SurvivalProbability;
                      measure LOWERCI, UPPERCI, NRISK, NEVENT, NCENSOR }
```

Designing the standard library is, essentially, **writing down these signatures**
for each method and agreeing on the concept vocabulary they reference
(`SurvivalTime`, `SurvivalProbability`, `HazardRatio`, `LSMean`, …). Get the
signatures right and composition, validation, and multi-target code generation
all follow.

---

## 5. `model` vs. `method`: two contract shapes

The proposal keeps two constructs because statistical methods fall into two
contract shapes. Library authors should know which shape a given technique is.

| Aspect            | `model` (regression)                          | `method` (estimator) / `test`             |
|-------------------|-----------------------------------------------|-------------------------------------------|
| Input description | a **formula** (`response ~ predictors`)        | **role inputs** (`time`, `censor`, `strata`) |
| Governed by       | `family` + `link` (+ `random`, `ties`)         | the named estimator concept               |
| Typical output    | one structured estimate (`estimand`, CI, p)    | one or more result cubes (`produces`)     |
| Examples          | ANCOVA, MMRM, logistic, Poisson, **Cox PH**    | **Kaplan-Meier**, Nelson-Aalen, log-rank  |
| Use when…         | the method IS a regression with a formula      | there is no natural formula / link        |

Cox PH lives in `model` because it genuinely has a formula and a coefficient
(the log-hazard-ratio). Kaplan-Meier lives in `method` because it has no formula,
no link, and its result is a whole curve, not a coefficient. When you add a new
technique to the library, the first question is which of these two contract shapes
it has.

---

## 6. Defining a reusable library method (the pattern)

A standard-library method is defined by pinning down four things. Using
Kaplan-Meier as the template:

**(a) The estimator concept** — the semantic identity, in a shared namespace, so
every study refers to the *same* Kaplan-Meier:

```thunderstruck
concept KaplanMeierEstimator "Kaplan-Meier Estimator" type_of DerivationConcept {
    namespace: CDISC.Glossary,
    category: Efficacy,
    definition: "Non-parametric product-limit estimator of S(t) from right-censored data..."
}
```

**(b) The required input roles and their concept types** — what the caller must
supply, and the concept each role must satisfy:

| Role     | Cardinality | Required concept binding |
|----------|-------------|--------------------------|
| `time`   | exactly 1   | `is_a SurvivalTime`      |
| `censor` | exactly 1   | `is_a CensoringStatus`   |
| `strata` | 0..n        | any dimension            |

**(c) The output cube template(s)** — the guaranteed result schema. Library
authors publish these as *named cube shapes* that callers instantiate. For KM:
`KMEstimates` (the curve) and `MedianSurvivalResult` (per-stratum median + CI).

**(d) The parameters** — knobs with defaults (e.g. CI method = Greenwood,
confidence = 0.95). In the current proposal these sit on the block; see the open
question in §8.

A study author then *calls* the library method by mapping their columns onto the
roles — they never redefine the estimator or its output schema:

```thunderstruck
method OSCurve estimate KaplanMeierEstimator {   // <- library concept, reused
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { curve: KMEstimates, median: MedianSurvivalResult }
}
```

---

## 7. Design rules that keep a library coherent

These follow from the AC/DC guiding principles (see
[../../model/Model_PRINCIPLES.md](../../model/Model_PRINCIPLES.md)) and matter
specifically for people writing reusable methods.

1. **Output cubes are immutable and new (GP-2).** A method never mutates its input;
   it emits a fresh cube. This is what makes an analysis a DAG and keeps results
   reproducible. Design output shapes as standalone artifacts, not edits.

2. **Depend only downward (GP-1).** A method (top layer) may reference cubes
   (middle) and concepts (bottom). Output *cube shapes* must not smuggle in
   references back up to methods. Keep the output schema pure structure + concepts.

3. **Bind every meaningful column to a concept.** `SURVPROB is_a SurvivalProbability`
   is what lets a downstream display know it's plotting a probability, and what
   lets two methods interoperate. Unbound measures are opaque and break composition.

4. **Version against the `standards` block.** A library method's contract is only
   stable relative to a standards version. If a method's output shape changes,
   that's a breaking change — treat the output cube template as a versioned API.

5. **Prefer role inputs over formulae when there's no formula.** Don't force an
   estimator into `model` just to reuse `formula:`; that reintroduces the
   "shaped-wrong" problem the proposal exists to fix.

6. **One method, one clear signature.** If a technique wants two very different
   output shapes depending on options, that's a signal to split it into two library
   methods rather than overload one.

---

## 8. Checklist: adding a new method to the standard library

1. **Classify the contract shape** — regression (`model`) or estimator/test
   (`method`/`test`)? (§5)
2. **Author or reuse the estimator/family concept** in a shared namespace. (§6a)
3. **Specify input roles** and the concept binding + cardinality each requires. (§6b)
4. **Design the output cube template(s)** — the result schema, every measure bound
   to a concept. This is the method's public API. (§6c, §3.2)
5. **List parameters and defaults.** (§6d)
6. **Write the signature down** (requires-shape → guarantees-shape) for docs. (§4)
7. **Provide a worked call** so study authors have a copy-paste starting point.
8. **Validate**: does a caller mapping real columns onto the roles pass the
   role/concept checks? Does a `display` reading the output cube resolve?

---

## 9. Open questions that affect library authors

The proposal's open questions (in [example-kaplan-meier.md](example-kaplan-meier.md#open-questions-for-review))
land squarely on library design:

- **Result cubes vs. lightweight result records.** A hazard ratio is one number
  plus a CI and a p-value — a degenerate cube. Do we want a first-class `result`
  element for scalars-per-stratum, so library authors aren't forced to model every
  scalar as a full cube? This changes how you'd publish, e.g., a Cox method's output.
- **Where parameters live.** Tie-handling on `model`, confidence on the output —
  should a library method instead declare a single `options { … }` block so all its
  knobs (and their defaults) are documented in one place?
- **Enforced vs. advisory role typing.** If the library says `time` must be
  `is_a SurvivalTime`, should a caller who omits the concept binding get an error or
  a warning? Enforcement makes the library's contracts real; it also raises the bar
  on every input cube being fully annotated.

Answering these is effectively deciding the ergonomics of the standard method
library, so library-developer feedback on them is the most valuable kind.
