# Thunderstruck DSL

A domain-specific language (DSL) for authoring Statistical Analysis Plans (SAPs) in clinical trials, using the W3C Data Cube standard as its foundational abstraction.

## Overview

Thunderstruck enables biostatisticians and clinical programmers to write Statistical Analysis Plans as typed, executable specifications with:

- **Formal semantics** using W3C Data Cube vocabulary
- **Automatic validation** against CDISC SDTM/ADaM standards and cube integrity constraints
- **Multi-target code generation** (R, SAS, Python planned)
- **Semantic interoperability** via RDF/Turtle export
- **Rich IDE experience** in VS Code with full LSP features

## Directory Structure

```
thunderstruck/
├── ABOUT.md                  # Complete language documentation
├── README.md                 # This file
│
├── packages/                 # Implementation packages
│   ├── thunderstruck-language/   # Langium language server
│   │   ├── src/                  # Language implementation
│   │   │   ├── grammar/          # Langium grammar definition
│   │   │   ├── validation/       # Validators (CDISC, W3C, semantic)
│   │   │   ├── types/            # Type system and inference
│   │   │   ├── lsp/              # LSP features (hover, completion, etc.)
│   │   │   └── stdlib/           # Standard library concepts
│   │   └── stdlib/               # Standard library .tsk files
│   │       └── concepts/         # Domain concept definitions
│   └── thunderstruck-vscode/     # VS Code extension
│       ├── src/                  # Extension implementation
│       └── syntaxes/             # TextMate grammar
│
├── docs/                     # Documentation
│   ├── THUNDERSTRUCK_PRD.md      # Product requirements
│   ├── THUNDERSTRUCK_PLAN.md     # Implementation plan
│   ├── W3C_CUBE_PRIMER.md        # W3C Data Cube introduction
│   └── README.sdmx.md            # SDMX overview
│
├── proposal/                 # Language design proposals
│   ├── LOP_PROPOSAL_CC_CUBE.md   # W3C Data Cube-centric approach
│   ├── LOP-PROPOSAL-CC.md        # Concept-centric approach
│   └── LOP-PROPOSAL-GPT5.md      # Streamlined DSL approach
│
├── package.json              # Monorepo configuration
├── lerna.json                # Lerna monorepo setup
├── tsconfig.json             # TypeScript configuration
└── jest.config.js            # Jest test configuration
```

## Project Status

**Current Phase:** Increment 6 Complete ✅ | Next: Increment 7 - Concept Management

### Completed Increments

Thunderstruck follows an incremental development approach outlined in [docs/THUNDERSTRUCK_PLAN.md](docs/THUNDERSTRUCK_PLAN.md).

#### ✅ Increment 6: Standard Library + Examples
- Standard library with reusable concept definitions
- Base concepts (Value, Visit, Population, etc.)
- Domain-specific concept libraries:
  - Vital signs (blood pressure, heart rate, temperature, etc.)
  - Laboratory tests (hemoglobin, glucose, liver enzymes, etc.)
  - Efficacy endpoints (ADAS-Cog, MMSE, FEV1, etc.)
  - Adverse events (severity, causality, MedDRA classifications)
- Concept hierarchy with inheritance
- CDISC/NCI/STATO terminology mappings
- Located in `packages/thunderstruck-language/stdlib/`
- See [packages/thunderstruck-language/stdlib/README.md](packages/thunderstruck-language/stdlib/README.md)

#### ✅ Increment 5: Advanced LSP Features
- Code completion (keywords, types, references)
- Hover information with type details
- Go-to-definition and find-references
- Document symbols (outline view)
- Real-time diagnostics
- Sub-100ms LSP response time
- See [../docs/INCREMENT_5_SUMMARY.md](../docs/INCREMENT_5_SUMMARY.md)

#### ✅ Increment 4: CDISC + W3C Validation
- W3C Data Cube Integrity Constraints (IC-1, IC-2, IC-11, IC-12, IC-19)
- CDISC SDTM/ADaM validation
- CDISC CORE Rules Engine (31 rules)
- Version management (SDTM 3.2/3.3/3.4, ADaM 1.0-1.3)
- Validation reporting (JSON, Text, Markdown)
- 402 passing tests, <100ms performance
- See [../docs/INCREMENT_4_PLAN.md](../docs/INCREMENT_4_PLAN.md)

#### ✅ Increment 3: Type System + Semantic Validation
- Type system with inference and checking
- Symbol table with scoping
- Semantic validators (slice, model, dependency, expression, formula)
- Type compatibility and conversions
- See [../docs/INCREMENT_3_PLAN.md](../docs/INCREMENT_3_PLAN.md)

#### ✅ Increment 2: Enhanced Grammar + LSP Foundation
- Complete Langium grammar
- VS Code extension with syntax highlighting
- LSP integration with real-time diagnostics
- Expression language and Wilkinson formula notation
- See [../docs/INCREMENT_2_REVIEW.md](../docs/INCREMENT_2_REVIEW.md)

#### ✅ Increment 1: Foundation
- Monorepo setup with Lerna
- Basic grammar and parsing
- Development environment

### Test Coverage

- **403 tests passing** (3 skipped)
- Parser tests, validator tests, integration tests, performance tests
- Sub-100ms validation and LSP response times

### GitHub Issues

Implementation tracked through GitHub issues:
- Increment 1-6 work: See closed issues with labels `increment-1` through `increment-6`
- Upcoming work: See open issues labeled `increment-7`

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- VS Code >= 1.80.0 (for extension development)

### Quick Start

```bash
# From the thunderstruck directory
cd thunderstruck

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Build VS Code extension
cd packages/thunderstruck-vscode
npm run build
npm run package  # Creates .vsix file
```

### VS Code Extension

To use the Thunderstruck VS Code extension:

1. Build the extension (see above)
2. Install the `.vsix` file:
   - Open VS Code
   - Command Palette → "Extensions: Install from VSIX..."
   - Select `thunderstruck-vscode-*.vsix`
3. Open a `.tsk` file to activate the extension

### Example Thunderstruck Program

```thunderstruck
// CDISC-compliant ADaM analysis dataset
cube ADADAS {
    namespace: "http://example.org/study/xyz#",
    structure: {
        dimensions: [
            USUBJID: Identifier,
            AVISITN: Integer,
            TRT01A: CodedValue
        ],
        measures: [
            AVAL: Numeric unit: "points",
            CHG: Numeric unit: "points"
        ],
        attributes: [
            EFFFL: Flag,
            PARAMCD: CodedValue
        ]
    }
}

// Analysis slice with automatic validation
slice Week24 from ADADAS {
    fix: { AVISITN = 24, EFFFL = "Y" },
    vary: [USUBJID, TRT01A],
    measures: [CHG]
}

// Statistical model with Wilkinson notation
model ANCOVA {
    input: Week24,
    formula: CHG ~ TRT01A + BASE,
    family: Gaussian,
    link: Identity
}
```

## Documentation

### Core Documentation

- **[ABOUT.md](ABOUT.md)** - Complete language documentation
  - Language overview and philosophy
  - Comprehensive syntax reference
  - Cube, slice, model, display constructs
  - Type system details
  - Standard library concepts

- **[docs/THUNDERSTRUCK_PRD.md](docs/THUNDERSTRUCK_PRD.md)** - Product Requirements
  - Vision and goals
  - User stories and requirements
  - Success criteria

- **[docs/THUNDERSTRUCK_PLAN.md](docs/THUNDERSTRUCK_PLAN.md)** - Implementation Plan
  - 14 increments with detailed deliverables
  - Testing and validation criteria
  - Timeline and dependencies

### Technical Documentation

- **[docs/W3C_CUBE_PRIMER.md](docs/W3C_CUBE_PRIMER.md)** - W3C Data Cube Vocabulary
  - Introduction to RDF Data Cube
  - Dimensions, measures, attributes
  - Integrity constraints
  - Application to clinical trials

- **[docs/README.sdmx.md](docs/README.sdmx.md)** - SDMX Overview
  - Statistical Data and Metadata eXchange
  - Relationship to W3C Data Cube
  - Clinical trial applications

### Design Proposals

- **[proposal/LOP_PROPOSAL_CC_CUBE.md](proposal/LOP_PROPOSAL_CC_CUBE.md)** - W3C Data Cube-Centric Approach (CURRENT)
  - Makes Data Cube the primary organizing principle
  - All structures are cubes with typed transformations
  - Native RDF representation

- **[proposal/LOP-PROPOSAL-CC.md](proposal/LOP-PROPOSAL-CC.md)** - Concept-Centric Approach
  - Treats concepts as first-class types
  - Rich type hierarchy
  - Alternative future direction

- **[proposal/LOP-PROPOSAL-GPT5.md](proposal/LOP-PROPOSAL-GPT5.md)** - Streamlined DSL Approach
  - Compact specification
  - Functional pipelines
  - Pragmatic syntax

### Examples

See [../examples/thunderstruck/](../examples/thunderstruck/) for:
- Feature examples (cubes, slices, models, displays)
- Complete analysis implementations
- Standard library usage

## Features

### Current Features (Increments 1-6)

- ✅ **Full Language Grammar** - All core constructs implemented
- ✅ **VS Code Integration** - Syntax highlighting, real-time diagnostics
- ✅ **LSP Features** - Code completion, hover, go-to-definition, find-references
- ✅ **Type System** - Type inference, checking, conversions
- ✅ **Standards Validation** - CDISC SDTM/ADaM, W3C Data Cube ICs
- ✅ **CORE Rules** - 31 CDISC conformance rules
- ✅ **Semantic Validators** - Slice, model, formula, expression, dependency validation
- ✅ **Version Management** - Support for multiple SDTM/ADaM versions
- ✅ **Reporting** - JSON, Text, Markdown validation reports
- ✅ **Standard Library** - Reusable concept definitions (vital signs, labs, efficacy, AEs)

### Planned Features (Increments 7-14)

- 🔄 **Concept Management** - Namespaces, inheritance, validation (Increment 7)
- 📋 **Visualizations** - Cube structure, pipeline DAG viewers (Increment 8)
- 📋 **R Code Generation** - tidyverse/rlang output (Increment 9)
- 📋 **SAS Code Generation** - DATA step/PROC output (Increment 10)
- 📋 **RDF Export** - Turtle/RDF-XML for SPARQL queries (Increment 11)
- 📋 **MCP Server** - Model Context Protocol integration (Increment 12)
- 📋 **Documentation** - User guides, tutorials (Increment 13)
- 📋 **Polish** - Performance, UX refinement (Increment 14)

## Contributing

Thunderstruck is in active development. See [docs/THUNDERSTRUCK_PLAN.md](docs/THUNDERSTRUCK_PLAN.md) for the roadmap.

### Development Workflow

1. Review the current increment in the plan
2. Check open issues on GitHub
3. Make changes in a feature branch
4. Run tests: `npm test`
5. Submit pull request

## Related Projects

This is part of the AC/DC (Analysis Concept / Derivation Concept) project for clinical trial biometric analyses:

- **Main Repository**: [../](../)
- **Examples**: [../examples/](../examples/)
- **Model Refinement**: [../model/](../model/) (Issue #27)

## License

MIT License - See [../LICENSE](../LICENSE) file for details.

## Links

- **GitHub Repository**: https://github.com/metadatadriven/acdc-wip
- **Issue Tracker**: https://github.com/metadatadriven/acdc-wip/issues
- **W3C Data Cube**: https://www.w3.org/TR/vocab-data-cube/
- **CDISC Standards**: https://www.cdisc.org/standards
