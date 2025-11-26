/**
 * Unit tests for the expression validator.
 *
 * Tests cover:
 * - Expression validation in various contexts
 * - Where clause validation (must be Flag type)
 * - Derivation expression validation
 * - Type compatibility checking
 * - Integration with TypeChecker
 */

import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import {
    Program,
    SliceDefinition,
    DeriveDefinition,
    Expression,
} from '../generated/ast';
import { ExpressionValidator, ValidationContext } from '../validation/expression-validator';
import { SymbolTable } from '../validation/symbol-table';
import { DiagnosticSeverity } from '../types/type-checker';
import {
    NumericType,
    IntegerType,
    TextType,
    FlagType,
    CubeType,
} from '../types/type-system';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(text: string): Promise<Program> {
    const document = await parseDocument(services, text);
    return document.parseResult.value as Program;
}

describe('ExpressionValidator', () => {
    let symbolTable: SymbolTable;
    let validator: ExpressionValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new ExpressionValidator(symbolTable);
    });

    describe('Where Clause Validation', () => {
        it('should validate correct where clause with Flag result', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID],
                    where: VALUE > 10
                }
            `);

            symbolTable.buildFromProgram(program);

            const slice = program.elements[1] as SliceDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateWhereClause(slice, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should reject where clause with non-Flag result', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID],
                    where: VALUE + 10
                }
            `);

            symbolTable.buildFromProgram(program);

            const slice = program.elements[1] as SliceDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateWhereClause(slice, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('where clause');
        });

        it('should validate where clause with logical operations', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric, COUNT: Integer]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID],
                    where: (VALUE > 10) and (COUNT < 5)
                }
            `);

            symbolTable.buildFromProgram(program);

            const slice = program.elements[1] as SliceDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateWhereClause(slice, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should handle where clause with undefined variable', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID],
                    where: UNDEFINED_VAR > 10
                }
            `);

            symbolTable.buildFromProgram(program);

            const slice = program.elements[1] as SliceDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateWhereClause(slice, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            const hasUndefinedError = diagnostics.some(
                d => d.message.includes('Undefined variable')
            );
            expect(hasUndefinedError).toBe(true);
        });

        it('should handle slice without where clause', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID]
                }
            `);

            symbolTable.buildFromProgram(program);

            const slice = program.elements[1] as SliceDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateWhereClause(slice, cubeType);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('Derivation Expression Validation', () => {
        it('should validate derivation with correct types', async () => {
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateDerivationExpression(derivation, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate derivation with type errors', async () => {
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
                        dimensions: [ID: Identifier],
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateDerivationExpression(derivation, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
        });

        it('should validate derivation with undefined variable', async () => {
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateDerivationExpression(derivation, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            const hasUndefinedError = diagnostics.some(
                d => d.message.includes('Undefined variable')
            );
            expect(hasUndefinedError).toBe(true);
        });

        it('should validate complex derivation expression', async () => {
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
                        RESULT = (A + B) * C / 2
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateDerivationExpression(derivation, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate derivation with unit incompatibility', async () => {
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateDerivationExpression(derivation, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            const hasUnitError = diagnostics.some(
                d => d.message.toLowerCase().includes('unit')
            );
            expect(hasUnitError).toBe(true);
        });
    });

    describe('Type Compatibility Checking', () => {
        it('should accept compatible types', async () => {
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
                        RESULT = 42
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];

            const diagnostics = validator.checkTypeCompatibility(
                derivation.expression,
                new NumericType(),
                'test compatibility'
            );

            // Integer is assignable to Numeric
            expect(diagnostics).toHaveLength(0);
        });

        it('should reject incompatible types', async () => {
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
                        RESULT = "text"
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];

            const diagnostics = validator.checkTypeCompatibility(
                derivation.expression,
                new NumericType(),
                'test compatibility'
            );

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('Type mismatch');
            expect(diagnostics[0].message).toContain('test compatibility');
        });
    });

    describe('Expression Type Inference', () => {
        it('should infer Numeric type', async () => {
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const inferredType = validator.inferExpressionType(derivation.expression, cubeType);

            expect(inferredType).toBeInstanceOf(NumericType);
        });

        it('should infer Integer type', async () => {
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
                        RESULT = 42
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];

            const inferredType = validator.inferExpressionType(derivation.expression);

            expect(inferredType).toBeInstanceOf(IntegerType);
        });

        it('should infer Flag type from comparison', async () => {
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
                        RESULT = VALUE > 10
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const inferredType = validator.inferExpressionType(derivation.expression, cubeType);

            expect(inferredType).toBeInstanceOf(FlagType);
        });

        it('should infer Text type', async () => {
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
                        dimensions: [ID: Identifier, RESULT: Text]
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

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];

            const inferredType = validator.inferExpressionType(derivation.expression);

            expect(inferredType).toBeInstanceOf(TextType);
        });
    });

    describe('Multiple Expression Validation', () => {
        it('should validate multiple expressions', async () => {
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
                        measures: [R1: Numeric, R2: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        R1 = A + B,
                        R2 = B + C
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const expressions = derive.derivations!.derivations.map(d => d.expression);
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const context: ValidationContext = {
                cubeType,
            };

            const diagnostics = validator.validateExpressions(expressions, context);

            expect(diagnostics).toHaveLength(0);
        });

        it('should collect diagnostics from multiple expressions', async () => {
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
                        measures: [R1: Numeric, R2: Numeric]
                    }
                }

                derive TestDerive {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [
                        R1 = UNDEF1,
                        R2 = UNDEF2
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const expressions = derive.derivations!.derivations.map(d => d.expression);

            const diagnostics = validator.validateExpressions(expressions);

            // Should have errors for both undefined variables
            expect(diagnostics.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Validation Context', () => {
        it('should use custom context description in errors', async () => {
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
                        RESULT = "text"
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);

            const derive = program.elements[2] as DeriveDefinition;
            const derivation = derive.derivations!.derivations[0];

            const context: ValidationContext = {
                expectedType: new NumericType(),
                contextDescription: 'custom context',
            };

            const diagnostics = validator.validateExpression(derivation.expression, context);

            expect(diagnostics.length).toBeGreaterThan(0);
            const hasCustomContext = diagnostics.some(
                d => d.message.includes('custom context')
            );
            expect(hasCustomContext).toBe(true);
        });
    });
});
