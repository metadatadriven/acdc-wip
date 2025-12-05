# Thunderstruck DSL Examples

This directory contains Thunderstruck domain-specific language (DSL) code examples demonstrating the syntax and capabilities of the language for authoring clinical trial Statistical Analysis Plans (SAPs).

## About Thunderstruck

Thunderstruck is a DSL for clinical trial biometric analyses, using the W3C Data Cube vocabulary as its foundational abstraction. The language includes:

- Working syntax, parser, and validator
- VS Code extension with syntax highlighting and validation
- Concept hierarchy and standard library
- Integration with CDISC standards

**Status**: The language implementation is functional but not final. The underlying model has known inconsistencies around derivations and statistical methods, which are being addressed through the model refinement work in [../model/](../model/).

For complete language documentation, see [../../README.thunderstruck.md](../../README.thunderstruck.md).

## Language Feature Examples

These standalone examples demonstrate specific Thunderstruck language constructs:

### Core Features

- **[example-01-simple-cube.tsk](example-01-simple-cube.tsk)** - Basic cube structure
  - Dimensions (identifying observations)
  - Measures (observed values)
  - Attributes (qualifiers and metadata)

- **[example-02-with-imports.tsk](example-02-with-imports.tsk)** - Using imports
  - Referencing standard CDISC definitions
  - Reusing concepts from the standard library
  - Namespace management

### Concept Modeling

- **[example-concept.tsk](example-concept.tsk)** - Defining concepts
  - Biomedical concepts with hierarchical types
  - CDISC terminology mappings
  - Units and value domains
  - Concept inheritance

### Data Operations

- **[example-slice.tsk](example-slice.tsk)** - Creating slices
  - Fixing dimension values
  - Applying filter conditions
  - Grouping and aggregation

- **[example-aggregate.tsk](example-aggregate.tsk)** - Computing aggregations
  - Summary statistics (mean, SD, median, etc.)
  - Grouping by dimensions
  - Multiple aggregation functions

- **[example-derive.tsk](example-derive.tsk)** - Creating derived cubes
  - Mathematical transformations
  - Change from baseline calculations
  - Percent change computations

### Statistical Modeling

- **[example-model.tsk](example-model.tsk)** - Statistical models
  - Wilkinson formula notation
  - ANCOVA models
  - Model parameters and outputs
  - **Note**: This area has known limitations being addressed in model refinement

### Display Specifications

- **[example-display.tsk](example-display.tsk)** - Tables and figures
  - Table layouts with rows and columns
  - Formatting specifications
  - Footnotes and metadata
  - Clinical study report formatting

## Complete Analysis Examples

These examples implement full analyses from CDISC ADaM Examples:

- **[ex01-ANACOVA.tsk](ex01-ANACOVA.tsk)** - Example 1: ANCOVA analysis
  - Bone mineral density analysis
  - Drug ABC vs. Placebo comparison
  - Primary efficacy analysis with LOCF
  - **Demonstrates current language limitations**

- **[ex06-multivariate.tsk](ex06-multivariate.tsk)** - Example 6: Multivariate analysis
  - Multiple outcome measures
  - Mood/depression scales
  - Multivariate statistical methods

## Standard Library

Thunderstruck includes a standard library of reusable concepts organized by clinical domain:

```
packages/thunderstruck-language/stdlib/
├── base/           # Core concepts (Value, Visit, Population, etc.)
├── efficacy/       # Efficacy outcome concepts
├── safety/         # Adverse events, lab values, vital signs
├── laboratory/     # Lab test concepts and ranges
└── ...
```

See [../../packages/thunderstruck-language/stdlib/README.md](../../packages/thunderstruck-language/stdlib/README.md) for details.

## Known Limitations

The current Thunderstruck implementation has limitations around:

1. **Statistical Methods**: Inconsistent representation of method inputs/outputs
2. **Derivations**: Unclear distinction between derived cubes and computed measures
3. **Method Chaining**: No clean way to compose multiple statistical operations
4. **Result Association**: Difficulty linking method results back to source data

These limitations are being addressed through systematic model refinement work documented in [../model/](../model/) and tracked in [GitHub Issue #27](https://github.com/metadatadriven/acdc-wip/issues/27).

## Using These Examples

### VS Code Extension

Install the Thunderstruck VS Code extension for:
- Syntax highlighting
- Real-time validation
- Code completion
- Error diagnostics

See [../../packages/thunderstruck-vscode/README.md](../../packages/thunderstruck-vscode/README.md) for installation instructions.

### Command Line

Validate and parse Thunderstruck files using the CLI:

```bash
npm run thunderstruck -- validate examples/thunderstruck/example-01-simple-cube.tsk
```

### Integration

The Thunderstruck parser can be integrated into analysis workflows:

```typescript
import { parseThunderstruck } from '@acdc/thunderstruck-language';

const ast = parseThunderstruck(sourceCode);
// Use AST for validation, transformation, code generation, etc.
```

## Contributing Examples

When adding new examples:

1. Use the `.tsk` file extension
2. Include inline comments explaining demonstrated features
3. Follow the naming convention: `example-<feature>.tsk` or `ex##-<analysis>.tsk`
4. Add entry to this README with description
5. Ensure examples validate without errors (unless demonstrating error handling)

## Related Directories

- **[../SAP/](../SAP/)** - Source SAP examples these implementations are based on
- **[../model/](../model/)** - AC/DC model structures informing language design
- **[../SDMX/](../SDMX/)** - Alternative metadata representations

## Language Reference

For complete language specification and documentation:
- [Thunderstruck Language Documentation](../../README.thunderstruck.md)
- [Standard Library Reference](../../packages/thunderstruck-language/stdlib/README.md)
- [VS Code Extension Guide](../../packages/thunderstruck-vscode/README.md)
