/**
 * Slice Validator for Thunderstruck Language
 *
 * Validates slice definitions:
 * - Source cube reference exists
 * - Fixed dimensions exist in cube
 * - Varying dimensions exist in cube
 * - Measures exist in cube
 * - Where clause variables exist in cube and expression is Flag type
 * - Fixed and varying dimensions don't overlap (warning)
 *
 * Design decisions:
 * - Fixed dimensions can be dimensions or attributes (for filtering)
 * - Varying dimensions must be dimensions (data dimensions)
 * - Measures must be measures (aggregatable values)
 */

import { SliceDefinition } from '../generated/ast.js';
import { SymbolTable } from './symbol-table.js';
import { ReferenceValidator } from './reference-validator.js';
import { ExpressionValidator } from './expression-validator.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import { CubeType } from '../types/type-system.js';

/**
 * Slice validator.
 *
 * Validates that slice definitions correctly reference cube components
 * and have well-formed where clauses.
 */
export class SliceValidator {
    private referenceValidator: ReferenceValidator;
    private expressionValidator: ExpressionValidator;

    constructor(private symbolTable: SymbolTable) {
        this.referenceValidator = new ReferenceValidator(symbolTable);
        this.expressionValidator = new ExpressionValidator(symbolTable);
    }

    /**
     * Validate entire slice definition.
     * Checks all aspects of the slice against its source cube.
     */
    validateSlice(slice: SliceDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Validate source cube reference
        const { cube, diagnostics: cubeDiagnostics } = this.validateSourceCube(slice);
        diagnostics.push(...cubeDiagnostics);

        // If cube doesn't exist, can't validate further
        if (!cube) {
            return diagnostics;
        }

        // Validate fixed dimensions
        if (slice.fixedDimensions) {
            const fixedDiagnostics = this.validateFixedDimensions(
                slice.fixedDimensions.constraints.map(c => c.dimension),
                cube,
                slice.name
            );
            diagnostics.push(...fixedDiagnostics);
        }

        // Validate varying dimensions
        if (slice.varyingDimensions) {
            const varyingDiagnostics = this.validateVaryingDimensions(
                slice.varyingDimensions.dimensions,
                cube,
                slice.name
            );
            diagnostics.push(...varyingDiagnostics);
        }

        // Validate measures
        if (slice.measures) {
            const measureDiagnostics = this.validateMeasures(
                slice.measures.measures,
                cube,
                slice.name
            );
            diagnostics.push(...measureDiagnostics);
        }

        // Validate where clause
        if (slice.whereClause) {
            const whereDiagnostics = this.expressionValidator.validateWhereClause(
                slice,
                cube
            );
            diagnostics.push(...whereDiagnostics);
        }

        // Check for overlapping fix/vary dimensions (warning)
        if (slice.fixedDimensions && slice.varyingDimensions) {
            const overlapDiagnostics = this.checkDimensionOverlap(
                slice.fixedDimensions.constraints.map(c => c.dimension),
                slice.varyingDimensions.dimensions,
                slice.name
            );
            diagnostics.push(...overlapDiagnostics);
        }

        return diagnostics;
    }

    /**
     * Validate source cube reference and return the cube type.
     */
    validateSourceCube(
        slice: SliceDefinition
    ): { cube: CubeType | null; diagnostics: TypeDiagnostic[] } {
        return this.referenceValidator.validateCubeReference(
            slice.cubeRef.$refText,
            `Slice '${slice.name}'`
        );
    }

    /**
     * Validate fixed dimensions exist in cube.
     * Fixed dimensions can be dimensions or attributes (for filtering).
     */
    validateFixedDimensions(
        fixedDimensionNames: string[],
        cube: CubeType,
        sliceName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        for (const dimName of fixedDimensionNames) {
            // Check if it's a dimension or attribute
            const isDimension = cube.dimensions.has(dimName);
            const isAttribute = cube.attributes.has(dimName);

            if (!isDimension && !isAttribute) {
                // Not found - suggest alternatives
                const allComponents = [
                    ...Array.from(cube.dimensions.keys()),
                    ...Array.from(cube.attributes.keys()),
                ];
                const suggestion = this.referenceValidator.suggestComponentName(
                    dimName,
                    allComponents
                );

                const message = suggestion
                    ? `Slice '${sliceName}' fix clause references '${dimName}' which is not a dimension or attribute in cube '${cube.name}'. Did you mean '${suggestion}'?`
                    : `Slice '${sliceName}' fix clause references '${dimName}' which is not a dimension or attribute in cube '${cube.name}'. Available dimensions: ${Array.from(cube.dimensions.keys()).join(', ') || 'none'}. Available attributes: ${Array.from(cube.attributes.keys()).join(', ') || 'none'}`;

                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message,
                });
            }
        }

        return diagnostics;
    }

    /**
     * Validate varying dimensions exist in cube.
     * Varying dimensions must be dimensions (not attributes).
     */
    validateVaryingDimensions(
        varyingDimensionNames: string[],
        cube: CubeType,
        sliceName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        for (const dimName of varyingDimensionNames) {
            // Varying dimensions must be dimensions
            if (!cube.dimensions.has(dimName)) {
                if (cube.attributes.has(dimName)) {
                    // It's an attribute, not a dimension
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message: `Slice '${sliceName}' vary clause references '${dimName}' which is an attribute, not a dimension in cube '${cube.name}'. Varying dimensions must be data dimensions.`,
                    });
                } else {
                    // Not found - suggest alternatives
                    const suggestion = this.referenceValidator.suggestComponentName(
                        dimName,
                        Array.from(cube.dimensions.keys())
                    );

                    const message = suggestion
                        ? `Slice '${sliceName}' vary clause references '${dimName}' which is not a dimension in cube '${cube.name}'. Did you mean '${suggestion}'?`
                        : `Slice '${sliceName}' vary clause references '${dimName}' which is not a dimension in cube '${cube.name}'. Available dimensions: ${Array.from(cube.dimensions.keys()).join(', ') || 'none'}`;

                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message,
                    });
                }
            }
        }

        return diagnostics;
    }

    /**
     * Validate measures exist in cube.
     */
    validateMeasures(
        measureNames: string[],
        cube: CubeType,
        sliceName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        for (const measureName of measureNames) {
            if (!cube.measures.has(measureName)) {
                // Not found - suggest alternatives
                const suggestion = this.referenceValidator.suggestComponentName(
                    measureName,
                    Array.from(cube.measures.keys())
                );

                const message = suggestion
                    ? `Slice '${sliceName}' references measure '${measureName}' which is not defined in cube '${cube.name}'. Did you mean '${suggestion}'?`
                    : `Slice '${sliceName}' references measure '${measureName}' which is not defined in cube '${cube.name}'. Available measures: ${Array.from(cube.measures.keys()).join(', ') || 'none'}`;

                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message,
                });
            }
        }

        return diagnostics;
    }

    /**
     * Check for overlapping fixed and varying dimensions (warning).
     * It's unusual to have a dimension in both fix and vary clauses.
     */
    private checkDimensionOverlap(
        fixedDimensions: string[],
        varyingDimensions: string[],
        sliceName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const fixedSet = new Set(fixedDimensions);
        const varyingSet = new Set(varyingDimensions);

        for (const dim of fixedDimensions) {
            if (varyingSet.has(dim)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Slice '${sliceName}' has dimension '${dim}' in both fix and vary clauses. This may not be intended.`,
                });
            }
        }

        return diagnostics;
    }
}
