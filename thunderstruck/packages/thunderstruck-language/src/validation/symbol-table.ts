/**
 * Symbol Table for Thunderstruck Language
 *
 * Provides symbol resolution and scoping for type checking and validation.
 *
 * Design decision (Q3): Two-pass resolution
 * - First pass: Collect all top-level definitions
 * - Second pass: Resolve types and references
 *
 * Design decision (Q8): Scoping rules
 * - Global scope: All top-level definitions (cubes, concepts, slices, models, etc.)
 * - Cube scope: Dimensions, measures, attributes visible only within cube
 * - Formula scope: Can reference dimensions/measures from input cube
 * - Expression scope: Can reference dimensions/measures/attributes from containing construct
 * - No shadowing allowed: all names must be unique in their scope
 */

import { AstNode } from 'langium';
import {
    Program,
    ProgramElement,
    CubeDefinition,
    ConceptDefinition,
    SliceDefinition,
    DeriveDefinition,
    ModelDefinition,
    AggregateDefinition,
    DisplayDefinition,
    Component,
    TypeReference,
    PrimitiveType,
    CodedValueType as AstCodedValueType,
    IdentifierType as AstIdentifierType,
} from '../generated/ast.js';
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
    ErrorType,
} from '../types/type-system.js';

/**
 * Symbol kind - represents what kind of entity the symbol is.
 */
export type SymbolKind =
    | 'cube'
    | 'concept'
    | 'slice'
    | 'model'
    | 'derive'
    | 'aggregate'
    | 'display'
    | 'pipeline'
    | 'dimension'
    | 'measure'
    | 'attribute';

/**
 * Symbol - represents a named entity in the program.
 */
export interface Symbol {
    name: string;
    type: Type;
    kind: SymbolKind;
    node: AstNode;
    scope: Scope;
}

/**
 * Scope - represents a lexical scope with a symbol table.
 *
 * Scopes form a hierarchy:
 * - Global scope (Program level)
 * - Cube scopes (for dimensions, measures, attributes)
 */
export class Scope {
    private symbols: Map<string, Symbol> = new Map();

    constructor(
        public readonly parent?: Scope,
        public readonly owner?: AstNode
    ) {}

    /**
     * Define a symbol in this scope.
     * Returns an error message if the name already exists (no shadowing).
     */
    define(symbol: Symbol): string | undefined {
        if (this.symbols.has(symbol.name)) {
            return `Symbol '${symbol.name}' is already defined in this scope`;
        }
        this.symbols.set(symbol.name, symbol);
        return undefined;
    }

    /**
     * Look up a symbol in this scope only (does not check parent scopes).
     */
    lookup(name: string): Symbol | undefined {
        return this.symbols.get(name);
    }

    /**
     * Look up a symbol in this scope and parent scopes.
     */
    lookupInHierarchy(name: string): Symbol | undefined {
        const symbol = this.symbols.get(name);
        if (symbol) {
            return symbol;
        }
        if (this.parent) {
            return this.parent.lookupInHierarchy(name);
        }
        return undefined;
    }

    /**
     * Get all symbols in this scope.
     */
    getAllSymbols(): Symbol[] {
        return Array.from(this.symbols.values());
    }

    /**
     * Get all symbol names in this scope.
     */
    getAllNames(): string[] {
        return Array.from(this.symbols.keys());
    }
}

/**
 * Symbol Table - manages scopes and symbol resolution for a program.
 *
 * Building process:
 * 1. First pass: Collect all top-level definitions and create scopes
 * 2. Second pass: Resolve types and build cube types
 */
export class SymbolTable {
    public readonly globalScope: Scope;
    private scopes: Map<AstNode, Scope> = new Map();
    private errors: string[] = [];

    constructor() {
        this.globalScope = new Scope(undefined, undefined);
        this.scopes.set(this.globalScope.owner as any, this.globalScope);
    }

    /**
     * Build the symbol table from a program.
     * Two-pass approach:
     * 1. First pass: Collect all definitions
     * 2. Second pass: Resolve types and references
     */
    buildFromProgram(program: Program): void {
        this.errors = [];

        // First pass: Collect all top-level definitions
        for (const element of program.elements) {
            this.collectTopLevelDefinition(element);
        }

        // Second pass: Resolve types for cubes (build CubeType with components)
        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                this.resolveCubeType(element);
            }
        }

        // Third pass: Resolve types for slices (inherit CubeType from source)
        // May need multiple iterations for slices-from-slices
        let resolved = true;
        let iterations = 0;
        const maxIterations = 10; // Prevent infinite loops

        do {
            resolved = true;
            for (const element of program.elements) {
                if (this.isSliceDefinition(element)) {
                    const sliceSymbol = this.globalScope.lookup(element.name);
                    if (sliceSymbol && !(sliceSymbol.type instanceof CubeType)) {
                        const wasResolved = this.resolveSliceType(element);
                        if (!wasResolved) {
                            resolved = false;
                        }
                    }
                }
            }
            iterations++;
        } while (!resolved && iterations < maxIterations);
    }

    /**
     * First pass: Collect top-level definitions and create placeholder symbols.
     */
    private collectTopLevelDefinition(element: ProgramElement): void {
        // Skip import statements
        if (element.$type === 'ImportStatement') {
            return;
        }

        const name = (element as any).name as string;
        if (!name) {
            return;
        }

        // Determine symbol kind
        let kind: SymbolKind;
        switch (element.$type) {
            case 'CubeDefinition':
                kind = 'cube';
                break;
            case 'ConceptDefinition':
                kind = 'concept';
                break;
            case 'SliceDefinition':
                kind = 'slice';
                break;
            case 'DeriveDefinition':
                kind = 'derive';
                break;
            case 'ModelDefinition':
                kind = 'model';
                break;
            case 'AggregateDefinition':
                kind = 'aggregate';
                break;
            case 'DisplayDefinition':
                kind = 'display';
                break;
            default:
                return;
        }

        // Create placeholder symbol (type will be resolved in second pass)
        const symbol: Symbol = {
            name,
            type: new ErrorType('Type not yet resolved'),
            kind,
            node: element,
            scope: this.globalScope,
        };

        const error = this.globalScope.define(symbol);
        if (error) {
            this.errors.push(error);
        }
    }

    /**
     * Second pass: Resolve cube type with all components.
     */
    private resolveCubeType(cube: CubeDefinition): void {
        // Create a scope for this cube
        const cubeScope = new Scope(this.globalScope, cube);
        this.scopes.set(cube, cubeScope);

        // Collect dimensions, measures, and attributes
        const dimensions = new Map<string, Type>();
        const measures = new Map<string, Type>();
        const attributes = new Map<string, Type>();

        // Process dimensions
        if (cube.structure.dimensions) {
            for (const component of cube.structure.dimensions.components) {
                const type = this.resolveTypeReference(component.type);
                dimensions.set(component.name, type);

                // Add to cube scope
                const symbol: Symbol = {
                    name: component.name,
                    type,
                    kind: 'dimension',
                    node: component,
                    scope: cubeScope,
                };
                const error = cubeScope.define(symbol);
                if (error) {
                    this.errors.push(error);
                }
            }
        }

        // Process measures
        if (cube.structure.measures) {
            for (const component of cube.structure.measures.components) {
                const type = this.resolveTypeReference(component.type);
                measures.set(component.name, type);

                // Add to cube scope
                const symbol: Symbol = {
                    name: component.name,
                    type,
                    kind: 'measure',
                    node: component,
                    scope: cubeScope,
                };
                const error = cubeScope.define(symbol);
                if (error) {
                    this.errors.push(error);
                }
            }
        }

        // Process attributes
        if (cube.structure.attributes) {
            for (const component of cube.structure.attributes.components) {
                const type = this.resolveTypeReference(component.type);
                attributes.set(component.name, type);

                // Add to cube scope
                const symbol: Symbol = {
                    name: component.name,
                    type,
                    kind: 'attribute',
                    node: component,
                    scope: cubeScope,
                };
                const error = cubeScope.define(symbol);
                if (error) {
                    this.errors.push(error);
                }
            }
        }

        // Create the CubeType
        const cubeType = new CubeType(cube.name, dimensions, measures, attributes);

        // Update the symbol in global scope with the resolved type
        const symbol = this.globalScope.lookup(cube.name);
        if (symbol) {
            (symbol as any).type = cubeType;
        }
    }

    /**
     * Third pass: Resolve slice type to inherit from source cube.
     * Returns true if resolution was successful, false if it needs another iteration.
     */
    private resolveSliceType(slice: SliceDefinition): boolean {
        // Get the source cube/slice
        const sourceSymbol = this.globalScope.lookup(slice.cubeRef.$refText);
        if (!sourceSymbol) {
            // Error will be caught by reference validator
            return true; // Nothing more we can do
        }

        // If source has a CubeType, use it
        if (sourceSymbol.type instanceof CubeType) {
            const sliceSymbol = this.globalScope.lookup(slice.name);
            if (sliceSymbol) {
                (sliceSymbol as any).type = sourceSymbol.type;
            }
            return true; // Successfully resolved
        }

        // If source is a slice that hasn't been resolved yet, try again later
        if (sourceSymbol.kind === 'slice') {
            return false; // Needs another iteration
        }

        // Source is something else (not a cube or slice)
        return true; // Nothing more we can do
    }

    /**
     * Resolve a type reference from the AST to a Type.
     */
    private resolveTypeReference(typeRef: TypeReference, unit?: string): Type {
        if (this.isPrimitiveType(typeRef)) {
            switch (typeRef.type) {
                case 'Numeric':
                    return new NumericType(unit);
                case 'Integer':
                    return new IntegerType();
                case 'Text':
                    return new TextType();
                case 'DateTime':
                    return new DateTimeType();
                case 'Date':
                    return new DateType();
                case 'Flag':
                    return new FlagType();
            }
        }

        if (this.isIdentifierType(typeRef)) {
            return new IdentifierType();
        }

        if (this.isCodedValueType(typeRef)) {
            const codeList = typeRef.codeList
                ? this.formatCodeList(typeRef.codeList)
                : undefined;
            return new CodedValueType(codeList);
        }

        return new ErrorType('Unknown type reference');
    }

    /**
     * Format a code list reference from AST structure.
     * CodeListRef has segments array (e.g., ['CDISC', 'CT', 'TRT01A'])
     */
    private formatCodeList(codeList: any): string {
        if (!codeList) {
            return '';
        }

        // Handle CodeListRef structure with segments
        if (codeList.segments && Array.isArray(codeList.segments)) {
            return codeList.segments.join('.');
        }

        return '';
    }

    /**
     * Get the scope for a given AST node.
     */
    getScope(node: AstNode): Scope | undefined {
        return this.scopes.get(node);
    }

    /**
     * Resolve a name from a given scope.
     */
    resolve(name: string, fromScope: Scope): Symbol | undefined {
        return fromScope.lookupInHierarchy(name);
    }

    /**
     * Resolve a name from global scope.
     */
    resolveGlobal(name: string): Symbol | undefined {
        return this.globalScope.lookup(name);
    }

    /**
     * Get all errors encountered during symbol table building.
     */
    getErrors(): string[] {
        return this.errors;
    }

    /**
     * Check if there are any errors.
     */
    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    /**
     * Get all global symbol names (for suggestions).
     */
    getAllGlobalSymbols(): string[] {
        return this.globalScope.getAllNames();
    }

    // Type guards
    private isCubeDefinition(node: AstNode): node is CubeDefinition {
        return node.$type === 'CubeDefinition';
    }

    private isSliceDefinition(node: AstNode): node is SliceDefinition {
        return node.$type === 'SliceDefinition';
    }

    private isPrimitiveType(typeRef: TypeReference): typeRef is PrimitiveType {
        return typeRef.$type === 'PrimitiveType';
    }

    private isIdentifierType(typeRef: TypeReference): typeRef is AstIdentifierType {
        return typeRef.$type === 'IdentifierType';
    }

    private isCodedValueType(typeRef: TypeReference): typeRef is AstCodedValueType {
        return typeRef.$type === 'CodedValueType';
    }
}
