/**
 * Tests for SliceValidator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program, SliceDefinition } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { SliceValidator } from '../validation/slice-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

function getSlice(program: Program, index: number = 1): SliceDefinition {
    return program.elements[index] as SliceDefinition;
}

describe('SliceValidator', () => {
    let symbolTable: SymbolTable;
    let validator: SliceValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new SliceValidator(symbolTable);
    });

    describe('validateSlice - valid slices', () => {
        it('should pass for valid slice with all components', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text, AVISITN: Integer],
                        measures: [AVAL: Numeric, CHG: Numeric],
                        attributes: [PARAM: Text]
                    }
                }

                slice Week24 from ADADAS {
                    fix: { AVISIT: "Week 24", AVISITN: 24 },
                    vary: [USUBJID],
                    measures: [AVAL, CHG],
                    where: AVAL > 0
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for slice with minimal components', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice MinimalSlice from TestCube {
                    vary: [ID]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('validateSourceCube', () => {
        it('should error for undefined cube reference', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from NonExistent {
                    vary: [ID]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const cubeError = diagnostics.find(d => d.message.includes('undefined'));
            expect(cubeError).toBeDefined();
            expect(cubeError!.severity).toBe(DiagnosticSeverity.Error);
        });

        it('should suggest similar cube names', async () => {
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

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('ADSL');
        });
    });

    describe('validateFixedDimensions', () => {
        it('should error for undefined fixed dimension', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [AVAL: Numeric]
                    }
                }

                slice BadSlice from ADADAS {
                    fix: { NonExistent: "value" },
                    vary: [USUBJID]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const fixError = diagnostics.find(d => d.message.includes('fix clause'));
            expect(fixError).toBeDefined();
            expect(fixError!.message).toContain('NonExistent');
        });

        it('should allow attributes in fix clause', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric],
                        attributes: [CATEGORY: Text]
                    }
                }

                slice FilteredSlice from TestCube {
                    fix: { CATEGORY: "A" },
                    vary: [ID]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics).toHaveLength(0);
        });

        it('should suggest similar dimension names', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [AVAL: Numeric]
                    }
                }

                slice BadSlice from ADADAS {
                    fix: { AVISTIT: "Week 24" },
                    vary: [USUBJID]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('AVISIT');
        });
    });

    describe('validateVaryingDimensions', () => {
        it('should error for undefined varying dimension', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice BadSlice from TestCube {
                    vary: [NonExistent]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const varyError = diagnostics.find(d => d.message.includes('vary clause'));
            expect(varyError).toBeDefined();
            expect(varyError!.message).toContain('NonExistent');
        });

        it('should error for attribute in vary clause', async () => {
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

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const attrError = diagnostics.find(d => d.message.includes('attribute'));
            expect(attrError).toBeDefined();
            expect(attrError!.message).toContain('dimension');
        });
    });

    describe('validateMeasures', () => {
        it('should error for undefined measure', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AVAL: Numeric, CHG: Numeric]
                    }
                }

                slice BadSlice from ADADAS {
                    vary: [USUBJID],
                    measures: [NonExistent]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const measureError = diagnostics.find(d => d.message.includes('measure'));
            expect(measureError).toBeDefined();
            expect(measureError!.message).toContain('NonExistent');
        });

        it('should suggest similar measure names', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AVAL: Numeric, CHG: Numeric, BASE: Numeric]
                    }
                }

                slice BadSlice from ADADAS {
                    vary: [USUBJID],
                    measures: [BAES]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('BASE');
        });
    });

    describe('checkDimensionOverlap', () => {
        it('should warn for dimension in both fix and vary', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, CATEGORY: Text],
                        measures: [VALUE: Numeric]
                    }
                }

                slice OverlappingSlice from TestCube {
                    fix: { CATEGORY: "A" },
                    vary: [ID, CATEGORY]
                }
            `);

            symbolTable.buildFromProgram(program);
            const slice = getSlice(program);

            const diagnostics = validator.validateSlice(slice);

            expect(diagnostics.length).toBeGreaterThan(0);
            const warning = diagnostics.find(d => d.severity === DiagnosticSeverity.Warning);
            expect(warning).toBeDefined();
            expect(warning!.message).toContain('both fix and vary');
            expect(warning!.message).toContain('CATEGORY');
        });
    });
});
