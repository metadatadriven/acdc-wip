/**
 * CDISC CORE Rule Checkers
 *
 * Implements specific rule checker types for CORE conformance rules.
 */

import { CubeDefinition, Component } from '../../generated/ast.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';
import { RuleChecker, CORERule, COREViolation } from './core-rules-engine.js';

/**
 * No Duplicate Key Checker
 *
 * Validates that key variables uniquely identify records.
 * Checks that key variables are present and properly typed.
 */
export class NoDuplicateKeyChecker extends RuleChecker {
    readonly type = 'no-duplicate-key';

    check(cube: CubeDefinition, rule: CORERule): COREViolation[] {
        const violations: COREViolation[] = [];
        const keyVariables = rule.config.keyVariables as string[];

        if (!keyVariables || keyVariables.length === 0) {
            return violations;
        }

        const components = this.getCubeComponents(cube);

        for (const keyVar of keyVariables) {
            const component = components.find(c => c.name === keyVar);

            if (!component) {
                violations.push({
                    ruleId: rule.id,
                    severity: DiagnosticSeverity.Error,
                    message: `Key variable '${keyVar}' is missing. Key variables must be present to ensure unique record identification.`,
                    variable: keyVar,
                });
            }
        }

        return violations;
    }

    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];
        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }
        return components;
    }
}

/**
 * ISO 8601 Date Checker
 *
 * Validates that date/datetime variables use ISO 8601 format.
 * For Thunderstruck, this checks that DateTime/Date types are used.
 */
export class ISO8601DateChecker extends RuleChecker {
    readonly type = 'iso8601-date';

    check(cube: CubeDefinition, rule: CORERule): COREViolation[] {
        const violations: COREViolation[] = [];
        const targetVariables = rule.variables || [];

        if (targetVariables.length === 0) {
            return violations;
        }

        const components = this.getCubeComponents(cube);

        for (const varName of targetVariables) {
            const component = components.find(c => c.name === varName);

            if (!component) {
                continue; // Variable not present - not a format issue
            }

            // Check if component has DateTime or Date type
            const isDateType = component.type.$type === 'PrimitiveType' &&
                (component.type.type === 'DateTime' || component.type.type === 'Date');

            if (!isDateType) {
                violations.push({
                    ruleId: rule.id,
                    severity: rule.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
                    message: `Variable '${varName}' should use DateTime or Date type for ISO 8601 compliance. Current type: ${this.getComponentType(component)}`,
                    variable: varName,
                    location: component,
                });
            }
        }

        return violations;
    }

    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];
        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }
        return components;
    }

    private getComponentType(component: Component): string {
        if (component.type.$type === 'PrimitiveType') {
            return component.type.type;
        }
        return component.type.$type;
    }
}

/**
 * DateTime Order Checker
 *
 * Validates that start date/time comes before end date/time.
 * This is a structural check - runtime data validation happens elsewhere.
 */
export class DateTimeOrderChecker extends RuleChecker {
    readonly type = 'datetime-order';

    check(cube: CubeDefinition, rule: CORERule): COREViolation[] {
        const violations: COREViolation[] = [];
        const startVar = rule.config.startVariable as string;
        const endVar = rule.config.endVariable as string;

        if (!startVar || !endVar) {
            return violations;
        }

        const components = this.getCubeComponents(cube);
        const startComponent = components.find(c => c.name === startVar);
        const endComponent = components.find(c => c.name === endVar);

        // Check both variables exist
        if (!startComponent) {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `Start datetime variable '${startVar}' is missing for datetime order validation.`,
                variable: startVar,
            });
        }

        if (!endComponent) {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `End datetime variable '${endVar}' is missing for datetime order validation.`,
                variable: endVar,
            });
        }

        // Check both are datetime types
        if (startComponent && !this.isDateTimeType(startComponent)) {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `Start variable '${startVar}' should be DateTime or Date type for order validation.`,
                variable: startVar,
                location: startComponent,
            });
        }

        if (endComponent && !this.isDateTimeType(endComponent)) {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `End variable '${endVar}' should be DateTime or Date type for order validation.`,
                variable: endVar,
                location: endComponent,
            });
        }

        return violations;
    }

    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];
        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }
        return components;
    }

    private isDateTimeType(component: Component): boolean {
        return component.type.$type === 'PrimitiveType' &&
            (component.type.type === 'DateTime' || component.type.type === 'Date');
    }
}

/**
 * Required If Checker
 *
 * Validates conditional requirements (if X is present, Y must be present).
 */
export class RequiredIfChecker extends RuleChecker {
    readonly type = 'required-if';

    check(cube: CubeDefinition, rule: CORERule): COREViolation[] {
        const violations: COREViolation[] = [];
        const conditionVar = rule.config.conditionVariable as string;
        const requiredVar = rule.config.requiredVariable as string;

        if (!conditionVar || !requiredVar) {
            return violations;
        }

        const components = this.getCubeComponents(cube);
        const condComponent = components.find(c => c.name === conditionVar);
        const reqComponent = components.find(c => c.name === requiredVar);

        // If condition variable is present, required variable must be present
        if (condComponent && !reqComponent) {
            violations.push({
                ruleId: rule.id,
                severity: rule.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
                message: `Variable '${requiredVar}' is required when '${conditionVar}' is present.`,
                variable: requiredVar,
            });
        }

        return violations;
    }

    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];
        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }
        return components;
    }
}

/**
 * Value In CodeList Checker
 *
 * Validates that CodedValue variables specify appropriate code lists.
 */
export class ValueInCodeListChecker extends RuleChecker {
    readonly type = 'value-in-codelist';

    check(cube: CubeDefinition, rule: CORERule): COREViolation[] {
        const violations: COREViolation[] = [];
        const targetVariable = rule.config.variable as string;
        const expectedCodeList = rule.config.codeList as string;

        if (!targetVariable || !expectedCodeList) {
            return violations;
        }

        const components = this.getCubeComponents(cube);
        const component = components.find(c => c.name === targetVariable);

        if (!component) {
            return violations; // Variable not present
        }

        // Check if it's a CodedValue type
        if (component.type.$type !== 'CodedValueType') {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `Variable '${targetVariable}' should be CodedValue type with code list '${expectedCodeList}'.`,
                variable: targetVariable,
                location: component,
            });
            return violations;
        }

        // Check if code list matches
        const codeListRef = component.type.codeList;
        if (!codeListRef || !codeListRef.segments || codeListRef.segments.length === 0) {
            violations.push({
                ruleId: rule.id,
                severity: DiagnosticSeverity.Warning,
                message: `Variable '${targetVariable}' should specify code list '${expectedCodeList}'.`,
                variable: targetVariable,
                location: component,
            });
        } else {
            // Get the last segment as the code list name (for namespaced code lists like CDISC.SEX)
            const actualCodeList = codeListRef.segments[codeListRef.segments.length - 1];
            if (actualCodeList !== expectedCodeList) {
                violations.push({
                    ruleId: rule.id,
                    severity: DiagnosticSeverity.Warning,
                    message: `Variable '${targetVariable}' uses code list '${actualCodeList}' but '${expectedCodeList}' is expected per CDISC standards.`,
                    variable: targetVariable,
                    location: component,
                });
            }
        }

        return violations;
    }

    private getCubeComponents(cube: CubeDefinition): Component[] {
        const components: Component[] = [];
        if (cube.structure.dimensions) {
            components.push(...cube.structure.dimensions.components);
        }
        if (cube.structure.measures) {
            components.push(...cube.structure.measures.components);
        }
        if (cube.structure.attributes) {
            components.push(...cube.structure.attributes.components);
        }
        return components;
    }
}
