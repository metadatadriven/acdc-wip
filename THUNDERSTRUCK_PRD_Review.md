# Thunderstruct PRD review

## General comments (apply throughout document)
- Change Python to SAS throughout. It is more important that we support R and SAS code generation in the first instance. (also note in NFR-5.2 that SAS will be a MUST HAVE requirement not SHOULD)
- Review how Concepts are included in Thunderstruct language. We want to support different types of concepts - Biomedical Concepts, Analysis Concepts, Derivation Concepts, etc. Review how this is implemented in the W3C Data Cube standard and if needed, Borrow ideas from SDMX standard where everything in the cube (dimensions, attributes, measures, etc.) all are linked to a concept. Review PRD and ensure that this is incuded in Thunderstruck.

## Story 5.2
- Tighten-up version requirements. Need to be able to e.g. support working with different versions of CDISC standards. What version of SAP are we defining? what version of the protocol does this refer to? etc.

## Story 6.2
- Add note explaining what PROV-O is and add to references

## FR-1.4
- Build documentation strings into the language (aka Common Lisp) in addition to /** comments **/

## FR-2.2
- Change CDISC validation requirements to support CORE rules??

## FR-6
- SAP document generation from spec is ok. Should we add...
- spec extraction from SAP document - or at least support/helpers for AI/LLM model to make it easier?
- can we learn from LLM->USDM experience to make Thunderstruck model better?
- ***ADD MCP SERVER to product requirements***

## NFR-7.1
- Add USDM v4.0+ to list of standards support
- In Thunderstruct we should be able to reference elements of the protocol using a USDM reference - for example, Populations, Study Design, Estimands, Primary/Secondary Analyses, etc. are all defined in the Protocol and Thunderstick must have ability to link to them so we have information traceability from Protocol -> SAP -> Analysis -> Results which is parallel of data traceability CDASH -> SDTM -> ADAM -> ARD/ARS -> TFL

## Success Metrics
- Remove Adoption metrics. Not relevent to this project
- Remove User Satisfaction. Not relevent to this project

## FR-4.3
- Vizualisations MUST be a VS Code extension

## Assumptions

###  4. Standards Stability
- wrt ICH, we should assume a stable version of the ICH M11 protocol standard that is aligned with USDM

## Constraints

### 2. Target Languages
- change SAS constraint to be use of BASE SAS 9.4 Language features along with SAS STATS statistical procedures.

### Business constraints
- Remove 1. Timeline. Not relevent to this PRD
- Remove 2. Resources. Not relevent to this PRD

## Positioning

Throughout positioning section, change current emphasis on W3C standards to a stronger standards-agnostic message that Thunderstruck makes it easy to interoperate with standards: CDISC, W3C, OMOP, FHIR, etc...

## Appendix C: Example SAP Specification

- Add a note explanation of what `formula: CHG ~ TRTDOSE + SITEGR1 + BASE` means in the `PrimaryEfficacyModel` and where this syntax comes from (is it based on existing syntax used in other languages?)

