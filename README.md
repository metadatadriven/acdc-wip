# Analysis Concepts / Derivation Concepts Work-In-Progress

This repository contains work-in-progress on **Language-Oriented Programming** approaches for CDISC Analysis/Derivation Concepts, with a focus on the **Thunderstruck DSL** for authoring Statistical Analysis Plans (SAPs) in clinical trials.

---

## Language-Oriented Programming Approach

This project explores using **domain-specific languages (DSLs)** and **formal language design** to capture Statistical Analysis Plans as typed, executable specifications. Three alternative approaches have been considered:

### 1. Concept-Centric Approach
**Document:** [LOP-PROPOSAL-CC.md](LOP-PROPOSAL-CC.md)

A comprehensive language design treating **concepts as first-class types**:
- **BiomedicalConcept**: Clinical/biological meaning (e.g., ADAS-Cog Total Score)
- **AnalysisConcept**: Analysis-space quantities (e.g., Change from Baseline)
- **DerivationConcept**: Computable transformations (e.g., LOCF Imputation)

Built on **Langium** with strong typing, functional paradigm, and multi-target code generation (R, SAS, Python). Emphasizes type safety, immutability, pure functions, and composability.

### 2. W3C Data Cube-Centric Approach
**Document:** [LOP_PROPOSAL_CC_CUBE.md](LOP_PROPOSAL_CC_CUBE.md)

Makes the **W3C Data Cube standard the primary organizing principle**:
- All data structures are cubes (SDTM, ADaM, Results)
- Operations are typed cube transformations
- Native RDF representation for interoperability
- Automatic validation via W3C integrity constraints (IC-1 through IC-21)

Provides semantic precision, provenance tracking, SPARQL queryability, and seamless integration with CDISC standards.

### 3. Streamlined DSL Approach
**Document:** [LOP-PROPOSAL-GPT5.md](LOP-PROPOSAL-GPT5.md)

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

**Current Phase:** Increment 1 - Basic Language Foundation + VS Code Authoring (Complete ✅)

**Key Deliverables:**
- Langium-based grammar for core constructs (cubes, dimensions, measures)
- VS Code extension with syntax highlighting
- Type system and validation infrastructure
- Example `.tsk` files demonstrating syntax

### Quick Links

- **Full Documentation:** [README.thunderstruck.md](README.thunderstruck.md)
- **Product Requirements:** [THUNDERSTRUCK_PRD.md](THUNDERSTRUCK_PRD.md)
- **Implementation Plan:** [THUNDERSTRUCK_PLAN.md](THUNDERSTRUCK_PLAN.md)
- **W3C Data Cube Primer:** [W3C_CUBE_PRIMER.md](W3C_CUBE_PRIMER.md)

### Example Syntax

```thunderstruck
cube ADADAS {
    namespace: "http://example.org/study/xyz#"
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
```

See [examples/](examples/) directory for complete analysis specifications.

---

## Repository Structure

```
acdc-wip/
├── packages/
│   ├── thunderstruck-language/    # Langium language definition
│   └── thunderstruck-vscode/      # VS Code extension
├── examples/                       # Example .tsk files
├── docs/                           # Supporting documentation
├── LOP-PROPOSAL-CC.md             # Concept-centric approach
├── LOP_PROPOSAL_CC_CUBE.md        # Cube-centric approach
├── LOP-PROPOSAL-GPT5.md           # Streamlined DSL approach
├── THUNDERSTRUCK_PRD.md           # Product requirements
├── THUNDERSTRUCK_PLAN.md          # Implementation plan
└── README.thunderstruck.md        # Full Thunderstruck documentation
```

## Contributing

This project is in early development. See [THUNDERSTRUCK_PLAN.md](THUNDERSTRUCK_PLAN.md) for the implementation roadmap and current status.

## License

MIT License - see [LICENSE](LICENSE) file for details

