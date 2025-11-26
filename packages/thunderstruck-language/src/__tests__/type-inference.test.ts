/**
 * Unit tests for type inference.
 *
 * Tests cover:
 * - Literal type inference
 * - Binary expression type inference
 * - Unary expression type inference
 * - Function call type inference
 */

import { TypeInference } from '../types/type-inference';
import {
    NumericType,
    IntegerType,
    TextType,
    FlagType,
    ErrorType,
    UnknownType,
} from '../types/type-system';

describe('Type Inference', () => {
    let inference: TypeInference;

    beforeEach(() => {
        inference = new TypeInference();
    });

    describe('Literal Inference', () => {
        it('should infer Integer from integer literal', () => {
            const literal = { $type: 'NumberLiteral', value: 42 };
            const type = inference.inferLiteral(literal as any);
            expect(type).toBeInstanceOf(IntegerType);
        });

        it('should infer Numeric from decimal literal', () => {
            const literal = { $type: 'NumberLiteral', value: 3.14 };
            const type = inference.inferLiteral(literal as any);
            expect(type).toBeInstanceOf(NumericType);
        });

        it('should infer Text from string literal', () => {
            const literal = { $type: 'StringLiteral', value: 'hello' };
            const type = inference.inferLiteral(literal as any);
            expect(type).toBeInstanceOf(TextType);
        });

        it('should infer Flag from boolean literal', () => {
            const literal = { $type: 'BooleanLiteral', value: 'true' };
            const type = inference.inferLiteral(literal as any);
            expect(type).toBeInstanceOf(FlagType);
        });
    });

    describe('Binary Expression Inference', () => {
        describe('Arithmetic Operators', () => {
            it('should infer Integer from Integer + Integer', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new IntegerType(),
                    new IntegerType()
                );
                expect(type).toBeInstanceOf(IntegerType);
            });

            it('should infer Numeric from Integer / Integer', () => {
                const type = inference.inferBinaryExpression(
                    '/',
                    new IntegerType(),
                    new IntegerType()
                );
                expect(type).toBeInstanceOf(NumericType);
            });

            it('should infer Numeric from Numeric + Numeric', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new NumericType(),
                    new NumericType()
                );
                expect(type).toBeInstanceOf(NumericType);
            });

            it('should infer Numeric from Integer + Numeric', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new IntegerType(),
                    new NumericType()
                );
                expect(type).toBeInstanceOf(NumericType);
            });

            it('should preserve units for addition', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new NumericType('kg'),
                    new NumericType('kg')
                );
                expect(type).toBeInstanceOf(NumericType);
                expect((type as NumericType).getUnit()).toBe('kg');
            });

            it('should return ErrorType for incompatible units', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new NumericType('kg'),
                    new NumericType('lb')
                );
                expect(type).toBeInstanceOf(ErrorType);
            });

            it('should return ErrorType for non-numeric operands', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new TextType(),
                    new IntegerType()
                );
                expect(type).toBeInstanceOf(ErrorType);
            });
        });

        describe('Comparison Operators', () => {
            it('should infer Flag from numeric comparison', () => {
                const type = inference.inferBinaryExpression(
                    '<',
                    new NumericType(),
                    new NumericType()
                );
                expect(type).toBeInstanceOf(FlagType);
            });

            it('should infer Flag from equality check', () => {
                const type = inference.inferBinaryExpression(
                    '==',
                    new TextType(),
                    new TextType()
                );
                expect(type).toBeInstanceOf(FlagType);
            });
        });

        describe('Logical Operators', () => {
            it('should infer Flag from Flag and Flag', () => {
                const type = inference.inferBinaryExpression(
                    'and',
                    new FlagType(),
                    new FlagType()
                );
                expect(type).toBeInstanceOf(FlagType);
            });

            it('should infer Flag from Flag or Flag', () => {
                const type = inference.inferBinaryExpression(
                    'or',
                    new FlagType(),
                    new FlagType()
                );
                expect(type).toBeInstanceOf(FlagType);
            });

            it('should return ErrorType for non-boolean operands', () => {
                const type = inference.inferBinaryExpression(
                    'and',
                    new IntegerType(),
                    new FlagType()
                );
                expect(type).toBeInstanceOf(ErrorType);
            });
        });

        describe('Error Propagation', () => {
            it('should propagate ErrorType from left operand', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new ErrorType(),
                    new IntegerType()
                );
                expect(type).toBeInstanceOf(ErrorType);
            });

            it('should propagate ErrorType from right operand', () => {
                const type = inference.inferBinaryExpression(
                    '+',
                    new IntegerType(),
                    new ErrorType()
                );
                expect(type).toBeInstanceOf(ErrorType);
            });
        });
    });

    describe('Unary Expression Inference', () => {
        it('should infer Integer from -Integer', () => {
            const type = inference.inferUnaryExpression('-', new IntegerType());
            expect(type).toBeInstanceOf(IntegerType);
        });

        it('should infer Numeric from -Numeric', () => {
            const type = inference.inferUnaryExpression('-', new NumericType());
            expect(type).toBeInstanceOf(NumericType);
        });

        it('should preserve units for negation', () => {
            const type = inference.inferUnaryExpression('-', new NumericType('mmHg'));
            expect(type).toBeInstanceOf(NumericType);
            expect((type as NumericType).getUnit()).toBe('mmHg');
        });

        it('should return ErrorType for negation of non-numeric', () => {
            const type = inference.inferUnaryExpression('-', new TextType());
            expect(type).toBeInstanceOf(ErrorType);
        });

        it('should infer Flag from not Flag', () => {
            const type = inference.inferUnaryExpression('not', new FlagType());
            expect(type).toBeInstanceOf(FlagType);
        });

        it('should return ErrorType for not on non-boolean', () => {
            const type = inference.inferUnaryExpression('not', new IntegerType());
            expect(type).toBeInstanceOf(ErrorType);
        });

        it('should propagate ErrorType', () => {
            const type = inference.inferUnaryExpression('-', new ErrorType());
            expect(type).toBeInstanceOf(ErrorType);
        });
    });

    describe('Function Call Inference', () => {
        it('should infer Numeric for mathematical functions', () => {
            const mathFunctions = ['log', 'exp', 'sqrt', 'abs'];
            mathFunctions.forEach(fn => {
                const type = inference.inferFunctionCall(fn, [new NumericType()]);
                expect(type).toBeInstanceOf(NumericType);
            });
        });

        it('should infer Numeric for statistical functions', () => {
            const statFunctions = ['mean', 'median', 'sd', 'var', 'sum'];
            statFunctions.forEach(fn => {
                const type = inference.inferFunctionCall(fn, [new NumericType()]);
                expect(type).toBeInstanceOf(NumericType);
            });
        });

        it('should infer Integer for count functions', () => {
            const type = inference.inferFunctionCall('count', []);
            expect(type).toBeInstanceOf(IntegerType);
        });

        it('should infer UnknownType for unknown functions', () => {
            const type = inference.inferFunctionCall('unknownFunction', []);
            expect(type).toBeInstanceOf(UnknownType);
        });

        it('should propagate ErrorType from arguments', () => {
            const type = inference.inferFunctionCall('log', [new ErrorType()]);
            expect(type).toBeInstanceOf(ErrorType);
        });

        it('should infer type from first argument for min/max', () => {
            const type1 = inference.inferFunctionCall('max', [new IntegerType()]);
            expect(type1).toBeInstanceOf(IntegerType);

            const type2 = inference.inferFunctionCall('min', [new NumericType('kg')]);
            expect(type2).toBeInstanceOf(NumericType);
        });
    });
});
