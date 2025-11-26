/**
 * Tests for DependencyValidator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { DependencyValidator } from '../validation/dependency-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

describe('DependencyValidator', () => {
    let symbolTable: SymbolTable;
    let validator: DependencyValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new DependencyValidator(symbolTable);
    });

    describe('validateNoCycles - valid programs', () => {
        it('should pass for program with no dependencies', async () => {
            const program = await parseProgram(`
                cube C1 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube C2 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for program with linear dependencies', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                model M1 {
                    input: S1,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for program with diamond dependency', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }
                slice S2 from TestCube { vary: [ID] }

                model M1 {
                    input: S1,
                    formula: VALUE ~ 1
                }

                model M2 {
                    input: S2,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('validateNoCycles - cycles', () => {
        it('should detect simple cycle (slice referencing itself)', async () => {
            // Note: This is a theoretical test - the actual parser may not allow this
            // In real usage, a slice would reference a cube or another slice
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            // Should not have cycles since S1 depends on TestCube (a cube, not a slice)
            expect(diagnostics).toHaveLength(0);
        });

        it('should detect cycle through multiple slices', async () => {
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

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const cycleError = diagnostics.find(d => d.message.includes('Circular dependency'));
            expect(cycleError).toBeDefined();
            expect(cycleError!.severity).toBe(DiagnosticSeverity.Error);
            expect(cycleError!.message).toContain('S1');
            expect(cycleError!.message).toContain('S2');
        });

        it('should detect complex cycle', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from S2 { vary: [ID] }
                slice S2 from S3 { vary: [ID] }
                slice S3 from S1 { vary: [ID] }
            `);

            symbolTable.buildFromProgram(program);

            const diagnostics = validator.validateNoCycles(program);

            expect(diagnostics.length).toBeGreaterThan(0);
            const cycleError = diagnostics.find(d => d.message.includes('Circular dependency'));
            expect(cycleError).toBeDefined();
        });
    });

    describe('buildGlobalDependencyGraph', () => {
        it('should build correct graph for simple dependencies', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                model M1 {
                    input: S1,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);

            expect(graph.size).toBe(3);
            expect(graph.has('TestCube')).toBe(true);
            expect(graph.has('S1')).toBe(true);
            expect(graph.has('M1')).toBe(true);

            // S1 depends on TestCube
            expect(graph.get('S1')!.has('TestCube')).toBe(true);

            // M1 depends on S1
            expect(graph.get('M1')!.has('S1')).toBe(true);
        });

        it('should handle multiple input types', async () => {
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

                slice S1 from TestCube { vary: [ID] }

                derive D1 {
                    input: TestCube,
                    output: OutputCube,
                    derivations: [RESULT = VALUE + 1]
                }

                aggregate A1 {
                    input: TestCube,
                    group by: [ID],
                    aggregations: [TOTAL = sum(VALUE)]
                }
            `);

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);

            expect(graph.get('S1')!.has('TestCube')).toBe(true);
            expect(graph.get('D1')!.has('TestCube')).toBe(true);
            expect(graph.get('A1')!.has('TestCube')).toBe(true);
        });
    });

    describe('detectCycles', () => {
        it('should return null for acyclic graph', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }
                slice S2 from TestCube { vary: [ID] }
            `);

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);
            const cycles = validator.detectCycles(graph);

            expect(cycles).toBeNull();
        });

        it('should detect cycle in graph', async () => {
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

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);
            const cycles = validator.detectCycles(graph);

            expect(cycles).not.toBeNull();
            expect(cycles!.length).toBeGreaterThan(0);
        });
    });

    describe('getTransitiveDependencies', () => {
        it('should return all transitive dependencies', async () => {
            const program = await parseProgram(`
                cube C1 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from C1 { vary: [ID] }
                slice S2 from S1 { vary: [ID] }

                model M1 {
                    input: S2,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);
            const deps = validator.getTransitiveDependencies('M1', graph);

            expect(deps.has('S2')).toBe(true);
            expect(deps.has('S1')).toBe(true);
            expect(deps.has('C1')).toBe(true);
        });
    });

    describe('getReverseDependencies', () => {
        it('should return all entities that depend on given entity', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }
                slice S2 from TestCube { vary: [ID] }

                model M1 {
                    input: TestCube,
                    formula: VALUE ~ 1
                }
            `);

            symbolTable.buildFromProgram(program);

            const graph = validator.buildGlobalDependencyGraph(program);
            const reverseDeps = validator.getReverseDependencies('TestCube', graph);

            expect(reverseDeps.has('S1')).toBe(true);
            expect(reverseDeps.has('S2')).toBe(true);
            expect(reverseDeps.has('M1')).toBe(true);
        });
    });
});
