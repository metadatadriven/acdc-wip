/**
 * Concept Validator for Thunderstruck Language
 *
 * Validates concept definitions including:
 * - Circular reference detection in concept hierarchies
 * - Property type validation (properties must reference concepts)
 * - Property inheritance chain validation
 * - Code list reference validation
 * - Concept-to-component linkage validation
 * - Type compatibility in concept hierarchies
 * - Namespace resolution and collision detection
 */

import { ConceptDefinition, Component, Program } from '../generated/ast.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import { AstUtils } from 'langium';

/**
 * Concept validator for validating concept definitions and relationships.
 */
export class ConceptValidator {
    /**
     * Validate all concepts in a program.
     */
    validateProgram(program: Program): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Get all concept definitions
        const concepts = AstUtils.streamAllContents(program).filter(
            node => node.$type === 'ConceptDefinition'
        ).map(node => node as ConceptDefinition).toArray();

        // Build namespace index
        const namespaceIndex = this.buildNamespaceIndex(concepts);

        // Validate each concept
        for (const concept of concepts) {
            diagnostics.push(...this.validateConcept(concept, concepts, namespaceIndex));
        }

        return diagnostics;
    }

    /**
     * Build an index of concepts by namespace.
     */
    private buildNamespaceIndex(concepts: ConceptDefinition[]): Map<string, ConceptDefinition[]> {
        const index = new Map<string, ConceptDefinition[]>();

        for (const concept of concepts) {
            const namespace = concept.namespace || 'default';
            const existing = index.get(namespace) || [];
            existing.push(concept);
            index.set(namespace, existing);
        }

        return index;
    }

    /**
     * Validate a single concept definition.
     */
    private validateConcept(
        concept: ConceptDefinition,
        allConcepts: ConceptDefinition[],
        namespaceIndex: Map<string, ConceptDefinition[]>
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check for circular references in hierarchy
        diagnostics.push(...this.checkCircularReferences(concept, allConcepts));

        // Validate property types
        if (concept.properties) {
            for (const property of concept.properties.properties) {
                diagnostics.push(...this.validatePropertyType(property, allConcepts));
            }
        }

        // Validate namespace collisions
        diagnostics.push(...this.checkNamespaceCollisions(concept, namespaceIndex));

        // Validate code list references (basic validation)
        if (concept.codeLists) {
            diagnostics.push(...this.validateCodeLists(concept));
        }

        return diagnostics;
    }

    /**
     * Check for circular references in concept hierarchy.
     */
    private checkCircularReferences(
        concept: ConceptDefinition,
        allConcepts: ConceptDefinition[]
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];
        const visited = new Set<string>();
        const stack = new Set<string>();

        const detectCycle = (current: ConceptDefinition): boolean => {
            const conceptName = current.name;

            if (stack.has(conceptName)) {
                // Found a cycle
                return true;
            }

            if (visited.has(conceptName)) {
                // Already checked this path
                return false;
            }

            visited.add(conceptName);
            stack.add(conceptName);

            // Check parent
            if (current.parentType?.ref) {
                const parent = current.parentType.ref;
                if (detectCycle(parent)) {
                    return true;
                }
            }

            stack.delete(conceptName);
            return false;
        };

        if (detectCycle(concept)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Circular reference detected in concept hierarchy for '${concept.name}'`
            });
        }

        return diagnostics;
    }

    /**
     * Validate that property types reference valid concepts.
     */
    private validatePropertyType(
        property: { name: string; type: { ref?: ConceptDefinition; $refText: string } },
        allConcepts: ConceptDefinition[]
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        if (!property.type.ref) {
            // Property type doesn't resolve to a concept
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Property '${property.name}' has undefined type '${property.type.$refText}'. Properties must reference concept definitions.`
            });
        }

        return diagnostics;
    }

    /**
     * Check for namespace collisions (multiple concepts with same name in same namespace).
     */
    private checkNamespaceCollisions(
        concept: ConceptDefinition,
        namespaceIndex: Map<string, ConceptDefinition[]>
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];
        const namespace = concept.namespace || 'default';
        const conceptsInNamespace = namespaceIndex.get(namespace) || [];

        const duplicates = conceptsInNamespace.filter(
            c => c.name === concept.name && c !== concept
        );

        if (duplicates.length > 0) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Concept '${concept.name}' is defined multiple times in namespace '${namespace}'`
            });
        }

        return diagnostics;
    }

    /**
     * Validate code list references (basic validation for format).
     */
    private validateCodeLists(concept: ConceptDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        if (!concept.codeLists?.mappings) {
            return diagnostics;
        }

        for (const mapping of concept.codeLists.mappings) {
            // Check that namespace is valid format
            if (!mapping.namespace) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Code list mapping is missing namespace`
                });
            }

            // Check that code is not empty
            if (!mapping.code || mapping.code.length === 0) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Code list mapping has empty code value`
                });
            }
        }

        return diagnostics;
    }

    /**
     * Validate that a component's concept reference is valid.
     */
    validateComponentConcept(
        component: Component,
        allConcepts: ConceptDefinition[]
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        if (!component.concept) {
            // No concept link is valid (optional)
            return diagnostics;
        }

        if (!component.concept.ref) {
            // Concept reference doesn't resolve
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Component '${component.name}' references undefined concept '${component.concept.$refText}'`
            });
        }

        return diagnostics;
    }

    /**
     * Validate property inheritance chain.
     * Ensures that properties are properly inherited through the concept hierarchy.
     */
    validatePropertyInheritance(concept: ConceptDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];
        const inheritedProperties = new Map<string, { type: string; source: ConceptDefinition }>();

        // Collect properties from parent hierarchy (not including current concept)
        const collectParentProperties = (current: ConceptDefinition | undefined, depth: number = 0): void => {
            if (!current || depth > 100) { // Prevent infinite loops
                return;
            }

            // Recurse to parent first
            if (current.parentType?.ref) {
                collectParentProperties(current.parentType.ref, depth + 1);
            }

            // Add properties from current level (will override grandparent properties)
            if (current.properties) {
                for (const property of current.properties.properties) {
                    inheritedProperties.set(property.name, {
                        type: property.type.$refText,
                        source: current
                    });
                }
            }
        };

        // Start collecting from parent (not from concept itself)
        if (concept.parentType?.ref) {
            collectParentProperties(concept.parentType.ref);
        }

        // Check if concept's own properties conflict with inherited ones
        if (concept.properties) {
            for (const property of concept.properties.properties) {
                const inherited = inheritedProperties.get(property.name);
                if (inherited && inherited.type !== property.type.$refText) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Warning,
                        message: `Property '${property.name}' in concept '${concept.name}' redefines inherited property with different type. Inherited type: '${inherited.type}', new type: '${property.type.$refText}'`
                    });
                }
            }
        }

        return diagnostics;
    }

    /**
     * Get all properties for a concept, including inherited ones.
     */
    getAllProperties(concept: ConceptDefinition): Map<string, { name: string; type: string; source: ConceptDefinition }> {
        const properties = new Map<string, { name: string; type: string; source: ConceptDefinition }>();

        const collectProperties = (current: ConceptDefinition | undefined, depth: number = 0): void => {
            if (!current || depth > 100) {
                return;
            }

            // Recurse to parent first (so child properties override parent)
            if (current.parentType?.ref) {
                collectProperties(current.parentType.ref, depth + 1);
            }

            // Add/override properties from current concept
            if (current.properties) {
                for (const property of current.properties.properties) {
                    properties.set(property.name, {
                        name: property.name,
                        type: property.type.$refText,
                        source: current
                    });
                }
            }
        };

        collectProperties(concept);
        return properties;
    }
}
