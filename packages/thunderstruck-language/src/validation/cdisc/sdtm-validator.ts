/**
 * SDTM Validator
 *
 * Validates that cube definitions conform to SDTM (Study Data Tabulation Model) standards.
 *
 * Validates:
 * - Required variables are present
 * - Variable types match SDTM specifications
 * - Code lists are correctly specified
 * - Domain structure is correct
 */

import { CubeDefinition, Component } from '../../generated/ast.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { StandardsMetadataRegistry, SDTMDomainDefinition } from './standards-metadata.js';

export interface SDTMValidationResult {
    valid: boolean;
    errors: SDTMValidationError[];
    warnings: SDTMValidationWarning[];
}

export interface SDTMValidationError {
    severity: DiagnosticSeverity;
    message: string;
    variable?: string;
    code: string;
}

export interface SDTMValidationWarning {
    severity: DiagnosticSeverity;
    message: string;
    variable?: string;
    code: string;
}

/**
 * Validates cubes against SDTM standards.
 */
export class SDTMValidator {
    constructor(private registry: StandardsMetadataRegistry) {}

    /**
     * Validate a cube definition against SDTM standards.
     *
     * @param cube The cube to validate
     * @param domain The SDTM domain to validate against (e.g., "DM", "AE", "LB")
     * @returns Validation result with errors and warnings
     */
    validate(cube: CubeDefinition, domain: string): SDTMValidationResult {
        const errors: SDTMValidationError[] = [];
        const warnings: SDTMValidationWarning[] = [];

        // Get SDTM domain definition
        const domainDef = this.registry.getSDTMDomain(domain);
        if (!domainDef) {
            errors.push({
                severity: DiagnosticSeverity.Error,
                message: `Unknown SDTM domain: ${domain}`,
                code: 'SDTM-UNKNOWN-DOMAIN',
            });
            return {valid: false, errors, warnings};
        }

        // Check required variables
        this.validateRequiredVariables(cube, domainDef, errors);

        // Check variable types
        this.validateVariableTypes(cube, domainDef, errors, warnings);

        // Check code lists
        this.validateCodeLists(cube, domainDef, warnings);

        // Check key variables
        this.validateKeyVariables(cube, domainDef, warnings);

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
        domainDef: SDTMDomainDefinition,
        errors: SDTMValidationError[]
    ): void {
        const requiredVars = domainDef.variables.filter(v => v.required);
        const cubeComponents = this.getCubeComponents(cube);

        for (const requiredVar of requiredVars) {
            const found = cubeComponents.find(c => c.name === requiredVar.name);
            if (!found) {
                errors.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Missing required SDTM variable '${requiredVar.name}' for domain ${domainDef.domain}`,
                    variable: requiredVar.name,
                    code: 'SDTM-MISSING-REQUIRED',
                });
            }
        }
    }

    /**
     * Validate that variable types match SDTM specifications.
     */
    private validateVariableTypes(
        cube: CubeDefinition,
        domainDef: SDTMDomainDefinition,
        errors: SDTMValidationError[],
        warnings: SDTMValidationWarning[]
    ): void {
        const cubeComponents = this.getCubeComponents(cube);

        for (const component of cubeComponents) {
            const sdtmVar = domainDef.variables.find(v => v.name === component.name);
            if (!sdtmVar) {
                // Variable not in standard - might be custom
                warnings.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Variable '${component.name}' is not part of SDTM ${domainDef.domain} standard`,
                    variable: component.name,
                    code: 'SDTM-NON-STANDARD-VAR',
                });
                continue;
            }

            // Check type compatibility
            const cubeType = this.getComponentType(component);
            if (!this.isTypeCompatible(cubeType, sdtmVar.type)) {
                errors.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Variable '${component.name}' has type '${cubeType}' but SDTM specifies '${sdtmVar.type}'`,
                    variable: component.name,
                    code: 'SDTM-TYPE-MISMATCH',
                });
            }
        }
    }

    /**
     * Validate code lists are properly specified.
     */
    private validateCodeLists(
        cube: CubeDefinition,
        domainDef: SDTMDomainDefinition,
        warnings: SDTMValidationWarning[]
    ): void {
        const cubeComponents = this.getCubeComponents(cube);

        for (const component of cubeComponents) {
            const sdtmVar = domainDef.variables.find(v => v.name === component.name);
            if (!sdtmVar) {
                continue;
            }

            if (sdtmVar.type === 'CodedValue' && sdtmVar.codeList) {
                // Check if cube has code list specified
                const hasCodeList = component.type.$type === 'CodedValueType' &&
                    component.type.codeList !== undefined;

                if (!hasCodeList) {
                    warnings.push({
                        severity: DiagnosticSeverity.Warning,
                        message: `Variable '${component.name}' should use code list '${sdtmVar.codeList}' per SDTM standard`,
                        variable: component.name,
                        code: 'SDTM-MISSING-CODELIST',
                    });
                }
            }
        }
    }

    /**
     * Validate key variables are present.
     */
    private validateKeyVariables(
        cube: CubeDefinition,
        domainDef: SDTMDomainDefinition,
        warnings: SDTMValidationWarning[]
    ): void {
        const cubeComponents = this.getCubeComponents(cube);

        for (const keyVar of domainDef.keyVariables) {
            const found = cubeComponents.find(c => c.name === keyVar);
            if (!found) {
                warnings.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Key variable '${keyVar}' is missing. This variable is needed for unique record identification in ${domainDef.domain}`,
                    variable: keyVar,
                    code: 'SDTM-MISSING-KEY',
                });
            }
        }
    }

    /**
     * Get all components from a cube (dimensions, measures, attributes).
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
     * Check if cube type is compatible with SDTM type.
     */
    private isTypeCompatible(cubeType: string, sdtmType: string): boolean {
        // Direct match
        if (cubeType === sdtmType) {
            return true;
        }

        // Identifier can be used for Text variables
        if (cubeType === 'Identifier' && sdtmType === 'Text') {
            return true;
        }

        // Integer is compatible with Numeric
        if (cubeType === 'Integer' && sdtmType === 'Numeric') {
            return true;
        }

        // DateTime is compatible with Date
        if (cubeType === 'DateTime' && sdtmType === 'Date') {
            return true;
        }

        return false;
    }
}
