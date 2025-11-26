/**
 * Unit tests for the formula validator.
 *
 * Tests cover:
 * - Formula validation (response and predictor variables)
 * - Variable collection from formula terms
 * - Model definition validation
 * - Variable name suggestions (Levenshtein distance)
 * - Error reporting for undefined or incorrect variable types
 */

import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import { Program, ModelDefinition } from '../generated/ast';
import { FormulaValidator } from '../validation/formula-validator';
import { SymbolTable } from '../validation/symbol-table';
import { DiagnosticSeverity } from '../types/type-checker';
import { CubeType } from '../types/type-system';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(text: string): Promise<Program> {
    const document = await parseDocument(services, text);
    return document.parseResult.value as Program;
}

describe('FormulaValidator', () => {
    let symbolTable: SymbolTable;
    let validator: FormulaValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new FormulaValidator(symbolTable);
    });

    describe('Valid Formula Validation', () => {
        it('should validate simple formula with measure response and dimension predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate formula with measure response and measure predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric, X: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate formula with multiple predictors', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text, GENDER: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ TREATMENT + GENDER
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate formula with interaction terms', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A * B
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate formula with crossing terms', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A : B
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('Response Variable Validation', () => {
        it('should reject dimension as response variable', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text, OUTCOME: Text],
                        measures: [VALUE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: TREATMENT ~ VALUE
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('Response variable');
            expect(diagnostics[0].message).toContain('must be a measure');
        });

        it('should reject attribute as response variable', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, TREATMENT: Text],
                        measures: [VALUE: Numeric],
                        attributes: [FLAG: Flag]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: FLAG ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('Response variable');
            expect(diagnostics[0].message).toContain('must be a measure');
        });

        it('should reject undefined response variable', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [VALUE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: UNDEFINED ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('is not defined');
        });
    });

    describe('Predictor Variable Validation', () => {
        it('should accept dimension as predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should accept measure as predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric, X: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should reject attribute as predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESPONSE: Numeric],
                        attributes: [FLAG: Flag]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ FLAG
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('Predictor variable');
            expect(diagnostics[0].message).toContain('cannot be an attribute');
        });

        it('should reject undefined predictor', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ UNDEFINED
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('is not defined');
        });

        it('should collect all predictor variables from complex formula', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text, C: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A + B + C
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('Model Validation', () => {
        it('should validate complete model definition', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: RESPONSE ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });

        it('should reject model with undefined input', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model TestModel {
                    input: UndefinedCube,
                    formula: RESPONSE ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('undefined input');
        });

        it('should reject model with non-cube input', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [TREATMENT: Text],
                        measures: [RESPONSE: Numeric]
                    }
                }

                model NotACube {
                    input: TestCube,
                    formula: RESPONSE ~ TREATMENT
                }

                model TestModel {
                    input: NotACube,
                    formula: RESPONSE ~ TREATMENT
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[2] as ModelDefinition;
            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            expect(diagnostics[0].message).toContain('is not a cube');
        });
    });

    describe('Variable Collection', () => {
        it('should collect variables from simple variable term', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [X: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const responseVars = validator.collectVariables(model.formula.response);
            const predictorVars = validator.collectVariables(model.formula.predictors);

            expect(responseVars).toContain('Y');
            expect(responseVars.size).toBe(1);
            expect(predictorVars).toContain('X');
            expect(predictorVars.size).toBe(1);
        });

        it('should collect variables from addition terms', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A + B
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const predictorVars = validator.collectVariables(model.formula.predictors);

            expect(predictorVars).toContain('A');
            expect(predictorVars).toContain('B');
            expect(predictorVars.size).toBe(2);
        });

        it('should collect variables from interaction terms', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A * B
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const predictorVars = validator.collectVariables(model.formula.predictors);

            expect(predictorVars).toContain('A');
            expect(predictorVars).toContain('B');
            expect(predictorVars.size).toBe(2);
        });

        it('should not collect numbers from formula', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [X: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X + 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const predictorVars = validator.collectVariables(model.formula.predictors);

            expect(predictorVars).toContain('X');
            expect(predictorVars.size).toBe(1);
        });
    });

    describe('Variable Suggestions', () => {
        it('should suggest close variable name for typo', () => {
            const availableNames = ['TREATMENT', 'RESPONSE', 'SUBJECT'];
            const suggestion = validator.suggestVariable('TREATMNT', availableNames);

            expect(suggestion).toBe('TREATMENT');
        });

        it('should suggest variable with small Levenshtein distance', () => {
            const availableNames = ['VALUE', 'WEIGHT', 'HEIGHT'];
            const suggestion = validator.suggestVariable('VAULE', availableNames);

            expect(suggestion).toBe('VALUE');
        });

        it('should not suggest if distance is too large', () => {
            const availableNames = ['TREATMENT', 'RESPONSE'];
            const suggestion = validator.suggestVariable('XYZABC', availableNames);

            expect(suggestion).toBeUndefined();
        });

        it('should return undefined for empty list', () => {
            const suggestion = validator.suggestVariable('TREATMENT', []);

            expect(suggestion).toBeUndefined();
        });

        it('should be case insensitive', () => {
            const availableNames = ['Treatment'];
            const suggestion = validator.suggestVariable('treatment', availableNames);

            expect(suggestion).toBe('Treatment');
        });

        it('should find closest match among multiple options', () => {
            const availableNames = ['TREAT', 'TREATMENT', 'TREATMENTS'];
            const suggestion = validator.suggestVariable('TREATMEN', availableNames);

            expect(suggestion).toBe('TREATMENT');
        });
    });

    describe('Complex Formulas', () => {
        it('should validate formula with multiple interactions', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text, C: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ A * B + C
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate formula with nested terms', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Text, B: Text, C: Text],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ (A + B) * C
                }
            `);

            symbolTable.buildFromProgram(program);

            const model = program.elements[1] as ModelDefinition;
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            const cubeType = cubeSymbol?.type as CubeType;

            const diagnostics = validator.validateFormula(model.formula, cubeType);

            expect(diagnostics).toHaveLength(0);
        });
    });
});
