/**
 * Concept Library Loader
 *
 * Provides access to the standard library of concept definitions.
 * The concept library includes:
 * - Base concepts (BiomedicalConcept, DerivationConcept, AnalysisConcept)
 * - Domain-specific concepts (vital signs, laboratory tests, adverse events, efficacy endpoints)
 * - Common property concepts (Value, Unit, etc.)
 *
 * These concepts can be imported and used in Thunderstruck programs.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LangiumDocument, URI } from 'langium';
import type { ThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';

// Get the directory path for the stdlib
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Paths to standard library concept files.
 */
export const STDLIB_CONCEPT_FILES = {
    base: '../../stdlib/concepts.tsk',
    vitalSigns: '../../stdlib/concepts/vital-signs.tsk',
    laboratory: '../../stdlib/concepts/laboratory.tsk',
    adverseEvents: '../../stdlib/concepts/adverse-events.tsk',
    efficacy: '../../stdlib/concepts/efficacy.tsk'
} as const;

/**
 * Registry of loaded concept library documents.
 */
export class ConceptLibrary {
    private documents = new Map<string, LangiumDocument<Program>>();

    constructor(private services: ThunderstruckServices) {}

    /**
     * Load all standard library concept files.
     */
    async loadAll(): Promise<void> {
        for (const [name, relativePath] of Object.entries(STDLIB_CONCEPT_FILES)) {
            await this.loadFile(name, relativePath);
        }
    }

    /**
     * Load a specific concept library file.
     */
    async loadFile(name: string, relativePath: string): Promise<LangiumDocument<Program>> {
        const existingDoc = this.documents.get(name);
        if (existingDoc) {
            return existingDoc;
        }

        try {
            const filePath = resolve(__dirname, relativePath);
            const content = readFileSync(filePath, 'utf-8');
            const uriString = `stdlib://${name}.tsk`;
            const uri = URI.parse(uriString);

            // Create a TextDocument from the content
            const textDocument = TextDocument.create(uriString, 'thunderstruck', 0, content);

            // Parse the document using Langium services
            const document = this.services.shared.workspace.LangiumDocumentFactory.fromString(
                content,
                uri
            );

            // Store the parsed document
            this.documents.set(name, document as LangiumDocument<Program>);

            return document as LangiumDocument<Program>;
        } catch (error) {
            console.error(`Failed to load concept library file '${name}':`, error);
            throw error;
        }
    }

    /**
     * Get a loaded concept library document by name.
     */
    getDocument(name: string): LangiumDocument<Program> | undefined {
        return this.documents.get(name);
    }

    /**
     * Get all loaded concept library documents.
     */
    getAllDocuments(): LangiumDocument<Program>[] {
        return Array.from(this.documents.values());
    }

    /**
     * Check if a specific library is loaded.
     */
    isLoaded(name: string): boolean {
        return this.documents.has(name);
    }

    /**
     * Clear all loaded concept libraries.
     */
    clear(): void {
        this.documents.clear();
    }
}

/**
 * Create and initialize a concept library instance.
 */
export async function createConceptLibrary(services: ThunderstruckServices): Promise<ConceptLibrary> {
    const library = new ConceptLibrary(services);
    await library.loadAll();
    return library;
}

/**
 * Get concept library file paths for external tools.
 */
export function getConceptLibraryPaths(): string[] {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    return Object.values(STDLIB_CONCEPT_FILES).map(relativePath =>
        resolve(__dirname, relativePath)
    );
}

/**
 * Concept library metadata for documentation and tooling.
 */
export const CONCEPT_LIBRARY_METADATA = {
    base: {
        name: 'Base Concepts',
        description: 'Foundational concept definitions including BiomedicalConcept, DerivationConcept, and AnalysisConcept',
        concepts: [
            'Value',
            'MeasurementUnit',
            'BaselineValue',
            'Visit',
            'BiomedicalConcept',
            'DerivationConcept',
            'AnalysisConcept',
            'Change',
            'ChangeFromBaseline',
            'PercentChange'
        ]
    },
    vitalSigns: {
        name: 'Vital Signs',
        description: 'Standard vital signs concepts including blood pressure, heart rate, temperature, and anthropometric measurements',
        concepts: [
            'VitalSign',
            'SystolicBP',
            'DiastolicBP',
            'MeanArterialPressure',
            'HeartRate',
            'PulseRate',
            'RespiratoryRate',
            'OxygenSaturation',
            'BodyTemperature',
            'OralTemperature',
            'TympanicTemperature',
            'Height',
            'Weight',
            'BMI',
            'BSA'
        ]
    },
    laboratory: {
        name: 'Laboratory Tests',
        description: 'Common laboratory test concepts including hematology, chemistry, liver function, lipids, and coagulation',
        concepts: [
            'LaboratoryTest',
            'HematologyConcept',
            'Hemoglobin',
            'Hematocrit',
            'WBC',
            'RBC',
            'Platelet',
            'Neutrophils',
            'Lymphocytes',
            'ChemistryConcept',
            'Glucose',
            'Creatinine',
            'BUN',
            'Sodium',
            'Potassium',
            'Chloride',
            'Calcium',
            'LiverFunctionTest',
            'ALT',
            'AST',
            'AlkalinePhosphatase',
            'TotalBilirubin',
            'Albumin',
            'LipidTest',
            'TotalCholesterol',
            'HDLCholesterol',
            'LDLCholesterol',
            'Triglycerides',
            'eGFR',
            'CoagulationTest',
            'PT',
            'INR',
            'aPTT'
        ]
    },
    adverseEvents: {
        name: 'Adverse Events',
        description: 'Adverse event concepts including severity grades, serious adverse events, causality, and common AE terms',
        concepts: [
            'AdverseEvent',
            'AESeverity',
            'MildAE',
            'ModerateAE',
            'SevereAE',
            'SeriousAdverseEvent',
            'LifeThreateningAE',
            'HospitalizationAE',
            'DisabilityAE',
            'CongenitalAnomalyAE',
            'FatalAE',
            'AECausality',
            'RelatedAE',
            'UnrelatedAE',
            'AEActionTaken',
            'DrugWithdrawnAE',
            'DoseReducedAE',
            'DoseInterruptedAE',
            'CardiacDisorder',
            'GastrointestinalDisorder',
            'NervousSystemDisorder',
            'InfectionInfestation',
            'RespiratorDisorder',
            'SkinDisorder',
            'Nausea',
            'Vomiting',
            'Diarrhea',
            'Headache',
            'Fatigue',
            'Dizziness',
            'Rash',
            'Pyrexia'
        ]
    },
    efficacy: {
        name: 'Efficacy Endpoints',
        description: 'Efficacy endpoint concepts including response criteria, survival endpoints, tumor measurements, QoL scales, and PK parameters',
        concepts: [
            'EfficacyEndpoint',
            'PrimaryEndpoint',
            'SecondaryEndpoint',
            'ExploratoryEndpoint',
            'ClinicalResponse',
            'CompleteResponse',
            'PartialResponse',
            'StableDisease',
            'ProgressiveDisease',
            'SurvivalEndpoint',
            'OverallSurvival',
            'ProgressionFreeSurvival',
            'EventFreeSurvival',
            'TimeToProgression',
            'DiseaseFreeSurvival',
            'TumorMeasurement',
            'SumOfDiameters',
            'PercentChangeInTumorSize',
            'TumorResponseRate',
            'ObjectiveResponseRate',
            'DiseaseControlRate',
            'QualityOfLife',
            'EORTCQLQC30',
            'EQ5D',
            'FACTG',
            'CognitiveAssessment',
            'MMSE',
            'ADAS_Cog',
            'MoCA',
            'PainAssessment',
            'VAS_Pain',
            'NRS_Pain',
            'BriefPainInventory',
            'DiseaseActivityScore',
            'DAS28',
            'PASI',
            'EDSS',
            'HAM_D',
            'MADRS',
            'PKEndpoint',
            'Cmax',
            'AUC',
            'Tmax',
            'HalfLife',
            'Clearance',
            'VolumeOfDistribution'
        ]
    }
} as const;
