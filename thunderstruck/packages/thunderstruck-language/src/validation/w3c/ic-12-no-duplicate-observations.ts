/**
 * IC-12: No Duplicate Observations
 *
 * W3C Data Cube integrity constraint IC-12:
 * "No two observations in the same DataSet can have the same values for all dimensions"
 *
 * In Thunderstruck, this is primarily a runtime concern, but we can perform static checks:
 * - Slices with no varying dimensions and no fixed dimensions would have undefined cardinality
 * - Aggregates that group by all dimensions perform no actual aggregation
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#ic-12
 */

import {
    Program,
    SliceDefinition,
    AggregateDefinition,
    ProgramElement,
} from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { CubeType } from '../../types/type-system.js';
import {
    IntegrityConstraint,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';

/**
 * IC-12 validator: Checks for potential duplicate observation issues.
 */
export class IC12_NoDuplicateObservations extends IntegrityConstraint {
    readonly id = 'IC-12';
    readonly description = 'No two observations can have identical dimension values';
    readonly priority = 'important' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSlice(element, symbolTable));
            } else if (this.isAggregateDefinition(element)) {
                violations.push(...this.validateAggregate(element, symbolTable));
            }
        }

        return violations;
    }

    /**
     * Validate a slice for potential duplicate observation issues.
     *
     * A slice with no varying dimensions produces at most one observation per
     * set of fixed dimension values. This is acceptable if there are fixed
     * dimensions, but suspicious if there are none.
     */
    private validateSlice(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        const hasVaryingDimensions =
            slice.varyingDimensions && slice.varyingDimensions.dimensions.length > 0;
        const hasFixedDimensions =
            slice.fixedDimensions && slice.fixedDimensions.constraints.length > 0;

        // If no varying dimensions and no fixed dimensions, cardinality is unclear
        if (!hasVaryingDimensions && !hasFixedDimensions) {
            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Warning,
                message: `Slice '${slice.name}' has no varying dimensions and no fixed dimensions. This will produce at most one observation (W3C IC-12).`,
                location: slice,
                suggestion: `Consider adding varying dimensions if you expect multiple observations, or fixed dimensions to clarify the slice's purpose.`,
                code: 'W3C-IC-12-SLICE',
            });
        }

        return violations;
    }

    /**
     * Validate an aggregate for potential issues.
     *
     * An aggregate that groups by all dimensions performs no actual aggregation,
     * and each input observation maps to exactly one output observation.
     */
    private validateAggregate(
        aggregate: AggregateDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Get input cube type
        const inputSymbol = symbolTable.resolveGlobal(aggregate.inputRef.$refText);
        if (!inputSymbol || !(inputSymbol.type instanceof CubeType)) {
            // Reference error will be caught by reference validator
            return violations;
        }

        const inputCube = inputSymbol.type as CubeType;
        const groupByDims = new Set(aggregate.groupBy.dimensions);
        const allDims = new Set(inputCube.dimensions.keys());

        // Check if grouping by all dimensions
        if (groupByDims.size === allDims.size && this.setsEqual(groupByDims, allDims)) {
            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Warning,
                message: `Aggregate '${aggregate.name}' groups by all dimensions. Each input observation will map to exactly one output observation (W3C IC-12).`,
                location: aggregate,
                suggestion: `Consider removing some dimensions from the groupBy clause to perform actual aggregation.`,
                code: 'W3C-IC-12-AGGREGATE',
            });
        }

        return violations;
    }

    /**
     * Check if two sets are equal.
     */
    private setsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
        if (set1.size !== set2.size) {
            return false;
        }
        for (const item of set1) {
            if (!set2.has(item)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Type guard to check if an element is a SliceDefinition.
     */
    private isSliceDefinition(element: ProgramElement): element is SliceDefinition {
        return element.$type === 'SliceDefinition';
    }

    /**
     * Type guard to check if an element is an AggregateDefinition.
     */
    private isAggregateDefinition(element: ProgramElement): element is AggregateDefinition {
        return element.$type === 'AggregateDefinition';
    }
}
