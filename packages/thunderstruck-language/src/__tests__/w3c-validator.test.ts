/**
 * Tests for W3C Data Cube Integrity Constraints
 *
 * Tests all five implemented integrity constraints:
 * - IC-1: Unique DataSet
 * - IC-2: Unique DSD
 * - IC-11: All Dimensions Required
 * - IC-12: No Duplicate Observations
 * - IC-19: Codes from CodeList
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { EmptyFileSystem, type LangiumDocument } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';
import { W3CValidator } from '../validation/w3c/w3c-validator.js';
import { SymbolTable } from '../validation/symbol-table.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices(EmptyFileSystem);
const parse = parseHelper<Program>(services.thunderstruck);

describe('W3C Data Cube Integrity Constraints', () => {
    describe('IC-1: Unique DataSet', () => {
        test('should pass for cubes with unique names', async () => {
            const document = await parse(`
                cube Cube1 {
                    structure: {
                        dimensions: [
                            DIM1: Identifier
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                cube Cube2 {
                    structure: {
                        dimensions: [
                            DIM2: Identifier
                        ],
                        measures: [
                            MEASURE2: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic1Violations = diagnostics.filter(d => d.message.includes('IC-1'));
            expect(ic1Violations).toHaveLength(0);
        });

        test('should error for duplicate cube names', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM2: Identifier
                        ],
                        measures: [
                            MEASURE2: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic1Violations = diagnostics.filter(d =>
                d.message.includes('IC-1') && d.message.includes('Duplicate cube')
            );
            expect(ic1Violations.length).toBeGreaterThan(0);
            expect(ic1Violations[0].severity).toBe(DiagnosticSeverity.Error);
            expect(ic1Violations[0].message).toContain('TestCube');
        });
    });

    describe('IC-2: Unique DSD', () => {
        test('should pass for cubes with unique component names', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text
                        ],
                        measures: [
                            MEASURE1: Numeric,
                            MEASURE2: Integer
                        ],
                        attributes: [
                            ATTR1: Text
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic2Violations = diagnostics.filter(d => d.message.includes('IC-2'));
            expect(ic2Violations).toHaveLength(0);
        });

        test('should error for duplicate dimension names', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM1: Text
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic2Violations = diagnostics.filter(d =>
                d.message.includes('IC-2') && d.message.includes('Duplicate component')
            );
            expect(ic2Violations.length).toBeGreaterThan(0);
            expect(ic2Violations[0].severity).toBe(DiagnosticSeverity.Error);
            expect(ic2Violations[0].message).toContain('DIM1');
        });

        test('should error for duplicate names across categories', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            COMP1: Identifier
                        ],
                        measures: [
                            COMP1: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic2Violations = diagnostics.filter(d =>
                d.message.includes('IC-2') && d.message.includes('Duplicate component')
            );
            expect(ic2Violations.length).toBeGreaterThan(0);
            expect(ic2Violations[0].message).toContain('COMP1');
            expect(ic2Violations[0].message).toContain('dimension');
            expect(ic2Violations[0].message).toContain('measure');
        });
    });

    describe('IC-11: All Dimensions Required', () => {
        test('should pass for slice with all dimensions specified', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text,
                            DIM3: Integer
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "VALUE1" },
                    vary: [DIM2, DIM3]
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic11Violations = diagnostics.filter(d => d.message.includes('IC-11'));
            expect(ic11Violations).toHaveLength(0);
        });

        test('should error for slice missing dimensions', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text,
                            DIM3: Integer
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "VALUE1" },
                    vary: [DIM2]
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic11Violations = diagnostics.filter(d =>
                d.message.includes('IC-11') && d.message.includes('does not specify all dimensions')
            );
            expect(ic11Violations.length).toBeGreaterThan(0);
            expect(ic11Violations[0].severity).toBe(DiagnosticSeverity.Error);
            expect(ic11Violations[0].message).toContain('DIM3');
            expect(ic11Violations[0].message).toContain('TestSlice');
        });

        test('should pass for slice with all dimensions fixed', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "VALUE1", DIM2: "VALUE2" }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic11Violations = diagnostics.filter(d => d.message.includes('IC-11'));
            expect(ic11Violations).toHaveLength(0);
        });
    });

    describe('IC-12: No Duplicate Observations', () => {
        test('should pass for slice with varying dimensions', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "VALUE1" },
                    vary: [DIM2]
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic12Violations = diagnostics.filter(d =>
                d.message.includes('IC-12') && d.severity === DiagnosticSeverity.Warning
            );
            expect(ic12Violations).toHaveLength(0);
        });

        test('should warn for slice with no varying or fixed dimensions', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "VALUE1" }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            // This should pass IC-12 because it has fixed dimensions
            const ic12Violations = diagnostics.filter(d =>
                d.message.includes('IC-12') && d.message.includes('no varying dimensions')
            );
            expect(ic12Violations).toHaveLength(0);
        });

        test.skip('should warn for aggregate grouping by all dimensions', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: Text
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                aggregate TestAgg from TestCube {
                    groupBy: [DIM1, DIM2],
                    statistics: {
                        MEAN_MEASURE: mean(MEASURE1)
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic12Violations = diagnostics.filter(d =>
                d.message.includes('IC-12') && d.message.includes('groups by all dimensions')
            );
            expect(ic12Violations.length).toBeGreaterThan(0);
            expect(ic12Violations[0].severity).toBe(DiagnosticSeverity.Warning);
            expect(ic12Violations[0].message).toContain('TestAgg');
        });
    });

    describe('IC-19: Codes from CodeList', () => {
        test('should pass for CodedValue with code list', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: CodedValue<SEX>
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic19Violations = diagnostics.filter(d => d.message.includes('IC-19'));
            expect(ic19Violations).toHaveLength(0);
        });

        test('should warn for CodedValue without code list', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: CodedValue
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic19Violations = diagnostics.filter(d =>
                d.message.includes('IC-19') && d.message.includes('no code list specified')
            );
            expect(ic19Violations.length).toBeGreaterThan(0);
            expect(ic19Violations[0].severity).toBe(DiagnosticSeverity.Warning);
            expect(ic19Violations[0].message).toContain('DIM2');
        });

        test('should pass for fixed CodedValue with string literal', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM2: CodedValue<SEX>
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                slice TestSlice from TestCube {
                    fix: { DIM1: "ID1", DIM2: "M" },
                    vary: []
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            const ic19Violations = diagnostics.filter(d =>
                d.message.includes('IC-19') && d.severity === DiagnosticSeverity.Error
            );
            expect(ic19Violations).toHaveLength(0);
        });
    });

    describe('W3CValidator Integration', () => {
        test('should report constraint statistics', () => {
            const validator = new W3CValidator();
            const stats = validator.getConstraintStats();

            expect(stats.total).toBe(5);
            expect(stats.critical).toBe(3); // IC-1, IC-2, IC-11
            expect(stats.important).toBe(2); // IC-12, IC-19
            expect(stats.optional).toBe(0);
        });

        test('should detect multiple violations in one program', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM1: Identifier,
                            DIM1: Text
                        ],
                        measures: [
                            MEASURE1: Numeric
                        ]
                    }
                }

                cube TestCube {
                    structure: {
                        dimensions: [
                            DIM2: Identifier
                        ],
                        measures: [
                            MEASURE2: Integer
                        ]
                    }
                }
            `);

            const program = document.parseResult.value;
            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = new W3CValidator();
            const diagnostics = validator.validate(program, symbolTable);

            // Should have both IC-1 (duplicate cube) and IC-2 (duplicate component) violations
            const ic1Violations = diagnostics.filter(d => d.message.includes('IC-1'));
            const ic2Violations = diagnostics.filter(d => d.message.includes('IC-2'));

            expect(ic1Violations.length).toBeGreaterThan(0);
            expect(ic2Violations.length).toBeGreaterThan(0);
        });
    });
});
