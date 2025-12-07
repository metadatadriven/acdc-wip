# eSAP Domain Model - ContextMapper DSL

This directory contains formal Domain-Driven Design (DDD) models for the electronic Statistical Analysis Plan (eSAP) domain, expressed using the ContextMapper DSL (CML).

## Files

- **eSAP_DOMAIN_DESIGN.md** - Comprehensive DDD analysis document (source for CML model):
  - Domain-Driven Design analysis of the eSAP domain
  - Bounded context definitions and responsibilities
  - Context relationships and integration patterns
  - Aggregate design and tactical patterns
  - Strategic domain classification

- **eSAP.cml** - Formal ContextMapper DSL model (generated from eSAP_DOMAIN_DESIGN.md):
  - Domain and subdomain definitions
  - 8 bounded contexts with aggregates
  - Context map showing relationships
  - Tactical DDD patterns (entities, value objects, services)

- **diagrams/** - Generated architecture visualizations (generated from eSAP.cml):
  - **eSAP_ContextMap.png** - Context map showing all bounded contexts and relationships (PNG)
  - **eSAP_ContextMap.svg** - Context map (scalable vector graphics)
  - **eSAP_ContextMap.puml** - Context map (PlantUML source)
  - **eSAP_ContextMap.gv** - Context map (GraphViz source)
  - **eSAP_BC_*_*.puml** - PlantUML class diagrams for each bounded context and aggregate

## Source Documentation

The CML model is derived from:
- **eSAP_DOMAIN_DESIGN.md** - Comprehensive DDD analysis of the eSAP domain

## Domain Structure

### Subdomains

The ClinicalTrialsDomain contains 8 subdomains classified by strategic importance:

**Core Domains (Competitive Differentiators):**
1. **StudyDesignManagement** - Protocol, objectives, endpoints, estimands
2. **StatisticalMethodology** - Statistical methods, models, hypothesis testing
3. **EfficacyEvaluation** - Treatment effect analysis and evaluation

**Supporting Domains (Necessary but not differentiating):**
4. **DataManagement** - Analysis datasets, derivations, quality
5. **SafetyMonitoring** - Adverse event capture and coding
6. **InterimAnalysisControl** - Adaptive decision-making
7. **OutputGeneration** - TFLs (Tables, Figures, Listings)

**Generic Domains (Standard functionality):**
8. **RegulatoryCompliance** - ICH guideline adherence, quality control

### Bounded Contexts

Each subdomain is implemented by a corresponding bounded context:

| Context | Key Aggregates | Technology |
|---------|---------------|------------|
| StudyDesignContext | Protocols | Java, Spring Boot, CDISC USDM |
| StatisticalAnalysisContext | StatisticalAnalysisPlans | R, SAS, Python |
| DataManagementContext | AnalysisSets, DerivedVariables | SAS, R, CDISC ADaM |
| SafetyMonitoringContext | AdverseEvents | SAS, MedDRA, CDISC SDTM/ADaM |
| EfficacyAssessmentContext | EfficacyAnalyses | R, SAS, CDISC ADaM |
| InterimAnalysisContext | InterimAnalyses | R, SAS, DMC Systems |
| RegulatoryComplianceContext | ComplianceAudits | QMS, Validation Tools |
| ReportingContext | TFLs | SAS, R, CDISC ARS |

## Context Relationships

The context map defines the following strategic relationships:

### Shared Kernel
- **StudyDesignContext ↔ StatisticalAnalysisContext**
  - Shared: Estimand framework
  - Requires close coordination

### Partnership
- **StatisticalAnalysisContext ↔ EfficacyAssessmentContext**
  - Equal collaboration on statistical methods
  - Shared infrastructure

### Customer-Supplier (Upstream → Downstream)

**Data Management as Supplier:**
- DataManagementContext → StatisticalAnalysisContext (ADaM datasets)
- DataManagementContext → SafetyMonitoringContext (Safety data, MedDRA coding)
- DataManagementContext → EfficacyAssessmentContext (Efficacy datasets)

**Reporting as Customer:**
- StatisticalAnalysisContext → ReportingContext (Analysis specifications)
- EfficacyAssessmentContext → ReportingContext (Efficacy results)
- SafetyMonitoringContext → ReportingContext (Safety summaries)

### Conformist
All contexts conform to:
- **RegulatoryComplianceContext** (ICH guidelines, quality standards)

### Orchestration
- **InterimAnalysisContext** coordinates multiple contexts for interim looks

## Key Aggregates

### Study Design Context
- **Protocols** - Protocol versioning, objectives, endpoints, estimands, study design

### Statistical Analysis Context
- **StatisticalAnalysisPlans** - SAP versions, analysis specifications, sample size calculations

### Data Management Context
- **AnalysisSets** - FAS, Safety, Per-Protocol population definitions
- **DerivedVariables** - Variable derivation rules and transformations

### Safety Monitoring Context
- **AdverseEvents** - AE capture, MedDRA coding, treatment-emergent determination

### Efficacy Assessment Context
- **EfficacyAnalyses** - Treatment effect estimation, hypothesis testing

### Interim Analysis Context
- **InterimAnalyses** - DMC decisions, stopping rules, alpha spending

### Regulatory Compliance Context
- **ComplianceAudits** - Compliance verification, findings, audit trail

### Reporting Context
- **TFLs** - Tables, Figures, Listings specifications and generation

## Standards Integration

The model integrates industry standards:

- **CDISC**
  - USDM (Unified Study Data Model) - Protocol digitization
  - SDTM (Study Data Tabulation Model) - Source data
  - ADaM (Analysis Data Model) - Analysis datasets
  - ARS (Analysis Results Standard) - Results representation
  - Controlled Terminology - Standardized vocabularies

- **ICH Guidelines**
  - E3 - Clinical Study Report structure
  - E9 - Statistical Principles
  - E9(R1) - Estimands and Sensitivity Analysis

- **Medical Coding**
  - MedDRA - Adverse event coding
  - WHO Drug Dictionary - Medication coding

## Using the Model

### Prerequisites

1. Install ContextMapper:
   - VS Code Extension: https://marketplace.visualstudio.com/items?itemName=contextmapper.context-mapper-vscode-extension
   - Eclipse Plugin: https://contextmapper.org/docs/eclipse/
   - CLI Tool: https://github.com/ContextMapper/context-mapper-cli

2. Review ContextMapper documentation:
   - Language Reference: https://contextmapper.org/docs/language-reference/
   - Examples: https://github.com/ContextMapper/context-mapper-examples

### Viewing the Model

Open `eSAP.cml` in:
- VS Code with ContextMapper extension
- Eclipse with ContextMapper plugin
- Any text editor (CML is human-readable)

### Generating Artifacts

ContextMapper can generate various outputs from CML models:

**Architecture Diagrams:**
```bash
# Generate context map visualization
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g context-map -o diagrams/

# Generate PlantUML class diagrams
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g plantuml -o diagrams/
```

**API Contracts:**
```bash
# Generate MDSL (Microservice Domain-Specific Language) contracts
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g mdsl -o generated/
```

**Custom Templates:**
```bash
# Generate custom output using Freemarker templates
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g generic -t template.ftl -f output.txt
```

### Model Validation

ContextMapper provides built-in validation:
```bash
# Validate the CML model
~/bin/context-mapper-cli/bin/cm validate -i eSAP.cml
```

The validator checks:
- Syntax correctness
- Semantic rules (e.g., aggregate roots, relationship consistency)
- Context map completeness

## Regenerating the Model

### From Source Documentation to CML

The `eSAP.cml` file is generated from the comprehensive domain analysis document:

**Source:** `eSAP_DOMAIN_DESIGN.md` (in this directory)

**Process:**

1. **Read the source analysis:**
   ```bash
   # Review the domain design document
   less eSAP_DOMAIN_DESIGN.md
   ```

2. **Identify key DDD components:**
   - Domains and Subdomains (Section 3)
   - Bounded Contexts (Section 1)
   - Context Relationships (Section 2)
   - Aggregates and Entities (each context section)
   - Value Objects, Services, Events

3. **Translate to CML syntax:**
   - Follow ContextMapper DSL patterns in `model/prompts/contextmapper.md`
   - Use proper CML syntax for domains, contexts, aggregates
   - Define context map with appropriate relationship patterns
   - Avoid reserved keywords (`type`, `description`, `operation`, `level`, `event`)

4. **Use naming conventions:**
   - Attributes: use `-` prefix (e.g., `- CustomerId id`)
   - Method parameters/returns: use `@` prefix (e.g., `@Customer findById(@CustomerId id)`)
   - Reserved keywords: add suffix (e.g., `typeValue` instead of `type`)

5. **Validate the generated CML:**
   ```bash
   ~/bin/context-mapper-cli/bin/cm validate -i eSAP.cml
   ```

**Example Translation:**

From eSAP_DOMAIN_DESIGN.md:
```markdown
### Study Design Context
- Manages protocol definitions, objectives, endpoints
- Core aggregate: Protocol
- Entities: StudyObjective, Endpoint, Estimand
```

To eSAP.cml:
```cml
BoundedContext StudyDesignContext implements StudyDesignManagement {
  type = APPLICATION
  implementationTechnology = "Java, Spring Boot, CDISC USDM"

  Aggregate Protocols {
    Entity Protocol {
      aggregateRoot
      - ProtocolId id
      - List<StudyObjective> objectives
      - List<Endpoint> endpoints
    }
  }
}
```

### From CML to Diagrams

Once the CML model is validated, generate visualizations:

**1. Generate all diagrams:**
```bash
# From model/design directory
cd model/design

# Generate context map (PNG, SVG, PlantUML, GraphViz)
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g context-map -o diagrams/

# Generate PlantUML class diagrams (all contexts and aggregates)
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g plantuml -o diagrams/
```

**2. Verify generated files:**
```bash
ls -l diagrams/
```

Expected output:
- `eSAP_ContextMap.png` - Visual context map (high-level architecture)
- `eSAP_ContextMap.svg` - Context map (vector format)
- `eSAP_ContextMap.puml` - Context map (PlantUML source)
- `eSAP_ContextMap.gv` - Context map (GraphViz DOT format)
- `eSAP_BC_<ContextName>.puml` - Class diagram for each bounded context
- `eSAP_BC_<ContextName>_<AggregateName>.puml` - Diagram for each aggregate

**3. View diagrams:**

Context Map (PNG):
```bash
# macOS
open diagrams/eSAP_ContextMap.png

# Linux
xdg-open diagrams/eSAP_ContextMap.png
```

PlantUML diagrams (requires PlantUML):
```bash
# Install PlantUML if needed
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu/Debian

# Generate PNG from PlantUML source
plantuml diagrams/*.puml
```

**4. Regeneration workflow:**

When updating the model:
```bash
# 1. Edit the CML file
vi eSAP.cml

# 2. Validate changes
~/bin/context-mapper-cli/bin/cm validate -i eSAP.cml

# 3. Regenerate diagrams
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g context-map -o diagrams/
~/bin/context-mapper-cli/bin/cm generate -i eSAP.cml -g plantuml -o diagrams/

# 4. Commit changes
git add eSAP.cml diagrams/
git commit -m "Update domain model"
```

## Model Evolution

When updating the model:

1. **Maintain Traceability** - Document changes back to source analysis documents
2. **Version Control** - Use git to track model evolution
3. **Regenerate Artifacts** - Update diagrams and contracts after changes
4. **Review Relationships** - Ensure context map remains accurate
5. **Validate Invariants** - Check that business rules are preserved

## References

- **ContextMapper Official Site**: https://contextmapper.org/
- **DDD Reference**: Eric Evans - "Domain-Driven Design" (Blue Book)
- **Estimand Framework**: ICH E9(R1) Addendum
- **CDISC Standards**: https://www.cdisc.org/

## Contact

For questions about the model or ContextMapper usage, see:
- ContextMapper Documentation: https://contextmapper.org/docs/
- ContextMapper GitHub: https://github.com/ContextMapper/context-mapper-dsl
