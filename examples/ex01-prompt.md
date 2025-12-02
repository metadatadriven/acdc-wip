# Initial Generation (from SAP to Thunderstruck single prompt)

## Attempt 1 - generate Thunderstruct from Example 1 SAP

### Prompt

read the document examples/ex01-ANACOVA.md and identify nouns and noun phrases that suggest potential concepts or entities within the SAP. document the list as a table. Use your understanding of the domain (Clinical Trial Biometrics usng CDISC Stanadrds) to recognise common entities involved in similar systems. Return the result using Thunderstruck language. Save the result in a file
examples/ex01-ANACOVA.tsk

### Result

See file examples/ex01-ANACOVA.tsk

This worked ok, generated a concept hierarchy that looks credible given the current state of the thunderstruct language.
Issue is that it has not identified dimensions/slices/etc - everything is a concept.

Try again in a new context, this time concentrate on identifyuing the concept and structure definitions... Thunderstruct can come next!

## Attempt 2 - identify concepts and structure from Example 1 SAP

### Prompt

Read the document examples/ex01-ANACOVA.md and identify nouns and noun phrases that suggest potential concepts or structural entities within the SAP. Use your understanding of the domain (Clinical Trial Biometrics, CDISC Stanadrds, NCI Codelists, and STATO ontology) to recognise common entities involved in similar systems. 
I want everything classified as either a concept or cube. The classification is hierarchical, with 'concept' and 'cube' being the top-level categories and all other categories are sub-classes of either a concept or a cube.

Top-level classification model is:

model
    - concept
        - biomedical
        - derived
        - analysis
    - cube
        - dimension
        - attribute
        - measure

You can extend the model under the leaf nodes but do not add nodes at the root, 1st level.

cube sub-entities are all concrete instances of a concept. So for example, 'bone mineral density' is a biomedical concept, and BMD is a cube/measure entity that is the concrete instance of the bone mineral density concept.

Create a full modesl for the ex01-ANACOVA.md file and Save the result in a file examples/ex01-STRUCTURE.md

The output file should have the following structure:

```md
# Example 1 AC/DC Model structure

- Add a short intro paragrah here

## Structure

- Add the model entity category structre here. Use YAML

## Definitions

- Add a list of model definitions here

## Issues

- List any open issues, unknowns or questions here
```

### Results

This worked much better. See file `examples/ex01-STRUCTURE.md`

#### Refinement 1
Referecnce to 'cube' in the prompt/model should actually be 'structre' and a thist top-level categoty added which is 'cubes' that has sub-cats of 'cube', 'slice' (aka dataset?) and maybe 'transformation'/derivation?

#### Refinement 2
Add more to the prompt to deal with datasets, results and displays

## Attempt 3 - 

### Prompt

Read the document examples/ex01-ANACOVA.md and identify nouns and noun phrases that suggest potential concepts or structural entities within the SAP. Use your understanding of the domain (Clinical Trial Biometrics, CDISC Stanadrds, NCI Codelists, and STATO ontology, etc.) to recognise common entities involved in similar systems. 
I want everything classified at the top-level as either a concept, a structure or a derivation. 
The classification is hierarchical, with 'concept', 'structure' and 'derivation' being the top-level categories and all other categories are sub-classes.

Top-level classification is:

model
    - concept
        - biomedical
        - derived
        - analysis
    - structure
        - dimension
        - attribute
        - measure
    - results
        - cube
        - slice (alias dataset)
        - derivation
        - display

You can extend the model under the leaf nodes but do not add nodes at the root or 1st level, only under the 2nd level.

#### model definitions

- concepts are abstract entities that represent the semantic meaninig of biometric analyses described in a SAP (Statistical Analysis Plan), derivations and results associated with regulated clinical trials.
- 'structure' describes the analysis data structure in terms of dimensions, attributes and measures. These are all concrete implementations of abstract concepts.   
- cube sub-entities are all concrete instances of a concept. 

#### examples

So for example, 'bone mineral density' is a biomedical concept, and BMD is a cube/measure entity that is the concrete instance of the bone mineral density concept.

Create a full model using the input file and save the result in the file examples/ex01-STRUCTURE.md

The output file should have the following structure:

```md
# Example 1 AC/DC Model structure

- Add a short intro paragrah here

## Structure

- Add the model entity category structre here. Use YAML

## Definitions

- Add a list of model definitions here

## Issues

- List any open issues, unknowns or questions here
```
