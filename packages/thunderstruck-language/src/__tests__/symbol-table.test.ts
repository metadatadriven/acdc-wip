/**
 * Unit tests for the symbol table.
 *
 * Tests cover:
 * - Scope operations (define, lookup, hierarchy)
 * - Symbol table building from programs
 * - Top-level symbol resolution
 * - Cube component resolution
 * - Duplicate name detection
 * - Type resolution from AST
 */

import { EmptyFileSystem } from 'langium';
import { parseDocument } from 'langium/test';
import { createThunderstruckServices } from '../thunderstruck-module';
import { Program, CubeDefinition } from '../generated/ast';
import { SymbolTable, Scope, Symbol } from '../validation/symbol-table';
import {
    NumericType,
    IntegerType,
    TextType,
    DateTimeType,
    DateType,
    IdentifierType,
    FlagType,
    CubeType,
    CodedValueType,
} from '../types/type-system';

const services = createThunderstruckServices({ ...EmptyFileSystem }).thunderstruck;

async function parseProgram(text: string): Promise<Program> {
    const document = await parseDocument(services, text);
    return document.parseResult.value as Program;
}

describe('Scope', () => {
    it('should create empty scope', () => {
        const scope = new Scope();
        expect(scope.parent).toBeUndefined();
        expect(scope.getAllSymbols()).toHaveLength(0);
    });

    it('should create scope with parent', () => {
        const parent = new Scope();
        const child = new Scope(parent);
        expect(child.parent).toBe(parent);
    });

    it('should define and lookup symbols', () => {
        const scope = new Scope();
        const symbol: Symbol = {
            name: 'test',
            type: new IntegerType(),
            kind: 'cube',
            node: {} as any,
            scope,
        };

        const error = scope.define(symbol);
        expect(error).toBeUndefined();

        const found = scope.lookup('test');
        expect(found).toBe(symbol);
    });

    it('should reject duplicate names', () => {
        const scope = new Scope();
        const symbol1: Symbol = {
            name: 'test',
            type: new IntegerType(),
            kind: 'cube',
            node: {} as any,
            scope,
        };
        const symbol2: Symbol = {
            name: 'test',
            type: new TextType(),
            kind: 'model',
            node: {} as any,
            scope,
        };

        scope.define(symbol1);
        const error = scope.define(symbol2);
        expect(error).toContain('already defined');
    });

    it('should lookup in parent scope', () => {
        const parent = new Scope();
        const child = new Scope(parent);

        const parentSymbol: Symbol = {
            name: 'parent',
            type: new IntegerType(),
            kind: 'cube',
            node: {} as any,
            scope: parent,
        };
        parent.define(parentSymbol);

        const found = child.lookupInHierarchy('parent');
        expect(found).toBe(parentSymbol);
    });

    it('should not find undefined symbols', () => {
        const scope = new Scope();
        const found = scope.lookup('missing');
        expect(found).toBeUndefined();
    });

    it('should get all symbols', () => {
        const scope = new Scope();
        const symbol1: Symbol = {
            name: 'a',
            type: new IntegerType(),
            kind: 'cube',
            node: {} as any,
            scope,
        };
        const symbol2: Symbol = {
            name: 'b',
            type: new TextType(),
            kind: 'model',
            node: {} as any,
            scope,
        };

        scope.define(symbol1);
        scope.define(symbol2);

        const symbols = scope.getAllSymbols();
        expect(symbols).toHaveLength(2);
        expect(symbols).toContain(symbol1);
        expect(symbols).toContain(symbol2);
    });

    it('should get all symbol names', () => {
        const scope = new Scope();
        scope.define({
            name: 'a',
            type: new IntegerType(),
            kind: 'cube',
            node: {} as any,
            scope,
        });
        scope.define({
            name: 'b',
            type: new TextType(),
            kind: 'model',
            node: {} as any,
            scope,
        });

        const names = scope.getAllNames();
        expect(names).toHaveLength(2);
        expect(names).toContain('a');
        expect(names).toContain('b');
    });
});

describe('Symbol Table', () => {
    describe('Building from Program', () => {
        it('should build symbol table from simple cube', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(false);

            // Check cube symbol
            const cubeSymbol = symbolTable.resolveGlobal('TestCube');
            expect(cubeSymbol).toBeDefined();
            expect(cubeSymbol?.kind).toBe('cube');
            expect(cubeSymbol?.type).toBeInstanceOf(CubeType);

            const cubeType = cubeSymbol?.type as CubeType;
            expect(cubeType.name).toBe('TestCube');
            expect(cubeType.dimensions.size).toBe(1);
            expect(cubeType.measures.size).toBe(1);
        });

        it('should resolve all primitive types', async () => {
            const program = await parseProgram(`
                cube AllTypes {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [
                            ID: Identifier,
                            NAME: Text
                        ],
                        measures: [
                            COUNT: Integer,
                            VALUE: Numeric,
                            CHANGE: Numeric unit: "kg",
                            TIMESTAMP: DateTime,
                            BIRTHDATE: Date
                        ],
                        attributes: [
                            FLAG: Flag
                        ]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(false);

            const cubeSymbol = symbolTable.resolveGlobal('AllTypes');
            const cubeType = cubeSymbol?.type as CubeType;

            expect(cubeType.dimensions.get('ID')).toBeInstanceOf(IdentifierType);
            expect(cubeType.dimensions.get('NAME')).toBeInstanceOf(TextType);
            expect(cubeType.measures.get('COUNT')).toBeInstanceOf(IntegerType);
            expect(cubeType.measures.get('VALUE')).toBeInstanceOf(NumericType);
            expect(cubeType.measures.get('TIMESTAMP')).toBeInstanceOf(DateTimeType);
            expect(cubeType.measures.get('BIRTHDATE')).toBeInstanceOf(DateType);
            expect(cubeType.attributes.get('FLAG')).toBeInstanceOf(FlagType);

            // Check unit
            const changeType = cubeType.measures.get('CHANGE') as NumericType;
            expect(changeType.getUnit()).toBe('kg');
        });

        it('should resolve coded value types', async () => {
            const program = await parseProgram(`
                cube WithCodedValues {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [
                            ID: Identifier,
                            TREATMENT: CodedValue<CDISC.CT.TRT01A>
                        ],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(false);

            const cubeSymbol = symbolTable.resolveGlobal('WithCodedValues');
            const cubeType = cubeSymbol?.type as CubeType;

            const treatmentType = cubeType.dimensions.get('TREATMENT');
            expect(treatmentType).toBeInstanceOf(CodedValueType);
            expect((treatmentType as CodedValueType).getCodeList()).toBe('CDISC.CT.TRT01A');
        });

        it('should build symbol table with multiple cubes', async () => {
            const program = await parseProgram(`
                cube Cube1 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube Cube2 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [COUNT: Integer]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(false);

            const cube1 = symbolTable.resolveGlobal('Cube1');
            const cube2 = symbolTable.resolveGlobal('Cube2');

            expect(cube1).toBeDefined();
            expect(cube2).toBeDefined();
            expect(cube1?.kind).toBe('cube');
            expect(cube2?.kind).toBe('cube');
        });

        it('should detect duplicate cube names', async () => {
            const program = await parseProgram(`
                cube Duplicate {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube Duplicate {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [COUNT: Integer]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(true);
            const errors = symbolTable.getErrors();
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0]).toContain('already defined');
        });

        it('should detect duplicate component names in cube', async () => {
            const program = await parseProgram(`
                cube WithDuplicates {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [ID: Numeric]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            expect(symbolTable.hasErrors()).toBe(true);
            const errors = symbolTable.getErrors();
            expect(errors.some(e => e.includes('already defined'))).toBe(true);
        });
    });

    describe('Cube Scopes', () => {
        it('should create scope for cube with components', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier, NAME: Text],
                        measures: [VALUE: Numeric, COUNT: Integer],
                        attributes: [FLAG: Flag]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const cubeNode = program.elements[0] as CubeDefinition;
            const cubeScope = symbolTable.getScope(cubeNode);

            expect(cubeScope).toBeDefined();
            expect(cubeScope?.getAllNames()).toHaveLength(5);
            expect(cubeScope?.getAllNames()).toContain('ID');
            expect(cubeScope?.getAllNames()).toContain('NAME');
            expect(cubeScope?.getAllNames()).toContain('VALUE');
            expect(cubeScope?.getAllNames()).toContain('COUNT');
            expect(cubeScope?.getAllNames()).toContain('FLAG');
        });

        it('should resolve components within cube scope', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric],
                        attributes: [LABEL: Text]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const cubeNode = program.elements[0] as CubeDefinition;
            const cubeScope = symbolTable.getScope(cubeNode);

            const idSymbol = cubeScope?.lookup('ID');
            expect(idSymbol?.kind).toBe('dimension');
            expect(idSymbol?.type).toBeInstanceOf(IdentifierType);

            const valueSymbol = cubeScope?.lookup('VALUE');
            expect(valueSymbol?.kind).toBe('measure');
            expect(valueSymbol?.type).toBeInstanceOf(NumericType);

            const labelSymbol = cubeScope?.lookup('LABEL');
            expect(labelSymbol?.kind).toBe('attribute');
            expect(labelSymbol?.type).toBeInstanceOf(TextType);
        });

        it('cube scope should have access to global scope', async () => {
            const program = await parseProgram(`
                cube Cube1 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                cube Cube2 {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [COUNT: Integer]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const cube2Node = program.elements[1] as CubeDefinition;
            const cube2Scope = symbolTable.getScope(cube2Node);

            // Should be able to resolve Cube1 from Cube2's scope
            const cube1Symbol = cube2Scope?.lookupInHierarchy('Cube1');
            expect(cube1Symbol).toBeDefined();
            expect(cube1Symbol?.kind).toBe('cube');
        });
    });

    describe('Top-level Definitions', () => {
        it('should collect slice definitions', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }

                slice TestSlice from TestCube {
                    vary: [ID]
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const sliceSymbol = symbolTable.resolveGlobal('TestSlice');
            expect(sliceSymbol).toBeDefined();
            expect(sliceSymbol?.kind).toBe('slice');
        });

        it('should collect model definitions', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [Y: Numeric, X: Numeric]
                    }
                }

                model TestModel {
                    input: TestCube,
                    formula: Y ~ X
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const modelSymbol = symbolTable.resolveGlobal('TestModel');
            expect(modelSymbol).toBeDefined();
            expect(modelSymbol?.kind).toBe('model');
        });
    });

    describe('Resolution', () => {
        it('should resolve from global scope', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolve('TestCube', symbolTable.globalScope);
            expect(symbol).toBeDefined();
            expect(symbol?.name).toBe('TestCube');
        });

        it('should not resolve missing symbols', async () => {
            const program = await parseProgram(`
                cube TestCube {
                    namespace: "http://example.org#",
                    structure: {
                        dimensions: [ID: Identifier],
                        measures: [VALUE: Numeric]
                    }
                }
            `);

            const symbolTable = new SymbolTable();
            symbolTable.buildFromProgram(program);

            const symbol = symbolTable.resolveGlobal('MissingCube');
            expect(symbol).toBeUndefined();
        });
    });
});
