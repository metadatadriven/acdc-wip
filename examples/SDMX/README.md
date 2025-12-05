# SDMX (Statistical Data and Metadata eXchange) Examples

This directory contains SDMX metadata representations for clinical trial analyses, demonstrating how the W3C Data Cube vocabulary and SDMX standards can be applied to biometric analysis datasets.

## Contents

- **[ex06-sdmx.xlsx](ex06-sdmx.xlsx)** - SDMX metadata structure for Example 6 (Mood/Depression multivariate analysis)
  - Data Structure Definition (DSD)
  - Code lists
  - Concept schemes
  - Dimension and measure metadata

- **[examples_sdmx.xlsx](examples_sdmx.xlsx)** - General SDMX metadata examples
  - Reference SDMX structures
  - Template for clinical trial metadata

## SDMX Background

SDMX (Statistical Data and Metadata eXchange) is an ISO standard for exchanging statistical data and metadata. It provides:

- **Data Structure Definitions (DSDs)**: Formal specifications of dataset structure
- **Code Lists**: Standardized value lists for categorical variables
- **Concept Schemes**: Hierarchical concept definitions
- **Metadata**: Rich metadata about data collection, processing, and interpretation

## Relationship to AC/DC Model

The SDMX representations in this directory demonstrate how:

1. **Dimensions** in the AC/DC model map to SDMX dimensions
2. **Measures** in the AC/DC model map to SDMX measures/observations
3. **Attributes** in the AC/DC model map to SDMX attributes
4. **Concepts** in the AC/DC model align with SDMX concept schemes

## W3C Data Cube Vocabulary

The W3C Data Cube vocabulary is based on SDMX and provides an RDF representation suitable for linked data applications. The AC/DC model extends Data Cube with clinical trial-specific concepts while maintaining compatibility with the core vocabulary.

### Key Data Cube Components

- `qb:DataSet` - Corresponds to AC/DC "Cube"
- `qb:DimensionProperty` - Corresponds to AC/DC "Dimension"
- `qb:MeasureProperty` - Corresponds to AC/DC "Measure"
- `qb:AttributeProperty` - Corresponds to AC/DC "Attribute"

## Tools and Standards

- **SDMX Information Model**: ISO/TS 17369
- **W3C Data Cube Vocabulary**: https://www.w3.org/TR/vocab-data-cube/
- **Excel templates**: Used for human-readable SDMX metadata definition

## Future Work

- Formal SDMX-ML (XML) representations
- RDF/Turtle serializations using Data Cube vocabulary
- Automated validation against SDMX specifications
- Integration with CDISC ODM and Define-XML standards

## Related Directories

- **[../SAP/](../SAP/)** - Source SAP examples that these SDMX structures describe
- **[../model/](../model/)** - AC/DC model structures that these examples inform
- **[../thunderstruck/](../thunderstruck/)** - Thunderstruck DSL implementations
