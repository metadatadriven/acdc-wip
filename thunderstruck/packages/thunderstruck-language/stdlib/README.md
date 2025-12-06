# Thunderstruck Standard Library

The Thunderstruck Standard Library provides a curated collection of reusable concept definitions for clinical trial biometric analyses. These concepts follow established standards including CDISC, SDTM, ADaM, NCI codelists, and the STATO ontology.

## Overview

The standard library demonstrates how AC/DC (Analysis Concept / Derivation Concept) concepts can be **defined and built up** using the Thunderstruck language. Concepts are organized into a hierarchical type system where more specific concepts inherit properties from base concepts, enabling:

- **Reusability** - Reference standard concepts rather than redefining them
- **Consistency** - Ensure analyses use standardized terminology and semantics
- **Interoperability** - Map concepts to external standards (CDISC, NCI, STATO)
- **Extensibility** - Build domain-specific concepts on standard foundations

## Structure

```
stdlib/
├── concepts.tsk              # Base concepts and type hierarchy
└── concepts/
    ├── vital-signs.tsk       # Vital signs measurements
    ├── laboratory.tsk        # Laboratory test concepts
    ├── efficacy.tsk          # Efficacy endpoints and scales
    └── adverse-events.tsk    # Safety and adverse event concepts
```

## Base Concepts (`concepts.tsk`)

The foundation of the standard library, providing core concepts that all domain-specific concepts build upon:

### Core Property Concepts

These concepts represent fundamental properties used throughout clinical trial analyses:

- **Value** - A measured or observed value
- **MeasurementUnit** - A unit of measurement
- **BaselineValue** - A baseline measurement value for comparison
- **Visit** - A study visit or timepoint

### Standard Base Concepts

Core hierarchical types for organizing domain concepts:

- **BiomedicalConcept** - Abstract base type for all clinical observations and measurements
- **DerivationConcept** - Abstract base type for computed or derived values
- **AnalysisConcept** - Abstract base type for analytical constructs and endpoints

### Standard Derivation Concepts

Common derivations used across clinical domains:

- **ChangeFromBaseline** - Absolute change from baseline: `Value - BaselineValue`
- **PercentChangeFromBaseline** - Relative change as percentage: `((Value - BaselineValue) / BaselineValue) × 100`
- **Mean** - Arithmetic mean of values
- **Median** - Middle value in ordered set
- **StandardDeviation** - Measure of variability
- **Count** - Number of observations

## Domain-Specific Concept Libraries

### Vital Signs (`concepts/vital-signs.tsk`)

Concepts for vital signs measurements commonly collected in clinical trials:

**Examples:**
- **SystolicBloodPressure** - Upper blood pressure value during heart contraction
- **DiastolicBloodPressure** - Lower blood pressure value during heart relaxation
- **HeartRate** - Number of heartbeats per minute
- **BodyTemperature** - Core body temperature
- **RespiratoryRate** - Number of breaths per minute
- **Weight** - Body weight measurement
- **Height** - Body height measurement
- **BodyMassIndex** (BMI) - Weight/height² ratio for assessing body composition

Each concept includes:
- Formal definition
- Standard abbreviation
- Measurement units
- CDISC SDTM mapping (domain, test code)
- NCI Thesaurus term mappings

### Laboratory Tests (`concepts/laboratory.tsk`)

Concepts for laboratory measurements and clinical chemistry:

**Examples:**
- **Hemoglobin** - Oxygen-carrying protein in red blood cells
- **Hematocrit** - Percentage of blood volume that is red blood cells
- **WhiteBloodCellCount** - Number of leukocytes per volume
- **Platelet** - Blood clotting cell count
- **Glucose** - Blood sugar level
- **Creatinine** - Kidney function marker
- **ALT** (Alanine Aminotransferase) - Liver enzyme
- **AST** (Aspartate Aminotransferase) - Liver enzyme
- **TotalBilirubin** - Liver function and hemolysis marker

### Efficacy Endpoints (`concepts/efficacy.tsk`)

Concepts for efficacy assessments and clinical outcome measures:

**Examples:**
- **ADASCog** - Alzheimer's Disease Assessment Scale-Cognitive subscale
- **MMSE** - Mini-Mental State Examination for cognitive function
- **HAMDScore** - Hamilton Depression Rating Scale
- **MADRSScore** - Montgomery-Åsberg Depression Rating Scale
- **PANSSTotal** - Positive and Negative Syndrome Scale for schizophrenia
- **FEV1** - Forced Expiratory Volume in 1 second (respiratory function)
- **SixMinuteWalkDistance** - Exercise capacity test
- **EjectionFraction** - Cardiac function percentage
- **TumorSize** - Oncology target lesion measurement
- **ProgressionFreeTime** - Time to disease progression or death

### Adverse Events (`concepts/adverse-events.tsk`)

Concepts for safety monitoring and adverse event classification:

**Examples:**
- **AdverseEvent** - Any untoward medical occurrence
- **SeriousAdverseEvent** - AE resulting in death, hospitalization, disability, etc.
- **TreatmentEmergentAdverseEvent** (TEAE) - AE occurring after treatment initiation
- **AdverseEventSeverity** - Mild, moderate, or severe classification
- **AdverseEventCausality** - Relationship to study drug (related, unrelated, etc.)
- **SystemOrganClass** - MedDRA body system classification
- **PreferredTerm** - MedDRA standardized AE term
- **LowLevelTerm** - MedDRA specific AE description

## Using Standard Library Concepts

### Importing Concepts

```thunderstruck
// Import specific concepts
import stdlib.concepts.ChangeFromBaseline
import stdlib.concepts.vital-signs.SystolicBloodPressure

// Import entire domain
import stdlib.concepts.laboratory.*
```

### Extending Standard Concepts

Create study-specific concepts by extending standard library concepts:

```thunderstruck
concept StudySpecificBMD type_of BiomedicalConcept {
    definition: "Bone mineral density at lumbar spine L1-L4",
    abbreviation: "BMD",
    unit: "g/cm²",
    cdisc_term: "SDTM.LB.LBTESTCD = 'BMD'",
    nci_code: "C64606",

    // Study-specific properties
    site: "Lumbar Spine L1-L4",
    normal_range: {
        lower: 0.9,
        upper: 1.2
    }
}
```

### Linking Cubes to Concepts

Reference standard concepts when defining analysis cubes:

```thunderstruck
cube ADVS "Vital Signs Analysis Dataset" {
    namespace: "http://example.org/study/vitals#",

    structure: {
        dimensions: [
            USUBJID: Identifier,
            AVISITN: Integer,
            PARAMCD: CodedValue
        ],
        measures: [
            AVAL: Numeric,
            CHG: Numeric
        ]
    },

    // Link to standard concepts
    linked_concepts: [
        {param: "SYSBP", concept: stdlib.concepts.vital-signs.SystolicBloodPressure},
        {param: "DIABP", concept: stdlib.concepts.vital-signs.DiastolicBloodPressure},
        {param: "PULSE", concept: stdlib.concepts.vital-signs.HeartRate}
    ]
}
```

## Concept Properties

Standard library concepts include rich metadata following a consistent structure:

| Property | Description | Example |
|----------|-------------|---------|
| `definition` | Formal definition of the concept | "Systolic blood pressure in mmHg" |
| `abbreviation` | Standard short form | "SBP" |
| `unit` | Measurement unit | "mmHg" |
| `cdisc_term` | SDTM/ADaM mapping | "SDTM.VS.VSTESTCD = 'SYSBP'" |
| `nci_code` | NCI Thesaurus code | "C25298" |
| `stato_term` | STATO ontology term (for statistical concepts) | "STATO:0000251" |
| `type_of` | Parent concept in hierarchy | `BiomedicalConcept` |
| `synonyms` | Alternative names | ["BP systolic", "Systolic BP"] |

## Hierarchical Type System

The standard library demonstrates a three-tier concept hierarchy aligned with the AC/DC model:

```
Concept (root)
├── BiomedicalConcept
│   ├── VitalSign
│   │   ├── BloodPressure
│   │   │   ├── SystolicBloodPressure
│   │   │   └── DiastolicBloodPressure
│   │   ├── HeartRate
│   │   └── BodyTemperature
│   ├── LaboratoryTest
│   │   ├── Hematology
│   │   ├── Chemistry
│   │   └── Urinalysis
│   └── EfficacyEndpoint
│       ├── CognitiveScale
│       ├── DepressionScale
│       └── PhysicalFunction
├── DerivationConcept
│   ├── ChangeFromBaseline
│   ├── PercentChange
│   └── SummaryStatistic
│       ├── Mean
│       ├── Median
│       └── StandardDeviation
└── AnalysisConcept
    ├── Population (ITT, PP, Safety)
    ├── Endpoint (Primary, Secondary)
    └── StatisticalMethod (ANCOVA, Mixed Model, etc.)
```

## Building Up Concepts

The standard library shows how complex domain concepts are **built up** from simpler base concepts:

### Example: Blood Pressure

```thunderstruck
// 1. Base property concept
concept Value {
    definition: "A measured or observed value"
}

// 2. Base biomedical concept
concept BiomedicalConcept {
    definition: "Abstract base for clinical observations"
}

// 3. Domain-specific category
concept VitalSign type_of BiomedicalConcept {
    definition: "Clinical measurements of basic body functions"
}

// 4. Specific measurement category
concept BloodPressure type_of VitalSign {
    definition: "Force of blood against arterial walls",
    unit: "mmHg",
    cdisc_domain: "VS"
}

// 5. Concrete measurements
concept SystolicBloodPressure type_of BloodPressure {
    definition: "Blood pressure during heart contraction",
    abbreviation: "SBP",
    cdisc_term: "SDTM.VS.VSTESTCD = 'SYSBP'",
    nci_code: "C25298"
}

concept DiastolicBloodPressure type_of BloodPressure {
    definition: "Blood pressure during heart relaxation",
    abbreviation: "DBP",
    cdisc_term: "SDTM.VS.VSTESTCD = 'DIABP'",
    nci_code: "C25299"
}
```

This hierarchical approach enables:
- **Progressive specialization** from abstract to concrete
- **Property inheritance** (e.g., all BloodPressure concepts share unit: "mmHg")
- **Semantic relationships** (e.g., SystolicBloodPressure IS_A BloodPressure IS_A VitalSign)
- **Standard mappings** at appropriate levels of granularity

## Contributing to the Standard Library

When adding new concepts:

1. **Choose the appropriate domain file** or create a new one for new domains
2. **Follow the hierarchical structure** - extend appropriate base concepts
3. **Include standard mappings** - CDISC, NCI, STATO where applicable
4. **Provide clear definitions** - formal, unambiguous descriptions
5. **Use standard terminology** - follow CDISC controlled terminology where possible
6. **Document relationships** - use `type_of`, `is_a`, or `related_to` keywords

## Limitations and Future Work

The current standard library is a **demonstration** of the concept-building approach. Known limitations include:

- **Incomplete coverage** - Not all clinical domains are represented
- **Simplified structure** - Some concepts need additional properties or relationships
- **Limited validation** - Cross-concept consistency checks are not yet implemented
- **No versioning** - Standard library changes are not tracked systematically

Future enhancements will include:
- Extended coverage across all major clinical domains (PK, immunogenicity, biomarkers, etc.)
- Formal validation rules for concept definitions
- Versioning and deprecation management
- Integration with external ontologies (SNOMED, LOINC, etc.)
- Automated generation from standard terminology sources

## Related Documentation

- [Thunderstruck Language README](../../../ABOUT.md) - Overview of the Thunderstruck DSL
- [Examples README](../../../../examples/README.md) - Example Thunderstruck programs
- [AC/DC Model Refinement](../../../../examples/README.md#2-acdc-model-refinement) - Foundational model work

## Questions?

For questions about standard library concepts or to propose new additions, please see the project documentation or reach out to the development team.
