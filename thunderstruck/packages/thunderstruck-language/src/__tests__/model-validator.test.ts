/**
 * Tests for ModelValidator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program, ModelDefinition } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { ModelValidator } from '../validation/model-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

function getModel(program: Program, index: number): ModelDefinition {
    return program.elements[index] as ModelDefinition;
}

describe('ModelValidator', () => {
    let symbolTable: SymbolTable;
    let validator: ModelValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new ModelValidator(symbolTable);
    });

    describe('validateModel - valid models', () => {
        it('should pass for valid model', async () => {
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

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for model with random effects', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [CHG: Numeric, BASE: Numeric]
                    }
                }

                model MMRM {
                    input: ADADAS,
                    formula: CHG ~ AVISIT + BASE,
                    random: { subject: USUBJID }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('validateInput', () => {
        it('should error for undefined input', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                model BadModel {
                    input: NonExistent,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const inputError = diagnostics.find(d => d.message.includes('undefined'));
            expect(inputError).toBeDefined();
            expect(inputError!.severity).toBe(DiagnosticSeverity.Error);
        });

        it('should suggest similar input names', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AVAL: Numeric]
                    }
                }

                model BadModel {
                    input: ADAAS,
                    formula: AVAL ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('ADADAS');
        });
    });

    describe('validateFamilyLinkCompatibility', () => {
        it('should pass for compatible Gaussian-Identity', async () => {
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
                    formula: Y ~ X,
                    family: Gaussian,
                    link: Identity
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for compatible Binomial-Logit', async () => {
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
                    formula: Y ~ X,
                    family: Binomial,
                    link: Logit
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });

        it('should error for incompatible Gaussian-Logit', async () => {
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

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const linkError = diagnostics.find(d => d.message.includes('not compatible'));
            expect(linkError).toBeDefined();
            expect(linkError!.message).toContain('Logit');
            expect(linkError!.message).toContain('Gaussian');
        });

        it('should error for incompatible Poisson-Logit', async () => {
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
                    family: Poisson,
                    link: Logit
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const linkError = diagnostics.find(d => d.message.includes('not compatible'));
            expect(linkError).toBeDefined();
            expect(linkError!.message).toContain('Poisson');
        });

        it('should list compatible links in error message', async () => {
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
                    family: Binomial,
                    link: Identity
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const linkError = diagnostics.find(d => d.message.includes('Compatible links'));
            expect(linkError).toBeDefined();
            expect(linkError!.message).toContain('Logit');
            expect(linkError!.message).toContain('Probit');
            expect(linkError!.message).toContain('Log');
        });
    });

    describe('validateRandomEffects', () => {
        it('should pass for valid random effects subject', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [CHG: Numeric]
                    }
                }

                model MMRM {
                    input: ADADAS,
                    formula: CHG ~ AVISIT,
                    random: { subject: USUBJID }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics).toHaveLength(0);
        });

        it('should error for undefined random effects subject', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [CHG: Numeric]
                    }
                }

                model BadModel {
                    input: ADADAS,
                    formula: CHG ~ 1,
                    random: { subject: NonExistent }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const subjectError = diagnostics.find(d => d.message.includes('subject'));
            expect(subjectError).toBeDefined();
            expect(subjectError!.message).toContain('NonExistent');
        });

        it('should error for measure used as random effects subject', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [CHG: Numeric, BASE: Numeric]
                    }
                }

                model BadModel {
                    input: ADADAS,
                    formula: CHG ~ 1,
                    random: { subject: BASE }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const subjectError = diagnostics.find(d => d.message.includes('measure'));
            expect(subjectError).toBeDefined();
            expect(subjectError!.message).toContain('dimension');
        });

        it('should error for attribute used as random effects subject', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [CHG: Numeric],
                        attributes: [PARAM: Text]
                    }
                }

                model BadModel {
                    input: ADADAS,
                    formula: CHG ~ 1,
                    random: { subject: PARAM }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const subjectError = diagnostics.find(d => d.message.includes('attribute'));
            expect(subjectError).toBeDefined();
            expect(subjectError!.message).toContain('dimension');
        });

        it('should suggest similar dimension names', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [CHG: Numeric]
                    }
                }

                model BadModel {
                    input: ADADAS,
                    formula: CHG ~ AVISIT,
                    random: { subject: USBJID }
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('USUBJID');
        });
    });

    describe('formula validation integration', () => {
        it('should validate formula variables', async () => {
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
                    formula: Y ~ NonExistent
                }
            `);

            symbolTable.buildFromProgram(program);
            const model = getModel(program, 1);

            const diagnostics = validator.validateModel(model);

            expect(diagnostics.length).toBeGreaterThan(0);
            const formulaError = diagnostics.find(d => d.message.includes('not defined'));
            expect(formulaError).toBeDefined();
        });
    });
});
