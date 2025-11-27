/**
 * Integration Tests for Thunderstruck Validation System
 *
 * Tests the complete validation pipeline from parsing through semantic validation.
 * Includes tests for:
 * - Valid example files (should have 0 errors)
 * - Invalid variations (should produce specific errors)
 * - Complex scenarios (multiple interacting validations)
 */

import { describe, it, expect } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { ReferenceValidator } from '../validation/reference-validator.js';
import { SliceValidator } from '../validation/slice-validator.js';
import { ModelValidator } from '../validation/model-validator.js';
import { DependencyValidator } from '../validation/dependency-validator.js';
import { ExpressionValidator } from '../validation/expression-validator.js';
import { FormulaValidator } from '../validation/formula-validator.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import * as fs from 'fs';
import * as path from 'path';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

/**
 * Comprehensive validation of a program.
 * Runs all validators and collects diagnostics.
 */
function validateProgram(program: Program): TypeDiagnostic[] {
    const symbolTable = new SymbolTable();
    const diagnostics: TypeDiagnostic[] = [];

    // Build symbol table (includes duplicate detection)
    symbolTable.buildFromProgram(program);
    // Convert string errors to diagnostics
    const symbolErrors = symbolTable.getErrors().map(msg => ({
        severity: DiagnosticSeverity.Error,
        message: msg,
    }));
    diagnostics.push(...symbolErrors);

    // If symbol table has errors, skip further validation
    if (symbolTable.hasErrors()) {
        return diagnostics;
    }

    // Initialize validators
    const referenceValidator = new ReferenceValidator(symbolTable);
    const sliceValidator = new SliceValidator(symbolTable);
    const modelValidator = new ModelValidator(symbolTable);
    const dependencyValidator = new DependencyValidator(symbolTable);
    const expressionValidator = new ExpressionValidator(symbolTable);
    const formulaValidator = new FormulaValidator(symbolTable);

    // Validate each element
    for (const element of program.elements) {
        switch (element.$type) {
            case 'SliceDefinition':
                diagnostics.push(...sliceValidator.validateSlice(element));
                break;

            case 'ModelDefinition':
                diagnostics.push(...modelValidator.validateModel(element));
                break;

            case 'DeriveDefinition': {
                // Validate input reference
                const inputResult = referenceValidator.validateInputReference(
                    element.inputRef.$refText,
                    `Derive '${element.name}'`
                );
                diagnostics.push(...inputResult.diagnostics);

                // Validate derivation expressions if input is valid
                if (inputResult.diagnostics.length === 0 && inputResult.cube) {
                    if (element.derivations) {
                        for (const derivation of element.derivations.derivations) {
                            const exprDiags = expressionValidator.validateDerivationExpression(
                                derivation,
                                inputResult.cube
                            );
                            diagnostics.push(...exprDiags);
                        }
                    }
                }
                break;
            }

            case 'AggregateDefinition': {
                // Validate input reference
                const inputResult = referenceValidator.validateInputReference(
                    element.inputRef.$refText,
                    `Aggregate '${element.name}'`
                );
                diagnostics.push(...inputResult.diagnostics);
                break;
            }

            case 'DisplayDefinition': {
                // Validate source reference
                const sourceDiags = referenceValidator.validateReference(
                    element.sourceRef.$refText,
                    ['cube', 'slice', 'model', 'aggregate', 'derive'],
                    `Display '${element.displayType}'`
                );
                diagnostics.push(...sourceDiags);
                break;
            }
        }
    }

    // Check for circular dependencies
    const cycleDiags = dependencyValidator.validateNoCycles(program);
    diagnostics.push(...cycleDiags);

    return diagnostics;
}

describe('Validation Integration Tests', () => {
    describe('Valid Programs', () => {
        it('should validate simple cube definition', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, TRT01A: Text],
                        measures: [AVAL: Numeric, CHG: Numeric]
                    }
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate cube with slice', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [AVAL: Numeric, CHG: Numeric, BASE: Numeric]
                    }
                }

                slice Week24 from ADADAS {
                    fix: { AVISIT: "Week 24" },
                    vary: [USUBJID],
                    measures: [CHG, BASE],
                    where: AVAL > 0
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate cube with model', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, TRT01A: Text],
                        measures: [CHG: Numeric, BASE: Numeric]
                    }
                }

                model ANCOVA {
                    input: ADADAS,
                    formula: CHG ~ TRT01A + BASE,
                    family: Gaussian,
                    link: Identity
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('Invalid Programs - Reference Errors', () => {
        it('should detect undefined cube reference in slice', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from NonExistentCube {
                    vary: [ID]
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('NonExistentCube'));
            expect(error).toBeDefined();
            expect(error!.severity).toBe(DiagnosticSeverity.Error);
        });

        it('should detect undefined dimension in slice', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [NonExistentDimension]
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('NonExistentDimension'));
            expect(error).toBeDefined();
        });

        it('should detect undefined variable in formula', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric]
                    }
                }

                model BadModel {
                    input: TestCube,
                    formula: Y ~ NonExistentVariable
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('NonExistentVariable'));
            expect(error).toBeDefined();
        });
    });

    describe('Invalid Programs - Type Errors', () => {
        it('should detect type mismatch in where clause', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric, COUNT: Integer]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [ID],
                    where: VALUE and COUNT
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('boolean') || d.message.includes('Flag'));
            expect(error).toBeDefined();
        });

        it('should detect incompatible family/link combination', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric, X: Numeric]
                    }
                }

                model BadModel {
                    input: TestCube,
                    formula: Y ~ X,
                    family: Gaussian,
                    link: Logit
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('not compatible'));
            expect(error).toBeDefined();
        });

        it('should detect non-Flag type in where clause', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [ID],
                    where: VALUE + 10
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('where clause') || d.message.includes('Flag'));
            expect(error).toBeDefined();
        });
    });

    describe('Invalid Programs - Circular Dependencies', () => {
        it('should detect simple circular dependency', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from S2 { vary: [ID] }
                slice S2 from S1 { vary: [ID] }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('Circular dependency'));
            expect(error).toBeDefined();
        });
    });

    describe('Invalid Programs - Structural Errors', () => {
        it('should detect duplicate cube names', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID2: Identifier],
                        measures: [VALUE2: Numeric]
                    }
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('duplicate') || d.message.includes('already defined'));
            expect(error).toBeDefined();
        });

        it('should detect dimension used as response in formula', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, CATEGORY: Text],
                        measures: [Y: Numeric]
                    }
                }

                model BadModel {
                    input: TestCube,
                    formula: CATEGORY ~ Y
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d =>
                d.message.includes('Response variable') &&
                d.message.includes('must be a measure')
            );
            expect(error).toBeDefined();
        });

        it('should detect attribute in vary clause', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric],
                        attributes: [LABEL: Text]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [LABEL]
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('attribute'));
            expect(error).toBeDefined();
        });
    });

    describe('Complex Scenarios', () => {
        it('should validate multi-level dependencies', async () => {
            const program = await parseProgram(`
                cube BaseCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [AVAL: Numeric, BASE: Numeric]
                    }
                }

                slice Filtered from BaseCube {
                    fix: { AVISIT: "Week 24" },
                    vary: [USUBJID],
                    where: AVAL > 0
                }

                model Analysis {
                    input: Filtered,
                    formula: AVAL ~ 1,
                    family: Gaussian,
                    link: Identity
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should validate complex formula with interactions', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, TRT01A: Text, AVISIT: Text],
                        measures: [CHG: Numeric, BASE: Numeric]
                    }
                }

                model ComplexModel {
                    input: ADADAS,
                    formula: CHG ~ TRT01A * AVISIT + BASE,
                    family: Gaussian,
                    link: Identity,
                    random: { subject: USUBJID }
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should detect multiple errors in same program', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [UndefinedDim],
                    measures: [NonExistentMeasure]
                }

                model BadModel {
                    input: TestCube,
                    formula: Y ~ X,
                    family: Gaussian,
                    link: Logit
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(2);
            expect(diagnostics.filter(d => d.severity === DiagnosticSeverity.Error).length).toBeGreaterThan(2);
        });
    });

    describe('Diagnostic Quality', () => {
        it('should provide "did you mean" suggestions for typos', async () => {
            const program = await parseProgram(`
                cube ADSL {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AGE: Integer]
                    }
                }

                slice TestSlice from ADLS {
                    vary: [USUBJID]
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('ADSL');
        });

        it('should list available options when no suggestion found', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [A: Identifier, B: Text],
                        measures: [X: Numeric, Y: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [CompletelyWrong]
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const error = diagnostics.find(d => d.message.includes('Available'));
            expect(error).toBeDefined();
        });

        it('should provide context in error messages', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X,
                    family: Poisson,
                    link: Logit
                }
            `);

            const diagnostics = validateProgram(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            // Should have context about which model, what's wrong
            const contextError = diagnostics.find(d =>
                d.message.includes('TestModel') || d.message.includes('TestCube')
            );
            expect(contextError).toBeDefined();
        });
    });
});
