# AC/DC Metamodel Documentation

## Overview

This directory contains the comprehensive documentation for the **AC/DC (Analysis Conceptualization and Derivation Cube) metamodel** - a framework for specifying clinical trial statistical analyses in a structured, standards-aligned, and reproducible manner.

The documentation follows a layered approach:
1. **Guiding Principles** - Foundational architectural commitments
2. **Domain Design** - Strategic domain-driven design analysis
3. **Requirements and Analysis** - Detailed specifications and comparative analysis
4. **Examples** - Concrete use cases demonstrating the model

---

## Core Documentation

### Model_PRINCIPLES.md

**[AC/DC Model Guiding Principles](./Model_PRINCIPLES.md)** (Version 5.0)

The foundational document that establishes the 8 non-negotiable architectural principles guiding all AC/DC metamodel design, implementation, and usage decisions:

1. **GP-1: Layered Architecture with Unidirectional Dependencies** - Three-layer separation (Concepts → Structures → Derivations)
2. **GP-2: Analysis Reproducibility and Provenance** - Immutable entities with directed acyclic dependencies
3. **GP-3: Complete End-to-End Traceability** - Full traceability from displays to source concepts
4. **GP-4: CDISC Standards Alignment** - Integration with USDM, SDTM, ADaM, and ARS
5. **GP-5: Extensible Core with Progressive Refinement** - Domain-agnostic core with domain-specific extensions
6. **GP-6: Declarative Analysis Specification** - Concept-based declarative specification of analyses
7. **GP-7: Regulatory Framework Compliance** - ICH E9(R1) estimand framework and GxP compliance
8. **GP-8: Explicit and Automated Quality Rules** - Quality checks as part of model specification

**Start here** to understand the architectural foundation of the AC/DC metamodel.

---

## Directory Structure

```
model/
├── Model_PRINCIPLES.md          # 👈 START HERE - Core guiding principles (v5.0)
├── README.md                    # This file
│
├── design/                      # Domain-Driven Design analysis
│   ├── README.md               # ContextMapper DSL documentation
│   ├── eSAP_DOMAIN_DESIGN.md   # Comprehensive DDD analysis
│   ├── eSAP.cml                # Formal ContextMapper model
│   └── diagrams/               # Generated architecture diagrams
│       ├── eSAP_ContextMap.png      # Context map visualization
│       ├── eSAP_ContextMap.svg      # Context map (vector)
│       ├── eSAP_ContextMap.puml     # Context map (PlantUML)
│       └── eSAP_BC_*.puml           # Bounded context diagrams
│
├── analysis/                    # Requirements analysis and examples
│   ├── README.md               # Analysis documentation overview
│   ├── Model_REQUIREMENTS.md          # Complete technical requirements
│   ├── Model_USER_REQUIREMENTS.md     # User-focused requirements
│   ├── Model_BUSINESS_REQUIREMENTS.md # Business objectives
│   ├── Model_COMPARISON.md            # Cross-model comparison
│   ├── Model_PROMPT.md                # Initial prompts and methodology
│   │
│   └── Examples/               # Concrete use cases
│       ├── Model_ex01-ex04_BMD.md     # Bone Mineral Density
│       ├── Model_ex05_Pain.md         # Pain scale analysis
│       ├── Model_ex06_Mood.md         # Mood assessment
│       ├── Model_ex07_FEV1.md         # Respiratory function
│       └── Model_ex08_HysLaw.md       # Hy's Law safety
│
└── prompts/                     # Development guidance
    └── contextmapper.md        # ContextMapper DSL patterns
```

---

## Documentation Layers

### 1. Architectural Principles (THIS LEVEL)

**Model_PRINCIPLES.md** - The foundation document establishing non-negotiable commitments:
- Layered architecture with clear separation of concerns
- Reproducibility through immutability and DAG structure
- Complete traceability from displays to source concepts
- CDISC standards alignment (USDM, SDTM, ADaM, ARS)
- Declarative specification through concepts
- Regulatory framework compliance (ICH E9(R1), GxP)

### 2. Domain Design (design/)

**Strategic Analysis:**
- **eSAP_DOMAIN_DESIGN.md** - Comprehensive Domain-Driven Design analysis identifying:
  - 8 bounded contexts (Study Design, Statistical Analysis, Data Management, Safety Monitoring, Efficacy Assessment, Interim Analysis, Regulatory Compliance, Reporting)
  - Core, Supporting, and Generic subdomains
  - Context relationships (Shared Kernel, Partnership, Customer-Supplier, Conformist)
  - Strategic and tactical patterns

**Formal Model:**
- **eSAP.cml** - Machine-readable ContextMapper DSL model enabling:
  - Automated diagram generation
  - Model validation
  - Architecture documentation
  - MDSL API contract generation

### 3. Requirements and Analysis (analysis/)

**Requirements Specifications:**
- **Model_REQUIREMENTS.md** - Comprehensive technical requirements
- **Model_USER_REQUIREMENTS.md** - End-user workflows and needs
- **Model_BUSINESS_REQUIREMENTS.md** - Strategic business objectives

**Comparative Analysis:**
- **Model_COMPARISON.md** - Cross-model analysis of existing standards (Define-XML, ODM, Dataset-JSON, ADaM) to inform AC/DC design decisions

**Use Case Examples:**
- **BMD, Pain, Mood, FEV1, Hy's Law** - Concrete examples demonstrating how the metamodel represents different analysis types

---

## Standards Alignment

The AC/DC metamodel aligns with industry standards:

### CDISC Standards
- **USDM** (Unified Study Definitions Model) - Protocol definitions
- **SDTM** (Study Data Tabulation Model) - Source data structure
- **ADaM** (Analysis Data Model) - Analysis dataset standard
- **ARS** (Analysis Results Standard) - Results metadata
- **Controlled Terminology** - Standard vocabularies (NCI Thesaurus, LOINC, SNOMED)

### ICH Guidelines
- **ICH E3** - Clinical Study Reports structure and content
- **ICH E9** - Statistical Principles for Clinical Trials
- **ICH E9(R1)** - Estimands and Sensitivity Analysis Addendum

### Regulatory Requirements
- **FDA, EMA, PMDA** - Health authority expectations
- **21 CFR Part 11** - Electronic records and signatures
- **GxP Principles** - Good Clinical, Laboratory, and Manufacturing Practices

---

## Usage Guide

### For Different Roles

**Statisticians / Biostatisticians:**
1. Start with **Model_PRINCIPLES.md** to understand the architectural foundation
2. Review **Model_REQUIREMENTS.md** for detailed functional requirements
3. Examine **Model_ex*.md** files for concrete analysis examples
4. Reference **eSAP_DOMAIN_DESIGN.md** for domain concepts

**Software Architects:**
1. Read **Model_PRINCIPLES.md** for architectural constraints and patterns
2. Study **design/eSAP_DOMAIN_DESIGN.md** for bounded context design
3. Review **design/eSAP.cml** and diagrams for formal architecture model
4. Understand **Model_COMPARISON.md** for standards integration

**Statistical Programmers:**
1. Focus on **Model_PRINCIPLES.md** GP-4 (CDISC Alignment) and GP-6 (Declarative Specification)
2. Review **Model_ex*.md** examples for implementation patterns
3. Reference **Model_REQUIREMENTS.md** for technical specifications
4. Check **design/eSAP_DOMAIN_DESIGN.md** Section 4 (Data Management Context)

**Regulatory Affairs / QA:**
1. Review **Model_PRINCIPLES.md** GP-7 (Regulatory Compliance) and GP-8 (Quality Rules)
2. Study **Model_BUSINESS_REQUIREMENTS.md** for compliance objectives
3. Examine **design/eSAP_DOMAIN_DESIGN.md** Section 7 (Regulatory Compliance Context)
4. Reference ICH E9(R1) estimand framework implementation

### Recommended Reading Order

**First-Time Users:**
1. **Model_PRINCIPLES.md** - Understand the "why" behind design decisions
2. **design/README.md** - Overview of domain structure
3. **Model_ex08_HysLaw.md** - Simple, concrete example
4. **Model_REQUIREMENTS.md** - Detailed specifications

**Domain Modelers:**
1. **Model_PRINCIPLES.md** - Architectural constraints
2. **design/eSAP_DOMAIN_DESIGN.md** - Strategic DDD analysis
3. **design/eSAP.cml** - Formal model
4. **Model_COMPARISON.md** - Standards alignment patterns

**Implementers:**
1. **Model_PRINCIPLES.md** - Design principles
2. **Model_REQUIREMENTS.md** - Technical requirements
3. **Model_ex*.md** - Implementation examples
4. **design/diagrams/** - Architecture visualizations

---

## Key Concepts

### Three-Layer Architecture

The AC/DC metamodel is built on a strict three-layer architecture (GP-1):

```
┌─────────────────────────────────────┐
│  Derivations (Top Layer)            │  - Methods, Slices, Displays
│  MAY reference ↓                    │  - Transformations
└─────────────────────────────────────┘  - Presentations
            ↓ depends on
┌─────────────────────────────────────┐
│  Structures (Middle Layer)          │  - Cubes, Dimensions
│  MAY reference ↓ ONLY               │  - Measures, Attributes
└─────────────────────────────────────┘  - Data organization
            ↓ depends on
┌─────────────────────────────────────┐
│  Concepts (Bottom Layer)            │  - Biomedical concepts
│  SHALL NOT reference ↑              │  - Derivation concepts
└─────────────────────────────────────┘  - Analysis concepts
```

### Cube as Fundamental Unit

A **Cube** is a multi-dimensional data structure containing:
- **Dimensions** - Identify and organize observations (Subject, Visit, Treatment, Parameter)
- **Measures** - Quantitative or qualitative values being analyzed
- **Attributes** - Qualify dimensions and measures

### Directed Acyclic Graph (DAG)

All cube dependencies form a DAG ensuring:
- Clear data lineage and provenance
- Reproducibility (same inputs → same outputs)
- Safe parallel execution
- Well-defined computation order

### Estimand Framework

First-class support for ICH E9(R1) estimands with all five components:
1. Treatment condition
2. Population
3. Variable (endpoint)
4. Intercurrent events (with handling strategy)
5. Population-level summary measure

---

## Version History

### Current Version: 5.0 (Model_PRINCIPLES.md)

**Latest Changes (2025-12-08):**
- Removed software engineering jargon for statistician accessibility
- Simplified OOP terminology to plain language
- Standardized terminology (layers, elements) throughout
- Deleted Programming Language Analogy table
- Improved clarity while maintaining technical accuracy

**Previous Versions:**
- **v4.0** - Consolidated from 13 to 8 principles through strategic merges
- **v3.0** - Removed 4 principles, simplified to 13
- **v2.0** - Added 4 new principles from eSAP domain design
- **v1.0** - Initial 13 guiding principles

See [Model_PRINCIPLES.md - Change History](./Model_PRINCIPLES.md#appendix-change-history) for complete version details.

---

## Contributing

When adding or updating documentation:

1. **Follow naming conventions:**
   - Principles: `Model_PRINCIPLES.md`
   - Requirements: `Model_*_REQUIREMENTS.md`
   - Examples: `Model_ex##_ShortName.md`
   - Design: `eSAP_*.md` or `eSAP_*.cml`

2. **Maintain traceability:**
   - Reference relevant principles (e.g., "see GP-4 for CDISC alignment")
   - Link to source requirements
   - Update version history

3. **Update this README:**
   - Add new documents to directory structure
   - Update version history section
   - Add relevant cross-references

4. **Validate changes:**
   - Ensure consistency with Model_PRINCIPLES.md
   - Verify CDISC standards alignment
   - Check cross-references are valid

---

## Related Projects

- **thunderstruck/** - Implementation of AC/DC metamodel concepts
- **eSAP/** - Statistical Analysis Plan templates and examples
- **examples/** - Additional clinical trial data examples

---

## References

### Domain-Driven Design
- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software" (Blue Book)
- Vaughn Vernon - "Implementing Domain-Driven Design" (Red Book)
- ContextMapper - https://contextmapper.org/

### CDISC Standards
- CDISC Website - https://www.cdisc.org/
- USDM - Unified Study Definitions Model
- SDTM - Study Data Tabulation Model
- ADaM - Analysis Data Model
- ARS - Analysis Results Standard

### ICH Guidelines
- ICH E3 - Structure and Content of Clinical Study Reports
- ICH E9 - Statistical Principles for Clinical Trials
- ICH E9(R1) Addendum - Estimands and Sensitivity Analysis in Clinical Trials

### Regulatory
- FDA - U.S. Food and Drug Administration
- EMA - European Medicines Agency
- PMDA - Pharmaceuticals and Medical Devices Agency (Japan)

---

**Last Updated:** 2025-12-08
**Current Branch:** dev/stuart/27-bottom-up
**Document Version:** 1.0
**Model Version:** 5.0 (Principles)
