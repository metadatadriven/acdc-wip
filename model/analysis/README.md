# AC/DC Model Analysis Documentation

## Overview

This directory contains comprehensive requirements analysis, design principles, and domain modeling documentation for the AC/DC (Adaptive Clinical Data Capture) metamodel. The documentation follows a structured approach to define a CDISC-compliant, three-tier architecture for representing clinical trial data and analyses.

## Directory Contents

### Requirements Documentation

**Model_REQUIREMENTS.md**
Complete technical requirements specification combining user, business, and architectural requirements for the AC/DC metamodel. Defines the comprehensive structure for clinical trial data representation.

**Model_USER_REQUIREMENTS.md**
User-focused requirements covering clinical trial workflows, data collection, analysis, and regulatory submission needs from the perspective of end users (biostatisticians, data managers, clinical programmers).

**Model_BUSINESS_REQUIREMENTS.md**
Business objectives and strategic requirements for the AC/DC metamodel, including regulatory compliance, data standards alignment (CDISC), and operational efficiency goals.

### Design Principles

**Model_PRINCIPLES.md**
Core architectural and design principles guiding AC/DC metamodel development:
- Three-tier architecture (Display ↔ Logical ↔ Physical)
- Unidirectional dependencies
- Immutability of physical tier
- CDISC standards alignment
- Separation of concerns

### Comparative Analysis

**Model_COMPARISON.md**
Cross-model comparison analyzing how different metamodels (Define-XML, ODM, Dataset-JSON, ADaM) represent clinical trial concepts. Identifies convergence patterns and best practices to inform AC/DC design.

### Domain-Driven Design

**eSAP_DOMAIN_DESIGN.md**
Comprehensive Domain-Driven Design (DDD) analysis of the electronic Statistical Analysis Plan (eSAP) domain:
- 8 bounded contexts (Study Design, Statistical Analysis, Data Management, Safety, Efficacy, Interim Analysis, Regulatory, Reporting)
- 8 core aggregates (Protocol, SAP, Analysis Set, Derived Variable, Adverse Event, Estimand, Sample Size, TFL)
- Ubiquitous language aligned with ICH E3/E9/E9(R1) and CDISC standards
- Domain events, services, and business rules
- Context mappings and integration patterns

### Example Use Cases

**Model_ex01-ex04_BMD.md**
Bone Mineral Density (BMD) analysis examples demonstrating:
- Continuous endpoint analyses
- Change from baseline calculations
- Analysis visit mapping
- Summary statistics presentations

**Model_ex05_Pain.md**
Pain scale analysis example covering:
- Ordered categorical endpoints
- Patient-reported outcomes
- Visual analog scales (VAS)
- Responder analyses

**Model_ex06_Mood.md**
Mood assessment example illustrating:
- Multi-item questionnaires
- Composite score derivations
- Missing item handling
- Psychometric endpoints

**Model_ex07_FEV1.md**
Forced Expiratory Volume (FEV1) respiratory example showing:
- Physiological measurements
- Percent predicted calculations
- Clinical significance thresholds
- Longitudinal analyses

**Model_ex08_HysLaw.md**
Hy's Law safety analysis example demonstrating:
- Composite safety endpoints
- Laboratory reference ranges
- Safety signal detection
- Regulatory safety criteria

### Development Prompts

**Model_PROMPT.md**
Initial prompts and guidance used to generate model documentation, preserving the analytical approach and requirements gathering methodology.

## Document Relationships

```
Model_PRINCIPLES.md
       ↓ (guides)
Model_REQUIREMENTS.md ← (consolidates) ← Model_USER_REQUIREMENTS.md
       ↓                                   Model_BUSINESS_REQUIREMENTS.md
       ↓ (informs)
Model_COMPARISON.md
       ↓ (validates)
eSAP_DOMAIN_DESIGN.md
       ↓ (demonstrates)
Model_ex*.md (examples)
```

## Standards Alignment

All documentation aligns with:
- **CDISC Standards**: SDTM, ADaM, Define-XML, Dataset-JSON, ODM
- **ICH Guidelines**: E3 (Clinical Study Reports), E9 (Statistical Principles), E9(R1) Addendum (Estimands)
- **Regulatory Requirements**: FDA, EMA expectations for data standards and analysis documentation

## Usage

1. **For Requirements Analysis**: Start with Model_REQUIREMENTS.md for complete specification
2. **For Architecture Design**: Review Model_PRINCIPLES.md for design constraints and patterns
3. **For Standards Comparison**: Consult Model_COMPARISON.md for cross-model insights
4. **For Domain Modeling**: Reference eSAP_DOMAIN_DESIGN.md for DDD patterns and bounded contexts
5. **For Implementation Examples**: Examine Model_ex*.md files for concrete use cases

## Version Control

All documents are version-controlled in the main repository. Changes should be committed with descriptive messages referencing the relevant issue or feature branch.

## Related Documentation

- **eSAP/SAP_Template.md**: Source Statistical Analysis Plan template that informed the eSAP domain design
- **thunderstruck/**: Thunderstruck implementation project applying these model concepts
- **CLAUDE.md**: Project-level instructions and conventions

## Contributing

When adding new analysis documentation:
1. Follow the established naming convention: `Model_ex##_ShortName.md`
2. Include clear use case description, data structures, and CDISC mappings
3. Update this README with the new document description
4. Reference relevant sections of Model_REQUIREMENTS.md and Model_PRINCIPLES.md

---

**Last Updated**: 2025-12-06
**Branch**: dev/stuart/27-bottom-up
