/**
 * Model Validator for Thunderstruck Language
 *
 * Validates model definitions:
 * - Input reference exists and is a cube or slice
 * - Formula variables exist in input cube
 * - Family/link function compatibility
 * - Random effects subject is a dimension
 *
 * Design decisions:
 * - Response variables must be measures (handled by FormulaValidator)
 * - Predictor variables can be dimensions or measures (handled by FormulaValidator)
 * - Family/link combinations follow standard GLM rules
 */

import { ModelDefinition, ModelFamily, LinkFunction } from '../generated/ast.js';
import { SymbolTable } from './symbol-table.js';
import { ReferenceValidator } from './reference-validator.js';
import { FormulaValidator } from './formula-validator.js';
import { TypeDiagnostic, DiagnosticSeverity } from '../types/type-checker.js';
import { CubeType } from '../types/type-system.js';

/**
 * Compatible family-link combinations for GLM models.
 * Based on standard statistical practice.
 */
const COMPATIBLE_LINKS: Record<ModelFamily, LinkFunction[]> = {
    'Gaussian': ['Identity', 'Log', 'Inverse'],
    'Binomial': ['Logit', 'Probit', 'Log'],
    'Poisson': ['Log', 'Identity', 'Sqrt'],
    'Gamma': ['Inverse', 'Identity', 'Log'],
    'InverseGaussian': ['Inverse', 'Identity', 'Log'],
};

/**
 * Model validator.
 *
 * Validates that model definitions have valid inputs, formulas,
 * and family/link combinations.
 */
export class ModelValidator {
    private referenceValidator: ReferenceValidator;
    private formulaValidator: FormulaValidator;

    constructor(private symbolTable: SymbolTable) {
        this.referenceValidator = new ReferenceValidator(symbolTable);
        this.formulaValidator = new FormulaValidator(symbolTable);
    }

    /**
     * Validate entire model definition.
     */
    validateModel(model: ModelDefinition): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Validate input reference
        const { cube, diagnostics: inputDiagnostics } = this.validateInput(model);
        diagnostics.push(...inputDiagnostics);

        // If input doesn't exist, can't validate further
        if (!cube) {
            return diagnostics;
        }

        // Validate formula against input cube
        const formulaDiagnostics = this.formulaValidator.validateFormula(
            model.formula,
            cube
        );
        diagnostics.push(...formulaDiagnostics);

        // Validate family/link compatibility if both are specified
        if (model.family && model.link) {
            const familyLinkDiagnostics = this.validateFamilyLinkCompatibility(
                model.family,
                model.link,
                model.name
            );
            diagnostics.push(...familyLinkDiagnostics);
        }

        // Validate random effects if present
        if (model.randomEffects?.subject) {
            const randomDiagnostics = this.validateRandomEffects(
                model.randomEffects.subject,
                cube,
                model.name
            );
            diagnostics.push(...randomDiagnostics);
        }

        return diagnostics;
    }

    /**
     * Validate input reference and return the input cube type.
     */
    validateInput(
        model: ModelDefinition
    ): { cube: CubeType | null; diagnostics: TypeDiagnostic[] } {
        return this.referenceValidator.validateInputReference(
            model.inputRef.$refText,
            `Model '${model.name}'`
        );
    }

    /**
     * Validate family/link function compatibility.
     */
    validateFamilyLinkCompatibility(
        family: ModelFamily,
        link: LinkFunction,
        modelName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const compatibleLinks = COMPATIBLE_LINKS[family];

        if (!compatibleLinks.includes(link)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Model '${modelName}' specifies link function '${link}' which is not compatible with family '${family}'. Compatible links for ${family}: ${compatibleLinks.join(', ')}`,
            });
        }

        return diagnostics;
    }

    /**
     * Validate random effects subject is a dimension in the input cube.
     */
    validateRandomEffects(
        subject: string,
        inputCube: CubeType,
        modelName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        if (!inputCube.dimensions.has(subject)) {
            // Check if it's a measure or attribute
            let actualType = 'undefined';
            if (inputCube.measures.has(subject)) {
                actualType = 'measure';
            } else if (inputCube.attributes.has(subject)) {
                actualType = 'attribute';
            }

            if (actualType !== 'undefined') {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Model '${modelName}' random effects subject '${subject}' is a ${actualType}, but must be a dimension in cube '${inputCube.name}'`,
                });
            } else {
                // Not found - suggest alternatives
                const suggestion = this.referenceValidator.suggestComponentName(
                    subject,
                    Array.from(inputCube.dimensions.keys())
                );

                const message = suggestion
                    ? `Model '${modelName}' random effects subject '${subject}' is not a dimension in cube '${inputCube.name}'. Did you mean '${suggestion}'?`
                    : `Model '${modelName}' random effects subject '${subject}' is not a dimension in cube '${inputCube.name}'. Available dimensions: ${Array.from(inputCube.dimensions.keys()).join(', ') || 'none'}`;

                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message,
                });
            }
        }

        return diagnostics;
    }
}
