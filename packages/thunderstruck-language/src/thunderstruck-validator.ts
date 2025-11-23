/**
 * Thunderstruck Language Validator
 *
 * Provides validation rules and diagnostics for Thunderstruck documents.
 * This validator runs on document changes and reports syntax errors,
 * semantic errors, and warnings to the client.
 */

import { ValidationAcceptor, ValidationChecks } from 'langium';
import type { ThunderstruckAstType } from './generated/ast.js';
import type { ThunderstruckServices } from './thunderstruck-module.js';

/**
 * Registry for validation checks.
 * Validators are organized by AST node type.
 */
export class ThunderstruckValidatorRegistry {
    constructor(services: ThunderstruckServices) {
        // Register validators here as we add more validation rules
    }
}

/**
 * Register custom validators for Thunderstruck.
 *
 * Currently provides basic syntax validation through Langium's parser.
 * Additional semantic validation rules will be added in future increments.
 */
export function registerValidationChecks(services: ThunderstruckServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = new ThunderstruckValidator();

    // Currently, Langium's built-in parser provides syntax validation
    // Additional semantic validation rules can be registered here
    // For example:
    // const checks: ValidationChecks<ThunderstruckAstType> = {
    //     CubeDefinition: validator.checkCubeDefinition,
    //     ModelDefinition: validator.checkModelDefinition,
    // };
    // registry.register(checks, validator);
}

/**
 * Custom validator for Thunderstruck-specific validation rules.
 *
 * In future increments, this will include:
 * - Type checking for expressions
 * - Reference resolution validation
 * - Semantic consistency checks
 * - Statistical model specification validation
 */
export class ThunderstruckValidator {
    // Example validation method (currently not used)
    // checkCubeDefinition(cube: CubeDefinition, accept: ValidationAcceptor): void {
    //     if (!cube.namespace) {
    //         accept('warning', 'Cube should have a namespace', { node: cube, property: 'name' });
    //     }
    // }
}
