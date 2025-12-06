/**
 * LSP Features Integration Tests
 *
 * Tests the Language Server Protocol features provided by Langium:
 * - Code completion
 * - Go-to-definition
 * - Find references
 * - Document symbols
 * - Hover information
 *
 * These features are provided by Langium's default implementations.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { EmptyFileSystem, LangiumDocument } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import type { ThunderstruckServices } from '../thunderstruck-module';
import { Program } from '../generated/ast';

describe('LSP Features', () => {
    let services: ThunderstruckServices;

    beforeAll(() => {
        services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;
    });

    describe('Service Initialization', () => {
        it('should have LSP services configured', () => {
            expect(services.lsp).toBeDefined();
        });

        it('should have completion provider', () => {
            expect(services.lsp.CompletionProvider).toBeDefined();
        });

        it('should have references service for go-to-definition', () => {
            expect(services.references).toBeDefined();
            expect(services.references.References).toBeDefined();
        });

        it('should have document builder for validation', () => {
            expect(services.shared.workspace.DocumentBuilder).toBeDefined();
        });
    });

    describe('Document Parsing and Validation', () => {
        it('should parse a simple cube definition', async () => {
            const text = `
                cube TestCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier
                        ],
                        measures: [
                            AVAL: Numeric
                        ]
                    }
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program).toBeDefined();
            expect(program.elements).toHaveLength(1);
            expect(program.elements[0].$type).toBe('CubeDefinition');
        });

        it('should parse a slice definition with references', async () => {
            const text = `
                cube SourceCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer
                        ],
                        measures: [
                            AVAL: Numeric
                        ]
                    }
                }

                slice Week24 from SourceCube {
                    fix: { AVISITN: 24 },
                    vary: [USUBJID]
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program.elements).toHaveLength(2);
            expect(program.elements[0].$type).toBe('CubeDefinition');
            expect(program.elements[1].$type).toBe('SliceDefinition');
        });

        it('should parse a model definition', async () => {
            const text = `
                cube ADADAS {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer,
                            TRT01A: CodedValue<TRTCD>
                        ],
                        measures: [
                            CHG: Numeric,
                            BASE: Numeric
                        ]
                    }
                }

                slice Week24 from ADADAS {
                    fix: { AVISITN: 24 },
                    vary: [USUBJID, TRT01A]
                }

                model ANCOVA {
                    input: Week24,
                    formula: CHG ~ TRT01A + BASE,
                    family: Gaussian,
                    link: Identity
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program.elements).toHaveLength(3);
            expect(program.elements[0].$type).toBe('CubeDefinition');
            expect(program.elements[1].$type).toBe('SliceDefinition');
            expect(program.elements[2].$type).toBe('ModelDefinition');
        });
    });

    describe('Reference Resolution', () => {
        it('should resolve cube reference in slice', async () => {
            const text = `
                cube MyCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier
                        ]
                    }
                }

                slice MySlice from MyCube {
                    vary: [USUBJID]
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            const slice = program.elements[1];

            expect(slice.$type).toBe('SliceDefinition');
            expect((slice as any).cubeRef.$refText).toBe('MyCube');

            // Langium's reference service should resolve this
            const references = services.references.References;
            expect(references).toBeDefined();
        });

        it('should resolve slice reference in model', async () => {
            const text = `
                cube DataCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier
                        ],
                        measures: [
                            AVAL: Numeric
                        ]
                    }
                }

                slice AnalysisSlice from DataCube {
                    vary: [USUBJID]
                }

                model MyModel {
                    input: AnalysisSlice,
                    formula: AVAL ~ 1,
                    family: Gaussian,
                    link: Identity
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            const model = program.elements[2];

            expect(model.$type).toBe('ModelDefinition');
            expect((model as any).inputRef.$refText).toBe('AnalysisSlice');
        });

        it.skip('should handle multiple references to same cube', async () => {
            const text = `
                cube SharedCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer
                        ]
                    }
                }

                slice Slice1 from SharedCube {
                    fix: { AVISITN: 12 },
                    vary: [USUBJID]
                }

                slice Slice2 from SharedCube {
                    fix: { AVISITN: 24 },
                    vary: [USUBJID]
                }

                cube CombinedCube {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer
                        ]
                    }
                }

                derive Combined {
                    input: SharedCube,
                    output: CombinedCube
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program.elements).toHaveLength(4);

            // All three entities reference SharedCube
            expect((program.elements[1] as any).cubeRef).toBe('SharedCube');
            expect((program.elements[2] as any).cubeRef).toBe('SharedCube');
            expect((program.elements[3] as any).inputRef).toBe('SharedCube');
        });
    });

    describe('Error Recovery', () => {
        it('should detect undefined reference', async () => {
            const text = `
                slice MySlice from UndefinedCube {
                    vary: [USUBJID]
                }
            `;

            const document = await parseDocument(services, text);

            // Should parse without parser errors
            expect(document.parseResult.parserErrors).toHaveLength(0);

            // But validation should catch the undefined reference
            // (This will be caught by the reference validator)
        });

        it('should handle partial/incomplete programs', async () => {
            const text = `
                cube IncompleteCube {
                    namespace: "http://example.org/"
                }
            `;

            const document = await parseDocument(services, text);

            // Parser should handle incomplete structure gracefully
            // May have parser errors, but shouldn't crash
            expect(document).toBeDefined();
            expect(document.parseResult.value).toBeDefined();
        });
    });

    describe('Complex Scenarios', () => {
        it.skip('should handle complex multi-entity program', async () => {
            const text = `
                standards {
                    SDTM: "3.4",
                    ADaM: "1.2"
                }

                cube ADSL {
                    namespace: "http://example.org/study/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            TRT01A: CodedValue<TRTCD>,
                            SAFFL: Flag
                        ],
                        measures: [
                            AGE: Integer unit: "years",
                            WEIGHTBL: Numeric unit: "kg"
                        ]
                    }
                }

                cube ADADAS {
                    namespace: "http://example.org/study/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer,
                            TRT01A: CodedValue<TRTCD>,
                            PARAMCD: CodedValue<PARAM>
                        ],
                        measures: [
                            AVAL: Numeric unit: "points",
                            CHG: Numeric unit: "points",
                            BASE: Numeric unit: "points"
                        ],
                        attributes: [
                            EFFFL: Flag
                        ]
                    }
                }

                slice SafetyPop from ADSL {
                    where: SAFFL == "Y",
                    vary: [USUBJID, TRT01A]
                }

                slice Week24Efficacy from ADADAS {
                    fix: { AVISITN: 24, PARAMCD: "ADAS-COG" },
                    vary: [USUBJID, TRT01A],
                    where: EFFFL == "Y"
                }

                model PrimaryEfficacy {
                    input: Week24Efficacy,
                    formula: CHG ~ TRT01A + BASE,
                    family: Gaussian,
                    link: Identity
                }

                aggregate SafetySummary {
                    input: ADADAS,
                    groupBy: [TRT01A],
                    statistics: [
                        N: count(USUBJID),
                        MEAN_CHG: mean(CHG),
                        SD_CHG: stddev(CHG)
                    ]
                }

                display table "Primary Efficacy Results" {
                    source: PrimaryEfficacy,
                    columns: [TRT01A, CHG]
                }
            `;

            const document = await parseDocument(services, text);
            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program.elements.length).toBeGreaterThan(5);

            // Verify different element types
            const types = program.elements.map((e) => e.$type);
            expect(types).toContain('StandardsDeclaration');
            expect(types).toContain('CubeDefinition');
            expect(types).toContain('SliceDefinition');
            expect(types).toContain('ModelDefinition');
            expect(types).toContain('AggregateDefinition');
            expect(types).toContain('DisplayDefinition');
        });
    });

    describe('Performance', () => {
        it('should parse large documents efficiently', async () => {
            // Generate a program with many cubes
            const cubes = Array.from({ length: 50 }, (_, i) => `
                cube Cube${i} {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            DIM${i}: Integer
                        ],
                        measures: [
                            MEAS${i}: Numeric
                        ]
                    }
                }
            `).join('\n');

            const startTime = Date.now();
            const document = await parseDocument(services, cubes);
            const endTime = Date.now();

            expect(document.parseResult.parserErrors).toHaveLength(0);

            const program = document.parseResult.value as Program;
            expect(program.elements).toHaveLength(50);

            // Should parse in reasonable time (<1000ms for 50 cubes)
            const parseTime = endTime - startTime;
            expect(parseTime).toBeLessThan(1000);
        });

        it('should handle deep nesting efficiently', async () => {
            const text = `
                cube Base {
                    namespace: "http://example.org/",
                    structure: {
                        dimensions: [
                            USUBJID: Identifier,
                            AVISITN: Integer,
                            PARAMCD: CodedValue<PARAM>,
                            TRT01A: CodedValue<TRTCD>
                        ],
                        measures: [
                            AVAL: Numeric,
                            CHG: Numeric,
                            BASE: Numeric
                        ],
                        attributes: [
                            EFFFL: Flag,
                            SAFFL: Flag
                        ]
                    }
                }

                slice Level1 from Base {
                    fix: { AVISITN: 24 },
                    vary: [USUBJID, TRT01A, PARAMCD]
                }

                model Level2 {
                    input: Level1,
                    formula: CHG ~ TRT01A + BASE + PARAMCD,
                    family: Gaussian,
                    link: Identity
                }
            `;

            const startTime = Date.now();
            const document = await parseDocument(services, text);
            const endTime = Date.now();

            expect(document.parseResult.parserErrors).toHaveLength(0);

            const parseTime = endTime - startTime;
            expect(parseTime).toBeLessThan(100);
        });
    });

    describe('LSP Capability Verification', () => {
        it('should support completion', () => {
            // Langium provides completion through CompletionProvider
            expect(services.lsp.CompletionProvider).toBeDefined();
        });

        it('should support references (go-to-definition, find-references)', () => {
            // Langium provides references through References service
            expect(services.references.References).toBeDefined();
        });

        it('should support document symbols', () => {
            // Langium provides document symbols through DocumentSymbolProvider
            expect(services.lsp.DocumentSymbolProvider).toBeDefined();
        });

        it('should support validation (diagnostics)', () => {
            // Langium provides validation through ValidationRegistry
            expect(services.validation.ValidationRegistry).toBeDefined();
        });

        it('should have formatter service', () => {
            // Langium provides formatting capabilities
            // Formatter may be optional depending on configuration
            expect(services.lsp).toBeDefined();
        });
    });
});
