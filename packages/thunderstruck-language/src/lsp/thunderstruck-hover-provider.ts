/**
 * Thunderstruck Hover Provider
 *
 * Provides hover information for Thunderstruck language elements.
 * Shows type information, documentation, and context for:
 * - Cubes and their components
 * - Slices and their constraints
 * - Models and their formulas
 * - References to other entities
 */

import { AstNode, AstUtils, CstNode } from 'langium';
import { HoverProvider } from 'langium/lsp';
import { Hover, MarkupKind } from 'vscode-languageserver';
import type { MaybePromise } from 'langium';
import {
    CubeDefinition,
    SliceDefinition,
    ModelDefinition,
    AggregateDefinition,
    DeriveDefinition,
    DisplayDefinition,
    isCubeDefinition,
    isSliceDefinition,
    isModelDefinition,
    isAggregateDefinition,
    isDeriveDefinition,
    isDisplayDefinition,
} from '../generated/ast.js';

export class ThunderstruckHoverProvider implements HoverProvider {
    getHoverContent(document: any, params: any): MaybePromise<Hover | undefined> {
        const rootNode = document.parseResult.value;
        const cst = params.textDocument.uri;
        const offset = document.textDocument.offsetAt(params.position);

        // Find the AST node at the cursor position
        const targetNode = this.findNodeAtOffset(rootNode.$cstNode, offset);
        if (!targetNode) {
            return undefined;
        }

        // Find the semantic element (AST node) for this CST node
        const astNode = this.findSemanticNode(targetNode);
        if (!astNode) {
            return undefined;
        }

        // Check if this is a reference
        const refNode = this.findReferenceTarget(astNode, targetNode);
        if (refNode) {
            return this.createHoverForElement(refNode);
        }

        // Otherwise, show hover for the element itself
        return this.createHoverForElement(astNode);
    }

    /**
     * Find the CST node at the given offset
     */
    private findNodeAtOffset(node: CstNode | undefined, offset: number): CstNode | undefined {
        if (!node) return undefined;

        if (node.offset <= offset && offset < node.end) {
            // Check children first (most specific)
            if ('children' in node) {
                for (const child of (node as any).children) {
                    const found = this.findNodeAtOffset(child, offset);
                    if (found) return found;
                }
            }
            return node;
        }
        return undefined;
    }

    /**
     * Find the AST node associated with a CST node
     */
    private findSemanticNode(cstNode: CstNode): AstNode | undefined {
        let current: any = cstNode;
        while (current) {
            if (current.element) {
                return current.element;
            }
            current = current.parent;
        }
        return undefined;
    }

    /**
     * Check if this node is a reference and find its target
     */
    private findReferenceTarget(astNode: AstNode, cstNode: CstNode): AstNode | undefined {
        // Check if the astNode has reference properties
        const node = astNode as any;

        // Check common reference properties
        const refProps = ['cubeRef', 'inputRef', 'sourceRef'];
        for (const prop of refProps) {
            if (node[prop] && typeof node[prop] === 'object' && node[prop].ref) {
                return node[prop].ref as AstNode;
            }
        }

        return undefined;
    }

    /**
     * Create hover content for an element
     */
    private createHoverForElement(node: AstNode): Hover | undefined {
        let content: string | undefined;

        if (isCubeDefinition(node)) {
            content = this.createHoverForCube(node);
        } else if (isSliceDefinition(node)) {
            content = this.createHoverForSlice(node);
        } else if (isModelDefinition(node)) {
            content = this.createHoverForModel(node);
        } else if (isAggregateDefinition(node)) {
            content = this.createHoverForAggregate(node);
        } else if (isDeriveDefinition(node)) {
            content = this.createHoverForDerive(node);
        } else if (isDisplayDefinition(node)) {
            content = this.createHoverForDisplay(node);
        }

        if (!content) {
            return undefined;
        }

        return {
            contents: {
                kind: MarkupKind.Markdown,
                value: content,
            },
        };
    }

    private createHoverForCube(cube: CubeDefinition): string {
        const parts: string[] = [];

        parts.push(`**Cube:** \`${cube.name}\``);
        parts.push('');

        if (cube.namespace) {
            parts.push(`**Namespace:** ${cube.namespace}`);
            parts.push('');
        }

        if (cube.structure) {
            if (cube.structure.dimensions && cube.structure.dimensions.components.length > 0) {
                parts.push('**Dimensions:**');
                for (const dim of cube.structure.dimensions.components) {
                    parts.push(`- ${dim.name}: ${this.formatType(dim.type)}`);
                }
                parts.push('');
            }

            if (cube.structure.measures && cube.structure.measures.components.length > 0) {
                parts.push('**Measures:**');
                for (const measure of cube.structure.measures.components) {
                    const unit = measure.unit ? ` (unit: ${measure.unit})` : '';
                    parts.push(`- ${measure.name}: ${this.formatType(measure.type)}${unit}`);
                }
                parts.push('');
            }

            if (cube.structure.attributes && cube.structure.attributes.components.length > 0) {
                parts.push('**Attributes:**');
                for (const attr of cube.structure.attributes.components) {
                    parts.push(`- ${attr.name}: ${this.formatType(attr.type)}`);
                }
            }
        }

        return parts.join('\n');
    }

    private createHoverForSlice(slice: SliceDefinition): string {
        const parts: string[] = [];

        parts.push(`**Slice:** \`${slice.name}\``);
        parts.push('');
        parts.push(`**From:** ${slice.cubeRef.$refText}`);

        if (slice.fixedDimensions && slice.fixedDimensions.constraints.length > 0) {
            parts.push('');
            parts.push('**Fixed:**');
            for (const constraint of slice.fixedDimensions.constraints) {
                parts.push(`- ${constraint.dimension}: ${this.formatExpression(constraint.value)}`);
            }
        }

        if (slice.varyingDimensions && slice.varyingDimensions.dimensions.length > 0) {
            parts.push('');
            parts.push('**Vary:**');
            parts.push(`- ${slice.varyingDimensions.dimensions.join(', ')}`);
        }

        if (slice.whereClause) {
            parts.push('');
            parts.push(`**Where:** ${this.formatExpression(slice.whereClause)}`);
        }

        return parts.join('\n');
    }

    private createHoverForModel(model: ModelDefinition): string {
        const parts: string[] = [];

        parts.push(`**Model:** \`${model.name}\``);
        parts.push('');
        parts.push(`**Input:** ${model.inputRef.$refText}`);

        if (model.formula) {
            parts.push('');
            parts.push(`**Formula:** \`${this.formatFormula(model.formula)}\``);
        }

        if (model.family) {
            parts.push('');
            parts.push(`**Family:** ${model.family}`);
        }

        if (model.link) {
            parts.push('');
            parts.push(`**Link:** ${model.link}`);
        }

        return parts.join('\n');
    }

    private createHoverForAggregate(aggregate: AggregateDefinition): string {
        const parts: string[] = [];

        parts.push(`**Aggregate:** \`${aggregate.name}\``);
        parts.push('');
        parts.push(`**Input:** ${aggregate.inputRef.$refText}`);

        if (aggregate.groupBy && aggregate.groupBy.dimensions.length > 0) {
            parts.push('');
            parts.push('**Group By:**');
            parts.push(`- ${aggregate.groupBy.dimensions.join(', ')}`);
        }

        if (aggregate.statistics && aggregate.statistics.statistics.length > 0) {
            parts.push('');
            parts.push('**Statistics:**');
            for (const stat of aggregate.statistics.statistics) {
                parts.push(`- ${stat.name} = ${stat.function}(${stat.measure})`);
            }
        }

        return parts.join('\n');
    }

    private createHoverForDerive(derive: DeriveDefinition): string {
        const parts: string[] = [];

        parts.push(`**Derive:** \`${derive.name}\``);
        parts.push('');
        parts.push(`**Input:** ${derive.inputRef.$refText}`);

        if (derive.output) {
            if ((derive.output as any).$type === 'CubeDefinition') {
                const outputCube = derive.output as CubeDefinition;
                parts.push(`**Output:** ${outputCube.name}`);
            } else if ((derive.output as any).cubeRef) {
                parts.push(`**Output:** ${(derive.output as any).cubeRef.$refText}`);
            }
        }

        return parts.join('\n');
    }

    private createHoverForDisplay(display: DisplayDefinition): string {
        const parts: string[] = [];

        parts.push(`**Display:** \`${display.displayType}\``);

        if (display.title) {
            parts.push('');
            parts.push(`**Title:** ${display.title}`);
        }

        parts.push('');
        parts.push(`**Source:** ${display.sourceRef.$refText}`);

        return parts.join('\n');
    }

    private formatType(type: any): string {
        if (!type) return 'unknown';

        if (typeof type === 'string') {
            return type;
        }

        if (type.$type === 'PrimitiveType') {
            return type.name;
        }

        if (type.$type === 'CodedValueType') {
            return `CodedValue<${type.codeListRef || 'unknown'}>`;
        }

        return 'unknown';
    }

    private formatExpression(expr: any): string {
        if (!expr) return '';

        // Simple string representation
        if (expr.$type === 'NumberLiteral') {
            return String(expr.value);
        }
        if (expr.$type === 'StringLiteral') {
            return `"${expr.value}"`;
        }
        if (expr.$type === 'VariableRef') {
            return expr.name;
        }
        if (expr.$type === 'BinaryExpression') {
            return `${this.formatExpression(expr.left)} ${expr.operator} ${this.formatExpression(expr.right)}`;
        }

        return '...';
    }

    private formatFormula(formula: any): string {
        if (!formula) return '';

        const response = formula.response || '?';
        const terms = formula.terms || [];
        const termStrs = terms.map((t: any) => this.formatTerm(t));

        return `${response} ~ ${termStrs.join(' + ')}`;
    }

    private formatTerm(term: any): string {
        if (!term) return '';

        if (term.$type === 'VariableTerm') {
            return term.name;
        }
        if (term.$type === 'InteractionTerm') {
            return term.variables.join(':');
        }

        return '?';
    }
}
