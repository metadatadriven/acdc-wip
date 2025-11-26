/**
 * CDISC Validator
 *
 * Main validator that orchestrates SDTM, ADaM, and CORE rules validation.
 * Loads standards metadata and provides unified validation interface.
 */

import { CubeDefinition } from '../../generated/ast.js';
import { StandardsMetadataRegistry } from './standards-metadata.js';
import { SDTMValidator, SDTMValidationResult } from './sdtm-validator.js';
import { ADaMValidator, ADaMValidationResult } from './adam-validator.js';
import { COREulesEngine, COREViolation } from './core-rules-engine.js';
import {
    NoDuplicateKeyChecker,
    ISO8601DateChecker,
    DateTimeOrderChecker,
    RequiredIfChecker,
    ValueInCodeListChecker,
} from './core-checkers.js';
import sdtmDefs from './sdtm-defs.json';
import adamDefs from './adam-defs.json';
import sdtmCoreRules from './sdtm-core-rules.json';
import adamCoreRules from './adam-core-rules.json';

/**
 * Main CDISC validator with CORE rules support.
 */
export class CDISCValidator {
    private registry: StandardsMetadataRegistry;
    private sdtmValidator: SDTMValidator;
    private adamValidator: ADaMValidator;
    private coreEngine: COREulesEngine;

    constructor() {
        this.registry = new StandardsMetadataRegistry();
        this.sdtmValidator = new SDTMValidator(this.registry);
        this.adamValidator = new ADaMValidator(this.registry);
        this.coreEngine = new COREulesEngine();

        // Load standards metadata and rules
        this.loadStandardsMetadata();
        this.loadCOREules();
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
     * Load CORE rules and register checkers.
     */
    private loadCOREules(): void {
        // Register checkers
        this.coreEngine.registerChecker(new NoDuplicateKeyChecker());
        this.coreEngine.registerChecker(new ISO8601DateChecker());
        this.coreEngine.registerChecker(new DateTimeOrderChecker());
        this.coreEngine.registerChecker(new RequiredIfChecker());
        this.coreEngine.registerChecker(new ValueInCodeListChecker());

        // Register SDTM CORE rules
        this.coreEngine.registerRules(sdtmCoreRules.rules as any);

        // Register ADaM CORE rules
        this.coreEngine.registerRules(adamCoreRules.rules as any);
    }

    /**
     * Validate a cube against SDTM standards with CORE rules.
     *
     * @param cube The cube to validate
     * @param domain The SDTM domain (e.g., "DM", "AE", "LB")
     * @returns Validation result with errors, warnings, and CORE violations
     */
    validateSDTMWithCORE(
        cube: CubeDefinition,
        domain: string
    ): SDTMValidationResult & { coreViolations: COREViolation[] } {
        const result = this.sdtmValidator.validate(cube, domain);
        const coreViolations = this.coreEngine.validateCube(cube, domain);

        return {
            ...result,
            coreViolations,
        };
    }

    /**
     * Validate a cube against ADaM standards with CORE rules.
     *
     * @param cube The cube to validate
     * @param dataset The ADaM dataset type (e.g., "ADSL", "BDS")
     * @returns Validation result with errors, warnings, and CORE violations
     */
    validateADaMWithCORE(
        cube: CubeDefinition,
        dataset: string
    ): ADaMValidationResult & { coreViolations: COREViolation[] } {
        const result = this.adamValidator.validate(cube, dataset);
        const coreViolations = this.coreEngine.validateCube(cube, dataset);

        return {
            ...result,
            coreViolations,
        };
    }

    /**
     * Get the standards registry (for advanced usage).
     */
    getRegistry(): StandardsMetadataRegistry {
        return this.registry;
    }

    /**
     * Get the CORE rules engine (for advanced usage).
     */
    getCOREEngine(): COREulesEngine {
        return this.coreEngine;
    }
}
