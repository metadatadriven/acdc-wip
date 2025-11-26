/**
 * Tests for PipelineValidator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { Program, PipelineDefinition } from '../generated/ast.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { PipelineValidator } from '../validation/pipeline-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(input: string): Promise<Program> {
    const document = await parseDocument(services, input);
    return document.parseResult.value as Program;
}

function getPipeline(program: Program, index: number): PipelineDefinition {
    return program.elements[index] as PipelineDefinition;
}

describe('PipelineValidator', () => {
    let symbolTable: SymbolTable;
    let validator: PipelineValidator;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        validator = new PipelineValidator(symbolTable);
    });

    describe('validatePipeline - valid pipelines', () => {
        it('should pass for valid linear pipeline', async () => {
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
                    input: TestCube,
                    formula: VALUE ~ 1
                }

                pipeline TestPipeline {
                    stages: [
                        stage1: S1,
                        stage2: M1 depends on stage1
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 3);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics).toHaveLength(0);
        });

        it('should pass for pipeline with multiple dependencies', async () => {
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
                slice S3 from TestCube { vary: [ID] }

                model M1 {
                    input: TestCube,
                    formula: VALUE ~ 1
                }

                pipeline ComplexPipeline {
                    stages: [
                        stage1: S1,
                        stage2: S2,
                        stage3: S3 depends on [stage1, stage2],
                        stage4: M1 depends on [stage3]
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 5);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics).toHaveLength(0);
        });
    });

    describe('checkDuplicateStageNames', () => {
        it('should error for duplicate stage names', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline BadPipeline {
                    stages: [
                        stage1: S1,
                        stage1: S1
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const dupError = diagnostics.find(d => d.message.includes('duplicate'));
            expect(dupError).toBeDefined();
            expect(dupError!.message).toContain('stage1');
        });
    });

    describe('validateDependencies', () => {
        it('should error for undefined dependency', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline BadPipeline {
                    stages: [
                        stage1: S1 depends on nonexistent
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const depError = diagnostics.find(d => d.message.includes('undefined'));
            expect(depError).toBeDefined();
            expect(depError!.message).toContain('nonexistent');
        });

        it('should suggest similar stage names', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline BadPipeline {
                    stages: [
                        LoadData: S1,
                        ProcessData: S1 depends on LoadDat
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const suggestion = diagnostics.find(d => d.message.includes('Did you mean'));
            expect(suggestion).toBeDefined();
            expect(suggestion!.message).toContain('LoadData');
        });
    });

    describe('validateOperationReferences', () => {
        it('should error for undefined operation', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                pipeline BadPipeline {
                    stages: [
                        stage1: NonExistent
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 1);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const opError = diagnostics.find(d => d.message.includes('undefined'));
            expect(opError).toBeDefined();
        });
    });

    describe('detectCycles', () => {
        it('should detect simple cycle', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline CyclicPipeline {
                    stages: [
                        stage1: S1 depends on stage2,
                        stage2: S1 depends on stage1
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const cycleError = diagnostics.find(d => d.message.includes('circular'));
            expect(cycleError).toBeDefined();
            expect(cycleError!.severity).toBe(DiagnosticSeverity.Error);
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

                slice S1 from TestCube { vary: [ID] }

                pipeline CyclicPipeline {
                    stages: [
                        A: S1 depends on C,
                        B: S1 depends on A,
                        C: S1 depends on B
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            expect(diagnostics.length).toBeGreaterThan(0);
            const cycleError = diagnostics.find(d => d.message.includes('circular'));
            expect(cycleError).toBeDefined();
        });

        it('should not detect false cycles in DAG', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline DAGPipeline {
                    stages: [
                        A: S1,
                        B: S1 depends on A,
                        C: S1 depends on A,
                        D: S1 depends on [B, C]
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const diagnostics = validator.validatePipeline(pipeline);

            const cycleError = diagnostics.find(d => d.message.includes('circular'));
            expect(cycleError).toBeUndefined();
        });
    });

    describe('topologicalSort', () => {
        it('should return correct execution order for linear pipeline', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline LinearPipeline {
                    stages: [
                        stage1: S1,
                        stage2: S1 depends on stage1,
                        stage3: S1 depends on stage2
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const order = validator.topologicalSort(pipeline);

            expect(order).not.toBeNull();
            expect(order).toHaveLength(3);
            expect(order![0]).toBe('stage1');
            expect(order![1]).toBe('stage2');
            expect(order![2]).toBe('stage3');
        });

        it('should return null for cyclic pipeline', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline CyclicPipeline {
                    stages: [
                        stage1: S1 depends on stage2,
                        stage2: S1 depends on stage1
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const order = validator.topologicalSort(pipeline);

            expect(order).toBeNull();
        });

        it('should handle diamond dependency pattern', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline DiamondPipeline {
                    stages: [
                        A: S1,
                        B: S1 depends on A,
                        C: S1 depends on A,
                        D: S1 depends on [B, C]
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const order = validator.topologicalSort(pipeline);

            expect(order).not.toBeNull();
            expect(order).toHaveLength(4);
            expect(order![0]).toBe('A');
            expect(order![3]).toBe('D');
            // B and C can be in either order
            expect(order!.includes('B')).toBe(true);
            expect(order!.includes('C')).toBe(true);
        });
    });

    describe('buildDependencyGraph', () => {
        it('should build correct graph', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice S1 from TestCube { vary: [ID] }

                pipeline TestPipeline {
                    stages: [
                        A: S1,
                        B: S1 depends on A,
                        C: S1 depends on [A, B]
                    ]
                }
            `);

            symbolTable.buildFromProgram(program);
            const pipeline = getPipeline(program, 2);

            const graph = validator.buildDependencyGraph(pipeline);

            expect(graph.size).toBe(3);
            expect(graph.get('A')!.size).toBe(0);
            expect(graph.get('B')!.has('A')).toBe(true);
            expect(graph.get('C')!.has('A')).toBe(true);
            expect(graph.get('C')!.has('B')).toBe(true);
        });
    });
});
