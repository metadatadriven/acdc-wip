/**
 * Tests for ReferenceValidator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { ReferenceValidator } from '../validation/reference-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

describe('ReferenceValidator', () => {
    let symbolTable: SymbolTable;
    let validator: ReferenceValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new ReferenceValidator(symbolTable);
    });

    describe('validateReference', () => {
        it('should pass for valid cube reference', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateReference(
                'TestCube',
                'cube',
                'Test context'
            );

            expect(diagnostics).toHaveLength(0);
        });

        it('should error for undefined reference', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateReference(
                'NonExistent',
                'cube',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('undefined');
        });

        it('should suggest similar names for typos', async () => {
            const program = await parseProgram(`
                cube ADSL {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AGE: Integer]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateReference(
                'ADLS',  // Typo
                'cube',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).toContain('Did you mean');
            expect(diagnostics[0].message).toContain('ADSL');
        });

        it('should error for wrong kind', async () => {
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

            const diagnostics = validator.validateReference(
                'TestSlice',
                'cube',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('slice');
            expect(diagnostics[0].message).toContain('not a cube');
        });

        it('should accept multiple expected kinds', async () => {
            const program = await parseProgram(`
                slice TestSlice from TestCube {
                    vary: [ID]
                }

                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateReference(
                'TestSlice',
                ['cube', 'slice'],
                'Test context'
            );

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('validateComponentReference', () => {
        it('should pass for valid dimension reference', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, TRT01A: Text],
                        measures: [AVAL: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('TestCube')!;
            const cube = symbol.type as any;

            const diagnostics = validator.validateComponentReference(
                'USUBJID',
                cube,
                'dimension',
                'Test context'
            );

            expect(diagnostics).toHaveLength(0);
        });

        it('should error for undefined component', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AVAL: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('TestCube')!;
            const cube = symbol.type as any;

            const diagnostics = validator.validateComponentReference(
                'NonExistent',
                cube,
                'dimension',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('not defined');
        });

        it('should suggest similar component names', async () => {
            const program = await parseProgram(`
                cube ADADAS {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier, AVISIT: Text],
                        measures: [AVAL: Numeric, CHG: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('ADADAS')!;
            const cube = symbol.type as any;

            const diagnostics = validator.validateComponentReference(
                'AVISTIT',  // Typo
                cube,
                'dimension',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).toContain('Did you mean');
            expect(diagnostics[0].message).toContain('AVISIT');
        });

        it('should error for wrong component type', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric],
                        attributes: [LABEL: Text]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('TestCube')!;
            const cube = symbol.type as any;

            const diagnostics = validator.validateComponentReference(
                'VALUE',  // This is a measure, not a dimension
                cube,
                'dimension',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
            expect(diagnostics[0].message).toContain('measure');
            expect(diagnostics[0].message).toContain('dimension');
        });
    });

    describe('Levenshtein distance suggestions', () => {
        it('should not suggest if distance is too large', async () => {
            const program = await parseProgram(`
                cube ADSL {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [USUBJID: Identifier],
                        measures: [AGE: Integer]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateReference(
                'CompletelyDifferent',
                'cube',
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).not.toContain('Did you mean');
        });

        it('should handle empty candidate list', async () => {
            const program = await parseProgram(`
                cube EmptyCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VAL: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('EmptyCube')!;
            const cube = symbol.type as any;

            const diagnostics = validator.validateComponentReference(
                'NonExistent',
                cube,
                'attribute',  // No attributes defined
                'Test context'
            );

            expect(diagnostics).toHaveLength(1);
            expect(diagnostics[0].message).toContain('Available attributes: none');
        });
    });
});
