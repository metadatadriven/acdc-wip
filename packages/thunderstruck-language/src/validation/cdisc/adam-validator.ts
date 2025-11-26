/**
 * ADaM Validator
 *
 * Validates that cube definitions conform to ADaM (Analysis Data Model) standards.
 *
 * Validates:
 * - Required variables are present
 * - Variable types match ADaM specifications
 * - Dataset structure is correct
 */

import { CubeDefinition, Component } from '../../generated/ast.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { StandardsMetadataRegistry, ADaMDatasetDefinition } from './standards-metadata.js';

export interface ADaMValidationResult {
    valid: boolean;
    errors: ADaMValidationError[];
    warnings: ADaMValidationWarning[];
}

export interface ADaMValidationError {
    severity: DiagnosticSeverity;
    message: string;
    variable?: string;
    code: string;
}

export interface ADaMValidationWarning {
    severity: DiagnosticSeverity;
    message: string;
    variable?: string;
    code: string;
}

/**
 * Validates cubes against ADaM standards.
 */
export class ADaMValidator {
    constructor(private registry: StandardsMetadataRegistry) {}

    /**
     * Validate a cube definition against ADaM standards.
     *
     * @param cube The cube to validate
     * @param dataset The ADaM dataset type (e.g., "ADSL", "BDS")
     * @returns Validation result with errors and warnings
     */
    validate(cube: CubeDefinition, dataset: string): ADaMValidationResult {
        const errors: ADaMValidationError[] = [];
        const warnings: ADaMValidationWarning[] = [];

        // Get ADaM dataset definition
        const datasetDef = this.registry.getADaMDataset(dataset);
        if (!datasetDef) {
            errors.push({
                severity: DiagnosticSeverity.Error,
                message: `Unknown ADaM dataset: ${dataset}`,
                code: 'ADAM-UNKNOWN-DATASET',
            });
            return {valid: false, errors, warnings};
        }

        // Check required variables
        this.validateRequiredVariables(cube, datasetDef, errors);

        // Check variable types
        this.validateVariableTypes(cube, datasetDef, errors, warnings);

        // Check key variables
        this.validateKeyVariables(cube, datasetDef, warnings);

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validate that all required variables are present.
     */
    private validateRequiredVariables(
        cube: CubeDefinition,
        datasetDef: ADaMDatasetDefinition,
        errors: ADaMValidationError[]
    ): void {
        const requiredVars = datasetDef.variables.filter(v => v.required);
        const cubeComponents = this.getCubeComponents(cube);

        for (const requiredVar of requiredVars) {
            const found = cubeComponents.find(c => c.name === requiredVar.name);
            if (!found) {
                errors.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Missing required ADaM variable '${requiredVar.name}' for dataset ${datasetDef.dataset}`,
                    variable: requiredVar.name,
                    code: 'ADAM-MISSING-REQUIRED',
                });
            }
        }
    }

    /**
     * Validate that variable types match ADaM specifications.
     */
    private validateVariableTypes(
        cube: CubeDefinition,
        datasetDef: ADaMDatasetDefinition,
        errors: ADaMValidationError[],
        warnings: ADaMValidationWarning[]
    ): void {
        const cubeComponents = this.getCubeComponents(cube);

        for (const component of cubeComponents) {
            const adamVar = datasetDef.variables.find(v => v.name === component.name);
            if (!adamVar) {
                // Variable not in standard
                warnings.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Variable '${component.name}' is not part of ADaM ${datasetDef.dataset} standard`,
                    variable: component.name,
                    code: 'ADAM-NON-STANDARD-VAR',
                });
                continue;
            }

            // Check type compatibility
            const cubeType = this.getComponentType(component);
            if (!this.isTypeCompatible(cubeType, adamVar.type)) {
                errors.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Variable '${component.name}' has type '${cubeType}' but ADaM specifies '${adamVar.type}'`,
                    variable: component.name,
                    code: 'ADAM-TYPE-MISMATCH',
                });
            }
        }
    }

    /**
     * Validate key variables are present.
     */
    private validateKeyVariables(
        cube: CubeDefinition,
        datasetDef: ADaMDatasetDefinition,
        warnings: ADaMValidationWarning[]
    ): void {
        const cubeComponents = this.getCubeComponents(cube);

        for (const keyVar of datasetDef.keyVariables) {
            const found = cubeComponents.find(c => c.name === keyVar);
            if (!found) {
                warnings.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Key variable '${keyVar}' is missing. This variable is needed for unique record identification in ${datasetDef.dataset}`,
                    variable: keyVar,
                    code: 'ADAM-MISSING-KEY',
                });
            }
        }
    }

    /**
     * Get all components from a cube.
     */
    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];

        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }

        return components;
    }

    /**
     * Get the type string for a component.
     */
    private getComponentType(component: Component): string {
        switch (component.type.$type) {
            case 'PrimitiveType':
                return component.type.type;
            case 'CodedValueType':
                return 'CodedValue';
            case 'IdentifierType':
                return 'Identifier';
            default:
                return 'Unknown';
        }
    }

    /**
     * Check if cube type is compatible with ADaM type.
     */
    private isTypeCompatible(cubeType: string, adamType: string): boolean {
        if (cubeType === adamType) {
            return true;
        }

        if (cubeType === 'Identifier' && adamType === 'Text') {
            return true;
        }

        if (cubeType === 'Integer' && adamType === 'Numeric') {
            return true;
        }

        if (cubeType === 'DateTime' && adamType === 'Date') {
            return true;
        }

        return false;
    }
}
