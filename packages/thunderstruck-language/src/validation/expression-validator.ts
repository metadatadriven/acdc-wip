/**
 * Expression Validator for Thunderstruck Language
 *
 * Validates expressions in context (e.g., in where clauses, derive statements).
 * Uses TypeChecker to ensure type correctness.
 *
 * Design decisions:
 * - Q1: Moderate type inference (expressions inferred, definitions explicit)
 * - Q4: Type mismatches are errors
 * - Q10: ErrorType propagation
 */

import { Expression, SliceDefinition, Derivation } from '../generated/ast.js';
import { TypeChecker, TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import { SymbolTable } from './symbol-table.js';
import { Type, FlagType, ErrorType, CubeType } from '../types/type-system.js';

/**
 * Validation context provides information about where an expression is being validated.
 */
export interface ValidationContext {
    /**
     * The cube type that provides the available variables.
     * For example, in a slice where clause, this is the source cube.
     */
    cubeType?: CubeType;

    /**
     * Expected result type for the expression.
     * For example, where clauses must result in Flag type.
     */
    expectedType?: Type;

    /**
     * Description of the context for error messages.
     */
    contextDescription?: string;
}

/**
 * Expression validator.
 *
 * Validates expressions in various contexts:
 * - Where clauses in slices (must be Flag type)
 * - Derive expressions (right-hand side of assignments)
 * - Model formulas (validated by FormulaValidator)
 */
export class ExpressionValidator {
    private typeChecker: TypeChecker;

    constructor(private symbolTable: SymbolTable) {
        this.typeChecker = new TypeChecker(symbolTable);
    }

    /**
     * Validate an expression in a given context.
     * Returns diagnostics for any issues found.
     */
    validateExpression(
        expr: Expression,
        context: ValidationContext = {}
    ): TypeDiagnostic[] {
        // Check the expression type with cube context
        const result = this.typeChecker.checkExpression(expr, context.cubeType);

        // Start with diagnostics from type checking
        const diagnostics = [...result.diagnostics];

        // If we have an expected type, check compatibility
        if (context.expectedType && !(result.type instanceof ErrorType)) {
            if (!result.type.isAssignableTo(context.expectedType)) {
                const contextDesc = context.contextDescription || 'this context';
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Type mismatch in ${contextDesc}: expected ${context.expectedType.toString()}, but got ${result.type.toString()}`,
                    node: expr,
                });
            }
        }

        return diagnostics;
    }

    /**
     * Validate a where clause in a slice definition.
     * Where clauses must evaluate to Flag type.
     */
    validateWhereClause(
        slice: SliceDefinition,
        cubeType: CubeType
    ): TypeDiagnostic[] {
        if (!slice.whereClause) {
            return [];
        }

        const context: ValidationContext = {
            cubeType,
            expectedType: new FlagType(),
            contextDescription: 'where clause',
        };

        return this.validateExpression(slice.whereClause, context);
    }

    /**
     * Validate the expression in a derive statement.
     * The right-hand side of the assignment (target = expression).
     */
    validateDerivationExpression(
        derivation: Derivation,
        inputCubeType: CubeType
    ): TypeDiagnostic[] {
        const context: ValidationContext = {
            cubeType: inputCubeType,
            contextDescription: `derive expression for '${derivation.target}'`,
        };

        return this.validateExpression(derivation.expression, context);
    }

    /**
     * Check if an expression type matches an expected type.
     * Used for various validation scenarios.
     */
    checkTypeCompatibility(
        expr: Expression,
        expectedType: Type,
        contextDescription: string
    ): TypeDiagnostic[] {
        const context: ValidationContext = {
            expectedType,
            contextDescription,
        };

        return this.validateExpression(expr, context);
    }

    /**
     * Get the inferred type of an expression without validation context.
     * Useful for getting the result type of derive expressions.
     */
    inferExpressionType(expr: Expression, cubeContext?: CubeType): Type {
        const result = this.typeChecker.checkExpression(expr, cubeContext);
        return result.type;
    }

    /**
     * Validate all expressions in a list and collect diagnostics.
     */
    validateExpressions(
        expressions: Expression[],
        context: ValidationContext = {}
    ): TypeDiagnostic[] {
        const allDiagnostics: TypeDiagnostic[] = [];

        for (const expr of expressions) {
            const diagnostics = this.validateExpression(expr, context);
            allDiagnostics.push(...diagnostics);
        }

        return allDiagnostics;
    }
}
