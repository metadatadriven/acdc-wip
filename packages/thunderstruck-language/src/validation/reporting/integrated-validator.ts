/**
 * Integrated Validator
 *
 * Unified validation interface that combines W3C, CDISC, and version validation
 * with comprehensive reporting.
 */

import type { Program, CubeDefinition } from '../../generated/ast.js';
import { CDISCValidator } from '../cdisc/cdisc-validator.js';
import { W3CValidator } from '../w3c/w3c-validator.js';
import { SymbolTable } from '../symbol-table.js';
import { ReportGenerator } from './report-generator.js';
import { ValidationIssueFactory } from './validation-report.js';
import type { ValidationReport, ReportOptions } from './validation-report.js';

/**
 * Options for integrated validation
 */
export interface ValidationOptions {
    /** Validate W3C Data Cube integrity constraints */
    validateW3C?: boolean;

    /** Validate SDTM conformance */
    validateSDTM?: boolean;

    /** Validate ADaM conformance */
    validateADaM?: boolean;

    /** Validate CORE rules */
    validateCORE?: boolean;

    /** Validate version compatibility */
    validateVersions?: boolean;

    /** Specific domain for SDTM validation */
    sdtmDomain?: string;

    /** Specific dataset for ADaM validation */
    adamDataset?: string;

    /** Report generation options */
    reportOptions?: ReportOptions;
}

/**
 * Integrated Validator
 *
 * Provides a unified interface for running all validations and generating reports.
 */
export class IntegratedValidator {
    private cdiscValidator: CDISCValidator;
    private w3cValidator: W3CValidator;
    private reportGenerator: ReportGenerator;

    constructor() {
        this.cdiscValidator = new CDISCValidator();
        this.w3cValidator = new W3CValidator();
        this.reportGenerator = new ReportGenerator();
    }

    /**
     * Validate a complete program with all validators
     */
    validateProgram(
        program: Program,
        options: ValidationOptions = {}
    ): ValidationReport {
        const {
            validateW3C = true,
            validateSDTM = false,
            validateADaM = false,
            validateCORE = false,
            validateVersions = true,
            reportOptions = {}
        } = options;

        // Start validation
        const targetName = this.getTargetName(program);
        this.reportGenerator.startValidation(targetName);

        // Load versions from program
        this.cdiscValidator.loadVersionsFromProgram(program);
        const versions = this.cdiscValidator.getEffectiveVersions();
        this.reportGenerator.setVersions(versions);

        // W3C Data Cube validation
        if (validateW3C) {
            this.runW3CValidation(program);
        }

        // Version validation
        if (validateVersions) {
            this.runVersionValidation(program);
        }

        // CDISC validation (requires cubes to be specified)
        if (validateSDTM || validateADaM || validateCORE) {
            // Note: CDISC validation is typically done per cube
            // This would need cube-specific options or iterate through cubes
        }

        return this.reportGenerator.generateReport(reportOptions);
    }

    /**
     * Validate a single cube against SDTM standards
     */
    validateCubeSDTM(
        cube: CubeDefinition,
        domain: string,
        includeCORE: boolean = true
    ): ValidationReport {
        this.reportGenerator.startValidation(cube.name);

        const versions = this.cdiscValidator.getEffectiveVersions();
        this.reportGenerator.setVersions(versions);

        if (includeCORE) {
            // Validate with CORE rules
            const result = this.cdiscValidator.validateSDTMWithCORE(cube, domain);

            // Convert CORE violations to issues
            const coreIssues = result.coreViolations.map(v =>
                ValidationIssueFactory.createCOREIssue(v)
            );
            this.reportGenerator.addCOREIssues(coreIssues);

            // TODO: Add standard SDTM validation issues from result.errors/warnings
        } else {
            // Validate without CORE rules
            const result = this.cdiscValidator.validateSDTM(cube, domain);
            // TODO: Add SDTM validation issues
        }

        return this.reportGenerator.generateReport();
    }

    /**
     * Validate a single cube against ADaM standards
     */
    validateCubeADaM(
        cube: CubeDefinition,
        dataset: string,
        includeCORE: boolean = true
    ): ValidationReport {
        this.reportGenerator.startValidation(cube.name);

        const versions = this.cdiscValidator.getEffectiveVersions();
        this.reportGenerator.setVersions(versions);

        if (includeCORE) {
            // Validate with CORE rules
            const result = this.cdiscValidator.validateADaMWithCORE(cube, dataset);

            // Convert CORE violations to issues
            const coreIssues = result.coreViolations.map(v =>
                ValidationIssueFactory.createCOREIssue(v)
            );
            this.reportGenerator.addCOREIssues(coreIssues);

            // TODO: Add standard ADaM validation issues from result.errors/warnings
        } else {
            // Validate without CORE rules
            const result = this.cdiscValidator.validateADaM(cube, dataset);
            // TODO: Add ADaM validation issues
        }

        return this.reportGenerator.generateReport();
    }

    /**
     * Run W3C validation
     */
    private runW3CValidation(program: Program): void {
        const symbolTable = new SymbolTable();
        symbolTable.buildFromProgram(program);

        const diagnostics = this.w3cValidator.validate(program, symbolTable);

        // Convert W3C diagnostics to validation issues
        const w3cIssues = diagnostics.map((diagnostic: any) =>
            ValidationIssueFactory.createW3CIssue(
                'W3C',
                diagnostic.message,
                diagnostic.severity
            )
        );

        this.reportGenerator.addW3CIssues(w3cIssues);
    }

    /**
     * Run version validation
     */
    private runVersionValidation(program: Program): void {
        const diagnostics = this.cdiscValidator.validateVersions(program);

        // Convert version diagnostics to validation issues
        const versionIssues = diagnostics.map(d =>
            ValidationIssueFactory.createVersionIssue(d)
        );

        this.reportGenerator.addVersionIssues(versionIssues);
    }

    /**
     * Get target name from program
     */
    private getTargetName(program: Program): string {
        // Try to get a meaningful name from the program
        // Could be first cube name, or "program" as default
        if (program.elements.length > 0) {
            const firstElement = program.elements[0];
            if ('name' in firstElement && typeof firstElement.name === 'string') {
                return firstElement.name;
            }
        }
        return 'program';
    }

    /**
     * Get the CDISC validator (for advanced usage)
     */
    getCDISCValidator(): CDISCValidator {
        return this.cdiscValidator;
    }

    /**
     * Get the W3C validator (for advanced usage)
     */
    getW3CValidator(): W3CValidator {
        return this.w3cValidator;
    }

    /**
     * Get the report generator (for advanced usage)
     */
    getReportGenerator(): ReportGenerator {
        return this.reportGenerator;
    }
}
