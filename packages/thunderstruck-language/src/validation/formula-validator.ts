/**
 * Formula Validator for Thunderstruck Language
 *
 * Validates statistical formulas in model definitions.
 * Ensures all variables exist in the input cube and have appropriate types.
 *
 * Design decision (Q6): All formula variables must exist in cube
 * - Variables must be pre-declared in input cube
 * - Response variables must be measures
 * - Predictor variables can be dimensions or measures
 */

import {
    Formula,
    FormulaTerm,
    FormulaVariable,
    FormulaAddition,
    FormulaCrossing,
    FormulaInteraction,
    FormulaFunction,
    FormulaNesting,
    FormulaPower,
    FormulaConditioning,
    FormulaNumber,
    ModelDefinition,
} from '../generated/ast.js';
import { SymbolTable } from './symbol-table.js';
import { CubeType } from '../types/type-system.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';

/**
 * Formula validator.
 *
 * Validates that:
 * - All variables in formula exist in input cube
 * - Response variable (LHS of ~) is a measure
 * - Predictor variables (RHS of ~) are dimensions or measures
 * - Function calls are valid (basic checking)
 */
export class FormulaValidator {
    constructor(private symbolTable: SymbolTable) {}

    /**
     * Validate a formula against an input cube.
     * Checks that all referenced variables exist and have appropriate types.
     */
    validateFormula(
        formula: Formula,
        inputCube: CubeType
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Validate response variable (LHS of ~)
        const responseVars = this.collectVariables(formula.response);
        for (const varName of responseVars) {
            // Response must be a measure
            if (!inputCube.measures.has(varName)) {
                if (inputCube.hasComponent(varName)) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message: `Response variable '${varName}' must be a measure, but it is a ${inputCube.dimensions.has(varName) ? 'dimension' : 'attribute'}`,
                    });
                } else {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message: `Response variable '${varName}' is not defined in cube '${inputCube.name}'`,
                    });
                }
            }
        }

        // Validate predictor variables (RHS of ~)
        const predictorVars = this.collectVariables(formula.predictors);
        for (const varName of predictorVars) {
            // Predictors can be dimensions or measures
            const isDimension = inputCube.dimensions.has(varName);
            const isMeasure = inputCube.measures.has(varName);

            if (!isDimension && !isMeasure) {
                if (inputCube.attributes.has(varName)) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message: `Predictor variable '${varName}' cannot be an attribute. Use dimensions or measures in formulas.`,
                    });
                } else {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        message: `Predictor variable '${varName}' is not defined in cube '${inputCube.name}'`,
                    });
                }
            }
        }

        return diagnostics;
    }

    /**
     * Validate a model definition.
     * Resolves the input cube and validates the formula.
     */
    validateModel(model: ModelDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Resolve input cube
        const inputSymbol = this.symbolTable.resolveGlobal(model.inputRef);

        if (!inputSymbol) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Model '${model.name}' references undefined input '${model.inputRef}'`,
            });
            return diagnostics;
        }

        // Input must be a cube (or slice, but we'll check for cube type)
        if (!(inputSymbol.type instanceof CubeType)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Model '${model.name}' input '${model.inputRef}' is not a cube`,
            });
            return diagnostics;
        }

        // Validate formula against input cube
        const formulaDiagnostics = this.validateFormula(model.formula, inputSymbol.type);
        diagnostics.push(...formulaDiagnostics);

        return diagnostics;
    }

    /**
     * Collect all variable names used in a formula term.
     * Recursively walks the formula structure.
     */
    collectVariables(term: FormulaTerm): Set<string> {
        const variables = new Set<string>();

        // Base case: FormulaVariable
        if (this.isFormulaVariable(term)) {
            variables.add(term.variable);
            return variables;
        }

        // Base case: FormulaNumber (no variables)
        if (this.isFormulaNumber(term)) {
            return variables;
        }

        // Recursive cases
        if (this.isFormulaAddition(term)) {
            const leftVars = this.collectVariables(term.left);
            const rightVars = this.collectVariables(term.right);
            leftVars.forEach(v => variables.add(v));
            rightVars.forEach(v => variables.add(v));
        }

        if (this.isFormulaCrossing(term) || this.isFormulaInteraction(term)) {
            const leftVars = this.collectVariables(term.left);
            const rightVars = this.collectVariables(term.right);
            leftVars.forEach(v => variables.add(v));
            rightVars.forEach(v => variables.add(v));
        }

        if (this.isFormulaNesting(term)) {
            const leftVars = this.collectVariables(term.left);
            const rightVars = this.collectVariables(term.right);
            leftVars.forEach(v => variables.add(v));
            rightVars.forEach(v => variables.add(v));
        }

        if (this.isFormulaPower(term)) {
            const leftVars = this.collectVariables(term.left);
            leftVars.forEach(v => variables.add(v));
            // Note: right side of power is typically a number, not a variable
        }

        if (this.isFormulaFunction(term)) {
            for (const arg of term.arguments) {
                const argVars = this.collectVariables(arg);
                argVars.forEach(v => variables.add(v));
            }
        }

        if (this.isFormulaConditioning(term)) {
            const leftVars = this.collectVariables(term.left);
            const rightVars = this.collectVariables(term.right);
            leftVars.forEach(v => variables.add(v));
            rightVars.forEach(v => variables.add(v));
        }

        return variables;
    }

    /**
     * Get a suggestion for a misspelled variable name.
     * Uses simple Levenshtein distance to find closest match.
     */
    suggestVariable(
        name: string,
        availableNames: string[]
    ): string | undefined {
        if (availableNames.length === 0) {
            return undefined;
        }

        // Find closest match using Levenshtein distance
        let closestName = availableNames[0];
        let closestDistance = this.levenshteinDistance(name.toLowerCase(), closestName.toLowerCase());

        for (const availableName of availableNames) {
            const distance = this.levenshteinDistance(name.toLowerCase(), availableName.toLowerCase());
            if (distance < closestDistance) {
                closestDistance = distance;
                closestName = availableName;
            }
        }

        // Only suggest if distance is small (typo threshold)
        if (closestDistance <= 3) {
            return closestName;
        }

        return undefined;
    }

    /**
     * Calculate Levenshtein distance between two strings.
     */
    private levenshteinDistance(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix: number[][] = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    // Type guards
    private isFormulaVariable(term: FormulaTerm): term is FormulaVariable {
        return term.$type === 'FormulaVariable';
    }

    private isFormulaNumber(term: FormulaTerm): term is FormulaNumber {
        return term.$type === 'FormulaNumber';
    }

    private isFormulaAddition(term: FormulaTerm): term is FormulaAddition {
        return term.$type === 'FormulaAddition';
    }

    private isFormulaCrossing(term: FormulaTerm): term is FormulaCrossing {
        return term.$type === 'FormulaCrossing';
    }

    private isFormulaInteraction(term: FormulaTerm): term is FormulaInteraction {
        return term.$type === 'FormulaInteraction';
    }

    private isFormulaNesting(term: FormulaTerm): term is FormulaNesting {
        return term.$type === 'FormulaNesting';
    }

    private isFormulaPower(term: FormulaTerm): term is FormulaPower {
        return term.$type === 'FormulaPower';
    }

    private isFormulaFunction(term: FormulaTerm): term is FormulaFunction {
        return term.$type === 'FormulaFunction';
    }

    private isFormulaConditioning(term: FormulaTerm): term is FormulaConditioning {
        return term.$type === 'FormulaConditioning';
    }
}
