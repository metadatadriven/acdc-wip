# AC/DC Examples

This directory contains examples demonstrating two complementary efforts in the AC/DC (Analysis Concept / Derivation Concept) project:

1. **Thunderstruck Language Examples** - A fully developed domain-specific language for clinical trial biometric analyses
2. **AC/DC Model Refinement** - Foundational work to refine the underlying conceptual model

---

## 1. Thunderstruck Language

Thunderstruck is a domain-specific language (DSL) for authoring Statistical Analysis Plans (SAPs) in clinical trials, using the W3C Data Cube standard as its foundational abstraction. For complete details, see [README.thunderstruck.md](../README.thunderstruck.md).

### Language Status

The Thunderstruck language implementation is functional with working syntax, parser, validation, and VS Code extension. The **concept hierarchy is working** and an example **standard library** has been created demonstrating how AC/DC concepts can be defined and built up using the language (see [Standard Library README](../packages/thunderstruck-language/stdlib/README.md)).

**However**, the language is not final and has known issues. Most significantly, the underlying model is inconsistent and not able to cleanly describe derivations and statistical methods. This limitation is being addressed through the Model Refinement work described in Section 2.

### Thunderstruck Quick Example

Here's a simple Thunderstruck program demonstrating key language constructs:

```thunderstruck
// Define a biomedical concept
concept BoneMineralDensity type_of BiomedicalConcept {
    definition: "Bone mineral density measurement at lumbar spine",
    abbreviation: "BMD",
    unit: "g/cm²",
    cdisc_term: "SDTM.LB.LBTESTCD = 'BMD'"
}

// Define an analysis cube
cube ADBMD "BMD Analysis Dataset" {
    namespace: "http://example.org/study/bmd#",

    structure: {
        dimensions: [
            USUBJID: Identifier,        // Subject ID
            AVISITN: Integer,            // Visit number
            TRT01A: CodedValue           // Treatment assigned
        ],

        measures: [
            AVAL: Numeric,               // Analysis value
            BASE: Numeric,               // Baseline value
            CHG: Numeric                 // Change from baseline
        ],

        attributes: [
            PARAMCD: CodedValue,         // Parameter code
            ITTFL: Flag                  // ITT population flag
        ]
    },

    linked_concept: BoneMineralDensity
}

// Create a slice for Month 24 ITT population
slice Month24_ITT from ADBMD {
    where: {
        AVISITN == 24,
        ITTFL == "Y"
    },
    group_by: [TRT01A]
}

// Define a display table
display Table_1 type table {
    title: "BMD Change from Baseline at Month 24",
    subtitle: "Intent-to-Treat Population",

    source: Month24_ITT,

    rows: TRT01A,
    columns: [
        {measure: "n", label: "N"},
        {measure: "mean", variable: CHG, label: "Mean Change", format: "x.xx"},
        {measure: "std", variable: CHG, label: "SD", format: "x.xxx"}
    ],

    footnotes: [
        "ITT = Intent-to-Treat population",
        "BMD = Bone Mineral Density measured in g/cm²"
    ]
}
```

### Standalone Examples

The following example files demonstrate specific Thunderstruck language features:

- [example-01-simple-cube.tsk](example-01-simple-cube.tsk) - Basic cube structure with dimensions, measures, and attributes
- [example-02-with-imports.tsk](example-02-with-imports.tsk) - Using imports to reference standard CDISC definitions
- [example-concept.tsk](example-concept.tsk) - Defining biomedical concepts with hierarchical types and terminology mappings
- [example-slice.tsk](example-slice.tsk) - Creating slices by fixing dimensions and applying filters
- [example-aggregate.tsk](example-aggregate.tsk) - Computing summary statistics grouped by dimensions
- [example-derive.tsk](example-derive.tsk) - Creating derived cubes through calculations and transformations
- [example-model.tsk](example-model.tsk) - Statistical models using Wilkinson formula notation
- [example-display.tsk](example-display.tsk) - Defining tables and figures for clinical study reports

### Standard Library

Thunderstruck includes a standard library of reusable concept definitions organized by clinical domain. See the [Standard Library README](../packages/thunderstruck-language/stdlib/README.md) for details on:

- Base concepts (Value, MeasurementUnit, Visit, etc.)
- Domain-specific concept libraries (Efficacy, Safety, Vital Signs, Laboratory, Adverse Events)
- How to extend and reuse standard concepts in your analyses

---

## 2. AC/DC Model Refinement

To address the inconsistencies in the underlying AC/DC model, particularly around derivations and statistical methods, work has begun on refining the foundational conceptual model. This work uses real-world examples from the CDISC ADaM specification to identify and validate a clean, consistent model structure.

### Source Material

The model refinement work is based on the [CDISC ADaM Examples 1.0 document](../docs/adam_examples_final.pdf), which provides concrete Statistical Analysis Plan (SAP) text and corresponding analysis datasets for common clinical trial analyses.

### Approach

The approach involves systematically analyzing SAP text to:

1. **Identify entities** - Extract nouns and noun phrases representing concepts, structures, and results
2. **Classify entities** - Categorize each entity into the three-tier hierarchy:
   - **Concepts** (abstract semantic entities: biomedical, derivation, analysis)
   - **Structures** (concrete data organization: dimensions, measures, attributes, cubes)
   - **Results** (relationships and outputs: slices, methods, displays)
3. **Validate consistency** - Ensure the model can cleanly represent all aspects of the analysis
4. **Iterate and refine** - Progressively improve the model through successive refinements

### Current Status: Example 1 (ANCOVA Analysis)

The refinement work is currently focused on **Example 1** from the CDISC ADaM document, which describes an ANCOVA analysis of bone mineral density:

#### Files

- [ex01-ANACOVA.md](ex01-ANACOVA.md) - Extract from the CDISC PDF document with SAP text and display layout
- [ex01-ANACOVA.tsk](ex01-ANACOVA.tsk) - Thunderstruck implementation (demonstrates current language limitations)
- [ex01-prompt.md](ex01-prompt.md) - Documents the evolution of the analysis prompt and model iterations
- [ex01-STRUCTURE.md](ex01-STRUCTURE.md) - Initial structural analysis (prompt 1 & 2 results)
- [ex01-STRUCTURE-p3.md](ex01-STRUCTURE-p3.md) - **Current model** (prompt 3 result) - comprehensive hierarchical classification

#### Key Results

The prompt 3 analysis ([ex01-STRUCTURE-p3.md](ex01-STRUCTURE-p3.md)) provides a much cleaner and more consistent model, identifying:

- **21 concept entities** across biomedical, derivation, and analysis categories
- **17 structure entities** including dimensions, measures, attributes, and cubes
- **16 result entities** including slices, methods, and display specifications
- **10 open issues** requiring clarification for full model consistency

The model successfully demonstrates:
- Clear separation between abstract concepts and concrete structural implementations
- Explicit representation of statistical methods and their inputs/outputs
- Formal specification of display elements with full metadata
- Hierarchical organization enabling progressive refinement

### Next Steps

1. **Final refinement** - Address the 10 open issues identified in the prompt 3 analysis
2. **Dataset comparison** - Compare the refined model structure with the actual ADaM datasets shown in the CDISC PDF document
3. **Additional examples** - Apply the refined model to Examples 2-N from the CDISC document to validate generalizability
4. **Language update** - Incorporate the refined model insights back into the Thunderstruck language specification

### Model Definition

The current three-tier classification structure is:

```yaml
model:
  concept:
    - biomedical      # Clinical observations and measurements
    - derivation      # Computed or derived values
    - analysis        # Analytical constructs
  structure:
    - dimension       # Components that identify observations
    - attribute       # Components that qualify/interpret values
    - measure         # Components containing observed values
    - cube            # Collections of observations organized by dimensions
  results:
    - slice           # Subsets of cubes with fixed dimension values
    - method          # Statistical computations producing results
    - display         # Tables, figures, and listings
```

This model extends the W3C Data Cube vocabulary with concepts specific to clinical trial biometric analyses while maintaining compatibility with OLAP dimensional modeling principles.

---

## Contributing

When adding new examples:

1. **Thunderstruck examples** should use the `.tsk` extension and include inline comments explaining the demonstrated features
2. **Model refinement examples** should follow the `ex##-DESCRIPTION.md` naming pattern with corresponding analysis files
3. Update this README to include links and descriptions of new examples

## Questions or Issues?

For questions about Thunderstruck language features, see [README.thunderstruck.md](../README.thunderstruck.md).

For questions about the AC/DC model or approach, see the project documentation in the [docs/](../docs/) directory.
