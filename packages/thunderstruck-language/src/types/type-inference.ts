/**
 * Type Inference Engine for Thunderstruck Language
 *
 * Infers types for expressions based on operands and operations.
 *
 * Design decision (Q1): Moderate type inference
 * - Infer types for expressions from operands
 * - Require explicit types for definitions (cubes, etc.)
 * - Variable references use declared types from symbol table
 */

import {
    Expression,
    BinaryExpression,
    UnaryExpression,
    Literal,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
    FunctionCallExpression,
    VariableReference,
    MemberAccessExpression,
} from '../generated/ast.js';
import {
    Type,
    NumericType,
    IntegerType,
    TextType,
    FlagType,
    ErrorType,
    UnknownType,
} from './type-system.js';

/**
 * Type inference engine for expressions.
 *
 * This class provides methods to infer types for various expression types.
 * It does NOT perform validation - that's the job of validators.
 * It only infers what the result type would be given the operand types.
 */
export class TypeInference {
    /**
     * Infer the type of a literal value.
     *
     * Rules:
     * - Number literal: Check if it's an integer → Integer, else → Numeric
     * - String literal → Text
     * - Boolean literal → Flag
     */
    inferLiteral(literal: Literal): Type {
        if (this.isNumberLiteral(literal)) {
            // Check if it's an integer (no decimal point)
            if (Number.isInteger(literal.value)) {
                return new IntegerType();
            }
            return new NumericType();
        }

        if (this.isStringLiteral(literal)) {
            return new TextType();
        }

        if (this.isBooleanLiteral(literal)) {
            return new FlagType();
        }

        // Shouldn't reach here, but return Unknown if we do
        return new UnknownType();
    }

    /**
     * Infer the result type of a binary expression.
     *
     * Rules:
     * - Arithmetic operators (+, -, *, /): Numeric op Numeric → Numeric
     *   - Special case: Integer op Integer → Integer (for +, -, *)
     *   - Special case: Integer / Integer → Numeric (division always produces Numeric)
     * - Comparison operators (<, <=, >, >=, ==, !=): Any op Any → Flag
     * - Logical operators (and, or): Flag op Flag → Flag
     *
     * @param operator The binary operator
     * @param leftType Type of left operand
     * @param rightType Type of right operand
     * @returns Inferred result type
     */
    inferBinaryExpression(
        operator: string,
        leftType: Type,
        rightType: Type
    ): Type {
        // If either operand is ErrorType, propagate the error
        if (leftType instanceof ErrorType || rightType instanceof ErrorType) {
            return new ErrorType();
        }

        // Arithmetic operators: +, -, *, /
        if (['+', '-', '*', '/'].includes(operator)) {
            // Both must be numeric types
            const leftIsNumeric = leftType instanceof NumericType || leftType instanceof IntegerType;
            const rightIsNumeric = rightType instanceof NumericType || rightType instanceof IntegerType;

            if (!leftIsNumeric || !rightIsNumeric) {
                return new ErrorType(`Operator '${operator}' requires numeric operands`);
            }

            // Integer op Integer
            if (leftType instanceof IntegerType && rightType instanceof IntegerType) {
                // Division always returns Numeric
                if (operator === '/') {
                    return new NumericType();
                }
                // Other arithmetic operators preserve Integer
                return new IntegerType();
            }

            // If either is Numeric (with units), check unit compatibility
            if (leftType instanceof NumericType && rightType instanceof NumericType) {
                const leftUnit = leftType.getUnit();
                const rightUnit = rightType.getUnit();

                // For + and -, units must match
                if (['+', '-'].includes(operator)) {
                    if (leftUnit !== rightUnit) {
                        return new ErrorType(`Cannot ${operator === '+' ? 'add' : 'subtract'} values with different units`);
                    }
                    return new NumericType(leftUnit);
                }

                // For * and /, unit handling is complex (not implemented yet)
                // For now, result has no unit
                return new NumericType();
            }

            // Mixed Integer and Numeric → Numeric
            // Check for unit compatibility if right side has units
            if (rightType instanceof NumericType && rightType.getUnit() !== undefined) {
                return new NumericType(rightType.getUnit());
            }
            if (leftType instanceof NumericType && leftType.getUnit() !== undefined) {
                return new NumericType(leftType.getUnit());
            }

            return new NumericType();
        }

        // Comparison operators: <, <=, >, >=
        if (['<', '<=', '>', '>='].includes(operator)) {
            // These work on numeric types or date types
            // Result is always Flag
            return new FlagType();
        }

        // Equality operators: ==, !=
        if (['==', '!='].includes(operator)) {
            // Can compare any types, result is Flag
            return new FlagType();
        }

        // Logical operators: and, or
        if (['and', 'or'].includes(operator)) {
            // Both operands should be Flag, result is Flag
            if (!(leftType instanceof FlagType) || !(rightType instanceof FlagType)) {
                return new ErrorType(`Operator '${operator}' requires boolean operands`);
            }
            return new FlagType();
        }

        // Unknown operator
        return new ErrorType(`Unknown operator '${operator}'`);
    }

    /**
     * Infer the result type of a unary expression.
     *
     * Rules:
     * - Negation (-): Numeric/Integer → Numeric/Integer
     * - Logical not: Flag → Flag
     *
     * @param operator The unary operator
     * @param operandType Type of the operand
     * @returns Inferred result type
     */
    inferUnaryExpression(operator: string, operandType: Type): Type {
        // If operand is ErrorType, propagate the error
        if (operandType instanceof ErrorType) {
            return new ErrorType();
        }

        // Negation operator: -
        if (operator === '-') {
            if (operandType instanceof IntegerType) {
                return new IntegerType();
            }
            if (operandType instanceof NumericType) {
                return new NumericType(operandType.getUnit());
            }
            return new ErrorType(`Operator '-' requires numeric operand`);
        }

        // Logical not operator
        if (operator === 'not') {
            if (operandType instanceof FlagType) {
                return new FlagType();
            }
            return new ErrorType(`Operator 'not' requires boolean operand`);
        }

        // Unknown operator
        return new ErrorType(`Unknown unary operator '${operator}'`);
    }

    /**
     * Infer the return type of a function call.
     *
     * This is a placeholder for now. Function signatures will be added
     * in a future increment.
     *
     * Known functions:
     * - log(), exp(), sqrt() → Numeric
     * - poly(), ns() → Numeric (used in formulas)
     *
     * @param functionName Name of the function
     * @param argumentTypes Types of the arguments
     * @returns Inferred return type
     */
    inferFunctionCall(
        functionName: string,
        argumentTypes: Type[]
    ): Type {
        // If any argument is ErrorType, propagate the error
        if (argumentTypes.some(t => t instanceof ErrorType)) {
            return new ErrorType();
        }

        // Known mathematical functions
        const mathFunctions = ['log', 'exp', 'sqrt', 'abs', 'floor', 'ceil', 'round'];
        if (mathFunctions.includes(functionName)) {
            return new NumericType();
        }

        // Statistical functions (used in formulas)
        const statFunctions = ['poly', 'ns', 'bs', 'spline'];
        if (statFunctions.includes(functionName)) {
            return new NumericType();
        }

        // Aggregation functions
        if (['mean', 'median', 'sd', 'var', 'sum'].includes(functionName)) {
            return new NumericType();
        }

        if (['count', 'n'].includes(functionName)) {
            return new IntegerType();
        }

        if (['min', 'max'].includes(functionName)) {
            // Return type matches argument type
            if (argumentTypes.length > 0) {
                return argumentTypes[0];
            }
            return new NumericType();
        }

        // Unknown function - return Unknown type
        // This will be enhanced when we add function signature resolution
        return new UnknownType();
    }

    // Type guard helpers
    private isNumberLiteral(node: any): node is NumberLiteral {
        return node.$type === 'NumberLiteral';
    }

    private isStringLiteral(node: any): node is StringLiteral {
        return node.$type === 'StringLiteral';
    }

    private isBooleanLiteral(node: any): node is BooleanLiteral {
        return node.$type === 'BooleanLiteral';
    }
}

/**
 * Singleton instance of TypeInference for convenience.
 */
export const typeInference = new TypeInference();
