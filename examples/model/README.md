# AC/DC Model Examples

This directory contains comprehensive AC/DC (Analysis Concept / Derivation Concept) model structures derived from real-world Statistical Analysis Plan examples. These models demonstrate how the three-tier AC/DC classification (concepts, structures, derivations) can represent clinical trial biometric analyses.

## Contents

### Example 1: ANCOVA Analysis of Bone Mineral Density

- **[ex01-prompt.md](ex01-prompt.md)** - Evolution of the modeling prompts
  - Documents three iterations of model refinement
  - Shows progression from initial extraction to comprehensive structure
  - References Issue #27 for continued OOAD analysis work

- **[ex01-STRUCTURE-p3.md](ex01-STRUCTURE-p3.md)** - Comprehensive AC/DC model (Prompt 3 result)
  - **Complete YAML model** with 18 concepts, 24 structures, 11 derivations
  - **Mermaid class diagram** showing full dependency chain
  - **Detailed definitions** for all categories and key entities
  - **Issues section** with 10 open questions and 10 design considerations
  - **End-to-end traceability** from display outputs to foundational concepts

## Three-Tier AC/DC Model Structure

The AC/DC metamodel organizes entities into three top-level categories:

### 1. Concepts (Abstract Semantic Entities)

**Biomedical Concepts** - Clinical observations and measurements
- Example: BoneMineralDensity, LumbarSpineBMD, MachineType

**Derivation Concepts** - Computed or derived values
- Example: PercentChangeFromBaseline, TreatmentDifference, LOCFImputation

**Analysis Concepts** - Analytical constructs and methods
- Example: ANCOVAModel, LeastSquaresMean, ConfidenceInterval, ITTPopulation

### 2. Structures (Concrete Data Entities)

**Dimensions** - Components that identify observations
- Example: Subject, TreatmentArm, TimePoint, AnalysisVisit

**Measures** - Components containing observed or computed values
- Example: BMDValue, PercentChangeValue, LSMeanValue, PValueValue

**Attributes** - Components that qualify and interpret observations
- Example: Population, ImputationMethod, SampleSize_N, Unit

**Cubes** - Collections of observations organized by dimensions
- Example: ADBMD (analysis dataset), ANCOVAResults (statistical results)

### 3. Derivations (Transformations and Displays)

**Slices** - Subsets of cubes with fixed dimension/attribute values
- Example: ITT_Month24_LOCF, DrugABC_Slice, Placebo_Slice

**Methods** - Statistical/mathematical transformations
- Example: FitANCOVAModel, ComputeLSMeans, ComputeCI, ApplyLOCF

**Displays** - Tables, figures, listings with formatting
- Example: Table_2_1_3_1 (primary efficacy table)

## Model Features

### Complete Traceability

The models demonstrate end-to-end traceability:

**Display** → **Methods** → **Slices** → **Cubes** → **Measures** → **Concepts**

Example path:
- Table 2.1.3.1 (display)
- → uses ComputeLSMeans, ComputeCI (methods)
- → operating on ITT_Month24_LOCF (slice)
- → filtered from ADBMD (cube)
- → containing PercentChangeValue (measure)
- → implementing PercentChangeFromBaseline (concept)

### OOAD Principles

The models follow Object-Oriented Analysis and Design principles:
- **Abstraction**: Clear separation of concepts from structures
- **Encapsulation**: Well-defined boundaries between layers
- **Inheritance**: Parent-child relationships (e.g., AnalysisVisit → TimePoint)
- **Composition**: Cubes composed of dimensions, measures, attributes
- **Association**: Explicit relationships (implements, contains, indexed by)

### Metadata-Rich

Each entity includes:
- **Description**: Clear explanation of purpose
- **Type**: Data type or category
- **Relationships**: Links to related entities
- **Formulas**: For derived values
- **Parameters**: For methods and transformations

## Validation and Quality

The Example 1 model has been validated for:
- ✅ Internal consistency - all entities properly classified
- ✅ Completeness - all SAP elements captured
- ✅ Clarity - clear definitions and examples
- ✅ Traceability - explicit dependency chains
- ✅ OOAD compliance - follows design principles

## Next Steps (See Issue #27)

The refinement process continues with:

1. **Phase 1**: Survey and select 5+ diverse examples from CDISC ADaM document
2. **Phase 2**: Create detailed AC/DC models for each example (following Example 1 template)
3. **Phase 3**: Apply OOAD principles to derive general-purpose metamodel
4. **Phase 4**: Validate refined metamodel and create specification documentation

See [GitHub Issue #27](https://github.com/metadatadriven/acdc-wip/issues/27) for the complete bottom-up OOAD analysis plan.

## Related Directories

- **[../SAP/](../SAP/)** - Source SAP examples that these models describe
- **[../thunderstruck/](../thunderstruck/)** - Thunderstruck DSL implementations showing language limitations
- **[../SDMX/](../SDMX/)** - SDMX/Data Cube representations

## References

- W3C Data Cube Vocabulary: https://www.w3.org/TR/vocab-data-cube/
- CDISC ADaM Examples: ../../docs/adam_examples_final.pdf
- AC/DC Project Documentation: ../../docs/
