/**
 * CDISC Validator
 *
 * Main validator that orchestrates SDTM and ADaM validation.
 * Loads standards metadata and provides unified validation interface.
 */

import { CubeDefinition } from '../../generated/ast.js';
import { StandardsMetadataRegistry } from './standards-metadata.js';
import { SDTMValidator, SDTMValidationResult } from './sdtm-validator.js';
import { ADaMValidator, ADaMValidationResult } from './adam-validator.js';
import sdtmDefs from './sdtm-defs.json';
import adamDefs from './adam-defs.json';

/**
 * Main CDISC validator.
 */
export class CDISCValidator {
    private registry: StandardsMetadataRegistry;
    private sdtmValidator: SDTMValidator;
    private adamValidator: ADaMValidator;

    constructor() {
        this.registry = new StandardsMetadataRegistry();
        this.sdtmValidator = new SDTMValidator(this.registry);
        this.adamValidator = new ADaMValidator(this.registry);

        // Load standards metadata
        this.loadStandardsMetadata();
    }

    /**
     * Load standards metadata from JSON files.
     */
    private loadStandardsMetadata(): void {
        // Load SDTM domains
        for (const domain of sdtmDefs.domains) {
            this.registry.registerSDTMDomain(domain as any);
        }

        // Load ADaM datasets
        for (const dataset of adamDefs.datasets) {
            this.registry.registerADaMDataset(dataset as any);
        }

        // Load code lists from SDTM
        for (const codeList of sdtmDefs.codeLists) {
            this.registry.registerCodeList(codeList);
        }
    }

    /**
     * Validate a cube against SDTM standards.
     */
    validateSDTM(cube: CubeDefinition, domain: string): SDTMValidationResult {
        return this.sdtmValidator.validate(cube, domain);
    }

    /**
     * Validate a cube against ADaM standards.
     */
    validateADaM(cube: CubeDefinition, dataset: string): ADaMValidationResult {
        return this.adamValidator.validate(cube, dataset);
    }

    /**
     * Get the standards registry (for advanced usage).
     */
    getRegistry(): StandardsMetadataRegistry {
        return this.registry;
    }
}
