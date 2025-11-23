# Change Log

All notable changes to the Thunderstruck VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-11-18

### Added

#### Core Language Support
- Comprehensive syntax highlighting for all Thunderstruck DSL constructs
- Support for core constructs: `cube`, `concept`, `slice`, `transform`, `model`, `aggregate`, `display`, `pipeline`
- Syntax highlighting for all keywords, types, operators, and language elements
- Support for `.tsk` and `.thunderstruck` file extensions

#### Language Server Protocol (LSP) Integration
- Real-time diagnostics with syntax error detection
- Language Server running in background for continuous validation
- File watching with automatic updates when `.tsk` files change
- Proper LSP client lifecycle management (start/stop)
- Debug mode support with Node.js inspector on port 6009

#### Visual Feedback
- Status bar indicator showing language server state:
  - ✅ Green checkmark when server is running
  - 🔄 Spinning icon when server is starting
  - ⛔ Warning indicator when server is stopped
  - Error state with detailed messages on failure
- Hover tooltips with server status information
- Problems panel integration for error reporting

#### Language Features
- **Keywords**: import, as, from, where, depends, on, namespace, structure, dimensions, measures, attributes, etc.
- **Types**: Numeric, Integer, Text, DateTime, Date, Flag, Identifier, CodedValue
- **Model Families**: Gaussian, Binomial, Poisson, Gamma, InverseGaussian
- **Link Functions**: Identity, Log, Logit, Probit, Inverse, Sqrt
- **Concept Types**: BiomedicalConcept, DerivationConcept, AnalysisConcept
- **Aggregate Functions**: mean, median, stddev, variance, count, sum, quantile, ci_lower, ci_upper
- **Operators**: Logical (and, or, not), comparison (==, !=, <, >, <=, >=), arithmetic (+, -, *, /, ^), formula (~)
- **Comments**: Single-line (//) and multi-line (/* */)

#### Documentation
- Comprehensive README with:
  - Quick start guide
  - Feature descriptions
  - Installation instructions (from source and VSIX)
  - Usage examples
  - Troubleshooting guide
  - Development instructions
- CHANGELOG for tracking releases
- Inline documentation in extension code

#### Testing & Quality
- 44 passing parser tests
- 10 comprehensive example files
- Integration tests for LSP functionality
- Full build pipeline with TypeScript compilation

### Technical Details

- Extension activates on opening `.tsk` or `.thunderstruck` files
- Language server communicates via IPC transport
- Supports both Node.js 18+ and VS Code 1.80+
- Built with TypeScript 5.3+
- Uses Langium 3.5+ for language server implementation
- TextMate grammar for syntax highlighting
- Language Server Protocol client v9.0+

### Known Limitations

- Advanced LSP features (code completion, hover info, go-to-definition) planned for future releases
- Code generation capabilities (R, SAS, Python) not yet available in extension
- RDF export features not yet exposed in extension UI

### Future Enhancements (Roadmap)

**Increment 2** (Planned):
- Enhanced diagnostics with semantic validation
- Better error messages with suggestions
- Validation against CDISC standards

**Increment 5** (Planned):
- Code completion (auto-complete for keywords, types, identifiers)
- Hover information (type info and documentation)
- Go to definition (navigate to cube, slice, model definitions)
- Find references (find all uses of a definition)
- Code lenses (inline actions and reference counts)
- Quick fixes (automated fixes for common errors)

**Later Increments** (Planned):
- Cube structure visualizer
- Pipeline DAG visualizer
- Data lineage graph viewer
- Code generation commands (generate R/SAS/Python)
- RDF export functionality

---

## Release Notes Format

Each release will include:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

---

**Project Status**: Alpha - Active Development

For more information, see:
- [Thunderstruck Documentation](https://github.com/metadatadriven/acdc-wip/blob/main/README.thunderstruck.md)
- [Product Requirements](https://github.com/metadatadriven/acdc-wip/blob/main/THUNDERSTRUCK_PRD.md)
- [Implementation Plan](https://github.com/metadatadriven/acdc-wip/blob/main/THUNDERSTRUCK_PLAN.md)
