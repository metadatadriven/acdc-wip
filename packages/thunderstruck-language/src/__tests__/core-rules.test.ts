/**
 * Tests for CDISC CORE Rules Engine
 *
 * Tests rule checkers and CORE rules validation.
 */

import { describe, test, expect } from '@jest/globals';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module.js';
import type { Program, CubeDefinition } from '../generated/ast.js';
import { CDISCValidator } from '../validation/cdisc/cdisc-validator.js';
import { DiagnosticSeverity } from '../types/type-checker.js';

const services = createThunderstruckServices(EmptyFileSystem);
const parse = parseHelper<Program>(services.thunderstruck);

describe('CDISC CORE Rules Engine', () => {
    describe('NoDuplicateKeyChecker', () => {
        test('should pass when all key variables are present', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const keyViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0001'
            );
            expect(keyViolations).toHaveLength(0);
        });

        test('should error when key variables are missing', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const keyViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0001'
            );
            expect(keyViolations.length).toBeGreaterThan(0);
            expect(keyViolations.some(v => v.variable === 'USUBJID')).toBe(true);
            expect(keyViolations.some(v => v.variable === 'DOMAIN')).toBe(true);
        });
    });

    describe('ISO8601DateChecker', () => {
        test('should pass when date variables use DateTime type', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            RFSTDTC: DateTime,
                            RFENDTC: DateTime
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const dateViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0002'
            );
            expect(dateViolations).toHaveLength(0);
        });

        test('should warn when date variables use Text type', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            RFSTDTC: Text
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const dateViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0002' && v.variable === 'RFSTDTC'
            );
            expect(dateViolations.length).toBeGreaterThan(0);
            expect(dateViolations[0].severity).toBe(DiagnosticSeverity.Warning);
        });
    });

    describe('DateTimeOrderChecker', () => {
        test('should pass when both start and end dates are present with DateTime type', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            RFSTDTC: DateTime,
                            RFENDTC: DateTime
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const orderViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0003'
            );
            expect(orderViolations).toHaveLength(0);
        });

        test('should warn when end date is missing', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            RFSTDTC: DateTime
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const orderViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0003' && v.variable === 'RFENDTC'
            );
            expect(orderViolations.length).toBeGreaterThan(0);
        });
    });

    describe('RequiredIfChecker', () => {
        test('should pass when both condition and required variables are present', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text
                        ],
                        measures: [
                            AGE: Integer
                        ],
                        attributes: [
                            AGEU: CodedValue<AGEU>
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const requiredIfViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0011'
            );
            expect(requiredIfViolations).toHaveLength(0);
        });

        test('should warn when condition is present but required variable is missing', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const requiredIfViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0011' && v.variable === 'AGEU'
            );
            expect(requiredIfViolations.length).toBeGreaterThan(0);
            expect(requiredIfViolations[0].message).toContain('required when');
        });
    });

    describe('ValueInCodeListChecker', () => {
        test('should pass when CodedValue uses correct code list', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            SEX: CodedValue<SEX>
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const codeListViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0010' && v.variable === 'SEX'
            );
            expect(codeListViolations).toHaveLength(0);
        });

        test('should warn when CodedValue uses wrong code list', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            SEX: CodedValue<WRONGLIST>
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const codeListViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0010' && v.variable === 'SEX'
            );
            expect(codeListViolations.length).toBeGreaterThan(0);
            expect(codeListViolations[0].message).toContain('WRONGLIST');
            expect(codeListViolations[0].message).toContain('SEX');
        });

        test('should warn when variable is not CodedValue', async () => {
            const document = await parse(`
                cube DM_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            SEX: Text
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'DM');

            const codeListViolations = result.coreViolations.filter(v =>
                v.ruleId === 'CG0010' && v.variable === 'SEX'
            );
            expect(codeListViolations.length).toBeGreaterThan(0);
            expect(codeListViolations[0].message).toContain('should be CodedValue');
        });
    });

    describe('ADaM CORE Rules', () => {
        test('should validate ADSL with all key variables', async () => {
            const document = await parse(`
                cube ADSL_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            SUBJID: Identifier
                        ],
                        measures: [
                            AGE: Integer
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateADaMWithCORE(cube, 'ADSL');

            const keyViolations = result.coreViolations.filter(v =>
                v.ruleId === 'AG0002'
            );
            expect(keyViolations).toHaveLength(0);
        });

        test('should validate BDS with required parameters', async () => {
            const document = await parse(`
                cube BDS_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            PARAMCD: Text,
                            AVISIT: Text
                        ],
                        measures: [
                            AVAL: Numeric
                        ],
                        attributes: [
                            PARAM: Text,
                            AVISITN: Numeric
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateADaMWithCORE(cube, 'BDS');

            const keyViolations = result.coreViolations.filter(v =>
                v.ruleId === 'AG0010'
            );
            const paramViolations = result.coreViolations.filter(v =>
                v.ruleId === 'AG0011'
            );

            expect(keyViolations).toHaveLength(0);
            expect(paramViolations).toHaveLength(0);
        });
    });

    describe('AE Domain CORE Rules', () => {
        test('should validate AE domain with all required elements', async () => {
            const document = await parse(`
                cube AE_Cube {
                    structure: {
                        dimensions: [
                            STUDYID: Identifier,
                            USUBJID: Identifier,
                            DOMAIN: Text,
                            AESEQ: Integer,
                            AESTDTC: DateTime,
                            AEENDTC: DateTime
                        ],
                        measures: [
                            AETERM: Text
                        ],
                        attributes: [
                            AESEV: CodedValue<AESEV>,
                            AESER: CodedValue<NY>
                        ]
                    }
                }
            `);

            const cube = document.parseResult.value.elements[0] as CubeDefinition;
            const validator = new CDISCValidator();
            const result = validator.validateSDTMWithCORE(cube, 'AE');

            // Should have no violations for properly configured AE cube
            const keyViolations = result.coreViolations.filter(v => v.ruleId === 'CG0020');
            const dateViolations = result.coreViolations.filter(v => v.ruleId === 'CG0021');
            const orderViolations = result.coreViolations.filter(v => v.ruleId === 'CG0022');

            expect(keyViolations).toHaveLength(0);
            expect(dateViolations).toHaveLength(0);
            expect(orderViolations).toHaveLength(0);
        });
    });

    describe('CORE Rules Engine Integration', () => {
        test('should load all SDTM and ADaM CORE rules', () => {
            const validator = new CDISCValidator();
            const engine = validator.getCOREEngine();
            const rules = engine.getRules();

            expect(rules.length).toBeGreaterThan(20); // Should have 16 SDTM + 15 ADaM rules
        });

        test('should get domain-specific rules', () => {
            const validator = new CDISCValidator();
            const engine = validator.getCOREEngine();

            const dmRules = engine.getRulesForDomain('DM');
            const aeRules = engine.getRulesForDomain('AE');
            const adslRules = engine.getRulesForDomain('ADSL');

            expect(dmRules.length).toBeGreaterThan(0);
            expect(aeRules.length).toBeGreaterThan(0);
            expect(adslRules.length).toBeGreaterThan(0);

            // DM-specific rules should not appear in AE rules
            const dmSpecificInAE = aeRules.some(r => r.appliesTo?.includes('DM'));
            expect(dmSpecificInAE).toBe(false);
        });
    });
});
