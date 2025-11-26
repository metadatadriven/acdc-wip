/**
 * IC-11: All Dimensions Required
 *
 * W3C Data Cube integrity constraint IC-11:
 * "Every qb:Observation must have a value for every dimension declared in its DSD"
 *
 * In Thunderstruck, this means:
 * - Slices must specify all dimensions from their source cube
 * - Dimensions can be either fixed (in the fix clause) or varying (in the vary clause)
 * - But all dimensions must be accounted for
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#ic-11
 */

import { Program, SliceDefinition, ProgramElement } from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { CubeType } from '../../types/type-system.js';
import {
    IntegrityConstraint,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';

/**
 * IC-11 validator: Ensures all dimensions are specified in slices.
 */
export class IC11_AllDimensionsRequired extends IntegrityConstraint {
    readonly id = 'IC-11';
    readonly description = 'Every observation must have a value for every dimension';
    readonly priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSliceDimensions(element, symbolTable));
            }
        }

        return violations;
    }

    /**
     * Validate that a slice specifies all dimensions from its source cube.
     */
    private validateSliceDimensions(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Get source cube type
        const cubeSymbol = symbolTable.resolveGlobal(slice.cubeRef);
        if (!cubeSymbol || !(cubeSymbol.type instanceof CubeType)) {
            // Reference error will be caught by reference validator
            return violations;
        }

        const cubeType = cubeSymbol.type as CubeType;
        const allDimensions = new Set(cubeType.dimensions.keys());

        // Collect dimensions that are specified (either fixed or varying)
        const specifiedDimensions = new Set<string>();

        // Add fixed dimensions
        if (slice.fixedDimensions) {
            for (const constraint of slice.fixedDimensions.constraints) {
                specifiedDimensions.add(constraint.dimension);
            }
        }

        // Add varying dimensions
        if (slice.varyingDimensions) {
            for (const dim of slice.varyingDimensions.dimensions) {
                specifiedDimensions.add(dim);
            }
        }

        // Check for missing dimensions
        const missingDimensions = Array.from(allDimensions)
            .filter(dim => !specifiedDimensions.has(dim))
            .sort();

        if (missingDimensions.length > 0) {
            const plural = missingDimensions.length > 1;
            const dimList = missingDimensions.join(', ');

            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Error,
                message: `Slice '${slice.name}' does not specify all dimensions from cube '${slice.cubeRef}'. Missing dimension${plural ? 's' : ''}: ${dimList} (W3C IC-11).`,
                location: slice,
                suggestion: `Add ${plural ? 'these dimensions' : 'this dimension'} to either the 'fix' or 'vary' clause.`,
                code: 'W3C-IC-11',
            });
        }

        return violations;
    }

    /**
     * Type guard to check if an element is a SliceDefinition.
     */
    private isSliceDefinition(element: ProgramElement): element is SliceDefinition {
        return element.$type === 'SliceDefinition';
    }
}
