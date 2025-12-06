/**
 * Thunderstruck Language Validator
 *
 * Provides validation rules and diagnostics for Thunderstruck documents.
 * This validator runs on document changes and reports syntax errors,
 * semantic errors, and warnings to the client.
 */

import { ValidationAcceptor, ValidationChecks, AstUtils } from 'langium';
import type { ThunderstruckAstType, ConceptDefinition, Program, CubeDefinition } from './generated/ast.js';
import type { ThunderstruckServices } from './thunderstruck-module.js';
import { ConceptValidator } from './validation/concept-validator.js';
import { DiagnosticSeverity } from './types/type-checker.js';

/**
 * Registry for validation checks.
 * Validators are organized by AST node type.
 */
export class ThunderstruckValidatorRegistry {
    constructor(services: ThunderstruckServices) {
        // Register validators here as we add more validation rules
    }
}

/**
 * Register custom validators for Thunderstruck.
 *
 * Registers validation checks for:
 * - Concept definitions (circular references, property types, namespaces)
 * - Component-to-concept linkage
 * - Property inheritance
 */
export function registerValidationChecks(services: ThunderstruckServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = new ThunderstruckValidator();

    const checks: ValidationChecks<ThunderstruckAstType> = {
        ConceptDefinition: validator.checkConceptDefinition,
        Program: validator.checkProgram,
    };
    registry.register(checks, validator);
}

/**
 * Custom validator for Thunderstruck-specific validation rules.
 *
 * Includes:
 * - Concept hierarchy validation (circular references)
 * - Property type validation
 * - Namespace collision detection
 * - Property inheritance validation
 */
export class ThunderstruckValidator {
    private conceptValidator = new ConceptValidator();

    /**
     * Validate a concept definition.
     */
    checkConceptDefinition(concept: ConceptDefinition, accept: ValidationAcceptor): void {
        // Get all concepts in the program
        const program = AstUtils.getContainerOfType(concept, (node): node is Program => node.$type === 'Program');
        if (!program) return;

        const allConcepts = AstUtils.streamAllContents(program)
            .filter(node => node.$type === 'ConceptDefinition')
            .map(node => node as ConceptDefinition)
            .toArray();

        // Build namespace index
        const namespaceIndex = new Map<string, ConceptDefinition[]>();
        for (const c of allConcepts) {
            const namespace = c.namespace || 'default';
            const existing = namespaceIndex.get(namespace) || [];
            existing.push(c);
            namespaceIndex.set(namespace, existing);
        }

        // Validate circular references
        const circularDiagnostics = this.checkCircularReferences(concept, new Set(), new Set());
        for (const diagnostic of circularDiagnostics) {
            accept('error', diagnostic.message, { node: concept, property: 'name' });
        }

        // Validate namespace collisions
        const namespace = concept.namespace || 'default';
        const conceptsInNamespace = namespaceIndex.get(namespace) || [];
        const duplicates = conceptsInNamespace.filter(
            c => c.name === concept.name && c !== concept
        );
        if (duplicates.length > 0) {
            accept('error', `Concept '${concept.name}' is defined multiple times in namespace '${namespace}'`, {
                node: concept,
                property: 'name'
            });
        }

        // Validate property types
        if (concept.properties) {
            for (const property of concept.properties.properties) {
                if (!property.type.ref) {
                    accept('error', `Property '${property.name}' has undefined type '${property.type.$refText}'. Properties must reference concept definitions.`, {
                        node: property,
                        property: 'name'
                    });
                }
            }
        }

        // Validate property inheritance
        const inheritanceDiagnostics = this.conceptValidator.validatePropertyInheritance(concept);
        for (const diagnostic of inheritanceDiagnostics) {
            accept(diagnostic.severity === DiagnosticSeverity.Error ? 'error' : 'warning', diagnostic.message, {
                node: concept,
                property: 'name'
            });
        }
    }

    /**
     * Validate the entire program for cross-cutting concerns.
     */
    checkProgram(program: Program, accept: ValidationAcceptor): void {
        // Get all components in cubes and check concept linkages
        const cubes = AstUtils.streamAllContents(program)
            .filter(node => node.$type === 'CubeDefinition')
            .map(node => node as CubeDefinition)
            .toArray();

        const allConcepts = AstUtils.streamAllContents(program)
            .filter(node => node.$type === 'ConceptDefinition')
            .map(node => node as ConceptDefinition)
            .toArray();

        for (const cube of cubes) {
            const components = [
                ...(cube.structure?.dimensions?.components || []),
                ...(cube.structure?.measures?.components || []),
                ...(cube.structure?.attributes?.components || [])
            ];

            for (const component of components) {
                if (component.concept && !component.concept.ref) {
                    accept('error', `Component '${component.name}' references undefined concept '${component.concept.$refText}'`, {
                        node: component,
                        property: 'name'
                    });
                }
            }
        }
    }

    /**
     * Check for circular references in concept hierarchy.
     */
    private checkCircularReferences(
        concept: ConceptDefinition,
        visited: Set<string>,
        stack: Set<string>
    ): { message: string }[] {
        const conceptName = concept.name;

        if (stack.has(conceptName)) {
            return [{ message: `Circular reference detected in concept hierarchy for '${concept.name}'` }];
        }

        if (visited.has(conceptName)) {
            return [];
        }

        visited.add(conceptName);
        stack.add(conceptName);

        const diagnostics: { message: string }[] = [];

        if (concept.parentType?.ref) {
            const parent = concept.parentType.ref;
            diagnostics.push(...this.checkCircularReferences(parent, visited, stack));
        }

        stack.delete(conceptName);
        return diagnostics;
    }
}
