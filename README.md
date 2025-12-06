# Analysis Concepts / Derivation Concepts Work-In-Progress

This repository contains work-in-progress on **Language-Oriented Programming** approaches for CDISC Analysis/Derivation Concepts, with a focus on the **Thunderstruck DSL** for authoring Statistical Analysis Plans (SAPs) in clinical trials.

---

## Language-Oriented Programming Approach

This project explores using **domain-specific languages (DSLs)** and **formal language design** to capture Statistical Analysis Plans as typed, executable specifications. Three alternative approaches have been considered:

### 1. Concept-Centric Approach
**Document:** [LOP-PROPOSAL-CC.md](thunderstruck/proposal/LOP-PROPOSAL-CC.md)

A comprehensive language design treating **concepts as first-class types**:
- **BiomedicalConcept**: Clinical/biological meaning (e.g., ADAS-Cog Total Score)
- **AnalysisConcept**: Analysis-space quantities (e.g., Change from Baseline)
- **DerivationConcept**: Computable transformations (e.g., LOCF Imputation)

Built on **Langium** with strong typing, functional paradigm, and multi-target code generation (R, SAS, Python). Emphasizes type safety, immutability, pure functions, and composability.

### 2. W3C Data Cube-Centric Approach
**Document:** [LOP_PROPOSAL_CC_CUBE.md](thunderstruck/proposal/LOP_PROPOSAL_CC_CUBE.md)

Makes the **W3C Data Cube standard the primary organizing principle**:
- All data structures are cubes (SDTM, ADaM, Results)
- Operations are typed cube transformations
- Native RDF representation for interoperability
- Automatic validation via W3C integrity constraints (IC-1 through IC-21)

Provides semantic precision, provenance tracking, SPARQL queryability, and seamless integration with CDISC standards.

### 3. Streamlined DSL Approach
**Document:** [LOP-PROPOSAL-GPT5.md](thunderstruck/proposal/LOP-PROPOSAL-GPT5.md)

A more compact DSL specification with:
- Clean separation of concerns (concepts, cubes, derivations, analyses, displays)
- Functional pipelines using `|>` operator
- Module system for reusability
- Emphasis on pragmatic syntax for statistician authoring

### Comparison of Approaches

| Aspect | Concept-Centric | Cube-Centric | Streamlined |
|--------|-----------------|--------------|-------------|
| **Primary Focus** | Type hierarchy | Data structure | Pragmatic syntax |
| **Standard Basis** | Custom concepts | W3C Data Cube | Hybrid |
| **Best For** | Clinicians/statisticians | Data engineers | Quick authoring |
| **Strength** | Rich type system | Interoperability | Simplicity |

**Recommended Strategy:** Combine approaches with **concept-centric authoring** that compiles to **cube-centric intermediate representation** for tooling and export.

Thunderstruck is an implementation of the **cube-centric intermediate representation**. An implementation of **concept-centric authoring** will be condidered later in this project and is OUT OF SCOPE currently.

---

## Thunderstruck: Analysis Concepts / Derivation Concept Specification Language

**Thunderstruck** is a domain-specific language for authoring Statistical Analysis Plans using the W3C Data Cube standard. It enables statisticians to:

- Define analyses as **typed cube operations** with automatic validation
- Generate multi-format outputs (R, SAS, Python code; RDF/Turtle metadata)
- Ensure traceability from Protocol → Estimand → Endpoint → Data → Results
- Leverage W3C standards for semantic interoperability

### Project Status

**Current Phase:** Increment 5 - Advanced LSP Features (Complete ✅)

**Latest Achievement:** Full IDE experience with Langium's comprehensive LSP features (PR #TBD)

**Completed Increments:**

#### Increment 5: Advanced LSP Features ✅
- ✅ Code completion (keywords, types, references)
- ✅ Hover information (type details, documentation)
- ✅ Go-to-definition (jump to referenced entities)
- ✅ Find-references (locate all usages)
- ✅ Document symbols (outline view)
- ✅ Real-time diagnostics and error reporting
- ✅ Comprehensive LSP feature tests
- ✅ Sub-100ms response time for all LSP operations
- See [docs/INCREMENT_5_SUMMARY.md](docs/INCREMENT_5_SUMMARY.md) for complete details

#### Increment 4: CDISC + W3C Validation ✅
- ✅ W3C Data Cube Integrity Constraints (5 ICs: IC-1, IC-2, IC-11, IC-12, IC-19)
- ✅ CDISC SDTM Validation (DM, AE, LB domains)
- ✅ CDISC ADaM Validation (ADSL, BDS structures)
- ✅ CDISC CORE Rules Engine (31 rules)
- ✅ Version Management (SDTM 3.2/3.3/3.4, ADaM 1.0/1.1/1.2/1.3)
- ✅ Validation Reporting (JSON, Text, Markdown formats)
- ✅ 402 passing tests with comprehensive integration and performance testing
- ✅ <100ms validation performance for typical programs
- See [docs/INCREMENT_4_PLAN.md](docs/INCREMENT_4_PLAN.md) for complete details

#### Increment 3: Type System + Semantic Validation ✅
- ✅ Type system foundation with inference and checking
- ✅ Symbol table with scoping and reference resolution
- ✅ Semantic validators (slice, model, dependency, expression, formula)
- ✅ Type compatibility checking and conversions
- ✅ Complete integration testing
- See [docs/INCREMENT_3_PLAN.md](docs/INCREMENT_3_PLAN.md) for complete details

#### Increment 2: Enhanced Grammar + LSP Foundation ✅
- ✅ Langium-based grammar for all core constructs
- ✅ VS Code extension with syntax highlighting
- ✅ LSP integration with real-time diagnostics
- ✅ Expression language and Wilkinson formula notation
- ✅ 10 comprehensive example files
- See [docs/INCREMENT_2_REVIEW.md](docs/INCREMENT_2_REVIEW.md) for assessment

#### Increment 1: Foundation ✅
- ✅ Project setup and architecture
- ✅ Basic grammar and parsing
- ✅ Development environment

**Test Coverage:** 403 tests passing (3 skipped)

**Next Phase:** Increment 6 - Standard Library + Examples

**Key Features Now Available:**
- **IDE Experience**: Code completion, go-to-definition, find-references, hover info
- **Standards Validation**: W3C Data Cube integrity constraints, CDISC compliance
- **Type System**: Full type checking with inference and conversions
- **Semantic Validation**: Models, slices, derivations, dependencies
- **Version Management**: SDTM 3.2/3.3/3.4, ADaM 1.0-1.3
- **Validation Reporting**: JSON, Text, Markdown formats
- **Real-time Diagnostics**: Errors and warnings in VS Code
- **Performance**: <100ms validation and LSP response times

### Quick Links

- **Full Documentation:** [ABOUT.md](thunderstruck/ABOUT.md)
- **Product Requirements:** [THUNDERSTRUCK_PRD.md](thunderstruck/docs/THUNDERSTRUCK_PRD.md)
- **Implementation Plan:** [THUNDERSTRUCK_PLAN.md](thunderstruck/docs/THUNDERSTRUCK_PLAN.md)
- **W3C Data Cube Primer:** [W3C_CUBE_PRIMER.md](thunderstruck/docs/W3C_CUBE_PRIMER.md)

### Example Syntax

```thunderstruck
// Standards version declaration
standards {
    SDTM: "3.4",
    ADaM: "1.2",
    W3C_Cube: "2014-01-16"
}

// CDISC-compliant ADaM cube with automatic validation
cube ADADAS {
    namespace: "http://example.org/study/xyz#"
    structure: {
        dimensions: [
            USUBJID: Identifier,
            AVISITN: Integer,
            TRT01A: CodedValue<TRTCD>
        ],
        measures: [
            AVAL: Numeric unit: "points",
            CHG: Numeric unit: "points",
            BASE: Numeric unit: "points"
        ],
        attributes: [
            EFFFL: Flag,
            PARAMCD: CodedValue<PARAM>
        ]
    }
}

// Type-safe slice with automatic IC-11 validation
slice Week24 from ADADAS {
    fix: { AVISITN = 24 },
    vary: [USUBJID, TRT01A],
    where: EFFFL == "Y"
}

// Statistical model with Wilkinson notation
model ANCOVA {
    input: Week24,
    formula: CHG ~ TRT01A + BASE,
    family: Gaussian,
    link: Identity
}
```

**Validation Features:**
- W3C integrity constraints (IC-1, IC-2, IC-11, IC-12, IC-19)
- CDISC SDTM/ADaM conformance checking
- CORE rules validation
- Type checking and inference
- Real-time diagnostics in VS Code

See [examples/](examples/) directory for complete analysis specifications and [thunderstruck/packages/thunderstruck-language/src/__tests__/fixtures/](thunderstruck/packages/thunderstruck-language/src/__tests__/fixtures/) for validation test examples.

---

## Repository Structure

```
acdc-wip/
├── thunderstruck/                  # Thunderstruck DSL implementation
│   ├── packages/
│   │   ├── thunderstruck-language/    # Langium language definition
│   │   └── thunderstruck-vscode/      # VS Code extension
│   ├── proposal/                   # Language design proposals
│   │   ├── LOP-PROPOSAL-CC.md     # Concept-centric approach
│   │   ├── LOP_PROPOSAL_CC_CUBE.md # Cube-centric approach
│   │   └── LOP-PROPOSAL-GPT5.md   # Streamlined DSL approach
│   ├── docs/                       # Thunderstruck documentation
│   │   ├── THUNDERSTRUCK_PRD.md   # Product requirements
│   │   └── THUNDERSTRUCK_PLAN.md  # Implementation plan
│   └── ABOUT.md                    # Full Thunderstruck documentation
├── examples/                       # Example .tsk files and models
└── docs/                           # Supporting documentation
```

## Contributing

This project is in early development. See [THUNDERSTRUCK_PLAN.md](thunderstruck/docs/THUNDERSTRUCK_PLAN.md) for the implementation roadmap and current status.

## License

MIT License - see [LICENSE](LICENSE) file for details

