/**
 * IC-2: Unique DSD (Data Structure Definition)
 *
 * W3C Data Cube integrity constraint IC-2:
 * "Each qb:DataStructureDefinition must be unique within a dataset"
 *
 * In Thunderstruck, this means:
 * - All components (dimensions, measures, attributes) within a cube must have unique names
 * - No component name can be duplicated across dimensions/measures/attributes
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#ic-2
 */

import { Program, CubeDefinition, ProgramElement, Component } from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import {
    IntegrityConstraint,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';

/**
 * IC-2 validator: Ensures all components within a cube have unique names.
 */
export class IC02_UniqueDSD extends IntegrityConstraint {
    readonly id = 'IC-2';
    readonly description = 'Each component in a DataStructureDefinition must be unique';
    readonly priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                violations.push(...this.validateCubeDSD(element));
            }
        }

        return violations;
    }

    /**
     * Validate that all components within a cube have unique names.
     */
    private validateCubeDSD(cube: CubeDefinition): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];
        const componentNames = new Map<string, { type: string; component: Component }>();

        // Check dimensions
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                this.checkComponentName(
                    dim,
                    'dimension',
                    cube.name,
                    componentNames,
                    violations
                );
            }
        }

        // Check measures
        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                this.checkComponentName(
                    measure,
                    'measure',
                    cube.name,
                    componentNames,
                    violations
                );
            }
        }

        // Check attributes
        if (cube.structure.attributes) {
            for (const attr of cube.structure.attributes.components) {
                this.checkComponentName(
                    attr,
                    'attribute',
                    cube.name,
                    componentNames,
                    violations
                );
            }
        }

        return violations;
    }

    /**
     * Check if a component name is unique, and record it.
     */
    private checkComponentName(
        component: Component,
        componentType: string,
        cubeName: string,
        componentNames: Map<string, { type: string; component: Component }>,
        violations: IntegrityConstraintViolation[]
    ): void {
        const existing = componentNames.get(component.name);

        if (existing) {
            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Error,
                message: `Duplicate component '${component.name}' in cube '${cubeName}'. Component is defined as both ${existing.type} and ${componentType} (W3C IC-2).`,
                location: component,
                suggestion: `Each dimension, measure, and attribute must have a unique name within the cube. Rename one of the components.`,
                code: 'W3C-IC-2',
            });
        } else {
            componentNames.set(component.name, { type: componentType, component });
        }
    }

    /**
     * Type guard to check if an element is a CubeDefinition.
     */
    private isCubeDefinition(element: ProgramElement): element is CubeDefinition {
        return element.$type === 'CubeDefinition';
    }
}
