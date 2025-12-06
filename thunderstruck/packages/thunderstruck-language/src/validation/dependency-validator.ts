/**
 * Dependency Validator for Thunderstruck Language
 *
 * Detects circular dependencies across all top-level constructs:
 * - Slices referencing slices
 * - Models referencing slices/cubes
 * - Derives referencing cubes/slices
 * - Aggregates referencing cubes/slices
 * - Displays referencing cubes/slices
 *
 * Builds a global dependency graph and uses DFS to detect cycles.
 */

import {
    Program,
    ProgramElement,
    SliceDefinition,
    ModelDefinition,
    DeriveDefinition,
    AggregateDefinition,
    DisplayDefinition,
} from '../generated/ast.js';
import { SymbolTable } from './symbol-table.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';

/**
 * Dependency validator.
 *
 * Detects circular dependencies in the program by building a global
 * dependency graph and checking for cycles.
 */
export class DependencyValidator {
    constructor(private symbolTable: SymbolTable) {}

    /**
     * Validate that there are no circular dependencies in the program.
     */
    validateNoCycles(program: Program): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Build global dependency graph
        const graph = this.buildGlobalDependencyGraph(program);

        // Detect cycles
        const cycles = this.detectCycles(graph);

        if (cycles) {
            for (const cycle of cycles) {
                const cyclePath = cycle.join(' → ');
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Circular dependency detected: ${cyclePath}`,
                });
            }
        }

        return diagnostics;
    }

    /**
     * Build global dependency graph.
     * Maps from entity name to set of dependency names.
     *
     * Example:
     * - Slice S1 depends on Cube C1 → graph.set('S1', new Set(['C1']))
     * - Model M1 depends on Slice S1 → graph.set('M1', new Set(['S1']))
     */
    buildGlobalDependencyGraph(program: Program): Map<string, Set<string>> {
        const graph = new Map<string, Set<string>>();

        for (const element of program.elements) {
            if (element.$type === 'ImportStatement') {
                continue;
            }

            const name = (element as any).name as string;
            if (!name) {
                continue;
            }

            // Initialize node
            if (!graph.has(name)) {
                graph.set(name, new Set<string>());
            }

            // Add dependencies based on element type
            const deps = this.extractDependencies(element);
            for (const dep of deps) {
                graph.get(name)!.add(dep);
            }
        }

        return graph;
    }

    /**
     * Extract dependencies from a program element.
     * Returns array of names that this element depends on.
     */
    private extractDependencies(element: ProgramElement): string[] {
        const deps: string[] = [];

        switch (element.$type) {
            case 'SliceDefinition': {
                const slice = element as SliceDefinition;
                deps.push(slice.cubeRef.$refText);
                break;
            }

            case 'ModelDefinition': {
                const model = element as ModelDefinition;
                deps.push(model.inputRef.$refText);
                break;
            }

            case 'DeriveDefinition': {
                const derive = element as DeriveDefinition;
                deps.push(derive.inputRef.$refText);
                break;
            }

            case 'AggregateDefinition': {
                const aggregate = element as AggregateDefinition;
                deps.push(aggregate.inputRef.$refText);
                break;
            }

            case 'DisplayDefinition': {
                const display = element as DisplayDefinition;
                deps.push(display.sourceRef.$refText);
                break;
            }

            // Other types (CubeDefinition, ConceptDefinition)
            // don't have input dependencies
        }

        return deps;
    }

    /**
     * Detect cycles in the dependency graph using DFS.
     * Returns array of cycles (each cycle is an array of entity names), or null if no cycles.
     */
    detectCycles(graph: Map<string, Set<string>>): string[][] | null {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const cycles: string[][] = [];

        /**
         * DFS helper to detect cycles.
         * Returns the cycle path if a cycle is found, null otherwise.
         */
        const dfs = (node: string, path: string[]): string[] | null => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);

            const neighbors = graph.get(node) || new Set<string>();
            for (const neighbor of neighbors) {
                // Only follow edges to nodes that exist in the graph
                if (!graph.has(neighbor)) {
                    continue;
                }

                if (!visited.has(neighbor)) {
                    const cycle = dfs(neighbor, [...path]);
                    if (cycle) {
                        return cycle;
                    }
                } else if (recursionStack.has(neighbor)) {
                    // Found a cycle - extract it from the path
                    const cycleStart = path.indexOf(neighbor);
                    return [...path.slice(cycleStart), neighbor];
                }
            }

            recursionStack.delete(node);
            return null;
        };

        // Run DFS from each unvisited node
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                const cycle = dfs(node, []);
                if (cycle) {
                    cycles.push(cycle);
                }
            }
        }

        return cycles.length > 0 ? cycles : null;
    }

    /**
     * Get all entities that a given entity depends on (transitive closure).
     */
    getTransitiveDependencies(
        entityName: string,
        graph: Map<string, Set<string>>
    ): Set<string> {
        const result = new Set<string>();
        const visited = new Set<string>();

        const dfs = (node: string) => {
            if (visited.has(node)) {
                return;
            }
            visited.add(node);

            const neighbors = graph.get(node) || new Set<string>();
            for (const neighbor of neighbors) {
                if (graph.has(neighbor)) {
                    result.add(neighbor);
                    dfs(neighbor);
                }
            }
        };

        dfs(entityName);
        return result;
    }

    /**
     * Get all entities that depend on a given entity (reverse dependencies).
     */
    getReverseDependencies(
        entityName: string,
        graph: Map<string, Set<string>>
    ): Set<string> {
        const result = new Set<string>();

        for (const [node, deps] of graph.entries()) {
            if (deps.has(entityName)) {
                result.add(node);
            }
        }

        return result;
    }
}
