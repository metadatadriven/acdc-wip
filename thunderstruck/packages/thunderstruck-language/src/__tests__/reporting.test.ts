/**
 * Tests for Validation Reporting System
 *
 * Tests report generation, formatting, and integrated validation.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';
import { DiagnosticSeverity } from '../types/type-checker.js';
import { ReportGenerator } from '../validation/reporting/report-generator.js';
import { ValidationIssueFactory } from '../validation/reporting/validation-report.js';
import { JSONFormatter, TextFormatter, MarkdownFormatter, FormatterFactory } from '../validation/reporting/report-formatter.js';
import { IntegratedValidator } from '../validation/reporting/integrated-validator.js';

const services = createThunderstruckServices(EmptyFileSystem);
const parse = parseHelper<Program>(services.thunderstruck);

describe('Validation Reporting System', () => {
    describe('ReportGenerator', () => {
        let generator: ReportGenerator;

        beforeEach(() => {
            generator = new ReportGenerator();
        });

        test('should create empty report with no issues', () => {
            generator.startValidation('test.tsk');
            const report = generator.generateReport();

            expect(report.summary.totalIssues).toBe(0);
            expect(report.summary.errors).toBe(0);
            expect(report.summary.warnings).toBe(0);
            expect(report.summary.status).toBe('pass');
        });

        test('should add W3C issues', () => {
            generator.startValidation('test.tsk');

            const issue = ValidationIssueFactory.createW3CIssue(
                'IC-1',
                'Duplicate cube names found',
                DiagnosticSeverity.Error,
                'DM_Cube'
            );
            generator.addW3CIssues([issue]);

            const report = generator.generateReport();

            expect(report.summary.totalIssues).toBe(1);
            expect(report.summary.errors).toBe(1);
            expect(report.results.w3c).toHaveLength(1);
            expect(report.summary.status).toBe('fail');
        });

        test('should add CORE issues', () => {
            generator.startValidation('test.tsk');

            const coreViolation = {
                ruleId: 'CG0001',
                severity: DiagnosticSeverity.Error,
                message: 'Key variable USUBJID is missing',
                variable: 'USUBJID'
            };
            const issue = ValidationIssueFactory.createCOREIssue(coreViolation);
            generator.addCOREIssues([issue]);

            const report = generator.generateReport();

            expect(report.summary.totalIssues).toBe(1);
            expect(report.results.core).toHaveLength(1);
            expect(report.results.core[0].code).toBe('CG0001');
        });

        test('should set standards versions', () => {
            generator.startValidation('test.tsk');
            generator.setVersions({
                SDTM: '3.4',
                ADaM: '1.2'
            });

            const report = generator.generateReport();

            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.metadata.versions.ADaM).toBe('1.2');
        });

        test('should calculate summary correctly', () => {
            generator.startValidation('test.tsk');

            // Add 2 errors
            generator.addW3CIssues([
                ValidationIssueFactory.createW3CIssue('IC-1', 'Error 1', DiagnosticSeverity.Error),
                ValidationIssueFactory.createW3CIssue('IC-2', 'Error 2', DiagnosticSeverity.Error)
            ]);

            // Add 3 warnings
            generator.addVersionIssues([
                { severity: DiagnosticSeverity.Warning, message: 'Warning 1', code: 'V1', source: 'Version' },
                { severity: DiagnosticSeverity.Warning, message: 'Warning 2', code: 'V2', source: 'Version' },
                { severity: DiagnosticSeverity.Warning, message: 'Warning 3', code: 'V3', source: 'Version' }
            ]);

            const report = generator.generateReport();

            expect(report.summary.totalIssues).toBe(5);
            expect(report.summary.errors).toBe(2);
            expect(report.summary.warnings).toBe(3);
            expect(report.summary.status).toBe('fail'); // Has errors
        });

        test('should filter warnings when includeWarnings is false', () => {
            generator.startValidation('test.tsk');

            generator.addW3CIssues([
                ValidationIssueFactory.createW3CIssue('IC-1', 'Error', DiagnosticSeverity.Error)
            ]);

            generator.addVersionIssues([
                { severity: DiagnosticSeverity.Warning, message: 'Warning', code: 'V1', source: 'Version' }
            ]);

            const report = generator.generateReport({ includeWarnings: false });

            expect(report.summary.totalIssues).toBe(1); // Only error
            expect(report.allIssues).toHaveLength(1);
        });

        test('should sort issues by severity', () => {
            generator.startValidation('test.tsk');

            generator.addW3CIssues([
                ValidationIssueFactory.createW3CIssue('IC-1', 'Warning', DiagnosticSeverity.Warning),
                ValidationIssueFactory.createW3CIssue('IC-2', 'Error', DiagnosticSeverity.Error),
                { severity: DiagnosticSeverity.Hint, message: 'Hint', code: 'H1', source: 'W3C' }
            ]);

            const report = generator.generateReport({ sortBySeverity: true });

            // Errors first, then warnings, then hints
            expect(report.allIssues[0].severity).toBe(DiagnosticSeverity.Error);
            expect(report.allIssues[1].severity).toBe(DiagnosticSeverity.Warning);
            expect(report.allIssues[2].severity).toBe(DiagnosticSeverity.Hint);
        });

        test('should limit number of issues', () => {
            generator.startValidation('test.tsk');

            const issues = Array.from({ length: 10 }, (_, i) =>
                ValidationIssueFactory.createW3CIssue(`IC-${i}`, `Issue ${i}`, DiagnosticSeverity.Warning)
            );
            generator.addW3CIssues(issues);

            const report = generator.generateReport({ maxIssues: 5 });

            expect(report.allIssues).toHaveLength(5);
        });

        test('should track validation duration', () => {
            generator.startValidation('test.tsk');
            const report = generator.generateReport();

            expect(report.metadata.duration).toBeDefined();
            expect(report.metadata.duration).toBeGreaterThanOrEqual(0);
        });

        test('should group results by source', () => {
            generator.startValidation('test.tsk');

            generator.addW3CIssues([ValidationIssueFactory.createW3CIssue('IC-1', 'W3C', DiagnosticSeverity.Error)]);
            generator.addSDTMIssues([ValidationIssueFactory.createSDTMIssue('SDTM issue', DiagnosticSeverity.Warning)]);
            generator.addADaMIssues([ValidationIssueFactory.createADaMIssue('ADaM issue', DiagnosticSeverity.Warning)]);

            const report = generator.generateReport();

            expect(report.results.w3c).toHaveLength(1);
            expect(report.results.sdtm).toHaveLength(1);
            expect(report.results.adam).toHaveLength(1);
            expect(report.results.core).toHaveLength(0);
        });

        test('should reset generator state', () => {
            generator.startValidation('test.tsk');
            generator.addW3CIssues([ValidationIssueFactory.createW3CIssue('IC-1', 'Error', DiagnosticSeverity.Error)]);

            generator.reset();
            generator.startValidation('test2.tsk');
            const report = generator.generateReport();

            expect(report.summary.totalIssues).toBe(0);
        });
    });

    describe('Report Formatters', () => {
        let generator: ReportGenerator;

        beforeEach(() => {
            generator = new ReportGenerator();
            generator.startValidation('test.tsk');
            generator.setVersions({ SDTM: '3.4', ADaM: '1.2' });

            // Add sample issues
            generator.addW3CIssues([
                ValidationIssueFactory.createW3CIssue('IC-1', 'Duplicate cube names', DiagnosticSeverity.Error, 'DM_Cube')
            ]);
            generator.addCOREIssues([
                ValidationIssueFactory.createCOREIssue({
                    ruleId: 'CG0001',
                    severity: DiagnosticSeverity.Warning,
                    message: 'Key variable missing',
                    variable: 'USUBJID'
                })
            ]);
        });

        test('JSONFormatter should produce valid JSON', () => {
            const report = generator.generateReport();
            const formatter = new JSONFormatter();
            const output = formatter.format(report);

            // Should be parseable
            const parsed = JSON.parse(output);
            expect(parsed.summary.totalIssues).toBe(2);
            expect(parsed.metadata.target).toBe('test.tsk');
        });

        test('TextFormatter should produce readable text', () => {
            const report = generator.generateReport();
            const formatter = new TextFormatter();
            const output = formatter.format(report);

            expect(output).toContain('VALIDATION REPORT');
            expect(output).toContain('Target:    test.tsk');
            expect(output).toContain('SDTM: 3.4');
            expect(output).toContain('IC-1');
            expect(output).toContain('CG0001');
        });

        test('MarkdownFormatter should produce markdown', () => {
            const report = generator.generateReport();
            const formatter = new MarkdownFormatter();
            const output = formatter.format(report);

            expect(output).toContain('# Validation Report');
            expect(output).toContain('## Metadata');
            expect(output).toContain('**SDTM:** 3.4');
            expect(output).toContain('### W3C Data Cube');
            expect(output).toContain('### CORE Rules');
        });

        test('FormatterFactory should get formatter by name', () => {
            const jsonFormatter = FormatterFactory.getFormatter('json');
            expect(jsonFormatter).toBeInstanceOf(JSONFormatter);

            const textFormatter = FormatterFactory.getFormatter('text');
            expect(textFormatter).toBeInstanceOf(TextFormatter);

            const mdFormatter = FormatterFactory.getFormatter('markdown');
            expect(mdFormatter).toBeInstanceOf(MarkdownFormatter);
        });

        test('FormatterFactory should throw error for unknown format', () => {
            expect(() => FormatterFactory.getFormatter('unknown')).toThrow('Unknown report format');
        });

        test('FormatterFactory should format using specified format', () => {
            const report = generator.generateReport();
            const output = FormatterFactory.format(report, 'json');

            const parsed = JSON.parse(output);
            expect(parsed.summary).toBeDefined();
        });
    });

    describe('IntegratedValidator', () => {
        let validator: IntegratedValidator;

        beforeEach(() => {
            validator = new IntegratedValidator();
        });

        test('should validate program with W3C and version checks', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4",
                    ADaM: "1.2"
                }

                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier
                        ],
                        measures: []
                    }
                }
            `);

            const report = validator.validateProgram(document.parseResult.value, {
                validateW3C: true,
                validateVersions: true
            });

            expect(report.metadata.target).toBeDefined();
            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.metadata.versions.ADaM).toBe('1.2');
            expect(report.summary).toBeDefined();
        });

        test('should handle program with no standards declaration', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier
                        ],
                        measures: []
                    }
                }
            `);

            const report = validator.validateProgram(document.parseResult.value);

            // Should use default versions
            expect(report.metadata.versions.SDTM).toBe('3.4');
            expect(report.summary).toBeDefined();
        });

        test('should validate with W3C disabled', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [],
                        measures: []
                    }
                }
            `);

            const report = validator.validateProgram(document.parseResult.value, {
                validateW3C: false,
                validateVersions: false
            });

            // Should have minimal issues since most validators are disabled
            expect(report.summary).toBeDefined();
        });
    });

    describe('ValidationIssueFactory', () => {
        test('should create W3C issue', () => {
            const issue = ValidationIssueFactory.createW3CIssue(
                'IC-1',
                'Test message',
                DiagnosticSeverity.Error,
                'TestCube'
            );

            expect(issue.code).toBe('IC-1');
            expect(issue.message).toBe('Test message');
            expect(issue.severity).toBe(DiagnosticSeverity.Error);
            expect(issue.source).toBe('W3C');
            expect(issue.element).toBe('TestCube');
        });

        test('should create SDTM issue', () => {
            const issue = ValidationIssueFactory.createSDTMIssue(
                'Missing variable',
                DiagnosticSeverity.Warning,
                'USUBJID',
                'DM_Cube'
            );

            expect(issue.source).toBe('SDTM');
            expect(issue.variable).toBe('USUBJID');
            expect(issue.element).toBe('DM_Cube');
        });

        test('should create ADaM issue', () => {
            const issue = ValidationIssueFactory.createADaMIssue(
                'Invalid structure',
                DiagnosticSeverity.Error,
                'PARAMCD'
            );

            expect(issue.source).toBe('ADaM');
            expect(issue.variable).toBe('PARAMCD');
        });

        test('should create CORE issue from violation', () => {
            const violation = {
                ruleId: 'CG0010',
                severity: DiagnosticSeverity.Warning,
                message: 'SEX must use controlled terminology',
                variable: 'SEX'
            };

            const issue = ValidationIssueFactory.createCOREIssue(violation);

            expect(issue.code).toBe('CG0010');
            expect(issue.source).toBe('CORE');
            expect(issue.variable).toBe('SEX');
        });

        test('should create version issue from diagnostic', () => {
            const diagnostic = {
                severity: DiagnosticSeverity.Warning,
                message: 'SDTM 3.4 and ADaM 1.0 may have compatibility issues',
                code: 'VERSION-COMPATIBILITY',
                suggestion: 'Use ADaM version 1.2'
            };

            const issue = ValidationIssueFactory.createVersionIssue(diagnostic);

            expect(issue.code).toBe('VERSION-COMPATIBILITY');
            expect(issue.source).toBe('Version');
            expect(issue.suggestion).toBe('Use ADaM version 1.2');
        });
    });
});
