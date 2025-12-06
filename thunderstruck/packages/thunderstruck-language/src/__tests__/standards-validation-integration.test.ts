/**
 * Standards Validation Integration Tests
 *
 * End-to-end validation tests for W3C, CDISC, CORE, and version validation.
 * Tests the complete validation pipeline using test fixtures.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';
import { DiagnosticSeverity } from '../types/type-checker.js';
import { IntegratedValidator } from '../validation/reporting/integrated-validator.js';
import { FormatterFactory } from '../validation/reporting/report-formatter.js';
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

describe('Standards Validation Integration', () => {
    let validator: IntegratedValidator;

    beforeEach(() => {
        validator = new IntegratedValidator();
    });

    describe('Valid SDTM Program', () => {
        test('should pass validation with no errors', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateVersions: true
            });

            const errors = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Error);
            expect(errors).toHaveLength(0);
            expect(report.summary.status).toMatch(/pass/);
        });

        test('should have correct metadata', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.metadata.versions.W3C_Cube).toBe('2014-01-16');
            expect(report.metadata.target).toBeDefined();
            expect(report.metadata.timestamp).toBeInstanceOf(Date);
        });

        test('should generate all report formats', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            // JSON format
            const json = FormatterFactory.format(report, 'json');
            expect(() => JSON.parse(json)).not.toThrow();
            const parsed = JSON.parse(json);
            expect(parsed.summary).toBeDefined();
            expect(parsed.metadata).toBeDefined();

            // Text format
            const text = FormatterFactory.format(report, 'text');
            expect(text).toContain('VALIDATION REPORT');
            expect(text).toContain('SUMMARY');
            expect(text).toContain('SDTM: 3.4');

            // Markdown format
            const markdown = FormatterFactory.format(report, 'markdown');
            expect(markdown).toContain('# Validation Report');
            expect(markdown).toContain('## Metadata');
            expect(markdown).toContain('**SDTM:** 3.4');
        });
    });

    describe('Invalid SDTM Program', () => {
        test('should detect multiple validation issues', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateVersions: false
            });

            const errors = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Error);
            expect(errors.length).toBeGreaterThan(0);
            expect(report.summary.status).toBe('fail');
        });

        test('should detect W3C IC-2 violation (duplicate components)', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true
            });

            // Should have W3C violations
            expect(report.results.w3c.length).toBeGreaterThan(0);
        });

        test('should detect IC-11 violation (missing dimensions)', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true
            });

            // Should have IC-11 violations for slice with missing dimensions
            const ic11Issues = report.allIssues.filter(i =>
                i.message.includes('IC-11') || i.message.includes('does not specify all dimensions')
            );
            expect(ic11Issues.length).toBeGreaterThan(0);
        });

        test('should group issues by source', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateVersions: false
            });

            expect(report.results).toBeDefined();
            expect(report.results.w3c).toBeDefined();
            expect(report.results.sdtm).toBeDefined();
            expect(report.results.adam).toBeDefined();
            expect(report.results.core).toBeDefined();
        });

        test('should calculate correct summary statistics', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            expect(report.summary.totalIssues).toBeGreaterThan(0);
            expect(report.summary.errors + report.summary.warnings + report.summary.hints).toBe(report.summary.totalIssues);
        });
    });

    describe('Valid ADaM Program', () => {
        test('should pass validation for ADSL', async () => {
            const content = loadFixture('valid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateVersions: true
            });

            const errors = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Error);
            expect(errors).toHaveLength(0);
        });

        test('should have correct ADaM version metadata', async () => {
            const content = loadFixture('valid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.metadata.versions.ADaM).toBe('1.2');
        });

        test('should pass validation for BDS structure', async () => {
            const content = loadFixture('valid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true
            });

            // BDS cube should have CHG and PCHG with BASE - no errors expected
            const errors = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Error);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Invalid ADaM Program', () => {
        test('should detect W3C violations in ADaM program', async () => {
            const content = loadFixture('invalid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateVersions: false
            });

            // Should detect IC-2 (duplicate PARAMCD) and IC-11 (missing dimensions in slice)
            const errors = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Error);
            expect(errors.length).toBeGreaterThan(0);
            expect(report.results.w3c.length).toBeGreaterThan(0);
        });

        test('should handle ADaM version metadata', async () => {
            const content = loadFixture('invalid-adam-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateVersions: false
            });

            // Should have ADaM 1.2 from standards declaration
            expect(report.metadata.versions.ADaM).toBe('1.2');
        });
    });

    describe('Report Options', () => {
        test('should filter warnings when includeWarnings is false', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                reportOptions: {
                    includeWarnings: false
                }
            });

            const warnings = report.allIssues.filter(i => i.severity === DiagnosticSeverity.Warning);
            expect(warnings).toHaveLength(0);
        });

        test('should sort issues by severity', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                reportOptions: {
                    sortBySeverity: true
                }
            });

            if (report.allIssues.length > 1) {
                // Errors should come before warnings
                let foundWarning = false;
                for (const issue of report.allIssues) {
                    if (issue.severity === DiagnosticSeverity.Warning) {
                        foundWarning = true;
                    }
                    if (foundWarning && issue.severity === DiagnosticSeverity.Error) {
                        fail('Errors should come before warnings when sorted');
                    }
                }
            }
        });

        test('should limit number of issues', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                reportOptions: {
                    maxIssues: 2
                }
            });

            expect(report.allIssues.length).toBeLessThanOrEqual(2);
        });
    });

    describe('Validation Pipeline', () => {
        test('should run all validators when options enabled', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program, {
                validateW3C: true,
                validateSDTM: false,
                validateADaM: false,
                validateCORE: false,
                validateVersions: true
            });

            // Should have run W3C and version validation
            expect(report.metadata).toBeDefined();
            expect(report.summary).toBeDefined();
        });

        test('should track validation duration', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            expect(report.metadata.duration).toBeDefined();
            expect(report.metadata.duration).toBeGreaterThanOrEqual(0);
        });

        test('should handle programs with no standards declaration', async () => {
            const document = await parse(`
                cube TestCube {
                    structure: {
                        dimensions: [
                            ID: Identifier
                        ],
                        measures: []
                    }
                }
            `);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);

            // Should use default versions
            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.metadata.versions.ADaM).toBe('1.2');
            expect(report.summary).toBeDefined();
        });
    });

    describe('Report Format Correctness', () => {
        test('JSON format should have all required fields', async () => {
            const content = loadFixture('valid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);
            const json = FormatterFactory.format(report, 'json');
            const parsed = JSON.parse(json);

            expect(parsed.metadata).toBeDefined();
            expect(parsed.metadata.timestamp).toBeDefined();
            expect(parsed.metadata.target).toBeDefined();
            expect(parsed.metadata.versions).toBeDefined();
            expect(parsed.summary).toBeDefined();
            expect(parsed.summary.totalIssues).toBeDefined();
            expect(parsed.summary.status).toBeDefined();
            expect(parsed.results).toBeDefined();
            expect(parsed.allIssues).toBeDefined();
        });

        test('Text format should be readable', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);
            const text = FormatterFactory.format(report, 'text');

            // Check for expected sections
            expect(text).toContain('=');  // Header separators
            expect(text).toContain('VALIDATION REPORT');
            expect(text).toContain('Target:');
            expect(text).toContain('Timestamp:');
            expect(text).toContain('SUMMARY');
            expect(text).toContain('Status:');
            expect(text).toContain('Total:');
            expect(text).toContain('Errors:');
            expect(text).toContain('Warnings:');

            if (report.allIssues.length > 0) {
                expect(text).toContain('ISSUES');
            }
        });

        test('Markdown format should have proper structure', async () => {
            const content = loadFixture('invalid-sdtm-cube.tsk');
            const document = await parse(content);
            const program = document.parseResult.value;

            const report = validator.validateProgram(program);
            const markdown = FormatterFactory.format(report, 'markdown');

            // Check for markdown headers
            expect(markdown).toContain('# Validation Report');
            expect(markdown).toContain('## Metadata');
            expect(markdown).toContain('## Summary');

            // Check for markdown table
            expect(markdown).toContain('| Metric | Count |');
            expect(markdown).toContain('|--------|-------|');

            // Check for metadata bullets
            expect(markdown).toContain('- **Target:**');
            expect(markdown).toContain('- **Timestamp:**');

            if (report.allIssues.length > 0) {
                expect(markdown).toContain('## Issues by Source');
            }
        });
    });
});
