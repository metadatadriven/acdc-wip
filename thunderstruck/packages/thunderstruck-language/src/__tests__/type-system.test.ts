/**
 * Unit tests for the Thunderstruck type system.
 *
 * Tests cover:
 * - Type creation and equality
 * - Type assignability (subtyping rules)
 * - Unit compatibility
 * - CodedValue compatibility
 * - Cube type operations
 */

import {
    Type,
    NumericType,
    IntegerType,
    TextType,
    DateTimeType,
    DateType,
    FlagType,
    IdentifierType,
    CodedValueType,
    CubeType,
    UnknownType,
    ErrorType,
} from '../types/type-system';
import { UnitChecker } from '../types/unit-checker';

describe('Type System', () => {
    describe('Primitive Types', () => {
        describe('NumericType', () => {
            it('should create numeric type without unit', () => {
                const type = new NumericType();
                expect(type.toString()).toBe('Numeric');
                expect(type.getUnit()).toBeUndefined();
            });

            it('should create numeric type with unit', () => {
                const type = new NumericType('mmHg');
                expect(type.toString()).toBe('Numeric unit: "mmHg"');
                expect(type.getUnit()).toBe('mmHg');
            });

            it('should check equality based on unit', () => {
                const type1 = new NumericType();
                const type2 = new NumericType();
                const type3 = new NumericType('kg');
                const type4 = new NumericType('kg');

                expect(type1.equals(type2)).toBe(true);
                expect(type3.equals(type4)).toBe(true);
                expect(type1.equals(type3)).toBe(false);
            });

            it('should be assignable to same numeric type', () => {
                const type1 = new NumericType();
                const type2 = new NumericType();
                expect(type1.isAssignableTo(type2)).toBe(true);
            });

            it('should check unit compatibility for assignment', () => {
                const withoutUnit = new NumericType();
                const withKg = new NumericType('kg');
                const withLb = new NumericType('lb');

                expect(withoutUnit.isAssignableTo(withoutUnit)).toBe(true);
                expect(withKg.isAssignableTo(withKg)).toBe(true);
                expect(withKg.isAssignableTo(withLb)).toBe(false);
                expect(withKg.isAssignableTo(withoutUnit)).toBe(false);
            });
        });

        describe('IntegerType', () => {
            it('should create integer type', () => {
                const type = new IntegerType();
                expect(type.toString()).toBe('Integer');
            });

            it('should be assignable to Numeric', () => {
                const intType = new IntegerType();
                const numType = new NumericType();
                expect(intType.isAssignableTo(numType)).toBe(true);
            });

            it('should not be assignable to Numeric with unit', () => {
                const intType = new IntegerType();
                const numWithUnit = new NumericType('kg');
                expect(intType.isAssignableTo(numWithUnit)).toBe(false);
            });

            it('should be assignable to Integer', () => {
                const type1 = new IntegerType();
                const type2 = new IntegerType();
                expect(type1.isAssignableTo(type2)).toBe(true);
            });
        });

        describe('TextType', () => {
            it('should create text type', () => {
                const type = new TextType();
                expect(type.toString()).toBe('Text');
            });

            it('should only be assignable to Text', () => {
                const textType = new TextType();
                const numType = new NumericType();
                expect(textType.isAssignableTo(textType)).toBe(true);
                expect(textType.isAssignableTo(numType)).toBe(false);
            });
        });

        describe('DateType and DateTimeType', () => {
            it('should create date types', () => {
                const dateType = new DateType();
                const dateTimeType = new DateTimeType();
                expect(dateType.toString()).toBe('Date');
                expect(dateTimeType.toString()).toBe('DateTime');
            });

            it('Date should be assignable to DateTime', () => {
                const dateType = new DateType();
                const dateTimeType = new DateTimeType();
                expect(dateType.isAssignableTo(dateTimeType)).toBe(true);
            });

            it('DateTime should not be assignable to Date', () => {
                const dateType = new DateType();
                const dateTimeType = new DateTimeType();
                expect(dateTimeType.isAssignableTo(dateType)).toBe(false);
            });
        });

        describe('FlagType', () => {
            it('should create flag type', () => {
                const type = new FlagType();
                expect(type.toString()).toBe('Flag');
            });
        });

        describe('IdentifierType', () => {
            it('should create identifier type', () => {
                const type = new IdentifierType();
                expect(type.toString()).toBe('Identifier');
            });
        });
    });

    describe('CodedValueType', () => {
        it('should create coded value without code list', () => {
            const type = new CodedValueType();
            expect(type.toString()).toBe('CodedValue');
            expect(type.getCodeList()).toBeUndefined();
        });

        it('should create coded value with code list', () => {
            const type = new CodedValueType('CDISC.CT.TRT01A');
            expect(type.toString()).toBe('CodedValue<CDISC.CT.TRT01A>');
            expect(type.getCodeList()).toBe('CDISC.CT.TRT01A');
        });

        it('specific code list should be assignable to general CodedValue', () => {
            const specific = new CodedValueType('CDISC.CT.TRT01A');
            const general = new CodedValueType();
            expect(specific.isAssignableTo(general)).toBe(true);
        });

        it('general CodedValue should not be assignable to specific', () => {
            const specific = new CodedValueType('CDISC.CT.TRT01A');
            const general = new CodedValueType();
            expect(general.isAssignableTo(specific)).toBe(false);
        });

        it('same code list should be assignable', () => {
            const type1 = new CodedValueType('CDISC.CT.TRT01A');
            const type2 = new CodedValueType('CDISC.CT.TRT01A');
            expect(type1.isAssignableTo(type2)).toBe(true);
        });

        it('different code lists should not be assignable', () => {
            const type1 = new CodedValueType('CDISC.CT.TRT01A');
            const type2 = new CodedValueType('CDISC.CT.TRT01P');
            expect(type1.isAssignableTo(type2)).toBe(false);
        });
    });

    describe('CubeType', () => {
        it('should create cube with components', () => {
            const dimensions = new Map([
                ['USUBJID', new IdentifierType()],
                ['VISIT', new TextType()],
            ]);
            const measures = new Map([
                ['AVAL', new NumericType('mmHg')],
                ['CHG', new NumericType('mmHg')],
            ]);
            const attributes = new Map([
                ['PARAM', new TextType()],
            ]);

            const cube = new CubeType('ADVS', dimensions, measures, attributes);

            expect(cube.toString()).toBe('Cube<ADVS>');
            expect(cube.name).toBe('ADVS');
            expect(cube.dimensions.size).toBe(2);
            expect(cube.measures.size).toBe(2);
            expect(cube.attributes.size).toBe(1);
        });

        it('should get component by name', () => {
            const dimensions = new Map([['USUBJID', new IdentifierType()]]);
            const measures = new Map([['AVAL', new NumericType()]]);
            const attributes = new Map([['PARAM', new TextType()]]);

            const cube = new CubeType('Test', dimensions, measures, attributes);

            expect(cube.getComponent('USUBJID')).toBeInstanceOf(IdentifierType);
            expect(cube.getComponent('AVAL')).toBeInstanceOf(NumericType);
            expect(cube.getComponent('PARAM')).toBeInstanceOf(TextType);
            expect(cube.getComponent('MISSING')).toBeUndefined();
        });

        it('should check if component exists', () => {
            const dimensions = new Map([['USUBJID', new IdentifierType()]]);
            const measures = new Map([['AVAL', new NumericType()]]);
            const attributes = new Map<string, Type>();

            const cube = new CubeType('Test', dimensions, measures, attributes);

            expect(cube.hasComponent('USUBJID')).toBe(true);
            expect(cube.hasComponent('AVAL')).toBe(true);
            expect(cube.hasComponent('MISSING')).toBe(false);
        });

        it('cubes with same name should be assignable', () => {
            const cube1 = new CubeType(
                'ADVS',
                new Map([['ID', new IdentifierType()]]),
                new Map([['VAL', new NumericType()]]),
                new Map()
            );
            const cube2 = new CubeType(
                'ADVS',
                new Map([['ID', new IdentifierType()]]),
                new Map([['VAL', new NumericType()]]),
                new Map()
            );

            expect(cube1.isAssignableTo(cube2)).toBe(true);
        });

        it('cubes with different names should not be assignable', () => {
            const cube1 = new CubeType(
                'ADVS',
                new Map([['ID', new IdentifierType()]]),
                new Map([['VAL', new NumericType()]]),
                new Map()
            );
            const cube2 = new CubeType(
                'ADAE',
                new Map([['ID', new IdentifierType()]]),
                new Map([['VAL', new NumericType()]]),
                new Map()
            );

            expect(cube1.isAssignableTo(cube2)).toBe(false);
        });
    });

    describe('ErrorType and UnknownType', () => {
        it('ErrorType should be assignable to anything', () => {
            const errorType = new ErrorType('test error');
            const numType = new NumericType();
            const textType = new TextType();

            expect(errorType.isAssignableTo(numType)).toBe(true);
            expect(errorType.isAssignableTo(textType)).toBe(true);
        });

        it('ErrorType should include message', () => {
            const error1 = new ErrorType('test error');
            const error2 = new ErrorType();

            expect(error1.toString()).toBe('Error(test error)');
            expect(error2.toString()).toBe('Error');
        });

        it('UnknownType should be assignable to anything', () => {
            const unknownType = new UnknownType();
            const numType = new NumericType();
            const textType = new TextType();

            expect(unknownType.isAssignableTo(numType)).toBe(true);
            expect(unknownType.isAssignableTo(textType)).toBe(true);
        });

        it('types should be assignable to ErrorType and UnknownType', () => {
            const numType = new NumericType();
            const errorType = new ErrorType();
            const unknownType = new UnknownType();

            expect(numType.isAssignableTo(errorType)).toBe(true);
            expect(numType.isAssignableTo(unknownType)).toBe(true);
        });
    });
});

describe('Unit Checker', () => {
    let checker: UnitChecker;

    beforeEach(() => {
        checker = new UnitChecker();
    });

    describe('areCompatible', () => {
        it('should consider same units compatible', () => {
            expect(checker.areCompatible('kg', 'kg')).toBe(true);
            expect(checker.areCompatible('mmHg', 'mmHg')).toBe(true);
        });

        it('should consider different units incompatible', () => {
            expect(checker.areCompatible('kg', 'lb')).toBe(false);
            expect(checker.areCompatible('mmHg', 'kPa')).toBe(false);
        });

        it('should consider both undefined as compatible', () => {
            expect(checker.areCompatible(undefined, undefined)).toBe(true);
        });

        it('should consider one undefined and one defined as incompatible', () => {
            expect(checker.areCompatible('kg', undefined)).toBe(false);
            expect(checker.areCompatible(undefined, 'kg')).toBe(false);
        });

        it('should be case-sensitive', () => {
            expect(checker.areCompatible('kg', 'KG')).toBe(false);
            expect(checker.areCompatible('kg', 'Kg')).toBe(false);
        });
    });

    describe('isValid', () => {
        it('should validate non-empty strings', () => {
            expect(checker.isValid('kg')).toBe(true);
            expect(checker.isValid('mmHg')).toBe(true);
            expect(checker.isValid('m/s')).toBe(true);
        });

        it('should reject empty strings', () => {
            expect(checker.isValid('')).toBe(false);
            expect(checker.isValid('   ')).toBe(false);
        });
    });

    describe('normalize', () => {
        it('should trim whitespace', () => {
            expect(checker.normalize('  kg  ')).toBe('kg');
            expect(checker.normalize('mmHg ')).toBe('mmHg');
        });

        it('should preserve the unit string', () => {
            expect(checker.normalize('kg')).toBe('kg');
            expect(checker.normalize('m/s^2')).toBe('m/s^2');
        });
    });

    describe('getIncompatibilityMessage', () => {
        it('should generate message for missing source unit', () => {
            const msg = checker.getIncompatibilityMessage(undefined, 'kg', 'assignment');
            expect(msg).toContain('no unit');
            expect(msg).toContain('kg');
        });

        it('should generate message for missing target unit', () => {
            const msg = checker.getIncompatibilityMessage('kg', undefined, 'assignment');
            expect(msg).toContain('kg');
            expect(msg).toContain('no unit');
        });

        it('should generate message for incompatible units', () => {
            const msg = checker.getIncompatibilityMessage('kg', 'lb', 'assignment');
            expect(msg).toContain('kg');
            expect(msg).toContain('lb');
            expect(msg).toContain('incompatible');
        });
    });
});
