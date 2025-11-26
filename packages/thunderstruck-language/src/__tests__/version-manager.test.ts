/**
 * Tests for Version Manager
 *
 * Tests version management, declaration parsing, and compatibility checking.
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program } from '../generated/ast.js';
import { VersionManager } from '../validation/cdisc/version-manager.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices(EmptyFileSystem);
const parse = parseHelper<Program>(services.thunderstruck);

describe('Version Manager', () => {
    let versionManager: VersionManager;

    beforeEach(() => {
        versionManager = new VersionManager();
    });

    describe('Default Versions', () => {
        test('should provide default versions when not declared', () => {
            const sdtmVersion = versionManager.getVersion('SDTM');
            const adamVersion = versionManager.getVersion('ADaM');
            const ctVersion = versionManager.getVersion('CDISC_CT');
            const w3cVersion = versionManager.getVersion('W3C_Cube');

            expect(sdtmVersion).toBe('3.4');
            expect(adamVersion).toBe('1.2');
            expect(ctVersion).toBe('2024-09-27');
            expect(w3cVersion).toBe('2014-01-16');
        });

        test('should report versions as not declared when using defaults', () => {
            expect(versionManager.isDeclared('SDTM')).toBe(false);
            expect(versionManager.isDeclared('ADaM')).toBe(false);
            expect(versionManager.isDeclared('CDISC_CT')).toBe(false);
            expect(versionManager.isDeclared('W3C_Cube')).toBe(false);
        });
    });

    describe('Standards Declaration Parsing', () => {
        test('should parse single standards declaration', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            expect(versionManager.getVersion('SDTM')).toBe('3.4');
            expect(versionManager.isDeclared('SDTM')).toBe(true);
        });

        test('should parse multiple standards in one declaration', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4",
                    ADaM: "1.2",
                    CDISC_CT: "2024-09-27"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            expect(versionManager.getVersion('SDTM')).toBe('3.4');
            expect(versionManager.getVersion('ADaM')).toBe('1.2');
            expect(versionManager.getVersion('CDISC_CT')).toBe('2024-09-27');
            expect(versionManager.isDeclared('SDTM')).toBe(true);
            expect(versionManager.isDeclared('ADaM')).toBe(true);
            expect(versionManager.isDeclared('CDISC_CT')).toBe(true);
        });

        test('should handle multiple standards declarations', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4"
                }

                standards {
                    ADaM: "1.2"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            expect(versionManager.getVersion('SDTM')).toBe('3.4');
            expect(versionManager.getVersion('ADaM')).toBe('1.2');
        });

        test('should use last declaration when standard is declared multiple times', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.3"
                }

                standards {
                    SDTM: "3.4"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            expect(versionManager.getVersion('SDTM')).toBe('3.4');
        });
    });

    describe('Effective Versions', () => {
        test('should return all effective versions (declared + defaults)', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.3"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const effective = versionManager.getEffectiveVersions();

            expect(effective.SDTM).toBe('3.3'); // declared
            expect(effective.ADaM).toBe('1.2'); // default
            expect(effective.CDISC_CT).toBe('2024-09-27'); // default
            expect(effective.W3C_Cube).toBe('2014-01-16'); // default
        });

        test('should return only declared versions', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.3",
                    ADaM: "1.1"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const declared = versionManager.getDeclaredVersions();

            expect(declared.SDTM).toBe('3.3');
            expect(declared.ADaM).toBe('1.1');
            expect(declared.CDISC_CT).toBeUndefined();
            expect(declared.W3C_Cube).toBeUndefined();
        });
    });

    describe('Version Validation', () => {
        test('should accept supported versions', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4",
                    ADaM: "1.2"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            expect(diagnostics).toHaveLength(0);
        });

        test('should warn about unsupported SDTM version', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.5"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            expect(diagnostics.length).toBeGreaterThan(0);
            const sdtmWarning = diagnostics.find(d => d.code === 'VERSION-UNSUPPORTED' && d.message.includes('SDTM'));
            expect(sdtmWarning).toBeDefined();
            expect(sdtmWarning?.severity).toBe(DiagnosticSeverity.Warning);
        });

        test('should warn about unsupported ADaM version', async () => {
            const document = await parse(`
                standards {
                    ADaM: "2.0"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            expect(diagnostics.length).toBeGreaterThan(0);
            const adamWarning = diagnostics.find(d => d.code === 'VERSION-UNSUPPORTED' && d.message.includes('ADaM'));
            expect(adamWarning).toBeDefined();
        });
    });

    describe('Version Compatibility', () => {
        test('should accept compatible SDTM and ADaM versions', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4",
                    ADaM: "1.2"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            const compatWarnings = diagnostics.filter(d => d.code === 'VERSION-COMPATIBILITY');
            expect(compatWarnings).toHaveLength(0);
        });

        test('should warn about incompatible SDTM and ADaM versions', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4",
                    ADaM: "1.0"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            const compatWarning = diagnostics.find(d => d.code === 'VERSION-COMPATIBILITY');
            expect(compatWarning).toBeDefined();
            expect(compatWarning?.severity).toBe(DiagnosticSeverity.Warning);
            expect(compatWarning?.message).toContain('compatibility issues');
        });

        test('should not check compatibility when using defaults', () => {
            // No standards declaration - using all defaults
            const diagnostics = versionManager.validateVersions();

            const compatWarnings = diagnostics.filter(d => d.code === 'VERSION-COMPATIBILITY');
            expect(compatWarnings).toHaveLength(0);
        });

        test('should not check compatibility when only one is declared', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.4"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            const diagnostics = versionManager.validateVersions();

            const compatWarnings = diagnostics.filter(d => d.code === 'VERSION-COMPATIBILITY');
            expect(compatWarnings).toHaveLength(0);
        });
    });

    describe('Version Support Queries', () => {
        test('should correctly identify supported versions', () => {
            expect(versionManager.isVersionSupported('SDTM', '3.4')).toBe(true);
            expect(versionManager.isVersionSupported('SDTM', '3.3')).toBe(true);
            expect(versionManager.isVersionSupported('SDTM', '3.2')).toBe(true);
            expect(versionManager.isVersionSupported('SDTM', '3.5')).toBe(false);

            expect(versionManager.isVersionSupported('ADaM', '1.2')).toBe(true);
            expect(versionManager.isVersionSupported('ADaM', '1.1')).toBe(true);
            expect(versionManager.isVersionSupported('ADaM', '2.0')).toBe(false);
        });

        test('should return list of supported versions', () => {
            const sdtmVersions = versionManager.getSupportedVersions('SDTM');
            expect(sdtmVersions).toContain('3.4');
            expect(sdtmVersions).toContain('3.3');
            expect(sdtmVersions).toContain('3.2');

            const adamVersions = versionManager.getSupportedVersions('ADaM');
            expect(adamVersions).toContain('1.2');
            expect(adamVersions).toContain('1.1');
            expect(adamVersions).toContain('1.0');
        });
    });

    describe('Integration with Program', () => {
        test('should work with complete program including cubes', async () => {
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
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);

            expect(versionManager.getVersion('SDTM')).toBe('3.4');
            expect(versionManager.getVersion('ADaM')).toBe('1.2');
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

            versionManager.loadFromProgram(document.parseResult.value);

            // Should use defaults
            expect(versionManager.getVersion('SDTM')).toBe('3.4');
            expect(versionManager.isDeclared('SDTM')).toBe(false);
        });
    });

    describe('Reset Functionality', () => {
        test('should reset to defaults after loading declarations', async () => {
            const document = await parse(`
                standards {
                    SDTM: "3.3"
                }
            `);

            versionManager.loadFromProgram(document.parseResult.value);
            expect(versionManager.getVersion('SDTM')).toBe('3.3');
            expect(versionManager.isDeclared('SDTM')).toBe(true);

            versionManager.reset();

            expect(versionManager.getVersion('SDTM')).toBe('3.4'); // default
            expect(versionManager.isDeclared('SDTM')).toBe(false);
        });
    });
});
