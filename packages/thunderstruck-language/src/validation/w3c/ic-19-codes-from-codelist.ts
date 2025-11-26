/**
 * IC-19: Codes from CodeList
 *
 * W3C Data Cube integrity constraint IC-19:
 * "If a dimension property has a qb:codeList, every observation must use a code from that list"
 *
 * In Thunderstruck, this means:
 * - CodedValue types should specify a code list
 * - Fixed dimension values for CodedValue types should use string literals
 *   (actual code validation against the code list happens at code generation time)
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#ic-19
 */

import {
    Program,
    CubeDefinition,
    SliceDefinition,
    ProgramElement,
    TypeReference,
    Expression,
    StringLiteral,
} from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { CubeType, CodedValueType as CodedValueTypeClass } from '../../types/type-system.js';
import {
    IntegrityConstraint,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';

/**
 * IC-19 validator: Ensures CodedValue dimensions have code lists and use valid values.
 */
export class IC19_CodesFromCodeList extends IntegrityConstraint {
    readonly id = 'IC-19';
    readonly description = 'Dimension values must come from specified code list';
    readonly priority = 'important' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                violations.push(...this.validateCubeComponents(element));
            } else if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSliceConstraints(element, symbolTable));
            }
        }

        return violations;
    }

    /**
     * Validate that CodedValue dimensions in a cube have code lists specified.
     */
    private validateCubeComponents(cube: CubeDefinition): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Check dimensions for CodedValue without code list
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                if (this.isCodedValueType(dim.type) && !dim.type.codeList) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Warning,
                        message: `Dimension '${dim.name}' in cube '${cube.name}' is CodedValue but has no code list specified (W3C IC-19).`,
                        location: dim,
                        suggestion: `Specify a code list: CodedValue<CodeListName>`,
                        code: 'W3C-IC-19-MISSING-CODELIST',
                    });
                }
            }
        }

        // Check measures for CodedValue without code list (less common but possible)
        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                if (this.isCodedValueType(measure.type) && !measure.type.codeList) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Warning,
                        message: `Measure '${measure.name}' in cube '${cube.name}' is CodedValue but has no code list specified (W3C IC-19).`,
                        location: measure,
                        suggestion: `Specify a code list: CodedValue<CodeListName>`,
                        code: 'W3C-IC-19-MISSING-CODELIST',
                    });
                }
            }
        }

        // Check attributes for CodedValue without code list
        if (cube.structure.attributes) {
            for (const attr of cube.structure.attributes.components) {
                if (this.isCodedValueType(attr.type) && !attr.type.codeList) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Warning,
                        message: `Attribute '${attr.name}' in cube '${cube.name}' is CodedValue but has no code list specified (W3C IC-19).`,
                        location: attr,
                        suggestion: `Specify a code list: CodedValue<CodeListName>`,
                        code: 'W3C-IC-19-MISSING-CODELIST',
                    });
                }
            }
        }

        return violations;
    }

    /**
     * Validate that fixed values for CodedValue dimensions in slices are string literals.
     */
    private validateSliceConstraints(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        if (!slice.fixedDimensions) {
            return violations;
        }

        // Get cube type
        const cubeSymbol = symbolTable.resolveGlobal(slice.cubeRef);
        if (!cubeSymbol || !(cubeSymbol.type instanceof CubeType)) {
            // Reference error will be caught by reference validator
            return violations;
        }

        const cubeType = cubeSymbol.type as CubeType;

        // Check that fixed values for CodedValue dimensions are string literals
        for (const constraint of slice.fixedDimensions.constraints) {
            const dimType = cubeType.dimensions.get(constraint.dimension);

            if (dimType && dimType instanceof CodedValueTypeClass) {
                // Check that the value is a string literal
                if (!this.isStringLiteral(constraint.value)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Fixed value for CodedValue dimension '${constraint.dimension}' must be a string literal (W3C IC-19).`,
                        location: constraint,
                        suggestion: `Use a quoted string like "CODE_VALUE"`,
                        code: 'W3C-IC-19-INVALID-VALUE',
                    });
                }
                // Note: We don't validate that the code exists in the code list here.
                // That would require loading actual code list data, which is deferred
                // to code generation time or a more comprehensive validation pass.
            }
        }

        return violations;
    }

    /**
     * Type guard to check if a type reference is CodedValue.
     */
    private isCodedValueType(typeRef: TypeReference): typeRef is Extract<TypeReference, { $type: 'CodedValueType' }> {
        return typeRef.$type === 'CodedValueType';
    }

    /**
     * Type guard to check if an expression is a string literal.
     */
    private isStringLiteral(expr: Expression): expr is StringLiteral {
        return expr.$type === 'StringLiteral';
    }

    /**
     * Type guard to check if an element is a CubeDefinition.
     */
    private isCubeDefinition(element: ProgramElement): element is CubeDefinition {
        return element.$type === 'CubeDefinition';
    }

    /**
     * Type guard to check if an element is a SliceDefinition.
     */
    private isSliceDefinition(element: ProgramElement): element is SliceDefinition {
        return element.$type === 'SliceDefinition';
    }
}
