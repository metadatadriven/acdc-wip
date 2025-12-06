# Thunderstruck Implementation Plan Review

Comments and Questions on the Thunderstruck implmentation plan v1.0

## Increment 1

- For project setup use Lerna to manage the monorepo not npm workspacs. If in doubt follow Theia 1.66.0 project setup and dependencies
- 1.5 Documentation: include documentation on how to install the VS Code extension

## Increment 6

- 6.1 CDISC Standard Library: Add the following to the ADaM Standard cubes: OCCDS template (Occurrence Data Structure), ADEVENT (Event Dataset for time-to-event analysis)
- 6.1 CDISC Standard Library: Add 'Implement CDASH standard cubes'
- Make it clear that 6.2 (Standard Transformations) are provided in a standard library and not built into Thunderstruck language.
- 6.3 Built-in Functions: These should be imported from a standard library, not built into Thunderstruck language.
- 6.4 Make it clear that the example SAPs will be heavily commented and full documentation strings to make them clear and easy for a new reader to understand.

## Increment 7

- 7.2 Concept Namespaces: remove BRIDG, and add USDM.Concepts, STATO.Concepts and NCI.Concepts
- 7.5 Concept Interoperability: Remove Link to SDMX concept vocabulary, and add Link to CDISC Biomedical Concepts library
- 7.5 Concept Interoperability: add examples of external sources e.g. STATO, NCI, CDISC Library, and other publicly available Biomedical Concept repositories (find some of the most popular)
