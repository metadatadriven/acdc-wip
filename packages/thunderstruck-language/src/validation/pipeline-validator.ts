/**
 * Pipeline Validator for Thunderstruck Language
 *
 * Validates pipeline definitions:
 * - All stage dependencies reference other stages in the pipeline
 * - No circular dependencies (cycle detection using DFS)
 * - Stage names are unique within pipeline
 * - Operation references are valid
 *
 * Provides:
 * - Dependency graph construction
 * - Cycle detection with path information
 * - Topological sort for execution order
 */

import { PipelineDefinition, PipelineStage } from '../generated/ast.js';
import { SymbolTable } from './symbol-table.js';
import { ReferenceValidator } from './reference-validator.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';

/**
 * Pipeline validator.
 *
 * Validates pipeline stages and dependencies, ensuring the pipeline
 * forms a valid directed acyclic graph (DAG).
 */
export class PipelineValidator {
    private referenceValidator: ReferenceValidator;

    constructor(private symbolTable: SymbolTable) {
        this.referenceValidator = new ReferenceValidator(symbolTable);
    }

    /**
     * Validate entire pipeline definition.
     */
    validatePipeline(pipeline: PipelineDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check for duplicate stage names
        const duplicateDiagnostics = this.checkDuplicateStageNames(pipeline);
        diagnostics.push(...duplicateDiagnostics);

        // Validate all dependencies
        const dependencyDiagnostics = this.validateDependencies(pipeline);
        diagnostics.push(...dependencyDiagnostics);

        // Detect cycles
        const cycles = this.detectCycles(pipeline);
        if (cycles) {
            for (const cycle of cycles) {
                const cyclePath = cycle.join(' → ');
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Pipeline '${pipeline.name}' has circular dependency: ${cyclePath}`,
                });
            }
        }

        // Validate operation references
        const operationDiagnostics = this.validateOperationReferences(pipeline);
        diagnostics.push(...operationDiagnostics);

        return diagnostics;
    }

    /**
     * Check for duplicate stage names within the pipeline.
     */
    private checkDuplicateStageNames(pipeline: PipelineDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];
        const seenNames = new Set<string>();

        for (const stage of pipeline.stages.stages) {
            if (seenNames.has(stage.name)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Pipeline '${pipeline.name}' has duplicate stage name '${stage.name}'`,
                });
            }
            seenNames.add(stage.name);
        }

        return diagnostics;
    }

    /**
     * Validate that all stage dependencies reference existing stages.
     */
    validateDependencies(pipeline: PipelineDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Collect all stage names
        const stageNames = new Set(
            pipeline.stages.stages.map(stage => stage.name)
        );

        // Check each stage's dependencies
        for (const stage of pipeline.stages.stages) {
            if (!stage.dependencies) {
                continue;
            }

            for (const depName of stage.dependencies.dependencies) {
                if (!stageNames.has(depName)) {
                    // Suggest similar stage names
                    const suggestion = this.referenceValidator.suggestComponentName(
                        depName,
                        Array.from(stageNames)
                    );

                    const message = suggestion
                        ? `Pipeline stage '${stage.name}' depends on undefined stage '${depName}'. Did you mean '${suggestion}'?`
                        : `Pipeline stage '${stage.name}' depends on undefined stage '${depName}'. Available stages: ${Array.from(stageNames).join(', ')}`;

                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message,
                    });
                }
            }
        }

        return diagnostics;
    }

    /**
     * Validate that operation references exist in the symbol table.
     */
    private validateOperationReferences(pipeline: PipelineDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        for (const stage of pipeline.stages.stages) {
            // Operation could be a slice, model, aggregate, display, or derive
            const opDiagnostics = this.referenceValidator.validateReference(
                stage.operationRef,
                ['slice', 'model', 'aggregate', 'display', 'derive'],
                `Pipeline stage '${stage.name}'`
            );
            diagnostics.push(...opDiagnostics);
        }

        return diagnostics;
    }

    /**
     * Detect cycles in the pipeline dependency graph using DFS.
     * Returns array of cycles (each cycle is an array of stage names), or null if no cycles.
     */
    detectCycles(pipeline: PipelineDefinition): string[][] | null {
        const graph = this.buildDependencyGraph(pipeline);

        // DFS state
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
     * Build dependency graph from pipeline definition.
     * Returns a map from stage name to set of dependency names.
     */
    buildDependencyGraph(pipeline: PipelineDefinition): Map<string, Set<string>> {
        const graph = new Map<string, Set<string>>();

        // Initialize nodes
        for (const stage of pipeline.stages.stages) {
            graph.set(stage.name, new Set<string>());
        }

        // Add edges (dependencies)
        for (const stage of pipeline.stages.stages) {
            if (stage.dependencies) {
                const deps = graph.get(stage.name)!;
                for (const depName of stage.dependencies.dependencies) {
                    deps.add(depName);
                }
            }
        }

        return graph;
    }

    /**
     * Perform topological sort on the pipeline.
     * Returns array of stage names in execution order, or null if there are cycles.
     */
    topologicalSort(pipeline: PipelineDefinition): string[] | null {
        // First check for cycles
        if (this.detectCycles(pipeline)) {
            return null;
        }

        const graph = this.buildDependencyGraph(pipeline);

        // Calculate in-degrees
        const inDegree = new Map<string, number>();
        for (const node of graph.keys()) {
            inDegree.set(node, 0);
        }
        for (const neighbors of graph.values()) {
            for (const neighbor of neighbors) {
                inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
            }
        }

        // Queue nodes with in-degree 0
        const queue: string[] = [];
        for (const [node, degree] of inDegree.entries()) {
            if (degree === 0) {
                queue.push(node);
            }
        }

        // Process queue
        const result: string[] = [];
        while (queue.length > 0) {
            const node = queue.shift()!;
            result.push(node);

            const neighbors = graph.get(node) || new Set<string>();
            for (const neighbor of neighbors) {
                const newDegree = (inDegree.get(neighbor) || 0) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) {
                    queue.push(neighbor);
                }
            }
        }

        // If not all nodes processed, there's a cycle (shouldn't happen due to check above)
        if (result.length !== graph.size) {
            return null;
        }

        return result;
    }
}
