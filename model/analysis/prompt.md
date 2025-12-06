# Analysis Modeling Prompt

## Attempt 3 - include results in model and refine definitions

### Prompt

Read the document examples/ex01-ANACOVA.md and identify nouns and noun phrases that suggest potential concepts or structural entities within the SAP. Use your understanding of the domain (Clinical Trial Biometrics, CDISC Stanadrds, NCI Codelists, and STATO ontology, etc.) to recognise common entities involved in similar systems.
I want everything classified at the top-level as either a concept, a structure or a derivation.
The classification is hierarchical, with 'concept', 'structure' and 'derivation' being the top-level categories and all other categories are sub-classes.

Top-level classification of the AC/DC model is:

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

You can extend the model under the leaf nodes but do not add nodes at the root or 1st level, only under the 2nd level.

#### model definitions

##### Top-level model definitions
- `concept` are abstract entities that represent the semantic meaninig of biometric analyses described in a SAP (Statistical Analysis Plan).
- `structure` describes the analysis data structure in terms of dimensions, attributes and measures (based on the w3c data cube vocabulary). These are all concrete implementations of abstract concepts.
- `results` describe relationships between structural elements and defines both a) how the analysis results are derived from structural entities to analysis results by the application of statistical methods, and b) biometric analysis results defined as displays (tables, figures or listings).

##### concept definitions

- `biomedical` concepts are Clinical observations and measurements (e.g., 'Systolic Blood Pressure', 'ADAS-Cog Total Score', etc.)
- `derivation` concepts are Computed or Derived values (e.g., 'Change from Baseline', 'Percent Change')
- `analysis` concepts are Analytical constructs (e.g., 'Efficacy Endpoint', 'Safety Parameter', etc.)

##### structure definitions

- `dimension` structure entities are data Components that **identify** observations. A unique combination of dimension values identifies exactly one observation. e.g. time period (date, study day), age group, sex, treatment arm, etc. Dimensions form the "index" of a cube
- `measure` structure entities are data components that contain the **observed values** themselves. The The quantitative or qualitative values being analyzed.
- `attribute` structure entities are data components that **qualify and interpret** observation values e.g. units ("mm","kg",etc.), flags, categories, etc. Attributes don't identify observations but provide essential context for interpretation.
- `cube` are the main structure entities that represent a collection of observations (measures) organized by dimensions and attributes.

##### derivations definitions

- `slice` is A subset of a cube which is defined by fixing one or more dimension values, while allowing other dimensions to vary
- `method` is a statistical or mathematical computation that takes as input cubes or slices, and produces one or more cubes or slices as a result. Methods are concrete implementations of derivation or analysis concepts.
- `display` are tables, figures or listings that represent how results (slices or cubes) are displayed. A single display may represent one or more result slice or cube, for example a baseline characteristic table might display age, sex, ethnic origin and blood pressure at baseline by treatment arm. Displays also include titles, subtitles, and footnotes, along with how to format numbers, etc.

#### examples

So for example, 'bone mineral density' is a biomedical concept, and BMD is a cube/measure entity that is the concrete instance of the bone mineral density concept.

Create a full model using the input file and save the result in the file examples/ex01-STRUCTURE-p3.md

The output file should have the following structure:

```md
# Example 1 AC/DC Model structure (prompt 3)

- Add a short intro paragrah here

## Structure

- Add the AC/DC model here. Use YAML

## Dependency diagram

- provide brief overview of the key dependencies between model entities with particular attention toend-to-end dependency linkage, i.e. from table outputs back through derivations, to structural entities, all the way back to concepts.

Insert a mermaid class diagram here. The class diagram depics the AC/DC Model.

## Definitions

- Add a list of model definitions here

## Issues

- List any open issues or open questions here
```

### Prompt 3 Results

FURTHER WORK ON THIS HAS MOVED TO [ISSUE #27](https://github.com/metadatadriven/acdc-wip/issues/27)
- See associated branch
