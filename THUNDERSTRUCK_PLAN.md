# Thunderstruck Implementation Plan

**Version:** 1.0
**Date:** 2025-11-15
**Status:** Draft for Review
**Based on:** THUNDERSTRUCK_PRD.md

---

## Overview

This document outlines an incremental, iterative implementation plan for the Thunderstruck DSL. The plan is structured into 14 increments, each building on the previous one, with clear review points and deliverables.

### Key Principles

1. **Incremental Development**: Build functionality step-by-step
2. **Review After Each Increment**: Stop and review before proceeding
3. **Flexibility**: PRD may be updated and code rebuilt at any point
4. **VS Code First**: First increment targets authoring experience
5. **Code Generation Later**: Focus on language and IDE before code generation
6. **Testability**: Each increment produces testable artifacts

### Project Structure

```
thunderstruck/
├── packages/
│   ├── thunderstruck-language/      # Core Langium language
│   ├── thunderstruck-vscode/        # VS Code extension
│   ├── thunderstruck-cli/           # Command-line tool
│   ├── thunderstruck-codegen-r/     # R code generator
│   ├── thunderstruck-codegen-sas/   # SAS code generator
│   ├── thunderstruck-codegen-rdf/   # RDF/Turtle generator
│   ├── thunderstruck-mcp/           # MCP server
│   └── thunderstruck-stdlib/        # Standard library
├── examples/                         # Example SAP specifications
├── docs/                             # Documentation
└── tests/                            # Integration tests
```

---

## Increment 1: Basic Language Foundation + VS Code Authoring

**Goal:** Can open `.tsk` files in VS Code with syntax highlighting

### Objectives
- Set up project infrastructure
- Create basic Langium grammar for core constructs
- Implement TextMate grammar for syntax highlighting
- Create minimal VS Code extension

### Dependencies
- None (first increment)

### Deliverables

#### 1.1 Project Setup
- [ ] Initialize monorepo with npm workspaces or Lerna
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint and Prettier
- [ ] Set up Jest for testing
- [ ] Create GitHub Actions CI/CD pipeline
- [ ] Initialize Git repository structure

#### 1.2 Langium Language Package
- [ ] Create `thunderstruck-language` package
- [ ] Define basic Langium grammar (`thunderstruck.langium`):
  - Program structure
  - Cube definitions with dimensions, measures, attributes
  - Basic types (Numeric, Integer, Text, DateTime, Date, Flag)
  - Comments (single-line `//`, multi-line `/* */`)
  - Import statements
- [ ] Generate language infrastructure using Langium CLI
- [ ] Implement basic parser tests

#### 1.3 TextMate Grammar
- [ ] Create TextMate grammar (`thunderstruck.tmLanguage.json`):
  - Keywords: `cube`, `dimensions`, `measures`, `attributes`, `namespace`, `structure`
  - Types: `Numeric`, `Integer`, `Text`, `DateTime`, `Date`, `Flag`, `CodedValue`, `Identifier`
  - Strings, numbers, comments
  - Operators: `:`, `[`, `]`, `{`, `}`, `,`
- [ ] Test syntax highlighting in VS Code

#### 1.4 VS Code Extension Skeleton
- [ ] Create `thunderstruck-vscode` package
- [ ] Set up extension manifest (`package.json`):
  - Language ID: `thunderstruck`
  - File extensions: `.tsk`, `.thunderstruck`
  - TextMate grammar reference
- [ ] Configure extension bundling with esbuild
- [ ] Create launch configuration for debugging

#### 1.5 Documentation
- [ ] README with project overview
- [ ] Getting started guide for developers
- [ ] Example `.tsk` file with basic cube definition

### Testing & Validation
- [ ] Can parse simple cube definitions without errors
- [ ] Syntax highlighting works in VS Code
- [ ] Extension loads without errors
- [ ] CI pipeline runs successfully

### Review Checkpoint
**Questions to Answer:**
1. Does the grammar structure support future expansion?
2. Is the project structure maintainable?
3. Does the syntax highlighting provide good visual feedback?
4. Are there any issues with the Langium tooling?

---

## Increment 2: Enhanced Grammar + LSP Foundation

**Goal:** Can write complete Thunderstruck programs with basic error detection

### Objectives
- Expand grammar to support all core constructs
- Implement basic Language Server Protocol (LSP)
- Add diagnostics for syntax errors
- Improve VS Code integration

### Dependencies
- Increment 1 complete

### Deliverables

#### 2.1 Extended Grammar
- [ ] Add `concept` definitions (first-class constructs)
- [ ] Add `slice` definitions (fixing and varying dimensions)
- [ ] Add `transform` definitions (cube-to-cube mappings)
- [ ] Add `model` definitions (statistical models with formulas)
- [ ] Add `aggregate` definitions (summary statistics)
- [ ] Add `display` definitions (tables and figures)
- [ ] Add `pipeline` definitions (DAG of analyses)
- [ ] Add expression language (arithmetic, comparison, logical operators)
- [ ] Add documentation strings (inline doc attached to definitions)

#### 2.2 LSP Implementation
- [ ] Implement Language Server using Langium LSP support
- [ ] Add connection to VS Code via LSP
- [ ] Implement basic diagnostics:
  - Syntax errors
  - Invalid construct usage
- [ ] Test LSP communication

#### 2.3 Enhanced VS Code Extension
- [ ] Connect extension to Language Server
- [ ] Display diagnostics in Problems panel
- [ ] Show error squiggles in editor
- [ ] Add status bar indicator
- [ ] Update TextMate grammar for new keywords

#### 2.4 Parser Tests
- [ ] Test parsing of all construct types
- [ ] Test error recovery
- [ ] Test comment handling
- [ ] Test complex nested structures

#### 2.5 Examples
- [ ] Create example files for each construct:
  - `example-cube.tsk`
  - `example-slice.tsk`
  - `example-model.tsk`
  - `example-display.tsk`
  - `example-pipeline.tsk`

### Testing & Validation
- [ ] All grammar rules parse correctly
- [ ] LSP connection stable
- [ ] Syntax errors shown in VS Code
- [ ] Example files parse without errors
- [ ] Parser handles invalid input gracefully

### Review Checkpoint
**Questions to Answer:**
1. Is the grammar expressive enough for real SAPs?
2. Are error messages helpful?
3. Is the LSP responsive?
4. Do the examples demonstrate key features?
5. Any grammar ambiguities or conflicts?

---

## Increment 3: Type System + Semantic Validation

**Goal:** Type errors caught in real-time

### Objectives
- Implement type system with primitive and compound types
- Add type checking and inference
- Validate cross-references
- Provide semantic diagnostics

### Dependencies
- Increment 2 complete

### Deliverables

#### 3.1 Type System Implementation
- [ ] Define type hierarchy:
  - Primitive types: `Numeric`, `Integer`, `Text`, `DateTime`, `Date`, `Flag`
  - Coded value types with code lists
  - Identifier types
  - Cube types
  - Unit types
- [ ] Implement type checker
- [ ] Implement type inference
- [ ] Add unit compatibility checking

#### 3.2 Semantic Validation
- [ ] Validate variable references in expressions
- [ ] Validate cube references in slices
- [ ] Validate dimension/measure references
- [ ] Check for circular dependencies
- [ ] Validate formula syntax and variable references
- [ ] Check pipeline DAG for cycles

#### 3.3 Enhanced Diagnostics
- [ ] Type mismatch errors
- [ ] Undefined reference errors
- [ ] Unit incompatibility warnings
- [ ] Circular dependency errors
- [ ] Helpful error messages with suggestions

#### 3.4 Symbol Table
- [ ] Build symbol table during parsing
- [ ] Track scope for names
- [ ] Enable cross-reference resolution

#### 3.5 Tests
- [ ] Unit tests for type checker
- [ ] Tests for each validation rule
- [ ] Test error messages
- [ ] Test valid and invalid programs

### Testing & Validation
- [ ] Type errors detected correctly
- [ ] Type inference works for simple cases
- [ ] Cross-references resolve correctly
- [ ] Error messages are actionable
- [ ] No false positives in validation

### Review Checkpoint
**Questions to Answer:**
1. Is the type system expressive enough?
2. Are type error messages clear?
3. Is type inference working as expected?
4. Are there edge cases we're missing?
5. Should we add more type flexibility?

---

## Increment 4: CDISC + W3C Validation

**Goal:** Standards compliance validation working

### Objectives
- Implement W3C Data Cube integrity constraint validation
- Add CDISC validation (SDTM, ADaM, CORE rules)
- Support version-aware validation
- Provide detailed compliance reports

### Dependencies
- Increment 3 complete

### Deliverables

#### 4.1 W3C Data Cube Validation
- [ ] Implement integrity constraints (prioritize critical ones):
  - IC-1: Unique DataSet
  - IC-2: Unique DSD
  - IC-11: All dimensions required
  - IC-12: No duplicate observations
  - IC-19: Codes from code list
- [ ] Add validation diagnostics for each IC
- [ ] Create IC validator framework for future constraints

#### 4.2 CDISC Validation Framework
- [ ] Load CDISC standards metadata:
  - SDTM domain definitions
  - ADaM dataset requirements
  - Controlled terminology
- [ ] Implement SDTM validation rules:
  - Required variables
  - Variable types and formats
  - Controlled terminology compliance
  - ISO 8601 date validation
- [ ] Implement ADaM validation rules:
  - Basic Data Structure (BDS)
  - Required variables (ADSL, BDS)
  - Naming conventions

#### 4.3 CDISC CORE Validation
- [ ] Implement CORE conformance rules engine
- [ ] Load SDTM CORE rules
- [ ] Load ADaM CORE rules
- [ ] Make rules configurable/extensible
- [ ] Report CORE rule violations

#### 4.4 Version Management
- [ ] Support specifying CDISC versions in programs:
  ```thunderstruck
  standards {
      SDTM: "3.4"
      ADaM: "1.2"
      CDISC_CT: "2024-09-27"
  }
  ```
- [ ] Validate against specified versions
- [ ] Provide version compatibility warnings

#### 4.5 Validation Reports
- [ ] Generate validation report with:
  - IC violations
  - CDISC rule violations
  - Severity levels (error, warning, info)
  - Suggestions for fixes
- [ ] Display in VS Code Problems panel
- [ ] Export as JSON/HTML

#### 4.6 Tests
- [ ] Test each IC with valid and invalid cubes
- [ ] Test SDTM validation rules
- [ ] Test ADaM validation rules
- [ ] Test version-specific validation
- [ ] Integration tests with example files

### Testing & Validation
- [ ] IC violations detected correctly
- [ ] CDISC rules applied correctly
- [ ] Version-aware validation works
- [ ] No false positives
- [ ] Validation performance acceptable (<100ms)

### Review Checkpoint
**Questions to Answer:**
1. Are the most important validation rules covered?
2. Is validation performance acceptable?
3. Are error messages actionable?
4. Do we need more CDISC CORE rules initially?
5. Is version management intuitive?

---

## Increment 5: Advanced LSP Features

**Goal:** Full IDE experience with completion, hover, navigation

### Objectives
- Implement code completion
- Add hover information
- Enable go-to-definition
- Add find-references
- Enhance developer experience

### Dependencies
- Increment 3 complete (symbol table needed)

### Deliverables

#### 5.1 Code Completion
- [ ] Context-aware completion suggestions:
  - Keywords (`cube`, `slice`, `model`, etc.)
  - Cube names when referencing
  - Dimension/measure names within cube context
  - Type names
  - Built-in functions
- [ ] Snippet completion for common patterns
- [ ] Trigger characters (`.`, `:`, `[`)

#### 5.2 Hover Information
- [ ] Show documentation on hover:
  - Type information
  - Inline documentation strings
  - Definition location
- [ ] Format hover content with markdown
- [ ] Show signature for functions

#### 5.3 Navigation
- [ ] Go-to-definition:
  - Jump to cube definition
  - Jump to dimension/measure definition
  - Jump to concept definition
- [ ] Find-references:
  - Find all uses of a cube
  - Find all uses of a dimension
- [ ] Document symbols (outline view)

#### 5.4 Code Lenses (optional)
- [ ] Show reference counts
- [ ] Show "Generate R code" action
- [ ] Show "Validate" action

#### 5.5 Quick Fixes
- [ ] Suggest fixes for common errors:
  - Import missing definition
  - Add missing required dimension
  - Fix type mismatch

#### 5.6 Semantic Highlighting
- [ ] Different colors for:
  - Dimensions vs. measures vs. attributes
  - Types vs. values
  - Cube names vs. variable names

#### 5.7 Tests
- [ ] Test completion in various contexts
- [ ] Test hover content accuracy
- [ ] Test navigation accuracy
- [ ] Test performance with large files

### Testing & Validation
- [ ] Completion works in all contexts
- [ ] Hover shows correct information
- [ ] Navigation is accurate
- [ ] Performance is responsive (<100ms)
- [ ] Features work in complex files

### Review Checkpoint
**Questions to Answer:**
1. Is code completion helpful or noisy?
2. Is hover information sufficient?
3. Are navigation features accurate?
4. Should we add more quick fixes?
5. Is the IDE experience smooth?

---

## Increment 6: Standard Library + Examples

**Goal:** Can author real SAPs using standard library

### Objectives
- Create CDISC standard library
- Implement standard transformations
- Add built-in functions
- Provide comprehensive examples

### Dependencies
- Increment 2 complete (grammar)
- Increment 5 complete (for good authoring experience)

### Deliverables

#### 6.1 CDISC Standard Library
- [ ] Create `thunderstruck-stdlib` package
- [ ] Implement SDTM domain cubes:
  - DM (Demographics)
  - AE (Adverse Events)
  - VS (Vital Signs)
  - LB (Laboratory)
  - EX (Exposure)
  - CM (Concomitant Medications)
- [ ] Implement ADaM standard cubes:
  - ADSL (Subject-Level Analysis Dataset)
  - BDS template (Basic Data Structure)
  - ADAE (Adverse Events Analysis)
  - ADTTE (Time-to-Event Analysis)
- [ ] Include CDISC metadata:
  - Variable labels
  - Value level metadata
  - Controlled terminology references

#### 6.2 Standard Transformations
- [ ] Implement common transformations:
  - `ChangeFromBaseline(cube, baseline_condition, value_var)`
  - `PercentChangeFromBaseline(...)`
  - `LOCF(cube, time_var, carry_forward_vars)`
  - `BOCF(cube, time_var, baseline_vars)`
  - `LastObservation(cube, subject_var, time_var, where_clause)`
  - `DeriveBaseline(cube, baseline_definition)`

#### 6.3 Built-in Functions
- [ ] Aggregation functions:
  - `mean()`, `median()`, `stddev()`, `variance()`
  - `count()`, `sum()`, `min()`, `max()`
  - `quantile(p)`, `iqr()`
- [ ] Statistical functions:
  - `ci_lower(alpha)`, `ci_upper(alpha)`
  - `se()` (standard error)
  - `cv()` (coefficient of variation)
- [ ] Date/time functions:
  - `date_diff()`, `add_days()`, `add_months()`
  - `year()`, `month()`, `day()`
- [ ] String functions:
  - `concat()`, `substring()`, `upper()`, `lower()`

#### 6.4 Comprehensive Examples
- [ ] Create example SAPs:
  - `example-01-demographics.tsk` - Basic demographics analysis
  - `example-02-adverse-events.tsk` - AE summary tables
  - `example-03-efficacy-mmrm.tsk` - MMRM analysis
  - `example-04-survival-analysis.tsk` - Time-to-event
  - `example-05-dose-response.tsk` - Dose-response modeling
  - `example-06-subgroup-analysis.tsk` - Subgroup analyses
  - `example-07-sensitivity-analysis.tsk` - Sensitivity analyses
  - `example-08-integrated-safety.tsk` - ISS tables
- [ ] Include detailed comments in examples
- [ ] Add README explaining each example

#### 6.5 Library Documentation
- [ ] Document each standard cube
- [ ] Document each transformation
- [ ] Document each built-in function
- [ ] Create API reference

#### 6.6 Import Mechanism
- [ ] Implement import resolution:
  ```thunderstruck
  import CDISC.SDTM.DM;
  import CDISC.ADaM.ADSL;
  from CDISC.Transformations import ChangeFromBaseline;
  ```
- [ ] Handle namespace resolution
- [ ] Support library versioning

### Testing & Validation
- [ ] All standard library definitions parse correctly
- [ ] Examples run through validation without errors
- [ ] Import mechanism works correctly
- [ ] Standard transformations are well-tested
- [ ] Documentation is complete

### Review Checkpoint
**Questions to Answer:**
1. Is the standard library comprehensive enough?
2. Are the examples realistic?
3. Are transformations flexible enough?
4. Should we add more built-in functions?
5. Is the import mechanism intuitive?

---

## Increment 7: Concept Management

**Goal:** First-class concept support

### Objectives
- Implement concept definitions as first-class constructs
- Add concept namespaces
- Link concepts to cube components
- Support concept interoperability

### Dependencies
- Increment 2 complete (grammar)
- Increment 3 complete (type system)

### Deliverables

#### 7.1 Concept Grammar Extensions
- [ ] Add concept definition syntax:
  ```thunderstruck
  concept SystolicBP "Systolic Blood Pressure" {
      type: BiomedicalConcept
      category: VitalSign
      definition: "Maximum blood pressure during contraction"
      unit: "mmHg"
      codeLists: [
          CDISC.CT.VSTESTCD: "SYSBP",
          LOINC: "8480-6",
          SNOMED: "271649006"
      ]
  }
  ```
- [ ] Support concept types:
  - BiomedicalConcept
  - DerivationConcept
  - AnalysisConcept
- [ ] Link concepts to cube components:
  ```thunderstruck
  dimensions: [
      VSTESTCD: CodedTest concept: SystolicBP
  ]
  ```

#### 7.2 Concept Namespaces
- [ ] Implement namespace mechanism
- [ ] Support standard namespaces:
  - CDISC.Glossary
  - SDMX.Concepts
  - BRIDG
- [ ] Prevent name collisions
- [ ] Support custom namespaces

#### 7.3 Concept Validation
- [ ] Validate concept type compatibility
- [ ] Validate code list references
- [ ] Check concept-to-component linkage
- [ ] Support semantic validation based on concepts

#### 7.4 Concept Library
- [ ] Create standard concept library:
  - Common vital signs concepts
  - Laboratory test concepts
  - Adverse event concepts
  - Efficacy endpoint concepts
- [ ] Include mappings to external terminologies

#### 7.5 Concept Interoperability
- [ ] Define RDF export structure for concepts
- [ ] Link to SDMX concept vocabulary
- [ ] Support concept import from external sources

#### 7.6 Tests
- [ ] Test concept definitions
- [ ] Test concept-component linking
- [ ] Test namespace resolution
- [ ] Test concept validation rules

### Testing & Validation
- [ ] Concepts parse correctly
- [ ] Namespaces prevent collisions
- [ ] Linking to cube components works
- [ ] Validation catches concept errors
- [ ] Standard concept library is usable

### Review Checkpoint
**Questions to Answer:**
1. Is the concept model aligned with SDMX?
2. Are concept types sufficient?
3. Is the linking mechanism clear?
4. Should we support concept hierarchies?
5. Is the standard concept library comprehensive?

---

## Increment 8: Visualizations

**Goal:** Visual understanding of models

### Objectives
- Create cube structure visualizer
- Implement pipeline DAG visualizer
- Add lineage graph visualizer
- Integrate with VS Code

### Dependencies
- Increment 2 complete (all constructs defined)
- Increment 6 helpful (examples to visualize)

### Deliverables

#### 8.1 Visualization Infrastructure
- [ ] Choose visualization library (e.g., D3.js, Cytoscape.js, or similar)
- [ ] Create webview panel in VS Code extension
- [ ] Set up messaging between extension and webview

#### 8.2 Cube Structure Visualizer
- [ ] Visualize cube as diagram:
  - Dimensions (axes)
  - Measures (values)
  - Attributes (metadata)
  - Relationships between cubes
- [ ] Interactive features:
  - Click to see details
  - Highlight related components
  - Export as image (SVG/PNG)
- [ ] Command: "Thunderstruck: Visualize Cube"

#### 8.3 Pipeline DAG Visualizer
- [ ] Visualize pipeline as directed acyclic graph:
  - Nodes: Cubes, transformations, models, aggregates
  - Edges: Data flow
  - Color coding by node type
- [ ] Interactive features:
  - Click node to jump to definition
  - Highlight dependencies
  - Detect cycles (error state)
- [ ] Command: "Thunderstruck: Visualize Pipeline"

#### 8.4 Lineage Graph Visualizer
- [ ] Visualize data lineage:
  - SDTM → ADaM → Analysis → Results
  - Provenance tracking
  - Transformation details
- [ ] Interactive features:
  - Expand/collapse levels
  - Filter by dataset/variable
  - Export provenance report
- [ ] Command: "Thunderstruck: Visualize Lineage"

#### 8.5 VS Code Integration
- [ ] Add commands to command palette
- [ ] Add context menu items
- [ ] Add toolbar buttons
- [ ] Support multiple visualizations simultaneously

#### 8.6 Tests
- [ ] Test visualization rendering
- [ ] Test interactivity
- [ ] Test with complex examples
- [ ] Test performance with large graphs

### Testing & Validation
- [ ] Visualizations render correctly
- [ ] Interactive features work
- [ ] Performance is acceptable
- [ ] Export functionality works
- [ ] Visualizations are helpful

### Review Checkpoint
**Questions to Answer:**
1. Are the visualizations intuitive?
2. Do they provide value?
3. Should we add more visualization types?
4. Is performance acceptable for large models?
5. Are export formats sufficient?

---

## Increment 9: R Code Generation

**Goal:** Can generate working R code from specifications

### Objectives
- Implement R code generator
- Support tidyverse and statistical modeling packages
- Create template system
- Validate generated code

### Dependencies
- Increment 2 complete (grammar)
- Increment 3 complete (type system for code gen context)
- Increment 6 helpful (standard library and examples)

### Deliverables

#### 9.1 Code Generator Infrastructure
- [ ] Create `thunderstruck-codegen-r` package
- [ ] Implement template engine (EJS, Handlebars, or custom)
- [ ] Set up code generation pipeline:
  - AST traversal
  - Template selection
  - Code emission
  - Formatting (styler package)

#### 9.2 R Templates
- [ ] Cube loading template:
  - Read CSV/Parquet/SAS datasets
  - Validate structure
  - Type conversions
- [ ] Slice template:
  - `dplyr::filter()` for fixed dimensions
  - `dplyr::select()` for varying dimensions
- [ ] Transform template:
  - Data manipulation using `dplyr`
  - Custom transformation functions
- [ ] Model templates:
  - Linear models: `lm()`
  - Mixed models: `lme4::lmer()` or `mmrm::mmrm()`
  - GLM: `glm()`
  - Survival: `survival::coxph()`, `survival::survfit()`
- [ ] Aggregate template:
  - `dplyr::summarize()` with aggregation functions
  - `dplyr::group_by()` for grouped stats
- [ ] Display template:
  - Tables: `gt::gt()` or `flextable`
  - Figures: `ggplot2`

#### 9.3 Package Support
- [ ] Support key R packages:
  - `tidyverse` (dplyr, tidyr, ggplot2)
  - `lme4` (mixed models)
  - `mmrm` (MMRM analysis)
  - `survival` (time-to-event)
  - `gt` or `flextable` (tables)
- [ ] Generate package dependency declarations
- [ ] Include version requirements

#### 9.4 Code Quality
- [ ] Generate readable code:
  - Proper indentation
  - Comments explaining steps
  - Meaningful variable names
- [ ] Include header with metadata:
  - Source Thunderstruck file
  - Generation timestamp
  - Required packages
- [ ] Add data validation checks

#### 9.5 CLI Integration
- [ ] Add command: `thunderstruck compile --target r <file.tsk>`
- [ ] Support output directory configuration
- [ ] Generate multiple R files if needed (one per analysis)

#### 9.6 Tests
- [ ] Unit tests for each template
- [ ] Integration tests: compile examples and run R code
- [ ] Validate generated code produces correct results
- [ ] Compare against hand-written reference implementations

### Testing & Validation
- [ ] Generated R code is syntactically valid
- [ ] Generated code runs without errors
- [ ] Results match expected values
- [ ] Code is readable and well-documented
- [ ] Performance is acceptable

### Review Checkpoint
**Questions to Answer:**
1. Is generated R code idiomatic?
2. Are the right packages being used?
3. Is the code readable?
4. Should we support more R packages?
5. Are results numerically correct?

---

## Increment 10: SAS Code Generation

**Goal:** Can generate working SAS code from specifications

### Objectives
- Implement SAS code generator
- Support BASE SAS 9.4 and SAS/STAT procedures
- Generate compliant SAS code
- Validate generated code

### Dependencies
- Increment 9 complete (code generator infrastructure can be shared)

### Deliverables

#### 10.1 SAS Code Generator
- [ ] Create `thunderstruck-codegen-sas` package
- [ ] Implement SAS template engine
- [ ] Set up code generation pipeline

#### 10.2 SAS Templates
- [ ] Cube loading template:
  - `LIBNAME` statements
  - `PROC IMPORT` or `DATA` steps
  - Type validation
- [ ] Slice template:
  - `DATA` step with `WHERE` clause
  - `KEEP` and `DROP` statements
- [ ] Transform template:
  - `DATA` steps for derivations
  - `PROC SQL` for complex transformations
- [ ] Model templates:
  - Linear models: `PROC GLM`, `PROC REG`
  - Mixed models: `PROC MIXED`, `PROC GLIMMIX`
  - Survival: `PROC PHREG`, `PROC LIFETEST`
- [ ] Aggregate template:
  - `PROC MEANS`, `PROC SUMMARY`
  - `PROC SQL` with aggregation
- [ ] Display template:
  - `PROC REPORT` for tables
  - `PROC SGPLOT`, `PROC SGPANEL` for figures
  - ODS output destinations

#### 10.3 SAS Language Features
- [ ] Generate BASE SAS 9.4 compatible code:
  - `DATA` steps
  - `PROC SQL`
  - Macro language (when needed)
  - Formats and informats
- [ ] Use SAS/STAT procedures appropriately
- [ ] Follow SAS naming conventions

#### 10.4 Code Quality
- [ ] Generate readable code:
  - Proper indentation
  - Comments explaining steps
  - Meaningful variable/dataset names
- [ ] Include header with metadata
- [ ] Add data validation steps
- [ ] Use SAS best practices

#### 10.5 CLI Integration
- [ ] Add command: `thunderstruck compile --target sas <file.tsk>`
- [ ] Support output directory configuration
- [ ] Generate `.sas` files

#### 10.6 Tests
- [ ] Unit tests for each template
- [ ] Integration tests (if SAS available):
  - Compile examples
  - Run SAS code
  - Validate results
- [ ] Syntax validation (using SAS log parsing if needed)
- [ ] Compare results to R code output

### Testing & Validation
- [ ] Generated SAS code is syntactically valid
- [ ] Code follows SAS best practices
- [ ] Results match R code output (numerical equivalence)
- [ ] Code is readable and documented
- [ ] Handles CDISC datasets correctly

### Review Checkpoint
**Questions to Answer:**
1. Is generated SAS code idiomatic?
2. Are we using the right PROCs?
3. Is the code compatible with BASE SAS 9.4?
4. Should we add more SAS/STAT procedures?
5. Do results match R code output?

---

## Increment 11: RDF Export

**Goal:** Semantic export to W3C Data Cube RDF/Turtle

### Objectives
- Implement RDF/Turtle generator
- Ensure W3C Data Cube compliance
- Add PROV-O provenance tracking
- Enable SPARQL queries

### Dependencies
- Increment 2 complete (grammar)
- Increment 7 helpful (concepts for richer RDF)

### Deliverables

#### 11.1 RDF Generator Infrastructure
- [ ] Create `thunderstruck-codegen-rdf` package
- [ ] Use N3.js library for RDF generation
- [ ] Implement W3C Data Cube vocabulary mapping

#### 11.2 W3C Data Cube Export
- [ ] Generate Data Structure Definitions (DSDs):
  - ComponentSpecifications
  - DimensionProperties
  - MeasureProperties
  - AttributeProperties
- [ ] Generate cube observations:
  - qb:Observation instances
  - Dimension values
  - Measure values
  - Attribute values
- [ ] Generate proper RDF namespaces

#### 11.3 PROV-O Provenance
- [ ] Track provenance metadata:
  - prov:Entity (datasets, cubes)
  - prov:Activity (transformations, models)
  - prov:Agent (person, software)
  - prov:wasGeneratedBy
  - prov:wasDerivedFrom
  - prov:used
- [ ] Link provenance to cube observations
- [ ] Include timestamp metadata

#### 11.4 Concept Export
- [ ] Export concept definitions to RDF:
  - skos:Concept
  - Links to external ontologies (CDISC, SNOMED, LOINC)
  - Concept schemes and hierarchies
- [ ] Link cube components to concepts

#### 11.5 CDISC SHARE Integration (Optional)
- [ ] Explore CDISC SHARE metadata vocabulary
- [ ] Add SHARE metadata if applicable

#### 11.6 Validation
- [ ] Validate generated RDF:
  - W3C Data Cube validator
  - SHACL shapes validation (if applicable)
  - Syntax validation (Turtle parser)
- [ ] Test SPARQL queries on generated RDF

#### 11.7 CLI Integration
- [ ] Add command: `thunderstruck compile --target rdf <file.tsk>`
- [ ] Support Turtle (.ttl) and JSON-LD output formats
- [ ] Generate vocabulary/ontology files

#### 11.8 Tests
- [ ] Test RDF generation for all examples
- [ ] Validate RDF with W3C validator
- [ ] Test SPARQL queries
- [ ] Test provenance tracking

### Testing & Validation
- [ ] Generated RDF is valid Turtle syntax
- [ ] RDF passes W3C Data Cube validation
- [ ] SPARQL queries work correctly
- [ ] Provenance links are accurate
- [ ] Concepts are properly represented

### Review Checkpoint
**Questions to Answer:**
1. Is the RDF compliant with W3C Data Cube?
2. Is provenance tracking sufficient?
3. Are SPARQL queries useful?
4. Should we add more semantic metadata?
5. Is the RDF interoperable with other systems?

---

## Increment 12: MCP Server

**Goal:** AI-assisted SAP authoring via LLM integration

### Objectives
- Implement Model Context Protocol (MCP) server
- Enable reading and writing Thunderstruck DSL programs
- Support LLM interaction with SAPs
- Provide structured access to language features

### Dependencies
- Increment 2 complete (grammar)
- Increment 3 complete (validation)
- Increments 9-11 helpful (code generation capabilities)

### Deliverables

#### 12.1 MCP Server Infrastructure
- [ ] Create `thunderstruck-mcp` package
- [ ] Implement MCP server protocol
- [ ] Set up server lifecycle management
- [ ] Add authentication/authorization (if needed)

#### 12.2 Core MCP Capabilities
- [ ] Read operations:
  - Read `.tsk` file
  - Parse to AST
  - Return structured representation
  - Query specific elements (cubes, models, etc.)
- [ ] Write operations:
  - Create new Thunderstruck programs
  - Modify existing programs (add/update/delete constructs)
  - Validate changes
  - Save to disk
- [ ] Query operations:
  - "What analyses are defined?"
  - "Show me the efficacy analyses"
  - "What cubes are used in this model?"
  - "What is the provenance of this result?"

#### 12.3 Structured Access
- [ ] Provide access to:
  - Cube definitions and metadata
  - Analysis specifications
  - Validation results
  - Code generation capabilities
  - Standard library
  - Examples

#### 12.4 Conversational SAP Authoring
- [ ] Support LLM-driven workflows:
  - "Create a new cube for ADAE"
  - "Add a slice for Week 24 efficacy population"
  - "Generate an MMRM model for change from baseline"
  - "Validate this SAP against CDISC rules"
- [ ] Provide context and suggestions
- [ ] Handle iterative refinement

#### 12.5 Integration
- [ ] CLI command: `thunderstruck mcp start`
- [ ] Configuration file for MCP server settings
- [ ] Logging and diagnostics

#### 12.6 Client Examples
- [ ] Create example LLM interactions (using Claude, GPT, etc.)
- [ ] Demonstrate conversational SAP authoring
- [ ] Show query capabilities

#### 12.7 Tests
- [ ] Test MCP protocol implementation
- [ ] Test read/write operations
- [ ] Test query operations
- [ ] Integration tests with LLM APIs (mocked)

### Testing & Validation
- [ ] MCP server starts and accepts connections
- [ ] Read/write operations work correctly
- [ ] Queries return accurate results
- [ ] LLM can interact with SAPs effectively
- [ ] Server is stable and performant

### Review Checkpoint
**Questions to Answer:**
1. Is the MCP protocol correctly implemented?
2. Are the operations comprehensive enough?
3. Is LLM interaction smooth?
4. Should we add more query types?
5. Are there security concerns?

---

## Increment 13: Documentation & Reporting

**Goal:** Complete toolchain with documentation generation

### Objectives
- Implement auto-generated documentation
- Add SAP document generation
- Create comprehensive user documentation
- Build CLI tool with all features

### Dependencies
- All previous increments complete

### Deliverables

#### 13.1 Auto-Generated Documentation
- [ ] Generate documentation from Thunderstruck programs:
  - Cube structure documentation
  - Analysis specifications
  - Data flow diagrams
- [ ] Output formats:
  - Markdown
  - HTML (static site)
  - PDF (via Pandoc or similar)

#### 13.2 SAP Document Generation
- [ ] Generate formal SAP document:
  - Title page
  - Table of contents
  - Study information
  - Analysis populations
  - Statistical methods
  - Analysis specifications
  - Shell tables
  - References
- [ ] Output to Word (.docx) or PDF
- [ ] Professional formatting

#### 13.3 Define.xml Generation (Optional)
- [ ] Generate Define.xml from cube definitions
- [ ] Include CDISC metadata
- [ ] Validate against Define.xml schema

#### 13.4 CLI Tool Completion
- [ ] Finalize `thunderstruck-cli` package
- [ ] Commands:
  - `init` - Create new project
  - `compile` - Generate code (R, SAS, RDF)
  - `validate` - Validate SAP
  - `doc` - Generate documentation
  - `visualize` - Generate visualizations
  - `mcp` - Start MCP server
  - `test` - Run tests on SAP
- [ ] Configuration file support
- [ ] Rich CLI output (colors, progress bars)
- [ ] Error handling and help messages

#### 13.5 User Documentation
- [ ] Getting Started Guide
- [ ] Language Reference
- [ ] Standard Library Reference
- [ ] Code Generation Guide
- [ ] IDE Features Guide
- [ ] Best Practices Guide
- [ ] Examples Walkthrough
- [ ] FAQ
- [ ] Troubleshooting Guide

#### 13.6 Developer Documentation
- [ ] Architecture Overview
- [ ] Extension Guide (custom validators, generators)
- [ ] Contributing Guide
- [ ] API Documentation

#### 13.7 Tests
- [ ] Test documentation generation
- [ ] Test SAP document output
- [ ] Test CLI commands
- [ ] Test configuration file handling

### Testing & Validation
- [ ] Documentation is complete and accurate
- [ ] SAP documents are professionally formatted
- [ ] CLI tool is user-friendly
- [ ] All commands work correctly
- [ ] Documentation is helpful for users

### Review Checkpoint
**Questions to Answer:**
1. Is the documentation comprehensive?
2. Are SAP documents publication-ready?
3. Is the CLI tool intuitive?
4. Should we add more output formats?
5. Are there missing user scenarios in docs?

---

## Increment 14: Testing & Polish

**Goal:** Production-ready v1.0 release

### Objectives
- Comprehensive test suite
- Performance optimization
- Bug fixes and polish
- Release preparation

### Dependencies
- All previous increments complete

### Deliverables

#### 14.1 Comprehensive Testing
- [ ] Unit test coverage >80%:
  - Language parser
  - Type system
  - Validators
  - Code generators
- [ ] Integration tests:
  - End-to-end SAP authoring
  - Code generation and execution
  - RDF export and SPARQL queries
  - MCP server interactions
- [ ] Regression tests:
  - All examples
  - Edge cases
  - Error conditions

#### 14.2 Performance Optimization
- [ ] Profile and optimize:
  - LSP responsiveness (<50ms validation)
  - Code generation speed (<500ms)
  - Large file handling
  - Memory usage
- [ ] Benchmark performance
- [ ] Document performance characteristics

#### 14.3 Bug Fixes & Polish
- [ ] Triage and fix all known bugs
- [ ] Improve error messages
- [ ] Enhance user experience
- [ ] Fix edge cases
- [ ] Improve code quality

#### 14.4 Security Review
- [ ] Review for security vulnerabilities
- [ ] Ensure no PHI/PII in error messages
- [ ] Validate input sanitization
- [ ] Check dependencies for vulnerabilities

#### 14.5 Accessibility & Internationalization (Optional)
- [ ] Review VS Code extension accessibility
- [ ] Consider i18n for error messages

#### 14.6 Release Preparation
- [ ] Version all packages to 1.0.0
- [ ] Create CHANGELOG.md
- [ ] Write release notes
- [ ] Prepare GitHub release
- [ ] Create release artifacts:
  - VS Code extension (.vsix)
  - NPM packages
  - CLI binaries (optional)
- [ ] Tag release in Git

#### 14.7 Final Documentation Review
- [ ] Review all documentation for accuracy
- [ ] Update screenshots and examples
- [ ] Proofread and edit
- [ ] Add video tutorials (optional)

#### 14.8 Community Preparation
- [ ] Set up GitHub issue templates
- [ ] Create contribution guidelines
- [ ] Set up discussion forum or Discord
- [ ] Prepare announcement blog post
- [ ] Create demo video

### Testing & Validation
- [ ] All tests pass
- [ ] Performance meets targets
- [ ] No critical or high-priority bugs
- [ ] Documentation is complete
- [ ] Release artifacts build successfully

### Review Checkpoint
**Questions to Answer:**
1. Are we confident in the quality?
2. Is the documentation sufficient for users?
3. Are there any blockers for v1.0?
4. Should we do a beta release first?
5. Is the community ready?

---

## Dependency Graph

```
Increment 1: Basic Language Foundation + VS Code Authoring
    ↓
Increment 2: Enhanced Grammar + LSP Foundation
    ↓
    ├──→ Increment 3: Type System + Semantic Validation
    │       ↓
    │       ├──→ Increment 4: CDISC + W3C Validation
    │       │
    │       └──→ Increment 5: Advanced LSP Features
    │               ↓
    │               Increment 6: Standard Library + Examples
    │                   ↓
    │                   ├──→ Increment 7: Concept Management
    │                   │
    │                   ├──→ Increment 8: Visualizations
    │                   │
    │                   ├──→ Increment 9: R Code Generation
    │                   │       ↓
    │                   │       Increment 10: SAS Code Generation
    │                   │           ↓
    │                   │           Increment 11: RDF Export
    │                   │               ↓
    │                   │               Increment 12: MCP Server
    │                   │                   ↓
    │                   │                   Increment 13: Documentation & Reporting
    │                   │                       ↓
    │                   └───────────────────────┴──→ Increment 14: Testing & Polish
```

---

## Iteration Strategy

### Review Cycle
After each increment:
1. **Demo**: Show working features
2. **Review**: Assess quality and completeness
3. **Decide**:
   - **Proceed** to next increment
   - **Iterate** on current increment
   - **Update PRD** if requirements changed
   - **Refactor** if needed before proceeding

### Flexibility Points
You may decide to:
- Skip optional features (marked with SHOULD)
- Reorder increments (respecting dependencies)
- Combine small increments
- Split large increments
- Update PRD based on learning

### Exit Criteria for Each Increment
- All deliverables complete
- Tests passing
- Documentation updated
- Review checkpoint questions answered
- Stakeholder approval

---

## Timeline Estimate

| Increment | Estimated Duration | Cumulative |
|-----------|-------------------|------------|
| 1. Basic Language Foundation | 2 weeks | 2 weeks |
| 2. Enhanced Grammar + LSP | 2 weeks | 4 weeks |
| 3. Type System + Validation | 3 weeks | 7 weeks |
| 4. CDISC + W3C Validation | 4 weeks | 11 weeks |
| 5. Advanced LSP Features | 2 weeks | 13 weeks |
| 6. Standard Library + Examples | 4 weeks | 17 weeks |
| 7. Concept Management | 2 weeks | 19 weeks |
| 8. Visualizations | 2 weeks | 21 weeks |
| 9. R Code Generation | 3 weeks | 24 weeks |
| 10. SAS Code Generation | 3 weeks | 27 weeks |
| 11. RDF Export | 2 weeks | 29 weeks |
| 12. MCP Server | 2 weeks | 31 weeks |
| 13. Documentation & Reporting | 3 weeks | 34 weeks |
| 14. Testing & Polish | 4 weeks | 38 weeks |

**Total Estimated Duration:** ~38 weeks (~9 months)

**Note:** This assumes:
- 1 full-time developer
- Learning curve with Langium
- Includes review/iteration time
- Buffer for unknowns

With multiple developers or if you're already familiar with Langium, timeline could be compressed.

---

## Risk Management

### Key Risks
1. **Langium Learning Curve**: Mitigation: Early prototyping, community engagement
2. **CDISC Complexity**: Mitigation: Start with core rules, expand iteratively
3. **Code Generation Accuracy**: Mitigation: Extensive testing, reference implementations
4. **Performance Issues**: Mitigation: Continuous profiling, optimization sprints
5. **Scope Creep**: Mitigation: Strict increment discipline, defer features to v2.0

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Adjust** increments, timeline, or dependencies as needed
3. **Begin Increment 1** when approved
4. **Set up** project infrastructure and team
5. **Schedule** regular review meetings after each increment

---

**Document Status:** Ready for Review
**Next Action:** Review and approve before starting Increment 1
