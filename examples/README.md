# AC/DC Examples

This directory contains examples demonstrating two complementary efforts in the AC/DC (Analysis Concept / Derivation Concept) project:

1. **AC/DC Model Refinement** - Foundational work to refine the underlying conceptual model
2. **Thunderstruck Language Examples** - A fully developed domain-specific language for clinical trial biometric analyses

The examples are organized into subdirectories by purpose:

```
examples/
├── SAP/            # Statistical Analysis Plan excerpts (source material)
├── model/          # AC/DC model structures and documentation
├── thunderstruck/  # Thunderstruck DSL code examples
└── SDMX/           # SDMX metadata representations
```

---

## Directory Overview

### [SAP/](SAP/) - Statistical Analysis Plan Examples

Contains SAP excerpts from the [CDISC ADaM Examples 1.0 document](../docs/adam_examples_final.pdf) serving as source material for model refinement and language validation.

**Contents:**
- Example 1: ANCOVA analysis (bone mineral density)
- Examples 1-4: BMD analyses (ANCOVA, categorical, repeated measures, descriptive)
- Example 5: Pain relief (logistic regression)
- Example 6: Mood/depression (multivariate)
- Example 7: FEV1 respiratory (crossover design)
- Example 8: Hy's Law criteria (safety)

**See:** [SAP/README.md](SAP/README.md) for detailed descriptions

### [model/](model/) - AC/DC Model Structures

Contains comprehensive AC/DC model structures derived from SAP examples, demonstrating the three-tier classification (concepts, structures, derivations).

**Contents:**
- `ex01-prompt.md` - Evolution of modeling prompts and iterations
- `ex01-STRUCTURE-p3.md` - Complete AC/DC model for Example 1 with:
  - 18 concepts (biomedical, derivation, analysis)
  - 24 structures (dimensions, measures, attributes, cubes)
  - 11 derivations (slices, methods, displays)
  - Mermaid dependency diagrams
  - End-to-end traceability

**See:** [model/README.md](model/README.md) for model documentation and OOAD principles

### [thunderstruck/](thunderstruck/) - Thunderstruck DSL Examples

Contains Thunderstruck domain-specific language code examples demonstrating syntax and capabilities.

**Feature Examples:**
- `example-01-simple-cube.tsk` - Basic cube structure
- `example-02-with-imports.tsk` - Using imports and standard library
- `example-concept.tsk` - Defining concepts with hierarchies
- `example-slice.tsk` - Creating data slices
- `example-aggregate.tsk` - Computing aggregations
- `example-derive.tsk` - Derived cubes and transformations
- `example-model.tsk` - Statistical models
- `example-display.tsk` - Tables and figures

**Complete Analysis Examples:**
- `ex01-ANACOVA.tsk` - Full ANCOVA analysis implementation
- `ex06-multivariate.tsk` - Multivariate analysis

**See:** [thunderstruck/README.md](thunderstruck/README.md) for language features and known limitations

### [SDMX/](SDMX/) - SDMX Metadata Examples

Contains SDMX (Statistical Data and Metadata eXchange) representations demonstrating how W3C Data Cube vocabulary applies to clinical trial analyses.

**Contents:**
- `ex06-sdmx.xlsx` - SDMX metadata for Example 6
- `examples_sdmx.xlsx` - General SDMX templates

**See:** [SDMX/README.md](SDMX/README.md) for SDMX and Data Cube background

---

## Quick Start

### Understanding the AC/DC Model

Start with the comprehensive Example 1 model:

1. Read the source SAP: [SAP/ex01-ANACOVA.md](SAP/ex01-ANACOVA.md)
2. Review the AC/DC model: [model/ex01-STRUCTURE-p3.md](model/ex01-STRUCTURE-p3.md)
3. Compare with Thunderstruck implementation: [thunderstruck/ex01-ANACOVA.tsk](thunderstruck/ex01-ANACOVA.tsk)

### Learning Thunderstruck

Explore language features in order:

1. **Basic structure**: [thunderstruck/example-01-simple-cube.tsk](thunderstruck/example-01-simple-cube.tsk)
2. **Concepts**: [thunderstruck/example-concept.tsk](thunderstruck/example-concept.tsk)
3. **Data operations**: [thunderstruck/example-slice.tsk](thunderstruck/example-slice.tsk), [example-aggregate.tsk](thunderstruck/example-aggregate.tsk)
4. **Statistical models**: [thunderstruck/example-model.tsk](thunderstruck/example-model.tsk)
5. **Displays**: [thunderstruck/example-display.tsk](thunderstruck/example-display.tsk)

See [ABOUT.md](../thunderstruck/ABOUT.md) for complete language documentation.

---

## Three-Tier AC/DC Model

The AC/DC metamodel organizes entities into three top-level categories:

### 1. Concepts (Abstract Semantic Entities)

- **Biomedical**: Clinical observations and measurements (e.g., BoneMineralDensity)
- **Derivation**: Computed or derived values (e.g., PercentChangeFromBaseline)
- **Analysis**: Analytical constructs (e.g., ANCOVAModel, LeastSquaresMean)

### 2. Structures (Concrete Data Entities)

- **Dimensions**: Components that identify observations (e.g., Subject, TreatmentArm, TimePoint)
- **Measures**: Components containing values (e.g., BMDValue, PercentChangeValue)
- **Attributes**: Components that qualify/interpret (e.g., Population, ImputationMethod)
- **Cubes**: Collections of observations organized by dimensions (e.g., ADBMD)

### 3. Derivations (Transformations and Displays)

- **Slices**: Subsets with fixed dimensions (e.g., ITT_Month24_LOCF)
- **Methods**: Statistical computations (e.g., FitANCOVAModel, ComputeLSMeans)
- **Displays**: Tables, figures, listings (e.g., Table_2_1_3_1)

This model extends the W3C Data Cube vocabulary with clinical trial-specific concepts while maintaining compatibility with OLAP dimensional modeling.

---

## Current Status

### AC/DC Model Refinement

✅ **Complete**: Example 1 (ANCOVA) comprehensive model with full traceability

🔄 **In Progress**: Bottom-up OOAD analysis across multiple CDISC examples

See [GitHub Issue #27](https://github.com/metadatadriven/acdc-wip/issues/27) for:
- Phase 1: Survey and select 5+ diverse examples
- Phase 2: Create detailed models for each example
- Phase 3: Apply OOAD principles to derive general-purpose metamodel
- Phase 4: Validate and document refined metamodel

### Thunderstruck Language

✅ **Working**: Syntax, parser, validation, VS Code extension, standard library

⚠️ **Known Limitations**: Model inconsistencies around derivations and statistical methods

The language limitations are being addressed through the model refinement work in [model/](model/).

---

## Contributing

When adding new examples:

1. **SAP examples**: Place source SAP text in `SAP/` with clear example numbering
2. **Model structures**: Create detailed AC/DC models in `model/` following Example 1 template
3. **Thunderstruck code**: Add `.tsk` files to `thunderstruck/` with inline comments
4. **SDMX metadata**: Add SDMX representations to `SDMX/` in Excel or XML format
5. **Update READMEs**: Add entries to relevant subdirectory README files

### File Naming Conventions

- SAP examples: `SAP_ex##_Description.md` or `ex##-DESCRIPTION.md`
- Model structures: `ex##-STRUCTURE.md` or `ex##-STRUCTURE-p#.md` (for iterations)
- Thunderstruck feature examples: `example-<feature>.tsk`
- Thunderstruck analysis examples: `ex##-<analysis>.tsk`
- SDMX examples: `ex##-sdmx.xlsx` or descriptive names

---

## References

### Standards and Specifications

- **W3C Data Cube Vocabulary**: https://www.w3.org/TR/vocab-data-cube/
- **SDMX Standards**: https://sdmx.org/
- **CDISC ADaM**: https://www.cdisc.org/standards/foundational/adam

### Project Documentation

- [Thunderstruck Language Documentation](../thunderstruck/ABOUT.md)
- [Standard Library Reference](../thunderstruck/packages/thunderstruck-language/stdlib/README.md)
- [VS Code Extension Guide](../thunderstruck/packages/thunderstruck-vscode/README.md)
- [CDISC ADaM Examples (PDF)](../docs/adam_examples_final.pdf)

### Related Issues

- [Issue #27: Bottom-up OOAD analysis of CDISC ADaM examples](https://github.com/metadatadriven/acdc-wip/issues/27)
- [PR #28: Example 1 Comprehensive AC/DC Model Structure](https://github.com/metadatadriven/acdc-wip/pull/28)

---

## Questions or Issues?

- **Thunderstruck language**: See [ABOUT.md](../thunderstruck/ABOUT.md)
- **AC/DC model**: See [model/README.md](model/README.md) or [docs/](../docs/)
- **General questions**: Open an issue on GitHub
