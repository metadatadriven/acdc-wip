import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import { ConceptLibrary, CONCEPT_LIBRARY_METADATA } from '../stdlib/concept-library';
import { Program, ConceptDefinition } from '../generated/ast';
import { AstUtils } from 'langium';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

describe('Concept Library', () => {
    let library: ConceptLibrary;

    beforeEach(() => {
        library = new ConceptLibrary(services);
    });

    describe('Library Loading', () => {
        it('should load all concept library files', async () => {
            await library.loadAll();

            expect(library.isLoaded('base')).toBe(true);
            expect(library.isLoaded('vitalSigns')).toBe(true);
            expect(library.isLoaded('laboratory')).toBe(true);
            expect(library.isLoaded('adverseEvents')).toBe(true);
            expect(library.isLoaded('efficacy')).toBe(true);
        });

        it('should return loaded documents', async () => {
            await library.loadAll();

            const baseDoc = library.getDocument('base');
            expect(baseDoc).toBeDefined();
            expect(baseDoc?.parseResult.value.$type).toBe('Program');
        });

        it('should get all loaded documents', async () => {
            await library.loadAll();

            const allDocs = library.getAllDocuments();
            expect(allDocs.length).toBe(5);
        });
    });

    describe('Base Concepts', () => {
        it('should parse base concepts correctly', async () => {
            const doc = await library.loadFile('base', '../../stdlib/concepts.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBeGreaterThan(0);

            // Check for key base concepts
            const conceptNames = concepts.map(c => c.name);
            expect(conceptNames).toContain('Value');
            expect(conceptNames).toContain('BiomedicalConcept');
            expect(conceptNames).toContain('DerivationConcept');
            expect(conceptNames).toContain('AnalysisConcept');
        });

        it('should define Change concept with properties', async () => {
            const doc = await library.loadFile('base', '../../stdlib/concepts.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const changeConcept = concepts.find(c => c.name === 'Change');
            expect(changeConcept).toBeDefined();
            expect(changeConcept?.properties).toBeDefined();
            expect(changeConcept?.properties?.properties.length).toBe(2);
        });

        it('should define ChangeFromBaseline as derived from Change', async () => {
            const doc = await library.loadFile('base', '../../stdlib/concepts.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const cfbConcept = concepts.find(c => c.name === 'ChangeFromBaseline');
            expect(cfbConcept).toBeDefined();
            expect(cfbConcept?.parentType).toBeDefined();
            expect(cfbConcept?.parentType?.$refText).toBe('Change');
        });
    });

    describe('Vital Signs Concepts', () => {
        it('should parse vital signs concepts correctly', async () => {
            const doc = await library.loadFile('vitalSigns', '../../stdlib/concepts/vital-signs.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBeGreaterThan(0);

            // Check for key vital signs concepts
            const conceptNames = concepts.map(c => c.name);
            expect(conceptNames).toContain('VitalSign');
            expect(conceptNames).toContain('SystolicBP');
            expect(conceptNames).toContain('DiastolicBP');
            expect(conceptNames).toContain('HeartRate');
            expect(conceptNames).toContain('BodyTemperature');
            expect(conceptNames).toContain('Height');
            expect(conceptNames).toContain('Weight');
            expect(conceptNames).toContain('BMI');
        });

        it('should define SystolicBP with code lists', async () => {
            const doc = await library.loadFile('vitalSigns', '../../stdlib/concepts/vital-signs.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const sysBP = concepts.find(c => c.name === 'SystolicBP');
            expect(sysBP).toBeDefined();
            expect(sysBP?.codeLists).toBeDefined();
            expect(sysBP?.codeLists?.mappings).toBeDefined();
            expect(sysBP?.codeLists?.mappings.length).toBeGreaterThan(0);
        });

        it('should define vital signs with units', async () => {
            const doc = await library.loadFile('vitalSigns', '../../stdlib/concepts/vital-signs.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const sysBP = concepts.find(c => c.name === 'SystolicBP');
            expect(sysBP?.unit).toBe('mmHg');

            const heartRate = concepts.find(c => c.name === 'HeartRate');
            expect(heartRate?.unit).toBe('beats/min');

            const weight = concepts.find(c => c.name === 'Weight');
            expect(weight?.unit).toBe('kg');
        });

        it('should define vital signs with CDISC namespace', async () => {
            const doc = await library.loadFile('vitalSigns', '../../stdlib/concepts/vital-signs.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const sysBP = concepts.find(c => c.name === 'SystolicBP');
            expect(sysBP?.namespace).toBe('CDISC.Glossary');
        });
    });

    describe('Laboratory Concepts', () => {
        it('should parse laboratory concepts correctly', async () => {
            const doc = await library.loadFile('laboratory', '../../stdlib/concepts/laboratory.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBeGreaterThan(0);

            // Check for key laboratory concepts
            const conceptNames = concepts.map(c => c.name);
            expect(conceptNames).toContain('LaboratoryTest');
            expect(conceptNames).toContain('HematologyConcept');
            expect(conceptNames).toContain('Hemoglobin');
            expect(conceptNames).toContain('WBC');
            expect(conceptNames).toContain('ChemistryConcept');
            expect(conceptNames).toContain('Glucose');
            expect(conceptNames).toContain('Creatinine');
            expect(conceptNames).toContain('LiverFunctionTest');
            expect(conceptNames).toContain('ALT');
            expect(conceptNames).toContain('AST');
        });

        it('should define Hemoglobin as hematology test', async () => {
            const doc = await library.loadFile('laboratory', '../../stdlib/concepts/laboratory.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const hgb = concepts.find(c => c.name === 'Hemoglobin');
            expect(hgb).toBeDefined();
            expect(hgb?.parentType?.$refText).toBe('HematologyConcept');
            expect(hgb?.unit).toBe('g/dL');
        });

        it('should define ALT as liver function test', async () => {
            const doc = await library.loadFile('laboratory', '../../stdlib/concepts/laboratory.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const alt = concepts.find(c => c.name === 'ALT');
            expect(alt).toBeDefined();
            expect(alt?.parentType?.$refText).toBe('LiverFunctionTest');
            expect(alt?.unit).toBe('U/L');
        });
    });

    describe('Adverse Event Concepts', () => {
        it('should parse adverse event concepts correctly', async () => {
            const doc = await library.loadFile('adverseEvents', '../../stdlib/concepts/adverse-events.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBeGreaterThan(0);

            // Check for key adverse event concepts
            const conceptNames = concepts.map(c => c.name);
            expect(conceptNames).toContain('AdverseEvent');
            expect(conceptNames).toContain('SeriousAdverseEvent');
            expect(conceptNames).toContain('MildAE');
            expect(conceptNames).toContain('ModerateAE');
            expect(conceptNames).toContain('SevereAE');
            expect(conceptNames).toContain('Nausea');
            expect(conceptNames).toContain('Headache');
        });

        it('should define SeriousAdverseEvent as derived from AdverseEvent', async () => {
            const doc = await library.loadFile('adverseEvents', '../../stdlib/concepts/adverse-events.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const sae = concepts.find(c => c.name === 'SeriousAdverseEvent');
            expect(sae).toBeDefined();
            expect(sae?.parentType?.$refText).toBe('AdverseEvent');
        });

        it('should define Nausea with MedDRA codes', async () => {
            const doc = await library.loadFile('adverseEvents', '../../stdlib/concepts/adverse-events.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const nausea = concepts.find(c => c.name === 'Nausea');
            expect(nausea).toBeDefined();
            expect(nausea?.codeLists).toBeDefined();
            expect(nausea?.codeLists?.mappings).toBeDefined();
        });
    });

    describe('Efficacy Concepts', () => {
        it('should parse efficacy concepts correctly', async () => {
            const doc = await library.loadFile('efficacy', '../../stdlib/concepts/efficacy.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBeGreaterThan(0);

            // Check for key efficacy concepts
            const conceptNames = concepts.map(c => c.name);
            expect(conceptNames).toContain('EfficacyEndpoint');
            expect(conceptNames).toContain('PrimaryEndpoint');
            expect(conceptNames).toContain('OverallSurvival');
            expect(conceptNames).toContain('ProgressionFreeSurvival');
            expect(conceptNames).toContain('CompleteResponse');
            expect(conceptNames).toContain('Cmax');
            expect(conceptNames).toContain('AUC');
        });

        it('should define OverallSurvival as survival endpoint', async () => {
            const doc = await library.loadFile('efficacy', '../../stdlib/concepts/efficacy.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const os = concepts.find(c => c.name === 'OverallSurvival');
            expect(os).toBeDefined();
            expect(os?.parentType?.$refText).toBe('SurvivalEndpoint');
            expect(os?.unit).toBe('days');
        });

        it('should define PK endpoints with units', async () => {
            const doc = await library.loadFile('efficacy', '../../stdlib/concepts/efficacy.tsk');
            const program = doc.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            const tmax = concepts.find(c => c.name === 'Tmax');
            expect(tmax).toBeDefined();
            expect(tmax?.unit).toBe('h');

            const clearance = concepts.find(c => c.name === 'Clearance');
            expect(clearance).toBeDefined();
            expect(clearance?.unit).toBe('L/h');
        });
    });

    describe('Concept Library Metadata', () => {
        it('should have metadata for all libraries', () => {
            expect(CONCEPT_LIBRARY_METADATA.base).toBeDefined();
            expect(CONCEPT_LIBRARY_METADATA.vitalSigns).toBeDefined();
            expect(CONCEPT_LIBRARY_METADATA.laboratory).toBeDefined();
            expect(CONCEPT_LIBRARY_METADATA.adverseEvents).toBeDefined();
            expect(CONCEPT_LIBRARY_METADATA.efficacy).toBeDefined();
        });

        it('should have descriptive names and descriptions', () => {
            expect(CONCEPT_LIBRARY_METADATA.base.name).toBe('Base Concepts');
            expect(CONCEPT_LIBRARY_METADATA.base.description).toBeTruthy();

            expect(CONCEPT_LIBRARY_METADATA.vitalSigns.name).toBe('Vital Signs');
            expect(CONCEPT_LIBRARY_METADATA.vitalSigns.description).toBeTruthy();
        });

        it('should list expected concepts in metadata', () => {
            expect(CONCEPT_LIBRARY_METADATA.base.concepts).toContain('BiomedicalConcept');
            expect(CONCEPT_LIBRARY_METADATA.vitalSigns.concepts).toContain('SystolicBP');
            expect(CONCEPT_LIBRARY_METADATA.laboratory.concepts).toContain('Hemoglobin');
            expect(CONCEPT_LIBRARY_METADATA.adverseEvents.concepts).toContain('AdverseEvent');
            expect(CONCEPT_LIBRARY_METADATA.efficacy.concepts).toContain('OverallSurvival');
        });
    });

    describe('Concept Integration', () => {
        it('should allow referencing library concepts in user programs', async () => {
            // First load the library
            await library.loadAll();

            // Now parse a user program that references library concepts
            const userProgram = `
                concept MyCustomVitalSign type_of SystolicBP {
                    definition: "Custom vital sign based on SystolicBP"
                }
            `;

            const document = await parseDocument(services, userProgram);
            const program = document.parseResult.value as Program;

            const concepts = AstUtils.streamAllContents(program)
                .filter(node => node.$type === 'ConceptDefinition')
                .map(node => node as ConceptDefinition)
                .toArray();

            expect(concepts.length).toBe(1);
            expect(concepts[0].name).toBe('MyCustomVitalSign');
            expect(concepts[0].parentType?.$refText).toBe('SystolicBP');
        });
    });
});
