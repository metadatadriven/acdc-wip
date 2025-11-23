# Thunderstruck Extension - User-Facing Information

This document shows what users will see when they view the Thunderstruck extension in VS Code's Extensions panel or marketplace.

## Extension Display Name
**Thunderstruck - Statistical Analysis Plans DSL**

## Description (Shown in Extension List)
```
Language support for Thunderstruck DSL - A domain-specific language for authoring
Statistical Analysis Plans (SAPs) in clinical trials using W3C Data Cube standards.
Provides syntax highlighting, real-time diagnostics, and LSP integration for formal,
machine-readable analysis specifications.
```

## Categories
- Programming Languages
- Linters
- Data Science

## Keywords (for search/discovery)
- clinical-trials
- statistical-analysis
- CDISC
- SDTM
- ADaM
- DSL
- biostatistics
- pharmaceutical
- W3C
- data-cube
- SAP
- langium
- language-server

## Version
0.1.0 (Alpha)

## Publisher
thunderstruck

## Requirements
- VS Code: ^1.80.0 or higher
- Node.js: 18.0.0 or higher

## Links Shown to Users

### Homepage
https://github.com/metadatadriven/acdc-wip/blob/main/README.thunderstruck.md

### Repository
https://github.com/metadatadriven/acdc-wip

### Issues/Bugs
https://github.com/metadatadriven/acdc-wip/issues

### Q&A/Discussions
https://github.com/metadatadriven/acdc-wip/discussions

## Badges
- Project Status: Alpha (orange badge)

## What Users See in Details Tab

When users click on the extension in VS Code, they see the README.md content with:

1. **Header Section**
   - Extension title: "Thunderstruck VS Code Extension"
   - Tagline: "Formal, machine-readable Statistical Analysis Plans for Clinical Trials"
   - Description of what Thunderstruck is

2. **Why Thunderstruck?**
   - Problem statement (traditional SAP issues)
   - Solution benefits (formal semantics, validation, code generation, etc.)

3. **Quick Start** (4 simple steps with code example)
   - Install extension
   - Create .tsk file
   - Write SAP code
   - See real-time feedback

4. **Features**
   - Syntax Highlighting (with detailed list)
   - Language Server Protocol (real-time diagnostics, file watching)
   - Future Features (code completion, hover, go-to-def, etc.)

5. **Requirements**
   - VS Code and Node.js versions

6. **Installation**
   - From source (development)
   - From VSIX package

7. **Usage**
   - Step-by-step guide
   - Complete code example

8. **File Extensions**
   - .tsk (primary)
   - .thunderstruck (alternative)

9. **Configuration**
   - Works out of the box

10. **Troubleshooting**
    - Extension not activating
    - Syntax highlighting issues
    - Language server problems

11. **Development**
    - Project structure
    - Building instructions
    - Debugging guide

12. **Links**
    - Documentation links
    - GitHub repository

13. **Release Notes**
    - Version 0.1.0 features

## What Users See in Changelog Tab

Complete changelog with:
- Version 0.1.0 (2024-11-18)
- Detailed feature list organized by category:
  - Core Language Support
  - LSP Integration
  - Visual Feedback
  - Language Features
  - Documentation
  - Testing & Quality
  - Technical Details
  - Known Limitations
  - Future Enhancements (roadmap)

## Extension Activation

The extension activates when:
- A `.tsk` file is opened
- A `.thunderstruck` file is opened

## Visual Indicators When Active

Users will see:
1. **Syntax highlighting** in editor (colorized code)
2. **Status bar item** (bottom-right):
   - "✅ Thunderstruck" when running
   - "🔄 Thunderstruck" when starting
   - "⛔ Thunderstruck" if stopped
3. **Problems panel** with any syntax errors
4. **Squiggly underlines** for syntax errors in code

## Commands Available

- `Thunderstruck: Hello World` (test command)
  - Shows info message
  - Verifies extension is loaded

## Example Use Case

When a user:
1. Installs the extension
2. Creates `my-analysis.tsk`
3. Types: `cube ADADAS {`

They immediately see:
- `cube` highlighted as a keyword (purple/blue)
- `ADADAS` highlighted as an identifier
- `{` highlighted as a bracket
- Real-time validation (missing structure, etc.)
- Status bar showing "✅ Thunderstruck"
- Suggestions in problems panel if syntax is incorrect

## Value Proposition for Users

**For Biostatisticians:**
- Write SAPs in a formal, precise language
- Get immediate feedback on syntax errors
- Avoid ambiguity in analysis specifications
- Create machine-readable, executable SAPs

**For Clinical Programmers:**
- Understand analysis intent unambiguously
- Generate code automatically (future feature)
- Validate analysis implementation
- Trace from protocol to results

**For Data Scientists:**
- Work with CDISC standards (SDTM, ADaM)
- Export to W3C Data Cube RDF format
- Query across studies with SPARQL
- Integrate with semantic web tools

**For All Users:**
- Modern IDE experience with VS Code
- Real-time error detection
- Comprehensive syntax highlighting
- Professional development workflow
