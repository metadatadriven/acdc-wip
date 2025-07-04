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

## References

- [RDF Data Cube Structure](https://phuse.s3.eu-central-1.amazonaws.com/Deliverables/Emerging+Trends+%26+Technologies/Clinical+Research+and+Development+RDF+Data+Cube+Structure+Technical+Guidance.pdf), PhUSE CS Semantic Technology Working Group

## Training
- [SDMX Vocabilary for Beginners](https://academy.siscc.org/courses/sdmx-vocabulary-for-beginners/)