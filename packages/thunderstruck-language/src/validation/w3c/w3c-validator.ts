/**
 * W3C Data Cube Validator
 *
 * Main validator that orchestrates all W3C Data Cube integrity constraint checks.
 * Registers all implemented constraints and provides a unified validation interface.
 */

import { Program } from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { TypeDiagnostic } from '../../types/type-checker.js';
import {
    IntegrityConstraintValidator,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';
import { IC01_UniqueDataSet } from './ic-01-unique-dataset.js';
import { IC02_UniqueDSD } from './ic-02-unique-dsd.js';
import { IC11_AllDimensionsRequired } from './ic-11-all-dimensions-required.js';
import { IC12_NoDuplicateObservations } from './ic-12-no-duplicate-observations.js';
import { IC19_CodesFromCodeList } from './ic-19-codes-from-codelist.js';

/**
 * Main W3C Data Cube validator.
 *
 * Validates programs against W3C Data Cube integrity constraints.
 */
export class W3CValidator {
    private icValidator: IntegrityConstraintValidator;

    constructor() {
        this.icValidator = new IntegrityConstraintValidator();

        // Register all implemented integrity constraints
        this.registerConstraints();
    }

    /**
     * Register all W3C Data Cube integrity constraints.
     */
    private registerConstraints(): void {
        // Critical constraints
        this.icValidator.registerConstraint(new IC01_UniqueDataSet());
        this.icValidator.registerConstraint(new IC02_UniqueDSD());
        this.icValidator.registerConstraint(new IC11_AllDimensionsRequired());

        // Important constraints
        this.icValidator.registerConstraint(new IC12_NoDuplicateObservations());
        this.icValidator.registerConstraint(new IC19_CodesFromCodeList());
    }

    /**
     * Validate a program against all W3C Data Cube integrity constraints.
     *
     * @param program The program to validate
     * @param symbolTable Symbol table with all definitions
     * @returns Array of diagnostics for any violations found
     */
    validate(program: Program, symbolTable: SymbolTable): TypeDiagnostic[] {
        const violations = this.icValidator.validateProgram(program, symbolTable);

        // Convert violations to TypeDiagnostic format
        return violations.map(v => this.violationToDiagnostic(v));
    }

    /**
     * Convert an IntegrityConstraintViolation to a TypeDiagnostic.
     */
    private violationToDiagnostic(violation: IntegrityConstraintViolation): TypeDiagnostic {
        return {
            severity: violation.severity,
            message: violation.suggestion
                ? `${violation.message}\n  Suggestion: ${violation.suggestion}`
                : violation.message,
            // TypeDiagnostic expects Expression for node, but we're passing AstNode
            // This is acceptable as TypeDiagnostic.node is optional and loosely typed
            node: violation.location as any,
        };
    }

    /**
     * Get statistics about registered constraints.
     */
    getConstraintStats(): { total: number; critical: number; important: number; optional: number } {
        const constraints = this.icValidator.getConstraints();
        return {
            total: constraints.length,
            critical: constraints.filter(c => c.priority === 'critical').length,
            important: constraints.filter(c => c.priority === 'important').length,
            optional: constraints.filter(c => c.priority === 'optional').length,
        };
    }
}
