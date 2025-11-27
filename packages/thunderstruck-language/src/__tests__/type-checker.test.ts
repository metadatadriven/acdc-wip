/**
 * Unit tests for the type checker.
 *
 * Tests cover:
 * - Expression type checking (binary, unary, literal, function call, variable reference)
 * - Diagnostic generation for type errors
 * - Error propagation
 * - Integration with SymbolTable
 */

import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import { Program, Expression, CubeDefinition } from '../generated/ast';
import { TypeChecker, DiagnosticSeverity } from '../types/type-checker';
import { SymbolTable } from '../validation/symbol-table';
import {
    NumericType,
    IntegerType,
    TextType,
    FlagType,
    ErrorType,
    UnknownType,
} from '../types/type-system';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(text: string): Promise<Program> {
    const document = await parseDocument(services, text);
    return document.parseResult.value as Program;
}

/**
 * Helper to extract an expression from a derive statement for testing.
 */
function getDerivationExpression(program: Program, deriveIndex: number = 2): Expression {
    const derive = program.elements[deriveIndex];
    if (derive.$type !== 'DeriveDefinition') {
        throw new Error(`Expected DeriveDefinition but got ${derive.$type}`);
    }
    if (!derive.derivations || derive.derivations.derivations.length === 0) {
        throw new Error('No derivations found');
    }
    return derive.derivations.derivations[0].expression;
}

/**
 * Helper to get the input cube context from a derive statement for testing.
 */
function getInputCubeContext(program: Program, symbolTable: SymbolTable, deriveIndex: number = 2): any {
    const derive = program.elements[deriveIndex];
    if (derive.$type !== 'DeriveDefinition') {
        throw new Error(`Expected DeriveDefinition but got ${derive.$type}`);
    }

    // Get the input cube reference
    const inputCubeName = derive.inputRef;
    if (inputCubeName) {
        const symbol = symbolTable.resolveGlobal(inputCubeName.$refText);
        if (symbol) {
            return symbol.type;
        }
    }

    return undefined;
}

describe('TypeChecker', () => {
    let symbolTable: SymbolTable;
    let typeChecker: TypeChecker;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        typeChecker = new TypeChecker(symbolTable);
    });

    describe('Literal Expressions', () => {
        it('should infer Integer type for number literals', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Integer]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = 42
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const result = typeChecker.checkExpression(expr);

            expect(result.type).toBeInstanceOf(IntegerType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should infer Text type for string literals', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Text]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = "hello"
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const result = typeChecker.checkExpression(expr);

            expect(result.type).toBeInstanceOf(TextType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should infer Flag type for boolean literals', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [RESULT: Flag]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = true
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const result = typeChecker.checkExpression(expr);

            expect(result.type).toBeInstanceOf(FlagType);
            expect(result.diagnostics).toHaveLength(0);
        });
    });

    describe('Binary Expressions', () => {
        it('should check arithmetic operations on numeric types', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [A: Numeric, B: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = A + B
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(NumericType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should report error for incompatible types in arithmetic', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, NAME: Text],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, NAME: Text],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = VALUE + NAME
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(ErrorType);
            expect(result.diagnostics.length).toBeGreaterThan(0);
            expect(result.diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
        });

        it('should check comparison operations', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [A: Numeric, B: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [RESULT: Flag]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = A > B
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(FlagType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should check logical operations on Flag types', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [FLAG1: Flag, FLAG2: Flag]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [RESULT: Flag]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = FLAG1 and FLAG2
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(FlagType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should report error for unit incompatibility', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [WEIGHT: Numeric unit: "kg", HEIGHT: Numeric unit: "cm"]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = WEIGHT + HEIGHT
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(ErrorType);
            expect(result.diagnostics.length).toBeGreaterThan(0);
            const errorMessage = result.diagnostics[0].message;
            expect(errorMessage).toContain('unit');
        });
    });

    describe('Unary Expressions', () => {
        it('should check negation on numeric types', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = -VALUE
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(NumericType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should check logical not on Flag types', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [FLAG: Flag]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [RESULT: Flag]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = not FLAG
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(FlagType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should report error for invalid unary operation', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, NAME: Text],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, NAME: Text],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = -NAME
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(ErrorType);
            expect(result.diagnostics.length).toBeGreaterThan(0);
        });
    });

    describe('Variable References', () => {
        it('should resolve variable from symbol table', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = VALUE
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(NumericType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should report error for undefined variable', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = UNDEFINED_VAR
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(ErrorType);
            expect(result.diagnostics.length).toBeGreaterThan(0);
            expect(result.diagnostics[0].message).toContain('Undefined variable');
        });
    });

    describe('Function Calls', () => {
        it('should check function call with arguments', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = sqrt(VALUE)
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            // Function calls should return a type (implementation dependent)
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should check nested function calls', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = log(sqrt(VALUE))
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.diagnostics).toHaveLength(0);
        });
    });

    describe('Member Access', () => {
        it('should handle member access expressions', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = TestCube.VALUE
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const result = typeChecker.checkExpression(expr);

            // Member access returns UnknownType in current implementation
            expect(result.type).toBeInstanceOf(UnknownType);
        });
    });

    describe('Error Propagation', () => {
        it('should propagate errors from subexpressions', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = UNDEFINED + VALUE
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            // Should have diagnostic for undefined variable
            expect(result.diagnostics.length).toBeGreaterThan(0);
            const hasUndefinedError = result.diagnostics.some(
                d => d.message.includes('Undefined variable')
            );
            expect(hasUndefinedError).toBe(true);
        });

        it('should collect diagnostics from both operands', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = UNDEF1 + UNDEF2
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            // Should have diagnostics for both undefined variables
            expect(result.diagnostics.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Complex Expressions', () => {
        it('should check complex nested expression', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [A: Numeric, B: Numeric, C: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESULT: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = (A + B) * C
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(NumericType);
            expect(result.diagnostics).toHaveLength(0);
        });

        it('should check mixed comparison and logical operations', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [A: Numeric, B: Numeric]
                    }
                }

                cube OutputCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        attributes: [RESULT: Flag]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        RESULT = (A > B) and (B > 0)
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const expr = getDerivationExpression(program, 2);
            const cubeContext = getInputCubeContext(program, symbolTable, 2);
            const result = typeChecker.checkExpression(expr, cubeContext);

            expect(result.type).toBeInstanceOf(FlagType);
            expect(result.diagnostics).toHaveLength(0);
        });
    });
});
