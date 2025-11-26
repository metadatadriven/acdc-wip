/**
 * Reference Validator for Thunderstruck Language
 *
 * Validates cross-references between constructs:
 * - Cube references in slices
 * - Input references in models, transforms, aggregates, derives
 * - Dimension/measure/attribute references within cubes
 * - Pipeline stage dependencies
 *
 * Provides helpful error messages with "did you mean" suggestions.
 */

import { SymbolTable, Symbol } from './symbol-table.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import { CubeType } from '../types/type-system.js';

/**
 * Reference validator.
 *
 * Validates that all references resolve to valid symbols
 * and provides helpful suggestions for undefined references.
 */
export class ReferenceValidator {
    constructor(private symbolTable: SymbolTable) {}

    /**
     * Validate that a reference resolves to a symbol of the expected kind.
     *
     * @param name The reference name to validate
     * @param expectedKind Expected symbol kind (e.g., 'cube', 'slice')
     * @param contextDescription Description for error messages
     * @returns Diagnostics for any issues found
     */
    validateReference(
        name: string,
        expectedKind: Symbol['kind'] | Symbol['kind'][],
        contextDescription: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Resolve the reference
        const symbol = this.symbolTable.resolveGlobal(name);

        if (!symbol) {
            // Reference not found - suggest alternatives
            const suggestion = this.suggestSymbol(name);
            const message = suggestion
                ? `${contextDescription} references undefined '${name}'. Did you mean '${suggestion}'?`
                : `${contextDescription} references undefined '${name}'`;

            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message,
            });

            return diagnostics;
        }

        // Check if symbol is of the expected kind
        const expectedKinds = Array.isArray(expectedKind) ? expectedKind : [expectedKind];
        if (!expectedKinds.includes(symbol.kind)) {
            const kindList = expectedKinds.join(' or ');
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `${contextDescription} references '${name}', but it is a ${symbol.kind}, not a ${kindList}`,
            });
        }

        return diagnostics;
    }

    /**
     * Validate a cube reference.
     * Returns the CubeType if valid, null otherwise.
     */
    validateCubeReference(
        cubeRef: string,
        contextDescription: string
    ): { cube: CubeType | null; diagnostics: TypeDiagnostic[] } {
        const diagnostics = this.validateReference(
            cubeRef,
            ['cube', 'slice'],
            contextDescription
        );

        if (diagnostics.length > 0) {
            return { cube: null, diagnostics };
        }

        // Get the cube type
        const symbol = this.symbolTable.resolveGlobal(cubeRef);
        if (symbol && symbol.type instanceof CubeType) {
            return { cube: symbol.type, diagnostics: [] };
        }

        return {
            cube: null,
            diagnostics: [{
                severity: DiagnosticSeverity.Error,
                message: `${contextDescription} references '${cubeRef}', but it does not have a cube type`,
            }],
        };
    }

    /**
     * Validate an input reference (for models, transforms, aggregates, derives).
     * Returns the CubeType if valid, null otherwise.
     */
    validateInputReference(
        inputRef: string,
        contextDescription: string
    ): { cube: CubeType | null; diagnostics: TypeDiagnostic[] } {
        return this.validateCubeReference(inputRef, contextDescription);
    }

    /**
     * Validate that a component (dimension, measure, or attribute) exists in a cube.
     *
     * @param componentName The component name to validate
     * @param cube The cube type to check
     * @param componentType Expected component type
     * @param contextDescription Description for error messages
     */
    validateComponentReference(
        componentName: string,
        cube: CubeType,
        componentType: 'dimension' | 'measure' | 'attribute',
        contextDescription: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check if component exists
        const component = cube.getComponent(componentName);

        if (!component) {
            // Component not found - suggest alternatives from the appropriate collection
            const availableComponents = this.getAvailableComponents(cube, componentType);
            const suggestion = this.suggestComponentName(componentName, availableComponents);

            const message = suggestion
                ? `${contextDescription} references ${componentType} '${componentName}' which is not defined in cube '${cube.name}'. Did you mean '${suggestion}'?`
                : `${contextDescription} references ${componentType} '${componentName}' which is not defined in cube '${cube.name}'. Available ${componentType}s: ${availableComponents.join(', ') || 'none'}`;

            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message,
            });

            return diagnostics;
        }

        // Check if component is of the expected type
        const isCorrectType = this.checkComponentType(componentName, cube, componentType);

        if (!isCorrectType) {
            const actualType = this.getComponentType(componentName, cube);
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `${contextDescription} references '${componentName}' as a ${componentType}, but it is a ${actualType} in cube '${cube.name}'`,
            });
        }

        return diagnostics;
    }

    /**
     * Get available components of a specific type from a cube.
     */
    private getAvailableComponents(
        cube: CubeType,
        componentType: 'dimension' | 'measure' | 'attribute'
    ): string[] {
        switch (componentType) {
            case 'dimension':
                return Array.from(cube.dimensions.keys());
            case 'measure':
                return Array.from(cube.measures.keys());
            case 'attribute':
                return Array.from(cube.attributes.keys());
        }
    }

    /**
     * Check if a component is of the expected type.
     */
    private checkComponentType(
        componentName: string,
        cube: CubeType,
        expectedType: 'dimension' | 'measure' | 'attribute'
    ): boolean {
        switch (expectedType) {
            case 'dimension':
                return cube.dimensions.has(componentName);
            case 'measure':
                return cube.measures.has(componentName);
            case 'attribute':
                return cube.attributes.has(componentName);
        }
    }

    /**
     * Get the actual type of a component.
     */
    private getComponentType(
        componentName: string,
        cube: CubeType
    ): 'dimension' | 'measure' | 'attribute' | 'unknown' {
        if (cube.dimensions.has(componentName)) return 'dimension';
        if (cube.measures.has(componentName)) return 'measure';
        if (cube.attributes.has(componentName)) return 'attribute';
        return 'unknown';
    }

    /**
     * Suggest a symbol name for an undefined reference using Levenshtein distance.
     */
    suggestSymbol(name: string): string | undefined {
        const allSymbols = this.symbolTable.getAllGlobalSymbols();
        return this.suggestFromList(name, allSymbols);
    }

    /**
     * Suggest a component name using Levenshtein distance.
     */
    suggestComponentName(name: string, availableComponents: string[]): string | undefined {
        return this.suggestFromList(name, availableComponents);
    }

    /**
     * Find the closest match from a list of candidates using Levenshtein distance.
     */
    private suggestFromList(name: string, candidates: string[]): string | undefined {
        if (candidates.length === 0) {
            return undefined;
        }

        let closestName = candidates[0];
        let closestDistance = this.levenshteinDistance(name.toLowerCase(), closestName.toLowerCase());

        for (const candidate of candidates.slice(1)) {
            const distance = this.levenshteinDistance(name.toLowerCase(), candidate.toLowerCase());
            if (distance < closestDistance) {
                closestDistance = distance;
                closestName = candidate;
            }
        }

        // Only suggest if distance is small (typo threshold)
        if (closestDistance <= 3) {
            return closestName;
        }

        return undefined;
    }

    /**
     * Calculate Levenshtein distance between two strings.
     */
    private levenshteinDistance(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix: number[][] = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }
}
