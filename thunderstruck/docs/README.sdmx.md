# SDMX Background Notes

The following information provides context on the **Statistical Data and Metadata eXchange (SDMX)** standard that underpins the W3C Data Cube vocabulary used by Thunderstruck.

## SDMX Examples

The repository contains SAP extracts modeled using SDMX, taken from the [CDISC ADaM Examples](./docs/adam_examples_final.pdf) document.

See the [SDMX Information Model](./docs/SDMX_2-1_SECTION_2_InformationModel_2020-07.pdf) version 2.1 documentation for detailed reference.

**Examples:**
- [Example 6](./examples/ex06-multivariate.md) - Multivariate Analysis of Variance (Mood)

## Creating an SDMX Model

Checklist for creating an SDMX model from source documentation (e.g., SAP and Shells):

### Step 1: Define Information Model Basics
- [ ] Identify Concepts - all "abstract units of knowledge"
- [ ] Identify Codelists - enumerations, numeric ranges, external references
- [ ] Identify data formats

### Step 2: Define the Data Structure
The data structure defines the 'cube' structure:
- [ ] Dimensions - axes along which data varies
- [ ] Measures - observed or computed values
- [ ] Attributes - metadata about observations

## SDMX Tools

### .stat suite data explorer
Web-based SDMX data explorer, part of the [.Stat suite](https://siscc.org/stat-suite/).

**Notes:**
- Clone [gitlab repo](https://gitlab.com/sis-cc/.stat-suite/dotstatsuite-data-explorer)
- Build following `yarn` commands in README
- Access at `http://localhost:7000/?tenant=oecd`

### CubeViz.js
Faceted browsing widget for SDMX data. See [README](https://github.com/AKSW/cubevizjs).

**Demo:** [Example application](https://smartdataua.github.io/rdfdatacube/) with [SDMX RDF data](https://raw.githubusercontent.com/hibernator11/datacuberdf/master/rdf-02-2017.n3).

**Notes:**
- Clone [github repo](https://github.com/AKSW/cubevizjs)
- Requires Node v8 (`nvm install 8 && nvm use 8`)
- Install: `npm install`
- Run: `npm start`
- Access: [http://localhost:8080/](http://localhost:8080/)

## References

- PHUSE [RDF Data Cube Structure](https://phuse.s3.eu-central-1.amazonaws.com/Deliverables/Emerging+Trends+%26+Technologies/Clinical+Research+and+Development+RDF+Data+Cube+Structure+Technical+Guidance.pdf) - Technical guidance from PhUSE CS Semantic Technology Working Group
- [Mapping SDMX to RDF](https://csarven.ca/linked-sdmx-data) - Article by Sarven Capadisli
- [BioPortal](https://www.bioontology.org/) - Comprehensive repository of biomedical ontologies
- W3C [Use Cases and Lessons for Data Cube Vocabulary](https://www.w3.org/TR/vocab-data-cube-use-cases/)

## Training
- [SDMX Vocabulary for Beginners](https://academy.siscc.org/courses/sdmx-vocabulary-for-beginners/) - Free course from SIS-CC Academy
