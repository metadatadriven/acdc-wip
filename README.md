# Analysis Concepts / Derivation Concepts Work-In-Progress

This repo contains work-in-progress related to CDISC Analysis/Derivation Concepts.

## Statistical Data and Metadata eXchange (SDMX)

The following files contain SAP extracts which are modelled using SDMX. The examples are taken from the [CDSIC ADaM Examples](./docs/adam_examples_final.pdf) document.

See the [SDMX Information Model](./docs/SDMX_2-1_SECTION_2_InformationModel_2020-07.pdf) version 2.1 documentation for detailed reference of the model.

### Examples

- [Example 6](./examples/ex06-multivariate.md) Multivariate Analysis of Variance (Mood)

## How to create an SDMX model

The following checklist can be used to simplify the process of creating an SDMX model from source documentation (e.g. SAP and Shells).

### Step 1 - define information model basics

This step defines the foundational elements that the data structure builds on (step 2)

- [ ] Identify Concepts - these are all "abstract units of knowledge". Each Conceptwill have a codelist or format associated with it - see next steps
- [ ] Identify Codelists. These can be enumerations defined in the source document, numeric ranges, references to external codelists, ontologies, etc.
- [ ] Identify data formats.

### Step 2 - define the data structure

The data structure defines the 'cube' structure that allows the data to be navigated independently of the contents.

- [ ] Dimensions
- [ ] Measures
- [ ] Values

## SDMX tools

### .stat suite data explorer

This is a web-based SDMX data explorer. It is part of a wider [suite of open-source SDMX tools](https://siscc.org/stat-suite/) maintained by .Stat project.

*TLDR;* The app runs ok but doesnt have any data out the box! Maybe need full suite of tools?

Notes:
- Clone [gitlab repo](https://gitlab.com/sis-cc/.stat-suite/dotstatsuite-data-explorer)
- build following `yarn` commands described in README
- Access using `http://localhost:7000/?tenant=oecd` (default tenant didnt work for me!)

### CubeViz.js 

According to the [README](https://github.com/AKSW/cubevizjs) "CubeViz is generating a faceted browsing widget that can be used to filter interactively observations to be visualized in charts."

There is an [example application here](https://smartdataua.github.io/rdfdatacube/) with links to [SDMX data in RDF format](https://raw.githubusercontent.com/hibernator11/datacuberdf/master/rdf-02-2017.n3).

Notes:
- clone [github repo](https://github.com/AKSW/cubevizjs#)
- THIS IS A VERY OLD PROJECT
- Roll back to node v8 using `nvm install 8` and `nvm use 8`
- Install with `npm install`
- run with `npm start`
- access demo at [http://localhost:8080/](http://localhost:8080/)

## References

- PHUSE [RDF Data Cube Structure](https://phuse.s3.eu-central-1.amazonaws.com/Deliverables/Emerging+Trends+%26+Technologies/Clinical+Research+and+Development+RDF+Data+Cube+Structure+Technical+Guidance.pdf), PhUSE CS Semantic Technology Working Group
- Article on [mapping SDMX (xml) to RDF](https://csarven.ca/linked-sdmx-data)
- [BioPortal](https://www.bioontology.org/) comprehensive repository of biomedical ontologies
- w3c article on [Use Cases and Lessons for the Data Cube Vocabulary](https://www.w3.org/TR/vocab-data-cube-use-cases/)

## Training
- [SDMX Vocabilary for Beginners](https://academy.siscc.org/courses/sdmx-vocabulary-for-beginners/)

