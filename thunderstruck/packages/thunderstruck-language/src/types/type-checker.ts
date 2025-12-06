/**
 * Type Checker for Thunderstruck Language
 *
 * Provides type checking for expressions using the type inference engine
 * and symbol table.
 *
 * This module bridges type inference with the symbol table to provide
 * complete type checking with proper error reporting.
 */

import {
    Expression,
    BinaryExpression,
    UnaryExpression,
    Literal,
    FunctionCallExpression,
    VariableReference,
    MemberAccessExpression,
} from '../generated/ast.js';
import {
    Type,
    ErrorType,
    UnknownType,
    CubeType,
} from './type-system.js';
import { TypeInference } from './type-inference.js';
import { SymbolTable } from '../validation/symbol-table.js';

/**
 * Diagnostic severity levels.
 */
export enum DiagnosticSeverity {
    Error = 'error',
    Warning = 'warning',
    Hint = 'hint',
}

/**
 * Type checking diagnostic.
 */
export interface TypeDiagnostic {
    severity: DiagnosticSeverity;
    message: string;
    node?: Expression;
}

/**
 * Type checking result.
 */
export interface TypeCheckResult {
    type: Type;
    diagnostics: TypeDiagnostic[];
}

/**
 * Type checker for expressions.
 *
 * Uses TypeInference to infer types and SymbolTable to resolve variable references.
 */
export class TypeChecker {
    private inference: TypeInference;
    private cubeContext?: CubeType;

    constructor(private symbolTable: SymbolTable) {
        this.inference = new TypeInference();
    }

    /**
     * Check the type of an expression.
     * Returns the inferred type and any diagnostics.
     *
     * @param expr The expression to check
     * @param cubeContext Optional cube context for resolving component variables
     */
    checkExpression(expr: Expression, cubeContext?: CubeType): TypeCheckResult {
        // Store cube context for variable resolution (only if provided)
        const previousContext = this.cubeContext;
        if (cubeContext !== undefined) {
            this.cubeContext = cubeContext;
        }

        const diagnostics: TypeDiagnostic[] = [];

        let result: TypeCheckResult;

        // Check based on expression type
        if (this.isBinaryExpression(expr)) {
            result = this.checkBinaryExpression(expr);
        } else if (this.isUnaryExpression(expr)) {
            result = this.checkUnaryExpression(expr);
        } else if (this.isLiteral(expr)) {
            result = this.checkLiteral(expr);
        } else if (this.isFunctionCallExpression(expr)) {
            result = this.checkFunctionCall(expr);
        } else if (this.isVariableReference(expr)) {
            result = this.checkVariableReference(expr);
        } else if (this.isMemberAccessExpression(expr)) {
            result = this.checkMemberAccess(expr);
        } else {
            // Unknown expression type
            result = {
                type: new UnknownType(),
                diagnostics: [{
                    severity: DiagnosticSeverity.Error,
                    message: `Unknown expression type: ${(expr as any).$type}`,
                    node: expr,
                }],
            };
        }

        // Restore previous context
        this.cubeContext = previousContext;

        return result;
    }

    /**
     * Check a binary expression.
     */
    private checkBinaryExpression(expr: BinaryExpression): TypeCheckResult {
        const diagnostics: TypeDiagnostic[] = [];

        // Check left operand
        const leftResult = this.checkExpression(expr.left);
        diagnostics.push(...leftResult.diagnostics);

        // Check right operand
        const rightResult = this.checkExpression(expr.right);
        diagnostics.push(...rightResult.diagnostics);

        // Infer result type
        const resultType = this.inference.inferBinaryExpression(
            expr.operator,
            leftResult.type,
            rightResult.type
        );

        // Add diagnostic if result is ErrorType
        if (resultType instanceof ErrorType && resultType.message) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: resultType.message,
                node: expr,
            });
        }

        return {
            type: resultType,
            diagnostics,
        };
    }

    /**
     * Check a unary expression.
     */
    private checkUnaryExpression(expr: UnaryExpression): TypeCheckResult {
        const diagnostics: TypeDiagnostic[] = [];

        // Check operand
        const operandResult = this.checkExpression(expr.operand);
        diagnostics.push(...operandResult.diagnostics);

        // Infer result type
        const resultType = this.inference.inferUnaryExpression(
            expr.operator,
            operandResult.type
        );

        // Add diagnostic if result is ErrorType
        if (resultType instanceof ErrorType && resultType.message) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: resultType.message,
                node: expr,
            });
        }

        return {
            type: resultType,
            diagnostics,
        };
    }

    /**
     * Check a literal expression.
     */
    private checkLiteral(expr: Literal): TypeCheckResult {
        const type = this.inference.inferLiteral(expr);

        return {
            type,
            diagnostics: [],
        };
    }

    /**
     * Check a function call expression.
     */
    private checkFunctionCall(expr: FunctionCallExpression): TypeCheckResult {
        const diagnostics: TypeDiagnostic[] = [];

        // Check all arguments
        const argumentTypes: Type[] = [];
        for (const arg of expr.arguments) {
            const argResult = this.checkExpression(arg);
            diagnostics.push(...argResult.diagnostics);
            argumentTypes.push(argResult.type);
        }

        // Infer result type
        const resultType = this.inference.inferFunctionCall(
            expr.function,
            argumentTypes
        );

        return {
            type: resultType,
            diagnostics,
        };
    }

    /**
     * Check a variable reference.
     * Looks up the variable in the symbol table or cube context.
     */
    private checkVariableReference(expr: VariableReference): TypeCheckResult {
        const diagnostics: TypeDiagnostic[] = [];

        // First try to resolve from cube context (if provided)
        if (this.cubeContext) {
            const componentType = this.cubeContext.getComponent(expr.variable);
            if (componentType) {
                return {
                    type: componentType,
                    diagnostics,
                };
            }
        }

        // Try to resolve the variable from global scope
        const symbol = this.symbolTable.resolveGlobal(expr.variable);

        if (!symbol) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Undefined variable '${expr.variable}'`,
                node: expr,
            });

            return {
                type: new ErrorType(`Undefined variable '${expr.variable}'`),
                diagnostics,
            };
        }

        return {
            type: symbol.type,
            diagnostics,
        };
    }

    /**
     * Check a member access expression (e.g., cube.component).
     */
    private checkMemberAccess(expr: MemberAccessExpression): TypeCheckResult {
        const diagnostics: TypeDiagnostic[] = [];

        // Check receiver
        const receiverResult = this.checkExpression(expr.receiver);
        diagnostics.push(...receiverResult.diagnostics);

        // For now, return UnknownType
        // Full member access validation will be implemented in semantic validators
        return {
            type: new UnknownType(),
            diagnostics,
        };
    }

    // Type guards
    private isBinaryExpression(expr: Expression): expr is BinaryExpression {
        return expr.$type === 'BinaryExpression';
    }

    private isUnaryExpression(expr: Expression): expr is UnaryExpression {
        return expr.$type === 'UnaryExpression';
    }

    private isLiteral(expr: Expression): expr is Literal {
        return expr.$type === 'NumberLiteral' ||
               expr.$type === 'StringLiteral' ||
               expr.$type === 'BooleanLiteral';
    }

    private isFunctionCallExpression(expr: Expression): expr is FunctionCallExpression {
        return expr.$type === 'FunctionCallExpression';
    }

    private isVariableReference(expr: Expression): expr is VariableReference {
        return expr.$type === 'VariableReference';
    }

    private isMemberAccessExpression(expr: Expression): expr is MemberAccessExpression {
        return expr.$type === 'MemberAccessExpression';
    }
}
