# Thunderstruck

A domain-specific language (DSL) for authoring Statistical Analysis Plans (SAPs) in clinical trials, using the W3C Data Cube standard as its foundational abstraction.

## Overview

Thunderstruck provides:
- **Formal language** for specifying analyses using W3C Data Cube vocabulary
- **Automatic validation** against CDISC standards and cube integrity constraints
- **Multi-target code generation** (R, SAS) from single specification
- **Semantic interoperability** via RDF export
- **Rich IDE support** in VS Code with syntax highlighting

## Project Status

**Current Phase:** Increment 1 - Basic Language Foundation + VS Code Authoring

### Completed
- ✅ Monorepo setup with Lerna
- ✅ TypeScript, ESLint, Prettier, Jest configuration
- ✅ Langium grammar for core constructs
- ✅ TextMate grammar for syntax highlighting
- ✅ VS Code extension skeleton

### In Progress
- Documentation and examples

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- VS Code >= 1.80.0

### Installation

```bash
# Clone the repository
git clone https://github.com/metadatadriven/acdc-wip.git
cd acdc-wip

# Install dependencies
npm install

# Build all packages
npm run build
```

### VS Code Extension Development

```bash
# Build the extension
npm run build --workspace=thunderstruck-vscode

# Open VS Code to the extension directory
code packages/thunderstruck-vscode

# Press F5 to launch the Extension Development Host
```

## Project Structure

```
thunderstruck/
├── packages/
│   ├── thunderstruck-language/      # Core Langium language
│   ├── thunderstruck-vscode/        # VS Code extension
│   ├── thunderstruck-cli/           # Command-line tool (future)
│   ├── thunderstruck-codegen-r/     # R code generator (future)
│   ├── thunderstruck-codegen-sas/   # SAS code generator (future)
│   ├── thunderstruck-codegen-rdf/   # RDF/Turtle generator (future)
│   ├── thunderstruck-mcp/           # MCP server (future)
│   └── thunderstruck-stdlib/        # Standard library (future)
├── examples/                         # Example SAP specifications
├── docs/                             # Documentation
└── tests/                            # Integration tests
```

## Language Features (Increment 1)

The Thunderstruck DSL currently supports:

### Cube Definitions
```thunderstruck
cube ADADAS "Analysis dataset for ADAS-Cog scores" {
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
            PARAMCD: CodedValue,
            EFFFL: Flag
        ]
    }
}
```

### Types
- Primitive: `Numeric`, `Integer`, `Text`, `DateTime`, `Date`, `Flag`
- Coded values: `CodedValue`
- Identifiers: `Identifier`
- Units: `unit: "string"`

### Comments
- Single-line: `// comment`
- Multi-line: `/* comment */`

### Imports
```thunderstruck
import CDISC.ADaM.ADSL;
import CDISC.SDTM.DM as Demographics;
```

## Documentation

- [THUNDERSTRUCK_PRD.md](THUNDERSTRUCK_PRD.md) - Product Requirements Document
- [THUNDERSTRUCK_PLAN.md](THUNDERSTRUCK_PLAN.md) - Implementation Plan
- [Getting Started Guide](docs/GETTING_STARTED.md) - Developer guide (coming soon)
- [Language Reference](docs/LANGUAGE_REFERENCE.md) - Complete language specification (coming soon)

## Development

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=thunderstruck-language

# Watch mode
npm run watch --workspace=thunderstruck-language
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=thunderstruck-language
```

### Linting

```bash
# Check code style
npx eslint packages/*/src

# Fix code style issues
npx eslint packages/*/src --fix
```

## Contributing

This project is currently in early development. See [THUNDERSTRUCK_PLAN.md](THUNDERSTRUCK_PLAN.md) for the implementation roadmap.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

Built with [Langium](https://langium.org/) - A language engineering framework for TypeScript

Based on:
- [W3C Data Cube Vocabulary](https://www.w3.org/TR/vocab-data-cube/)
- [CDISC Standards](https://www.cdisc.org/standards)
- [ICH E9(R1) Guidelines](https://www.ema.europa.eu/en/ich-e9-statistical-principles-clinical-trials)

## Contact

Statistical Computing & Data Science Team
