# Thunderstruck VS Code Extension

**Formal, machine-readable Statistical Analysis Plans for Clinical Trials**

Thunderstruck is a domain-specific language (DSL) that enables biostatisticians and clinical programmers to write Statistical Analysis Plans (SAPs) as typed, executable specifications using the W3C Data Cube standard. This VS Code extension provides comprehensive language support with syntax highlighting, real-time diagnostics, and Language Server Protocol (LSP) integration.

## Why Thunderstruck?

Traditional SAPs written in natural language suffer from:
- **Ambiguity**: Different programmers interpret the same SAP differently
- **Implementation Errors**: Manual translation from prose to code introduces mistakes
- **Non-Interoperability**: Results locked in proprietary formats (SAS datasets, custom CSVs)
- **Manual Validation**: Time-consuming human verification of SAP compliance

Thunderstruck solves these problems by providing:
- **Formal Semantics**: Unambiguous specifications using W3C Data Cube vocabulary
- **Automatic Validation**: Built-in type checking and integrity constraints (IC-1 through IC-21)
- **Multi-Target Code Generation**: Generate R, SAS, and Python code from a single specification
- **Semantic Interoperability**: Native RDF export enables SPARQL queries and linked data integration
- **CDISC Compliance**: First-class support for SDTM and ADaM standards

## Quick Start

1. **Install the extension** from the VS Code marketplace or from VSIX
2. **Create a new file** with `.tsk` extension (e.g., `my-analysis.tsk`)
3. **Start writing** your Statistical Analysis Plan using Thunderstruck syntax
4. **See real-time feedback** with syntax highlighting and diagnostics

```thunderstruck
// Define your analysis dataset
cube ADADAS "Analysis Dataset for ADAS-Cog" {
    namespace: "http://example.org/study/xyz#",
    structure: {
        dimensions: [
            USUBJID: Identifier,
            AVISITN: Integer,
            TRT01A: CodedValue
        ],
        measures: [
            CHG: Numeric unit: "points"
        ]
    }
}

// Define your statistical model
model PrimaryEfficacy {
    input: Week24Slice,
    formula: CHG ~ TRT01A + BASE + SITEGR1,
    family: Gaussian,
    link: Identity
}
```

## Features

### Syntax Highlighting

Rich syntax highlighting for Thunderstruck DSL with support for:

- **Core Constructs**: `cube`, `concept`, `slice`, `derive`, `model`, `aggregate`, `display`, `pipeline`
- **Keywords**: `import`, `namespace`, `structure`, `dimensions`, `measures`, `attributes`, `input`, `output`, `formula`, `family`, `link`, etc.
- **Types**: `Numeric`, `Integer`, `Text`, `DateTime`, `Date`, `Flag`, `Identifier`, `CodedValue`
- **Model Families**: `Gaussian`, `Binomial`, `Poisson`, `Gamma`, `InverseGaussian`
- **Link Functions**: `Identity`, `Log`, `Logit`, `Probit`, `Inverse`, `Sqrt`
- **Aggregate Functions**: `mean`, `median`, `stddev`, `variance`, `count`, `sum`, `min`, `max`, `quantile`, `ci_lower`, `ci_upper`
- **Operators**: Logical (`and`, `or`, `not`), comparison (`==`, `!=`, `<`, `>`, etc.), arithmetic (`+`, `-`, `*`, `/`, `^`), formula (`~`)
- **Comments**: Single-line (`//`) and multi-line (`/* */`)

### Language Server Protocol (LSP)

The extension integrates with the Thunderstruck Language Server to provide:

- **Real-time Diagnostics**: Syntax errors are highlighted as you type
- **File Watching**: Automatic updates when `.tsk` files change
- **Parse Validation**: Ensures your Thunderstruck programs are syntactically correct

### Future Features (Coming in Later Increments)

- **Code Completion**: Auto-complete for keywords, types, and identifiers
- **Hover Information**: Type information and documentation on hover
- **Go to Definition**: Navigate to cube, slice, model definitions
- **Find References**: Find all uses of a definition
- **Code Lenses**: Inline actions and reference counts
- **Quick Fixes**: Automated fixes for common errors

## Requirements

- VS Code version 1.80.0 or higher
- Node.js 18.0.0 or higher

## Installation

### From Source (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/metadatadriven/acdc-wip.git
   cd acdc-wip
   ```

2. Install dependencies and build:
   ```bash
   # Install and build the language server
   cd packages/thunderstruck-language
   npm install
   npm run build

   # Install and build the VS Code extension
   cd ../thunderstruck-vscode
   npm install
   npm run build
   ```

3. Launch the extension in development mode:
   - Open the workspace in VS Code
   - Press F5 to launch the Extension Development Host
   - Open a `.tsk` file to activate the extension

### From VSIX Package

1. Build the VSIX package:
   ```bash
   cd packages/thunderstruck-vscode
   npm run package
   ```

2. Install the extension:
   - In VS Code, open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Type "Extensions: Install from VSIX..."
   - Select the generated `thunderstruck-vscode-0.1.0.vsix` file

## Usage

1. Create or open a `.tsk` file (Thunderstruck source file)
2. The extension will automatically activate
3. Start writing your Statistical Analysis Plan using Thunderstruck DSL

### Example

```thunderstruck
// Define an analysis dataset cube
cube ADADAS "Analysis Dataset for ADAS-Cog Total Score" {
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

// Create an analysis slice
slice Week24Efficacy from ADADAS {
    fix: {
        AVISITN: 24,
        EFFFL: "Y"
    },
    vary: [USUBJID, TRT01A],
    measures: [CHG]
}

// Define a statistical model
model DoseResponseLinear {
    input: Week24Efficacy,
    formula: CHG ~ TRT01A + SITEGR1 + BASE,
    family: Gaussian,
    link: Identity
}
```

## File Extensions

The extension recognizes the following file extensions:
- `.tsk` - Thunderstruck source files
- `.thunderstruck` - Alternative extension

## Configuration

Currently, the extension works out of the box with no configuration required.

## Troubleshooting

### Extension not activating

- Ensure you have a `.tsk` file open
- Check the Output panel (View > Output) and select "Thunderstruck Language Server"
- Look for any error messages

### Syntax highlighting not working

- Verify the file has a `.tsk` or `.thunderstruck` extension
- Reload VS Code (Developer: Reload Window)

### Language Server not starting

- Check that the language server is built: `packages/thunderstruck-language/lib/main.js` should exist
- Rebuild the language server: `cd packages/thunderstruck-language && npm run build`

## Development

### Project Structure

```
packages/thunderstruck-vscode/
├── src/
│   └── extension.ts          # Main extension entry point
├── syntaxes/
│   └── thunderstruck.tmLanguage.json  # TextMate grammar
├── language-configuration.json  # Language config (brackets, comments)
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript configuration
```

### Building

```bash
npm run build      # Compile TypeScript
npm run watch      # Watch mode for development
npm run package    # Create VSIX package
```

### Debugging

1. Open the workspace in VS Code
2. Set breakpoints in `src/extension.ts`
3. Press F5 to launch Extension Development Host
4. Open a `.tsk` file to trigger breakpoints

## Contributing

This extension is part of the Thunderstruck project. See the main repository for contribution guidelines.

## License

MIT License - See LICENSE file in the repository root.

## Links

- [Thunderstruck Documentation](../../README.thunderstruck.md)
- [Product Requirements](../../THUNDERSTRUCK_PRD.md)
- [Implementation Plan](../../THUNDERSTRUCK_PLAN.md)
- [GitHub Repository](https://github.com/metadatadriven/acdc-wip)

## Release Notes

### 0.1.0 - Initial Release

- Basic syntax highlighting for Thunderstruck DSL
- LSP integration with real-time diagnostics
- Support for all core language constructs
- File watching for automatic updates
