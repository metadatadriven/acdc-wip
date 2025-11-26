/**
 * W3C Data Cube Integrity Constraint Validator Framework
 *
 * Provides extensible framework for implementing W3C Data Cube integrity constraints.
 * Each constraint is implemented as a separate validator that inherits from IntegrityConstraint.
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#wf-rules
 */

import { AstNode } from 'langium';
import { Program } from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';

/**
 * Represents a violation of an integrity constraint.
 */
export interface IntegrityConstraintViolation {
    /** Constraint ID (e.g., "IC-1", "IC-2") */
    constraintId: string;

    /** Severity of the violation */
    severity: DiagnosticSeverity;

    /** Human-readable error message */
    message: string;

    /** AST node where the violation occurred */
    location: AstNode;

    /** Optional suggestion for fixing the violation */
    suggestion?: string;

    /** Optional code for categorization */
    code?: string;
}

/**
 * Abstract base class for integrity constraints.
 *
 * Each constraint implements the validate method to check for violations.
 */
export abstract class IntegrityConstraint {
    /** Unique identifier for this constraint (e.g., "IC-1") */
    abstract readonly id: string;

    /** Human-readable description of what this constraint checks */
    abstract readonly description: string;

    /** Priority level for validation order */
    abstract readonly priority: 'critical' | 'important' | 'optional';

    /**
     * Validate the program against this integrity constraint.
     *
     * @param program The program to validate
     * @param symbolTable Symbol table with all definitions
     * @returns Array of violations found (empty if valid)
     */
    abstract validate(
        program: Program,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[];
}

/**
 * Main validator that orchestrates all integrity constraints.
 */
export class IntegrityConstraintValidator {
    private constraints: IntegrityConstraint[] = [];

    /**
     * Register an integrity constraint for validation.
     *
     * @param constraint The constraint to register
     */
    registerConstraint(constraint: IntegrityConstraint): void {
        this.constraints.push(constraint);

        // Sort by priority: critical > important > optional
        this.constraints.sort((a, b) => {
            const priorityOrder = { critical: 0, important: 1, optional: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    /**
     * Validate a program against all registered constraints.
     *
     * @param program The program to validate
     * @param symbolTable Symbol table with all definitions
     * @returns Array of all violations found
     */
    validateProgram(
        program: Program,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const constraint of this.constraints) {
            try {
                const constraintViolations = constraint.validate(program, symbolTable);
                violations.push(...constraintViolations);
            } catch (error) {
                // Log error but continue with other constraints
                console.error(`Error in constraint ${constraint.id}:`, error);
            }
        }

        return violations;
    }

    /**
     * Get all registered constraints.
     */
    getConstraints(): IntegrityConstraint[] {
        return [...this.constraints];
    }

    /**
     * Clear all registered constraints.
     */
    clearConstraints(): void {
        this.constraints = [];
    }
}
