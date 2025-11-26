/**
 * Validation Performance Tests
 *
 * Performance benchmarks for validation system to ensure validation
 * completes in acceptable time (<100ms for typical programs).
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';
import { IntegratedValidator } from '../validation/reporting/integrated-validator.js';
import { W3CValidator } from '../validation/w3c/w3c-validator.js';
import { CDISCValidator } from '../validation/cdisc/cdisc-validator.js';
import { SymbolTable } from '../validation/symbol-table.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = createThunderstruckServices(EmptyFileSystem);
const parse = parseHelper<Program>(services.thunderstruck);

function loadFixture(filename: string): string {
    const fixturePath = path.join(__dirname, 'fixtures', filename);
    return fs.readFileSync(fixturePath, 'utf-8');
}

describe('Validation Performance', () => {
    let integratedValidator: IntegratedValidator;
    let w3cValidator: W3CValidator;
    let cdiscValidator: CDISCValidator;

    beforeEach(() => {
        integratedValidator = new IntegratedValidator();
        w3cValidator = new W3CValidator();
        cdiscValidator = new CDISCValidator();
    });

    describe('Performance Requirements', () => {
        test('should validate typical program in <100ms', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const startTime = Date.now();
            const report = integratedValidator.validateProgram(program, {
                validateW3C: true,
                validateVersions: true
            });
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(100);
            expect(report).toBeDefined();
        });

        test('should validate complex program in <200ms', async () => {
            const content = loadFixture('valid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const startTime = Date.now();
            const report = integratedValidator.validateProgram(program, {
                validateW3C: true,
                validateVersions: true
            });
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(200);
            expect(report).toBeDefined();
        });

        test('W3C validation should complete in <50ms', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const startTime = Date.now();
            const diagnostics = w3cValidator.validate(program, symbolTable);
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(50);
            expect(diagnostics).toBeDefined();
        });

        test('version validation should complete in <20ms', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            cdiscValidator.loadVersionsFromProgram(program);

            const startTime = Date.now();
            const diagnostics = cdiscValidator.validateVersions(program);
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(20);
            expect(diagnostics).toBeDefined();
        });

        test('report generation should complete in <30ms', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            // Pre-run validation to get issues
            const report = integratedValidator.validateProgram(program);
            const generator = integratedValidator.getReportGenerator();

            const startTime = Date.now();
            generator.generateReport();
            const duration = Date.now() - startTime;

            expect(duration).toBeLessThan(30);
        });
    });

    describe('Performance Under Load', () => {
        test('should handle multiple validations without performance degradation', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const durations: number[] = [];

            // Run validation 10 times
            for (let i = 0; i < 10; i++) {
                const startTime = performance.now();
                integratedValidator.validateProgram(program);
                const duration = performance.now() - startTime;
                durations.push(duration);
            }

            // Calculate average
            const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

            // Average should still be under 100ms
            expect(avgDuration).toBeLessThan(100);

            // Check for performance degradation (last should not be significantly slower than first)
            const first = durations[0];
            const last = durations[durations.length - 1];

            // Only check degradation if first duration is meaningful (>0.1ms)
            if (first > 0.1) {
                const degradation = last / first;
                // Last run should not be more than 3x slower than first (allows for variance)
                expect(degradation).toBeLessThan(3.0);
            }
        });

        test('should not have memory leaks during repeated validation', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            // Capture initial memory
            if (global.gc) {
                global.gc();
            }
            const initialMemory = process.memoryUsage().heapUsed;

            // Run validation many times
            for (let i = 0; i < 100; i++) {
                integratedValidator.validateProgram(program);
            }

            // Capture final memory
            if (global.gc) {
                global.gc();
            }
            const finalMemory = process.memoryUsage().heapUsed;

            // Memory growth should be reasonable (less than 10MB for 100 validations)
            const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);
            expect(memoryGrowth).toBeLessThan(10);
        });
    });

    describe('Performance Scaling', () => {
        test('should scale linearly with program size', async () => {
            // Small program
            const smallProgram = await parse(`
                cube Small {
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VAL: Numeric]
                    }
                }
            `);

            const startSmall = performance.now();
            integratedValidator.validateProgram(smallProgram.parseResult.value);
            const durationSmall = performance.now() - startSmall;

            // Medium program (5 cubes)
            let mediumContent = '';
            for (let i = 0; i < 5; i++) {
                mediumContent += `
                    cube Cube${i} {
                        structure: {
                            dimensions: [ID${i}: Identifier],
                            measures: [VAL${i}: Numeric]
                        }
                    }
                `;
            }
            const mediumProgram = await parse(mediumContent);

            const startMedium = performance.now();
            integratedValidator.validateProgram(mediumProgram.parseResult.value);
            const durationMedium = performance.now() - startMedium;

            // Large program (10 cubes)
            let largeContent = '';
            for (let i = 0; i < 10; i++) {
                largeContent += `
                    cube LargeCube${i} {
                        structure: {
                            dimensions: [DIMID${i}: Identifier],
                            measures: [MEASURE${i}: Numeric]
                        }
                    }
                `;
            }
            const largeProgram = await parse(largeContent);

            const startLarge = performance.now();
            integratedValidator.validateProgram(largeProgram.parseResult.value);
            const durationLarge = performance.now() - startLarge;

            // Check scaling is roughly linear (not exponential)
            // Only check if durations are meaningful (>0.1ms)
            if (durationSmall > 0.1 && durationMedium > 0.1 && durationLarge > 0.1) {
                // Large should not be more than 5x medium, and medium not more than 5x small
                expect(durationMedium / durationSmall).toBeLessThan(5);
                expect(durationLarge / durationMedium).toBeLessThan(5);
            }

            // All should complete in reasonable time
            expect(durationSmall).toBeLessThan(50);
            expect(durationMedium).toBeLessThan(150);
            expect(durationLarge).toBeLessThan(300);
        });

        test('should handle large number of dimensions efficiently', async () => {
            // Create cube with 50 dimensions
            let dimensions = '';
            for (let i = 0; i < 50; i++) {
                dimensions += `DIM${i}: Text${i < 49 ? ',' : ''}\n`;
            }

            const program = await parse(`
                cube LargeCube {
                    structure: {
                        dimensions: [
                            ${dimensions}
                        ],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            const startTime = Date.now();
            integratedValidator.validateProgram(program.parseResult.value);
            const duration = Date.now() - startTime;

            // Should still complete in reasonable time even with many dimensions
            expect(duration).toBeLessThan(150);
        });
    });

    describe('Individual Validator Performance', () => {
        test('IC validators should be fast', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const validator = integratedValidator.getW3CValidator();

            // Run each IC validation multiple times and measure
            const iterations = 100;
            const startTime = Date.now();

            for (let i = 0; i < iterations; i++) {
                validator.validate(program, symbolTable);
            }

            const totalDuration = Date.now() - startTime;
            const avgDuration = totalDuration / iterations;

            // Each validation should be very fast (< 10ms on average)
            expect(avgDuration).toBeLessThan(10);
        });

        test('version manager should load versions quickly', async () => {
            const content = loadFixture('valid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const iterations = 1000;
            const startTime = Date.now();

            for (let i = 0; i < iterations; i++) {
                const validator = new CDISCValidator();
                validator.loadVersionsFromProgram(program);
                validator.getEffectiveVersions();
            }

            const totalDuration = Date.now() - startTime;
            const avgDuration = totalDuration / iterations;

            // Version loading should be very fast (< 1ms on average)
            expect(avgDuration).toBeLessThan(1);
        });
    });

    describe('Report Formatting Performance', () => {
        test('JSON formatting should be fast', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = integratedValidator.validateProgram(program);
            const { FormatterFactory } = await import('../validation/reporting/report-formatter.js');

            const startTime = Date.now();
            for (let i = 0; i < 100; i++) {
                FormatterFactory.format(report, 'json');
            }
            const duration = Date.now() - startTime;

            // 100 JSON formats should complete in < 50ms
            expect(duration).toBeLessThan(50);
        });

        test('Text formatting should be fast', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = integratedValidator.validateProgram(program);
            const { FormatterFactory } = await import('../validation/reporting/report-formatter.js');

            const startTime = Date.now();
            for (let i = 0; i < 100; i++) {
                FormatterFactory.format(report, 'text');
            }
            const duration = Date.now() - startTime;

            // 100 text formats should complete in < 100ms
            expect(duration).toBeLessThan(100);
        });

        test('Markdown formatting should be fast', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = integratedValidator.validateProgram(program);
            const { FormatterFactory } = await import('../validation/reporting/report-formatter.js');

            const startTime = Date.now();
            for (let i = 0; i < 100; i++) {
                FormatterFactory.format(report, 'markdown');
            }
            const duration = Date.now() - startTime;

            // 100 markdown formats should complete in < 100ms
            expect(duration).toBeLessThan(100);
        });
    });
});
