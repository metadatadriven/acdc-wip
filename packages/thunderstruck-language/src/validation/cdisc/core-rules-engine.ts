/**
 * CDISC CORE Rules Engine
 *
 * Implements CDISC Conformance Rules (CORE) validation.
 * CORE rules define specific conformance requirements for CDISC standards.
 *
 * Reference: https://www.cdisc.org/standards/foundational/conformance
 */

import { CubeDefinition, Component } from '../../generated/ast.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';

/**
 * Represents a CORE rule violation.
 */
export interface COREViolation {
    ruleId: string;
    severity: DiagnosticSeverity;
    message: string;
    variable?: string;
    location?: any;
}

/**
 * Represents a CORE rule definition.
 */
export interface CORERule {
    /** Rule identifier (e.g., "CG0001", "CG0002") */
    id: string;

    /** Rule description */
    description: string;

    /** Severity level */
    severity: 'error' | 'warning';

    /** Rule category (e.g., "Structure", "Formatting", "Content") */
    category: string;

    /** Checker type to use */
    checkerType: string;

    /** Configuration for the checker */
    config: Record<string, any>;

    /** Applicable domains/datasets */
    appliesTo?: string[];

    /** Specific variables this rule applies to */
    variables?: string[];
}

/**
 * Abstract base class for rule checkers.
 */
export abstract class RuleChecker {
    abstract readonly type: string;

    /**
     * Check a cube against this rule.
     *
     * @param cube The cube to check
     * @param rule The rule definition
     * @returns Array of violations found
     */
    abstract check(cube: CubeDefinition, rule: CORERule): COREViolation[];
}

/**
 * CORE Rules Engine.
 *
 * Orchestrates execution of CORE rules against cubes.
 */
export class COREulesEngine {
    private checkers: Map<string, RuleChecker> = new Map();
    private rules: CORERule[] = [];

    /**
     * Register a rule checker.
     */
    registerChecker(checker: RuleChecker): void {
        this.checkers.set(checker.type, checker);
    }

    /**
     * Register CORE rules.
     */
    registerRules(rules: CORERule[]): void {
        this.rules.push(...rules);
    }

    /**
     * Clear all registered rules.
     */
    clearRules(): void {
        this.rules = [];
    }

    /**
     * Get all registered rules.
     */
    getRules(): CORERule[] {
        return [...this.rules];
    }

    /**
     * Get rules applicable to a specific domain/dataset.
     */
    getRulesForDomain(domain: string): CORERule[] {
        return this.rules.filter(rule => {
            if (!rule.appliesTo || rule.appliesTo.length === 0) {
                return true; // Rule applies to all domains
            }
            return rule.appliesTo.includes(domain);
        });
    }

    /**
     * Execute all applicable rules against a cube.
     *
     * @param cube The cube to validate
     * @param domain The domain/dataset type (e.g., "DM", "ADSL")
     * @returns Array of violations found
     */
    validateCube(cube: CubeDefinition, domain: string): COREViolation[] {
        const violations: COREViolation[] = [];
        const applicableRules = this.getRulesForDomain(domain);

        for (const rule of applicableRules) {
            const checker = this.checkers.get(rule.checkerType);
            if (!checker) {
                console.warn(`No checker registered for type: ${rule.checkerType}`);
                continue;
            }

            try {
                const ruleViolations = checker.check(cube, rule);
                violations.push(...ruleViolations);
            } catch (error) {
                console.error(`Error executing rule ${rule.id}:`, error);
            }
        }

        return violations;
    }

    /**
     * Get checker by type.
     */
    getChecker(type: string): RuleChecker | undefined {
        return this.checkers.get(type);
    }
}
