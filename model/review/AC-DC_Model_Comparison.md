# AC/DC Model: Personal Branch (issue #27) vs. CDISC Project Model

**Status:** Review / findings
**Date:** 2026-07-09
**Compared:**
- **This branch (personal):** `metadatadriven/acdc-wip` @ `dev/stuart/27-bottom-up` (commit `7d548bb`)
- **Project (shared):** `cdisc-org/analysis-concepts` @ `methods_02` (commit `81a04b1`, 2026-07-02)

---

## 0. TL;DR

The two efforts have **independently converged on the same central idea** — that a
statistical method should be a *concept-free, reusable operation with role-named
inputs and typed outputs*, and that the clinical meaning is bound to it separately.
That is genuinely encouraging: the issue #27 proposal's headline thesis
("a method is a typed transformation between shapes; concepts bind elsewhere")
is exactly the architecture the project has already built and populated.

They differ mostly in **altitude and maturity**, not direction:

- The **project model** is a *metamodel + data library*: LinkML schemas with ~60
  concrete method instances (`M.KaplanMeier`, `M.LogRankTest`, `M.CoxPH`, …), an
  output-type vocabulary, a transformation/binding layer, and a fully worked
  survival case study validated against an ADaM oracle. It is considerably further
  along on statistical-method modelling.
- **This branch** is a *principles + authoring-surface* effort: DDD/bounded-context
  analysis, guiding principles, and the **Thunderstruck DSL** (a Langium grammar
  with real IDE tooling) plus the KM syntax-extension proposal. Its distinctive
  assets are the human authoring/validation UX and the W3C Data Cube grounding.

**Bottom line:** these are complementary layers of one stack, not rivals. The most
useful reframing of the issue #27 proposal is as a **human authoring front-end that
compiles down to the project's method/transformation instances** — which is exactly
the "LinkML → Thunderstruck exporter?" question already noted in the CDISC 360i F2F
minutes. Several of the issue #27 proposal's "open questions" are already answered by
the project model, and adopting those answers would save reinventing them.

---

## 1. What each model is

### 1.1 This branch (issue #27)

| Aspect | Detail |
|---|---|
| Framing | Bottom-up derivation of an AC/DC metamodel from CDISC ADaM examples |
| Principles | `model/Model_PRINCIPLES.md` — 8 guiding principles (layering, immutability/DAG, traceability, CDISC alignment, declarative spec, regulatory compliance, quality rules) |
| Domain design | `model/design/` — DDD analysis, ContextMapper model, 8 bounded contexts |
| Schema | `model/design/Model_DESIGN.md` — "Unified Metamodel v2.0" as YAML |
| Layering | **Three layers**: Concepts → Structures (cubes) → Derivations, with strictly downward dependencies |
| Data abstraction | **W3C Data Cube** — `cube` with `dimensions` / `measures` / `attributes` |
| Authoring surface | **Thunderstruck DSL** (Langium): `cube`, `concept`, `slice`, `model`, `aggregate`, `display`; VS Code extension + LSP |
| KM contribution | `examples/thunderstruck/example-kaplan-meier*` — a working KM analysis plus a proposal for first-class `method` / `test` / extended `model` blocks |
| Tech | TypeScript / Langium / VS Code; RDF / Turtle export |

### 1.2 CDISC project (`analysis-concepts`, methods_02)

| Aspect | Detail |
|---|---|
| Framing | Model concepts for derivation & analysis to support end-to-end automation and CDISC 360i |
| Principles | `model/Principles.md` — rationale (interchange, automation/reuse, reduced ambiguity, traceability, collaboration), KISS, explicit **LinkML** choice |
| Layering | **Concept layers OC / DC / AC** (collected-observation, derivation, analysis), converging toward a unified "one concept model"; separate Method, Transformation, Output-class, eSAP, SmartPhrase layers |
| Data abstraction | Concept-keyed normalized cubes + **FHIR datatypes**; transformation input/output data structures |
| Method library | `lib/methods/` — **~60 concept-free methods** (39 analyses + 21 derivations) as per-file JSON, each with `formula` (`wilkinson_rogers` / `assignment` / `survival`), role inputs, `configurations`, typed outputs |
| Binding | **Transformation layer** (`lib/transformations/`) binds a method to concepts via `usesMethod` + `inputDataStructure` / `outputDataStructure.measures[].concept` |
| Output model | Decomposed vocabularies: `output_class_templates` → `statistic_sets` → `statistics_vocabulary`, with structured `indexed_by` (granularity / components / axis) |
| KM contribution | `M.KaplanMeier` + `M.LogRankTest` + `M.CoxPH` methods, plus `docs/case-study-pfs-NCT01797120.md` — full SDTM→endpoint→KM chain validated against `ADTTE` |
| Tech | LinkML (source of truth) → generated JSON Schema → `linkml-validate`; Neo4j graph; NCI / STATO codings; SmartPhrase NL rendering |

---

## 2. Where they converge (the good news)

1. **Concept-free, reusable methods.** The single most important agreement. The
   issue #27 proposal argues methods should not hard-code `AVAL`, should bind
   columns by *role*, and should carry their result schema — see
   `example-kaplan-meier-cubes-and-methods.md`. The project already implements this:
   methods "MUST NOT reference clinical, derivation, or analysis concepts"; concepts
   attach only at the transformation layer (method-schema-design §3.6.2).

2. **Role-token inputs.** Both name inputs by statistical role rather than position.
   The proposal's `time` / `censor` / `strata` map almost 1:1 onto the project's
   `time` / `event` / `fixed_effect` / `strata` (the project uses an *event*
   indicator where the proposal uses a *censor* flag — same information, opposite
   polarity).

3. **Named, typed outputs.** Both reject "a loose bag of numbers." The proposal's
   `produces: { curve, median }` is the same instinct as the project's multiple
   named outputs (`survival_table`, `median_survival`, `event_summary`,
   `landmark_estimates`).

4. **Survival is first-class.** Both treat time-to-event as needing dedicated
   support rather than being forced through a GLM.

5. **Wilkinson / `Surv(...)` formula notation.** Both use `Surv(time, event) ~ group`
   for the survival response and Wilkinson-Rogers notation for regressions.

6. **Configurations / options.** The proposal's open question ("where do estimator
   parameters live — a single `options {}` block?") is already answered: the project
   puts them in a `configurations[]` array (`conf_type` on KM, `rho` on log-rank,
   `ties` on Cox).

7. **Provenance / DAG + end-to-end traceability, and statistician-facing authoring.**
   Both build an acyclic derivation chain and both explicitly prioritise a
   human-authoring surface (Thunderstruck DSL here; SmartPhrase there).

---

## 3. Where they diverge (and which is ahead)

| Dimension | This branch (issue #27) | CDISC project (methods_02) | Assessment |
|---|---|---|---|
| **Altitude** | Authoring DSL (concrete syntax) | Metamodel + data library (LinkML instances) | Different layers; **complementary** |
| **Method taxonomy** | Proposes **three** constructs: `method` (estimators), `test` (hypothesis tests), extended `model` (regressions) | **One** `method` construct; `formula.notation` (`survival` / `wilkinson_rogers` / `assignment`) is the discriminator | Project is **simpler**; directly answers the proposal's open "method vs model" question |
| **KM / log-rank / Cox** | KM as a `model`; log-rank & Cox *deferred* (couldn't be expressed) | All three exist as populated method files | Project is **well ahead** |
| **Output modelling** | "Output cube = result schema" (dimensions/measures) | `output_class_templates` → `statistic_sets` → `statistics_vocabulary` + structured `indexed_by` | Project is **far more granular** |
| **Hazard ratio as output** | Left as an open question ("HR is a degenerate cube?") | `hazard_ratio_estimates` output_type, indexed by level | Project **answers it** |
| **Treatment comparison / contrast** | Not modelled (the KM proposal defers it) | First-class `M.LinearContrast` (contrast-as-method, `c = L·θ`) | Project **has it**; this branch does not |
| **Concept binding location** | Partly on structures (cube `is_a`) and proposed `estimand` on model output | **Strictly** at the transformation layer; methods 100% concept-free | Project's separation is **cleaner** |
| **Concept model scope** | Concepts / Structures / Derivations (clean-architecture layering) | OC / DC / AC unified concept model; concepts may own math (definition-vs-procedure) | Different cut; project models **collected data (OC)** too, which this branch omits |
| **Units** | Units as free-text on concepts/measures | Formal `unitRule` (`inherited`/`derived`/`fixed`/…) resolved by dimensional arithmetic | Project is **more rigorous** |
| **Data typing** | Primitive types (`Numeric`, `Flag`, …) | FHIR datatypes on concepts + structural `dataType` on methods | Project is **more interoperable** |
| **Standards identity** | Namespaced concepts, code lists in DSL | NCI C-codes + STATO codings per method | Project is **submission-aligned** |
| **Modelling language** | Langium grammar (bespoke DSL) | LinkML (schema) → JSON Schema → validation | Different tooling philosophy |
| **Validation evidence** | DSL parses (0 parser errors); KM is illustrative | PFS case study run against real SDTM, validated vs `ADTTE` oracle | Project has **empirical validation** |

### Where this branch has something the project lacks

- **A concrete authoring/IDE experience.** Thunderstruck gives live parsing,
  diagnostics, completion, and go-to-definition. The project's JSON/LinkML
  instances are authored and validated in batch; there is no equivalent
  human-facing editing surface (SmartPhrase is a rendering/NL layer, not an editor).
- **Strategic domain decomposition.** The DDD / ContextMapper bounded-context
  analysis (`model/design/eSAP_DOMAIN_DESIGN.md`) is a strategic view the project
  repo doesn't carry.
- **W3C Data Cube grounding.** An explicit route to RDF / SPARQL interoperability
  and W3C integrity-constraint validation, which the project's approach doesn't use.
- **Pedagogical narrative.** The KM walkthrough + statistician primer are
  onboarding assets of a kind the project docs (design memos) aren't aimed at.

---

## 4. Side-by-side: the Kaplan-Meier example

The KM analysis is the sharpest lens because both efforts worked it explicitly.

### 4.1 This branch — `example-kaplan-meier.tsk` + proposal

```thunderstruck
// input structure hand-declared as a cube; population as a slice
slice OS_ITT from ADTTE { fix: {PARAMCD:"OS", ITTFL:"Y"}, vary:[USUBJID,TRT01P], measures:[AVAL,CNSR] }

// PROPOSED (not yet implemented): estimator as a first-class method
method OSCurve estimate KaplanMeierEstimator {
    input: OS_ITT, time: AVAL, censor: CNSR, strata: [TRT01P],
    produces: { curve: KMEstimates, median: MedianSurvivalResult }
}
// log-rank + Cox proposed but not expressible in the current grammar
```

- Strength: readable, authorable, IDE-supported; explicit three-layer trace from
  concept → cube → slice → method → display.
- Gap: the estimator/test/model machinery is **proposed, not built**; log-rank and
  Cox couldn't be written; `KMEstimates` is a hand-shaped cube.

### 4.2 CDISC project — `M.KaplanMeier` + PFS case study

```json
// M.KaplanMeier — a populated, concept-free method file
"formula": { "notation": "survival", "generic_expression": "Surv(<time>, <event>) ~ <fixed_effect>?" },
"inputs":  [ {"name":"time"}, {"name":"event"}, {"name":"fixed_effect", "required": false} ],
"outputs": [ {"name":"event_summary"}, {"name":"survival_table"},
             {"name":"median_survival"}, {"name":"landmark_estimates"} ]
```

Plus `M.LogRankTest` (`chi_squared_test_result`, config `rho`) and `M.CoxPH`
(`hazard_ratio_estimates`, config `ties`), and an 8-step SDTM→`(time,event)`
derivation chain in `docs/case-study-pfs-NCT01797120.md` that validates against the
study's `ADTTE`.

- Strength: **built and validated**; richer output set (landmark estimates,
  event summary); the whole SDTM→endpoint chain is specified with real data.
- Gap: no human authoring surface; the method files are not something a
  statistician edits directly.

### 4.3 The telling detail: the censoring concept

Both hit the *same* modelling issue independently. This branch introduces a
`CensoringStatus` concept in the `.tsk` file; the project's PFS case study flags
**exactly one concept gap** — "no first-class **censoring indicator** concept
(currently overloads generic `Flag`)." Independent discovery of the same gap is
strong evidence the two models are describing the same territory.

---

## 5. Recommendations for this branch

1. **Reframe the proposal as a compiler front-end, not a parallel model.** Position
   Thunderstruck as an authoring surface that emits the project's method/transformation
   instances (the F2F "LinkML → Thunderstruck exporter" idea, run in reverse). This
   turns the DSL's real advantage (authoring UX) into a contribution to the shared
   model rather than a competing one.

2. **Adopt the project's answers to the proposal's open questions.** Specifically:
   collapse `method` / `test` / `model` toward **one method construct discriminated
   by formula notation**; move estimator parameters into a `configurations`-style
   block; and express the hazard ratio as a typed output rather than agonising over
   "degenerate cube." These are already settled upstream.

3. **Keep methods strictly concept-free.** The proposal partly binds concepts on
   structures/outputs (`is_a`, `estimand`). Align with the project's cleaner rule:
   **all** concept binding happens at the transformation layer. This is the
   architecture the cubes-and-methods doc already advocates — finish the job.

4. **Reconcile the layer vocabulary.** Map this branch's Concepts/Structures/Derivations
   onto the project's OC/DC/AC + Method/Transformation layers explicitly, and decide
   whether to model the **collected-observation (OC)** layer, which this branch
   currently omits.

5. **Consider mapping the W3C Data Cube view onto the project's output model** rather
   than replacing it — the `output_class → statistic_set → statistics` decomposition
   and `indexed_by` row model are more expressive than a bare cube and are worth
   inheriting; the cube view can sit on top as an interchange/RDF projection.

6. **Reuse the project's method inventory.** ~60 methods already exist; the KM
   example should target `M.KaplanMeier` / `M.LogRankTest` / `M.CoxPH` semantics
   rather than defining new ones.

## 6. What the project might take from this branch

- The **Thunderstruck authoring/IDE experience** as a candidate human front-end.
- The **DDD bounded-context analysis** as a strategic-design complement to the
  bottom-up method library.
- The **narrative onboarding assets** (KM walkthrough, statistician primer) as a
  template for making the (dense) design memos approachable.
- A dedicated **`CensoringIndicator` concept** — both efforts independently found
  the gap; worth promoting from `Flag`.

---

## 7. One-line characterisation

> This branch designs *how a statistician would write* an analysis; the project
> models *what the analysis is* and has already built the library. They meet at the
> same architecture — concept-free methods bound to concepts elsewhere — and the
> highest-value move is to connect them, with Thunderstruck compiling to the
> project's method/transformation instances.

---

*Provenance: project model read from `cdisc-org/analysis-concepts@methods_02`
(`81a04b1`), files under `lib/methods/`, `lib/concepts/`, `docs/`, `model/`. This
branch read at `7d548bb`, files under `model/` and `examples/thunderstruck/`.*
