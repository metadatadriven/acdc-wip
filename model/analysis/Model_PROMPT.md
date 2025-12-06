# Analysis Modeling Prompt

Read the SAP document examples/SAP/SAP_ex05_Pain.md and apply OOAD (Object-Orientated Analysis and Design) and OLAP (OnLine Analytical Processing) and Logic Programming princliples to create a model from the SAP text in YAML format. 
Document the model in an output file mode/analysis/Model_ex05_Pain.md (see below for contents of output model file)
Pay special attention to nouns, verbs, adjectives and realtionships in the text.
Use your understanding of the domain (Clinical Trial Biometrics, CDISC Stanadrds, NCI Codelists, and STATO ontology, etc.) to recognise common entities involved other in similar systems.
This analysis is a three-step process:
  1. Identify concept hierarchy - this is the abstract entity hierarchy. Use OOAD methodology for this step.
  2. Define the data structure - effectively a star schema that describes the data structure in terms of concepts. Use OLAP techniques to identigy the structure.
  3. Specify the derivations - definition of aggregate functions that are applied to the data structure to produce displays. Use logic programming techniques to identify predicates and ryule bodies within the SAP text

The metamodel classifies everything at the top-level as either a concept, a structure or a derivation.
The classification is hierarchical, with 'concept', 'structure' and 'derivation' being the top-level categories and all other categories are sub-classes.

Top-level classification of the AC/DC metamodel is:

```yaml
model:
    concepts:
      - biomedical
      - derivation
      - analysis
    structures:
      - dimension
      - attribute
      - measure
      - cube
    derivations:
      - slice
      - method
      - display
```
The model extends the metamodel classifications under the leaf nodes but do not add nodes at the root or 1st level, only under the 2nd level.

## metamodel definitions

### Top-level definitions
- `concept` are abstract entities that represent the semantic meaninig of biometric analyses described in a SAP (Statistical Analysis Plan).
- `structure` describes the analysis data structure in terms of dimensions, attributes and measures (based on the w3c data cube vocabulary). These are all concrete implementations of abstract concepts.
- `results` describe relationships between structural elements and defines both a) how the analysis results are derived from structural entities to analysis results by the application of statistical methods, and b) biometric analysis results defined as displays (tables, figures or listings).

### concept definitions

- `biomedical` concepts are Clinical observations and measurements (e.g., 'Systolic Blood Pressure', 'ADAS-Cog Total Score', etc.)
- `derivation` concepts are Computed or Derived values (e.g., 'Change from Baseline', 'Percent Change')
- `analysis` concepts are Analytical constructs (e.g., 'Efficacy Endpoint', 'Safety Parameter', etc.)

### structure definitions

- `dimension` structure entities are data Components that **identify** observations. A unique combination of dimension values identifies exactly one observation. e.g. time period (date, study day), age group, sex, treatment arm, etc. Dimensions form the "index" of a cube
- `measure` structure entities are data components that contain the **observed values** themselves. The The quantitative or qualitative values being analyzed.
- `attribute` structure entities are data components that **qualify and interpret** observation values e.g. units ("mm","kg",etc.), flags, categories, etc. Attributes don't identify observations but provide essential context for interpretation.
- `cube` are the main structure entities that represent a collection of observations (measures) organized by dimensions and attributes.

### derivations definitions

- `slice` is A subset of a cube which is defined by fixing one or more dimension values, while allowing other dimensions to vary
- `method` is a statistical or mathematical computation that takes as input cubes or slices, and produces one or more cubes or slices as a result. Methods are concrete implementations of derivation or analysis concepts.
- `display` are tables, figures or listings that represent how results (slices or cubes) are displayed. A single display may represent one or more result slice or cube, for example a baseline characteristic table might display age, sex, ethnic origin and blood pressure at baseline by treatment arm. Displays also include titles, subtitles, and footnotes, along with how to format numbers, etc.

## examples

So for example, 'bone mineral density' is a biomedical concept, and BMD is a cube/measure entity that is the concrete instance of the bone mineral density concept.

## Output file (AC/DC Model decription)

The output file should have the following structure:

```md
# AC/DC Model structure

- Add a short intro paragrah here with reference to the input file.

## Structure

- Add the AC/DC model here. Use YAML to describe the UML model

## Dependency diagram

- provide brief overview of the key dependencies between model entities with particular attention to end-to-end dependency linkage, ie. from table outputs back through derivations, to structural entities, all the way back to concepts.

## Model structure

Insert a mermaid diagram here that depicts the top-level packages in the AC/DC model.

Insert a mermaid class diagram here. The class diagram depics the AC/DC Model.

## Definitions

- Add a list of model definitions here

## Issues

- List any open issues or open questions here
```
