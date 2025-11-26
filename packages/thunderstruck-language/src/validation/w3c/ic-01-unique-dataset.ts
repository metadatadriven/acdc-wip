/**
 * IC-1: Unique DataSet
 *
 * W3C Data Cube integrity constraint IC-1:
 * "Each qb:DataSet has a unique URI"
 *
 * In Thunderstruck, this means each cube definition must have a unique name.
 *
 * Reference: https://www.w3.org/TR/vocab-data-cube/#ic-1
 */

import { Program, CubeDefinition, ProgramElement } from '../../generated/ast.js';
import { SymbolTable } from '../symbol-table.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import {
    IntegrityConstraint,
    IntegrityConstraintViolation,
} from './integrity-constraint-validator.js';

/**
 * IC-1 validator: Ensures each cube has a unique name.
 */
export class IC01_UniqueDataSet extends IntegrityConstraint {
    readonly id = 'IC-1';
    readonly description = 'Each DataSet (cube) must have a unique identifier';
    readonly priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];
        const datasetNames = new Map<string, CubeDefinition>();

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                const existingCube = datasetNames.get(element.name);

                if (existingCube) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Duplicate cube definition '${element.name}'. Each cube must have a unique name (W3C IC-1).`,
                        location: element,
                        suggestion: `Rename this cube to a unique identifier.`,
                        code: 'W3C-IC-1',
                    });
                } else {
                    datasetNames.set(element.name, element);
                }
            }
        }

        return violations;
    }

    /**
     * Type guard to check if an element is a CubeDefinition.
     */
    private isCubeDefinition(element: ProgramElement): element is CubeDefinition {
        return element.$type === 'CubeDefinition';
    }
}
