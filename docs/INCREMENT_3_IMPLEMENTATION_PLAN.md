# Increment 3: Type System + Semantic Validation
## Detailed Implementation Plan

**Version:** 1.0
**Date:** 2025-11-23
**Status:** Draft for Review
**Issue:** #6

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Phases](#implementation-phases)
4. [Detailed Task Breakdown](#detailed-task-breakdown)
5. [Testing Strategy](#testing-strategy)
6. [Open Questions](#open-questions)
7. [Success Criteria](#success-criteria)
8. [Dependencies](#dependencies)
9. [Risk Assessment](#risk-assessment)

---

## Overview

### Goal
Enable real-time type checking and semantic validation in the Thunderstruck DSL, providing helpful diagnostics for type mismatches, undefined references, and semantic errors.

### Scope
This increment builds upon the grammar and LSP foundation from Increment 2 by adding:
- A type system with primitive, coded, identifier, cube, and unit types
- Type checking for expressions, formulas, and references
- Semantic validation for cross-references and structural constraints
- Enhanced error messages with actionable suggestions
- Symbol table for name resolution and scoping

### Out of Scope (Deferred to Increment 4)
- W3C Data Cube integrity constraint validation (IC-1 through IC-21)
- CDISC standards compliance validation
- Code generation

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Thunderstruck Language                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │  Parser (L2)   │──────▶│ AST (generated) │              │
│  └────────────────┘      └────────┬─────────┘              │
│                                   │                          │
│                                   ▼                          │
│  ┌────────────────────────────────────────────┐             │
│  │         Symbol Table Builder               │             │
│  │  - Collects all definitions                │             │
│  │  - Tracks scopes                           │             │
│  │  - Builds type information                 │             │
│  └──────────────────┬─────────────────────────┘             │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────┐             │
│  │         Type System                        │             │
│  │  - Type representations                    │             │
│  │  - Type compatibility rules                │             │
│  │  - Type inference engine                   │             │
│  │  - Unit compatibility checker              │             │
│  └──────────────────┬─────────────────────────┘             │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────┐             │
│  │    Semantic Validator                      │             │
│  │  - Reference validation                    │             │
│  │  - Type checking                           │             │
│  │  - Structural validation                   │             │
│  │  - Circular dependency detection           │             │
│  └──────────────────┬─────────────────────────┘             │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────┐             │
│  │    Diagnostic Generator                    │             │
│  │  - Error messages                          │             │
│  │  - Warnings                                │             │
│  │  - Quick fix suggestions                   │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
packages/thunderstruck-language/src/
├── types/
│   ├── type-system.ts          # Core type representations
│   ├── type-checker.ts         # Type checking logic
│   ├── type-inference.ts       # Type inference engine
│   └── unit-checker.ts         # Unit compatibility
├── validation/
│   ├── symbol-table.ts         # Symbol table & scoping
│   ├── reference-validator.ts  # Cross-reference validation
│   ├── expression-validator.ts # Expression type checking
│   ├── formula-validator.ts    # Formula validation
│   ├── cube-validator.ts       # Cube structure validation
│   ├── slice-validator.ts      # Slice validation
│   ├── model-validator.ts      # Model validation
│   ├── pipeline-validator.ts   # Pipeline DAG validation
│   └── diagnostic-builder.ts   # Error message generation
├── thunderstruck-validator.ts  # Main validator (update)
└── __tests__/
    ├── type-system.test.ts
    ├── validation.test.ts
    └── diagnostics.test.ts
```

---

## Implementation Phases

### Phase 1: Type System Foundation (Week 1)
**Focus:** Build core type representations and compatibility rules

**Tasks:**
1. Define type hierarchy
2. Implement type compatibility checking
3. Implement unit representation and compatibility
4. Create type utilities

**Deliverables:**
- `type-system.ts` with all type classes
- `unit-checker.ts` with unit compatibility
- Unit tests for type system

### Phase 2: Symbol Table & Scoping (Week 1-2)
**Focus:** Build symbol table for name resolution

**Tasks:**
1. Implement symbol table builder
2. Add scope tracking
3. Implement reference resolution
4. Handle imports

**Deliverables:**
- `symbol-table.ts` with scoping support
- Resolution utilities
- Unit tests for symbol resolution

### Phase 3: Type Checking (Week 2)
**Focus:** Implement type checking for expressions and formulas

**Tasks:**
1. Expression type checker
2. Formula variable type checker
3. Type inference for simple cases
4. Binary/unary operator type rules

**Deliverables:**
- `type-checker.ts` with expression checking
- `type-inference.ts` with inference rules
- `expression-validator.ts`
- `formula-validator.ts`
- Unit tests for type checking

### Phase 4: Semantic Validation (Week 2-3)
**Focus:** Validate structure and references

**Tasks:**
1. Cube component validation
2. Slice validation (cube refs, dimension refs)
3. Model validation (input refs, formula vars)
4. Transform validation
5. Pipeline DAG validation (cycle detection)
6. Circular dependency detection

**Deliverables:**
- All validator modules in `validation/`
- Integration tests
- Example validation cases

### Phase 5: Enhanced Diagnostics (Week 3)
**Focus:** Improve error messages and suggestions

**Tasks:**
1. Diagnostic message builder
2. "Did you mean?" suggestions
3. Quick fix proposals
4. Severity levels (error/warning/hint)

**Deliverables:**
- `diagnostic-builder.ts`
- Rich error messages
- Tests for diagnostic quality

### Phase 6: Integration & Testing (Week 3)
**Focus:** End-to-end testing and polish

**Tasks:**
1. Comprehensive test suite
2. Performance testing
3. False positive elimination
4. Documentation
5. Update INCREMENT_3_REVIEW.md

**Deliverables:**
- Full test coverage
- Performance benchmarks
- Documentation updates

---

## Detailed Task Breakdown

### 3.1 Type System Implementation

#### Task 3.1.1: Define Type Hierarchy
**File:** `src/types/type-system.ts`

**Type Classes to Implement:**
```typescript
// Base type
abstract class Type {
  abstract toString(): string;
  abstract equals(other: Type): boolean;
  abstract isAssignableTo(target: Type): boolean;
}

// Primitive types
class NumericType extends Type { }
class IntegerType extends Type { } // subtype of Numeric
class TextType extends Type { }
class DateTimeType extends Type { }
class DateType extends Type { }
class FlagType extends Type { } // boolean

// Special types
class IdentifierType extends Type { }
class CodedValueType extends Type {
  constructor(public codeList?: string) { }
}

// Composite types
class CubeType extends Type {
  constructor(
    public name: string,
    public dimensions: Map<string, Type>,
    public measures: Map<string, Type>,
    public attributes: Map<string, Type>
  ) { }
}

// Unit type
class UnitType {
  constructor(public unit: string) { }
  isCompatibleWith(other: UnitType): boolean;
}

// Special type for unresolved references
class UnknownType extends Type { }
class ErrorType extends Type { }
```

**Type Compatibility Rules:**
- Integer ⊆ Numeric (Integer is assignable to Numeric)
- Date ⊆ DateTime (Date is assignable to DateTime)
- CodedValue with specific list ⊆ CodedValue without list
- All other types require exact match
- Units must match exactly (initially; could add conversion later)

**Tests:**
- [ ] Create all type instances
- [ ] Test type equality
- [ ] Test assignability rules
- [ ] Test unit compatibility

---

#### Task 3.1.2: Implement Unit Checker
**File:** `src/types/unit-checker.ts`

**Functionality:**
```typescript
class UnitChecker {
  // Check if two units are compatible
  areCompatible(unit1: string, unit2: string): boolean;

  // Check if unit is valid (optional: validate against UCUM)
  isValid(unit: string): boolean;

  // Get normalized form (e.g., "kilogram" → "kg")
  normalize(unit: string): string;
}
```

**Initial Implementation:**
- Exact string match (case-sensitive)
- No unit conversion
- Future: Add UCUM validation and conversion

**Tests:**
- [ ] Same units are compatible
- [ ] Different units are incompatible
- [ ] Empty/missing units handled

---

#### Task 3.1.3: Type Inference Engine
**File:** `src/types/type-inference.ts`

**Inference Rules:**

1. **Literals:**
   - Number → Numeric
   - Integer literal (no decimal) → Integer
   - String → Text
   - Boolean → Flag

2. **Binary Expressions:**
   - Numeric op Numeric → Numeric
   - Integer op Integer → Integer (for +, -, *)
   - Integer op Integer → Numeric (for /)
   - Comparison ops → Flag
   - Logical ops → Flag

3. **Unary Expressions:**
   - -Numeric → Numeric
   - not Flag → Flag

4. **Function Calls:**
   - Infer from function signature (if known)
   - Otherwise → Unknown

5. **Variable References:**
   - Look up in symbol table
   - Use declared type

**Tests:**
- [ ] Literal inference
- [ ] Binary expression inference
- [ ] Unary expression inference
- [ ] Variable reference type lookup

---

### 3.2 Semantic Validation

#### Task 3.2.1: Symbol Table Builder
**File:** `src/validation/symbol-table.ts`

**Data Structures:**
```typescript
interface Symbol {
  name: string;
  type: Type;
  kind: 'cube' | 'concept' | 'slice' | 'model' | 'derive' |
        'aggregate' | 'display' | 'pipeline' | 'dimension' |
        'measure' | 'attribute';
  node: AstNode;
  scope: Scope;
}

class Scope {
  parent?: Scope;
  symbols: Map<string, Symbol>;

  lookup(name: string): Symbol | undefined;
  define(symbol: Symbol): void;
  lookupInHierarchy(name: string): Symbol | undefined;
}

class SymbolTable {
  globalScope: Scope;
  scopes: Map<AstNode, Scope>;

  buildFromProgram(program: Program): void;
  getScope(node: AstNode): Scope | undefined;
  resolve(name: string, fromScope: Scope): Symbol | undefined;
}
```

**Building Process:**
1. First pass: Collect all top-level definitions (cubes, concepts, etc.)
2. Second pass: Resolve types and references
3. Track cube components (dimensions, measures, attributes) in cube scope

**Tests:**
- [ ] Build symbol table from program
- [ ] Resolve top-level symbols
- [ ] Resolve nested symbols (cube components)
- [ ] Handle undefined references
- [ ] Handle duplicate definitions

---

#### Task 3.2.2: Reference Validator
**File:** `src/validation/reference-validator.ts`

**Validations:**
```typescript
class ReferenceValidator {
  // Validate that a reference resolves to a symbol
  validateReference(
    name: string,
    expectedKind: Symbol['kind'],
    context: ValidationContext
  ): ValidationDiagnostic[];

  // Check cube reference in slice
  validateCubeReference(slice: SliceDefinition): ValidationDiagnostic[];

  // Check input reference in model/transform/aggregate
  validateInputReference(node: AstNode): ValidationDiagnostic[];

  // Check dimension/measure/attribute references
  validateComponentReference(
    ref: string,
    cube: CubeType,
    componentType: 'dimension' | 'measure' | 'attribute'
  ): ValidationDiagnostic[];
}
```

**Error Messages:**
- `Undefined cube 'ADADAS'. Did you mean 'ADAS'?`
- `Cube 'ADAE' has no dimension 'USUBJID'. Available dimensions: SUBJID, AEDECOD.`
- `Measure 'CHG' is not available in cube 'ADSL'. Did you mean 'AGE'?`

**Tests:**
- [ ] Valid references pass
- [ ] Undefined references fail
- [ ] Wrong kind references fail (e.g., using cube name where slice expected)
- [ ] Suggestions for typos

---

#### Task 3.2.3: Expression Validator
**File:** `src/validation/expression-validator.ts`

**Validations:**
```typescript
class ExpressionValidator {
  // Check types in binary expression
  validateBinaryExpression(expr: BinaryExpression): ValidationDiagnostic[];

  // Check types in unary expression
  validateUnaryExpression(expr: UnaryExpression): ValidationDiagnostic[];

  // Check function call arguments
  validateFunctionCall(call: FunctionCallExpression): ValidationDiagnostic[];

  // Check member access
  validateMemberAccess(expr: MemberAccessExpression): ValidationDiagnostic[];

  // Validate variable reference exists and get its type
  validateVariableReference(ref: VariableReference): Type;
}
```

**Type Checking Rules:**

1. **Arithmetic Operators (+, -, *, /):**
   - Both operands must be Numeric or Integer
   - Result type: Numeric (or Integer if both are Integer and op is not /)

2. **Comparison Operators (<, <=, >, >=):**
   - Operands must be Numeric or DateTime/Date
   - Result type: Flag

3. **Equality Operators (==, !=):**
   - Operands must be same type
   - Result type: Flag

4. **Logical Operators (and, or):**
   - Both operands must be Flag
   - Result type: Flag

5. **Unary not:**
   - Operand must be Flag
   - Result type: Flag

**Error Messages:**
- `Cannot apply operator '+' to types 'Text' and 'Numeric'`
- `Operator '<' requires numeric operands, got 'Text' and 'Numeric'`
- `Cannot compare 'Date' with 'Text'`

**Tests:**
- [ ] Valid arithmetic expressions
- [ ] Invalid operand types
- [ ] Valid comparisons
- [ ] Invalid comparisons
- [ ] Logical operations
- [ ] Unary operators

---

#### Task 3.2.4: Formula Validator
**File:** `src/validation/formula-validator.ts`

**Validations:**
```typescript
class FormulaValidator {
  // Validate formula variables exist in input cube
  validateFormula(
    formula: Formula,
    inputCube: CubeType
  ): ValidationDiagnostic[];

  // Collect all variables used in formula
  collectVariables(formula: Formula): Set<string>;

  // Check response variable is a measure
  validateResponseVariable(
    response: FormulaTerm,
    cube: CubeType
  ): ValidationDiagnostic[];

  // Check predictor variables are dimensions or measures
  validatePredictorVariables(
    predictors: FormulaTerm,
    cube: CubeType
  ): ValidationDiagnostic[];
}
```

**Validation Rules:**
- Response variable (LHS of ~) must be a measure in the input cube
- Predictor variables (RHS of ~) must be dimensions or measures in input cube
- Function calls in formula (e.g., `poly(DOSE, 2)`) checked separately
- Random effects subject must be a dimension

**Error Messages:**
- `Formula variable 'CHG' is not defined in cube 'ADSL'. Did you mean 'AGE'?`
- `Response variable 'TRT01A' is a dimension, but must be a measure`
- `Random effects subject 'SUBJID' is not a dimension in cube 'ADADAS'`

**Tests:**
- [ ] Valid formulas
- [ ] Undefined variables in formula
- [ ] Wrong component type (dimension used as response)
- [ ] Valid random effects
- [ ] Invalid random effects

---

#### Task 3.2.5: Slice Validator
**File:** `src/validation/slice-validator.ts`

**Validations:**
```typescript
class SliceValidator {
  // Validate entire slice definition
  validateSlice(slice: SliceDefinition): ValidationDiagnostic[];

  // Check cube reference exists
  validateSourceCube(slice: SliceDefinition): CubeType | null;

  // Check fixed dimensions exist in cube
  validateFixedDimensions(
    fixed: DimensionConstraints,
    cube: CubeType
  ): ValidationDiagnostic[];

  // Check varying dimensions exist in cube
  validateVaryingDimensions(
    varying: string[],
    cube: CubeType
  ): ValidationDiagnostic[];

  // Check measures exist in cube
  validateMeasures(
    measures: string[],
    cube: CubeType
  ): ValidationDiagnostic[];

  // Check where clause variables exist in cube
  validateWhereClause(
    where: Expression,
    cube: CubeType
  ): ValidationDiagnostic[];
}
```

**Validation Rules:**
- Source cube must exist
- Fixed dimensions must be dimensions or attributes in source cube
- Varying dimensions must be dimensions in source cube
- Measures must be measures in source cube
- Variables in where clause must be dimensions, measures, or attributes
- Fixed and varying dimensions should not overlap (warning)

**Error Messages:**
- `Slice 'Week24_Efficacy' references undefined cube 'ADADAS'`
- `Dimension 'AVISIT' in 'fix' clause is not defined in cube 'ADSL'`
- `Measure 'CHG' is not available in cube 'ADSL'`
- `Variable 'EFFFL' in 'where' clause is not defined in cube 'ADADAS'`
- `Dimension 'TRT01A' appears in both 'fix' and 'vary' clauses (warning)`

**Tests:**
- [ ] Valid slice definitions
- [ ] Undefined cube reference
- [ ] Invalid dimension in fix clause
- [ ] Invalid dimension in vary clause
- [ ] Invalid measure
- [ ] Invalid where clause variable
- [ ] Overlapping fix/vary dimensions

---

#### Task 3.2.6: Model Validator
**File:** `src/validation/model-validator.ts`

**Validations:**
```typescript
class ModelValidator {
  // Validate entire model definition
  validateModel(model: ModelDefinition): ValidationDiagnostic[];

  // Check input reference
  validateInput(model: ModelDefinition): CubeType | null;

  // Validate formula against input cube
  validateModelFormula(
    formula: Formula,
    inputCube: CubeType
  ): ValidationDiagnostic[];

  // Check family/link compatibility
  validateFamilyLinkCompatibility(
    family: string,
    link: string
  ): ValidationDiagnostic[];

  // Validate random effects
  validateRandomEffects(
    random: RandomEffects,
    inputCube: CubeType
  ): ValidationDiagnostic[];
}
```

**Validation Rules:**
- Input must reference a cube or slice
- Formula variables must exist in input
- Family/link combinations must be compatible:
  - Gaussian: Identity, Log, Inverse
  - Binomial: Logit, Probit, Log
  - Poisson: Log, Identity, Sqrt
  - Gamma: Inverse, Identity, Log
- Random effects subject must be a dimension

**Error Messages:**
- `Model 'ANCOVA_Week24' references undefined input 'Week24_ITT'`
- `Link function 'Logit' is not compatible with family 'Gaussian'`
- `Random effects subject 'PATIENT' is not a dimension in input cube`

**Tests:**
- [ ] Valid model definitions
- [ ] Undefined input
- [ ] Invalid formula variables
- [ ] Invalid family/link combination
- [ ] Valid random effects
- [ ] Invalid random effects

---

#### Task 3.2.7: Pipeline Validator
**File:** `src/validation/pipeline-validator.ts`

**Validations:**
```typescript
class PipelineValidator {
  // Validate entire pipeline
  validatePipeline(pipeline: PipelineDefinition): ValidationDiagnostic[];

  // Check for cycles in dependency graph
  detectCycles(pipeline: PipelineDefinition): string[][] | null;

  // Build dependency graph
  buildDependencyGraph(pipeline: PipelineDefinition): Map<string, Set<string>>;

  // Validate all stage dependencies exist
  validateDependencies(pipeline: PipelineDefinition): ValidationDiagnostic[];

  // Topological sort for execution order
  topologicalSort(pipeline: PipelineDefinition): string[] | null;
}
```

**Validation Rules:**
- All stage dependencies must reference other stages in the pipeline
- No circular dependencies (use DFS cycle detection)
- Stage names must be unique within pipeline

**Error Messages:**
- `Pipeline stage 'AnalyzeEfficacy' depends on undefined stage 'PrepareData'`
- `Circular dependency detected: LoadData → PrepareData → LoadData`
- `Duplicate stage name 'LoadData' in pipeline`

**Tests:**
- [ ] Valid pipeline (DAG)
- [ ] Detect simple cycle
- [ ] Detect complex cycle
- [ ] Undefined dependency
- [ ] Duplicate stage names
- [ ] Topological sort

---

#### Task 3.2.8: Circular Dependency Detection
**File:** `src/validation/dependency-validator.ts`

**Validations:**
```typescript
class DependencyValidator {
  // Check for circular dependencies across all constructs
  validateNoCycles(program: Program): ValidationDiagnostic[];

  // Build global dependency graph
  // slice → cube, model → slice/cube, transform → cube, etc.
  buildGlobalDependencyGraph(program: Program): Map<string, Set<string>>;

  // Detect cycles using DFS
  detectCycles(graph: Map<string, Set<string>>): string[][] | null;
}
```

**Example Circular Dependency:**
```thunderstruck
slice S1 from S2 { ... }  // S1 depends on S2
slice S2 from S1 { ... }  // S2 depends on S1 → cycle!
```

**Error Messages:**
- `Circular dependency detected: S1 → S2 → S1`

**Tests:**
- [ ] No dependencies
- [ ] Linear dependencies (no cycles)
- [ ] Simple cycle (A → B → A)
- [ ] Complex cycle (A → B → C → A)
- [ ] Multiple independent cycles

---

### 3.3 Enhanced Diagnostics

#### Task 3.3.1: Diagnostic Builder
**File:** `src/validation/diagnostic-builder.ts`

**Functionality:**
```typescript
class DiagnosticBuilder {
  // Build error diagnostic
  error(message: string, node: AstNode, property?: string): Diagnostic;

  // Build warning diagnostic
  warning(message: string, node: AstNode, property?: string): Diagnostic;

  // Build hint diagnostic
  hint(message: string, node: AstNode, property?: string): Diagnostic;

  // Add "did you mean" suggestion using Levenshtein distance
  suggestAlternative(
    invalid: string,
    candidates: string[]
  ): string | undefined;

  // Format error with context
  formatWithContext(message: string, details: Record<string, any>): string;
}
```

**Error Message Templates:**
- Type mismatch: `Cannot assign '{actual}' to '{expected}'`
- Undefined reference: `'{name}' is not defined. Did you mean '{suggestion}'?`
- Invalid operation: `Cannot apply operator '{op}' to types '{left}' and '{right}'`
- Missing property: `Cube '{cube}' has no {component} '{name}'. Available {component}s: {list}`

**Tests:**
- [ ] Error severity levels
- [ ] Suggestion algorithm
- [ ] Message formatting
- [ ] Context inclusion

---

### 3.4 Symbol Table

Covered in Task 3.2.1

---

### 3.5 Tests

#### Task 3.5.1: Unit Tests

**Test Files:**
- `type-system.test.ts` - Type classes, compatibility, units
- `type-inference.test.ts` - Inference rules
- `symbol-table.test.ts` - Symbol resolution, scoping
- `reference-validator.test.ts` - Reference validation
- `expression-validator.test.ts` - Expression type checking
- `formula-validator.test.ts` - Formula validation
- `slice-validator.test.ts` - Slice validation
- `model-validator.test.ts` - Model validation
- `pipeline-validator.test.ts` - Pipeline DAG validation
- `diagnostic-builder.test.ts` - Error messages

**Coverage Target:** >90% for validation code

---

#### Task 3.5.2: Integration Tests

**Test Files:**
- `validation-integration.test.ts`

**Test Cases:**
- Parse and validate all example files (should pass with 0 errors)
- Create invalid variations of examples (should produce specific errors)
- Test combined scenarios (multiple interacting validations)

**Example Invalid Cases:**
```thunderstruck
// Type mismatch
slice Test from ADADAS {
  where: AVAL == "text"  // Error: comparing Numeric with Text
}

// Undefined reference
model M1 {
  input: NonExistentCube  // Error: undefined
}

// Circular dependency
slice S1 from S2 { }
slice S2 from S1 { }  // Error: circular
```

---

#### Task 3.5.3: Test Error Messages

**Validation:**
- Every error must have a clear message
- Messages should include context (what was expected, what was found)
- Suggestions should be provided when possible
- Line and column info must be accurate

**Test Approach:**
- Parse invalid files
- Assert specific error messages
- Verify error locations
- Check suggestion quality

---

## Testing Strategy

### Test-Driven Development
1. Write test cases first for each validator
2. Implement validator to pass tests
3. Iterate until all tests pass

### Test Categories

1. **Unit Tests** (60%)
   - Individual type system components
   - Single validation rules
   - Utility functions

2. **Integration Tests** (30%)
   - Full document validation
   - Multiple interacting rules
   - Example file validation

3. **Regression Tests** (10%)
   - Previously found bugs
   - Edge cases

### Test Data

1. **Valid Examples:**
   - Use existing 10 example files
   - Should validate with 0 errors

2. **Invalid Examples:**
   - Create negative test cases for each validation rule
   - Store in `__tests__/fixtures/invalid/`

3. **Edge Cases:**
   - Empty files
   - Minimal valid programs
   - Maximum complexity programs

---

## Open Questions

**Status:** ✅ All questions answered (2025-01-26)

**Summary of Decisions:**
- Q1: Type Inference → **Moderate** (infer expressions, explicit definitions)
- Q2: Unit Compatibility → **Strict** (exact string match)
- Q3: Reference Resolution → **Two-pass** (symbol table first)
- Q4: Error Severity → **Accepted** (errors/warnings/hints as proposed)
- Q5: Performance → **Accepted** (<50ms/<200ms/<500ms)
- Q6: Formula Type Inference → **Variables must exist in cube**
- Q7: Quick Fixes → **Defer to Increment 5**
- Q8: Scoping → **Accepted** (global/cube/formula/expression scopes)
- Q9: CodedValue → **Specific to general** (CodedValue<X> → CodedValue)
- Q10: Missing Types → **Error Type** (propagates, collects multiple errors)

---

### Q1: Type Inference Aggressiveness
**Question:** How aggressive should type inference be?

**Options:**
A. **Conservative:** Only infer types where absolutely necessary (literals, simple expressions)
B. **Moderate:** Infer types for expressions but require explicit types for definitions
C. **Aggressive:** Infer types everywhere possible, minimize explicit type annotations

**Recommendation:** Start with **Moderate** (Option B)
- Cube components require explicit types (already in grammar)
- Expression types inferred from operands
- Variable references use declared types
- Function calls need type signatures (future work)

**Impact:**
- Conservative: More type annotations required, clearer but verbose
- Aggressive: Less verbose but potentially confusing errors

**✅ DECISION: Option B - Moderate** (2025-01-26)
- Accepted recommended approach
- Provides good balance between explicitness and convenience

---

### Q2: Unit Compatibility Strictness
**Question:** How strict should unit compatibility checking be?

**Options:**
A. **Strict:** Units must match exactly (string equality)
B. **Normalized:** Units normalized before comparison (e.g., "kg" == "kilogram")
C. **Convertible:** Allow compatible units (e.g., "mg" and "g")
D. **Validation-only:** Check units are valid UCUM, allow any combination

**Recommendation:** Start with **Strict** (Option A), add normalization later
- Simple to implement
- No ambiguity about what's allowed
- Can relax in future increments

**✅ DECISION: Option A - Strict** (2025-01-26)
- Accepted recommended approach
- Units must match exactly (string equality)
- Future enhancement: Add normalization/conversion in later increments

---

### Q3: Cross-Reference Resolution Timing
**Question:** When should cross-references be resolved?

**Options:**
A. **Lazy:** Resolve on-demand during validation
B. **Eager:** Resolve immediately after parsing (in linking phase)
C. **Two-pass:** Build symbol table first, then resolve references

**Recommendation:** **Two-pass** (Option C)
- Langium best practice
- Allows forward references
- Clear separation of concerns

**✅ DECISION: Option C - Two-pass** (2025-01-26)
- Accepted recommended approach (Langium best practice)
- Build symbol table first, then resolve references

---

### Q4: Error vs Warning Severity
**Question:** Which validations should be errors vs warnings vs hints?

**Proposed Severity Levels:**

**Errors (block compilation):**
- Type mismatches
- Undefined references
- Circular dependencies
- Invalid formula variables
- Pipeline cycles

**Warnings (may indicate issues):**
- Dimension appears in both fix and vary
- Unused variables
- Missing optional properties (e.g., cube namespace)
- Deprecated features (future)

**Hints (suggestions):**
- Performance optimization suggestions (future)
- Style recommendations (future)

**✅ DECISION: Accept proposed severity levels** (2025-01-26)
- Errors: Type mismatches, undefined references, circular dependencies, invalid formula variables, pipeline cycles
- Warnings: Dimension in both fix and vary, unused variables, missing optional properties
- Hints: Performance optimizations, style recommendations

---

### Q5: Performance Expectations
**Question:** What are the performance requirements for validation?

**Scenarios:**
- Small file (~100 lines): How fast should validation be?
- Medium file (~500 lines): Acceptable delay?
- Large file (~2000 lines): Maximum acceptable delay?

**Recommendation:**
- Small: <50ms (real-time, as specified in PRD)
- Medium: <200ms
- Large: <500ms

**Optimization Strategies:**
- Incremental validation (only re-validate changed nodes)
- Caching of type information
- Lazy evaluation where possible

**✅ DECISION: Accept recommended performance targets** (2025-01-26)
- Small file (~100 lines): <50ms
- Medium file (~500 lines): <200ms
- Large file (~2000 lines): <500ms
- Will implement incremental validation, caching, and lazy evaluation as needed

---

### Q6: Scope of Type Inference
**Question:** Should we infer types in formulas, or require all formula variables to be pre-declared in cubes?

**Current Grammar:** Formulas use FormulaVariable which is just an ID
- Option A: Look up variable in cube, use its type
- Option B: Allow formula to introduce new variables with inferred types
- Option C: Require all variables to exist in cube (no inference needed)

**Recommendation:** **Option A/C** - Variables must exist in cube, use their declared types
- Aligns with statistical practice
- Clear error messages
- No ambiguity

**✅ DECISION: Option A/C - Variables must exist in cube** (2025-01-26)
- Accepted recommended approach
- All formula variables must be pre-declared in input cube
- Use declared types from cube, no formula-specific type inference

---

### Q7: Quick Fixes
**Question:** Should we implement quick fixes in this increment or defer?

**Examples of Quick Fixes:**
- "Add missing dimension to cube"
- "Import undefined reference"
- "Fix typo"

**Recommendation:** **Defer to Increment 5** (Advanced LSP Features)
- Focus on solid validation first
- Quick fixes require LSP code actions
- More complex implementation

**✅ DECISION: Defer to Increment 5** (2025-01-26)
- Accepted recommended approach
- Focus on validation and diagnostics in this increment
- Quick fixes will be implemented in Advanced LSP Features increment

---

### Q8: Symbol Table Scoping
**Question:** What scoping rules should we implement?

**Current Constructs:**
- Program (global scope)
- Cubes (have internal scope for dimensions/measures/attributes)
- Formulas (reference variables from input cube)

**Proposed Rules:**
1. **Global scope:** All top-level definitions (cubes, concepts, slices, models, etc.)
2. **Cube scope:** Dimensions, measures, attributes visible only within cube
3. **Formula scope:** Can reference dimensions/measures from input cube
4. **Expression scope:** Can reference dimensions/measures/attributes from containing construct

**Shadowing:** Not allowed (all names must be unique in their scope)

**✅ DECISION: Accept proposed scoping rules** (2025-01-26)
- Global scope for all top-level definitions
- Cube scope for internal components (dimensions, measures, attributes)
- Formula scope references input cube components
- Expression scope references containing construct
- No shadowing allowed - all names unique within scope

---

### Q9: Coded Value Type Checking
**Question:** How should we handle CodedValue types?

**Current Grammar:**
```
CodedValue        // any coded value
CodedValue<CDISC.CT.TRT01A>  // specific code list
```

**Type Compatibility:**
- Option A: CodedValue is compatible with any CodedValue (ignore code list)
- Option B: CodedValue<X> is only compatible with CodedValue<X> (exact match)
- Option C: CodedValue<X> is compatible with CodedValue (specific → general)

**Recommendation:** **Option C**
- Specific code list can be used where general coded value expected
- General coded value cannot be used where specific list required
- Mirrors nominal typing in TypeScript

**✅ DECISION: Option C - Specific to general allowed** (2025-01-26)
- Accepted recommended approach
- CodedValue<X> is compatible with CodedValue (specific → general)
- General CodedValue cannot be used where specific list required
- Mirrors TypeScript nominal typing pattern

---

### Q10: Handling Missing Type Information
**Question:** What should happen when type information is incomplete or missing?

**Scenarios:**
- Variable reference cannot be resolved
- Function call with unknown function
- Expression with error in sub-expression

**Options:**
A. **Error Type:** Use special ErrorType that propagates through expressions
B. **Unknown Type:** Use UnknownType that is compatible with everything
C. **Fail Fast:** Stop validation immediately when type cannot be determined

**Recommendation:** **Option A (Error Type)**
- Allows validation to continue
- Collects multiple errors in one pass
- Clearly marks error locations

**✅ DECISION: Option A - Error Type** (2025-01-26)
- Accepted recommended approach
- Use special ErrorType that propagates through expressions
- Allows validation to continue and collect multiple errors
- Clearly marks error locations without false cascading errors

---

## Success Criteria

### Functional Requirements
- [ ] All primitive types implemented and testable
- [ ] Type compatibility rules working correctly
- [ ] Unit compatibility checking functional
- [ ] Symbol table resolves all references correctly
- [ ] Expression type checking catches type mismatches
- [ ] Formula validation catches undefined variables
- [ ] Slice validation catches invalid cube/dimension references
- [ ] Model validation catches invalid inputs and formula errors
- [ ] Pipeline validation detects cycles
- [ ] Circular dependency detection working
- [ ] Error messages are clear and actionable
- [ ] Suggestions provided for common errors

### Non-Functional Requirements
- [ ] Validation completes in <50ms for typical files (<1000 lines)
- [ ] >90% test coverage for validation code
- [ ] All 10 example files validate with 0 errors
- [ ] No false positives on valid code
- [ ] Documentation complete for all validators

### Review Checkpoint Questions (from Plan)
1. **Is the type system expressive enough?**
   - Can express all types needed for clinical trial data
   - Type compatibility rules are clear and sensible

2. **Are type error messages clear?**
   - Messages explain what was expected and what was found
   - Suggestions provided for common mistakes

3. **Is type inference working as expected?**
   - Infers types for expressions correctly
   - Minimizes need for redundant type annotations

4. **Are there edge cases we're missing?**
   - Comprehensive test suite covers edge cases
   - Regression tests for found bugs

5. **Should we add more type flexibility?**
   - Evaluate based on testing feedback
   - Consider unit conversion, subtyping, etc.

---

## Dependencies

### Internal Dependencies
- Increment 2 complete (grammar and LSP foundation)
- Generated AST from Langium
- Langium validation framework

### External Dependencies
- Langium 3.5.x
- TypeScript 5.x
- Jest for testing

### Knowledge Dependencies
- Langium validation best practices
- Type system design patterns
- Graph algorithms (cycle detection)

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Type system too complex** | Medium | High | Start simple, iterate based on feedback |
| **Performance issues on large files** | Low | Medium | Profile early, implement incremental validation |
| **False positives in validation** | Medium | High | Comprehensive testing, user feedback |
| **Langium limitations** | Low | Medium | Engage with Langium community, workarounds |
| **Inference algorithm bugs** | Medium | Medium | Extensive test coverage, simple rules |

### Schedule Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Underestimated complexity** | Medium | Medium | Prioritize core features, defer nice-to-haves |
| **Scope creep** | Medium | Medium | Strict adherence to plan, defer to Increment 4/5 |
| **Testing takes longer than expected** | Low | Low | Parallel test development with implementation |

---

## Timeline Estimate

**Total Duration:** 3 weeks (as per plan)

### Week 1
- Days 1-2: Type system foundation
- Days 3-4: Symbol table and scoping
- Day 5: Type inference basics

### Week 2
- Days 1-2: Expression and formula validation
- Days 3-4: Semantic validation (slices, models, transforms)
- Day 5: Pipeline and dependency validation

### Week 3
- Days 1-2: Enhanced diagnostics
- Days 3-4: Integration testing and bug fixes
- Day 5: Documentation and review

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Answer open questions** (Q1-Q10)
3. **Approve scope and approach**
4. **Begin Phase 1** implementation
5. **Daily check-ins** on progress
6. **Adjust plan** as needed based on learnings

---

## Appendix: Example Validation Scenarios

### Scenario 1: Type Mismatch in Expression
```thunderstruck
cube ADADAS {
  structure: {
    dimensions: [USUBJID: Identifier],
    measures: [AVAL: Numeric unit: "points"],
    attributes: [PARAM: Text]
  }
}

slice Test from ADADAS {
  where: AVAL == "text"  // ERROR: Type mismatch
}
```

**Expected Error:**
```
Cannot compare 'Numeric' with 'Text'
  at example.tsk:10:10

  where: AVAL == "text"
         ^^^^^^^^^^^^^^
```

---

### Scenario 2: Undefined Reference
```thunderstruck
slice Week24 from NonExistent {  // ERROR: Undefined cube
  vary: [USUBJID]
}
```

**Expected Error:**
```
Cube 'NonExistent' is not defined
  at example.tsk:1:19

  slice Week24 from NonExistent {
                    ^^^^^^^^^^^
```

---

### Scenario 3: Invalid Formula Variable
```thunderstruck
model ANCOVA {
  input: Week24_ITT,
  formula: CHANGE ~ TREATMENT + BASELINE
  // ERROR if CHANGE not a measure, or TREATMENT/BASELINE not in cube
}
```

**Expected Error:**
```
Formula variable 'BASELINE' is not defined in cube 'Week24_ITT'
  at example.tsk:3:35
  Did you mean 'BASE'?
```

---

### Scenario 4: Circular Dependency
```thunderstruck
slice S1 from S2 { vary: [USUBJID] }
slice S2 from S1 { vary: [USUBJID] }
```

**Expected Error:**
```
Circular dependency detected: S1 → S2 → S1
  at example.tsk:1:15 and example.tsk:2:15
```

---

### Scenario 5: Unit Mismatch
```thunderstruck
cube C1 {
  structure: {
    measures: [
      WEIGHT: Numeric unit: "kg",
      HEIGHT: Numeric unit: "cm"
    ]
  }
}

transform T1 {
  input: C1,
  transformations: [
    BMI = WEIGHT / HEIGHT  // WARNING: unit mismatch kg vs cm
  ]
}
```

**Expected Warning:**
```
Unit mismatch: dividing 'kg' by 'cm' may not be intended
  at example.tsk:13:11
  Result unit would be 'kg/cm', did you mean to convert units?
```

---

## References

- THUNDERSTRUCK_PRD.md - Product requirements
- THUNDERSTRUCK_PLAN.md - Overall implementation plan
- Langium Documentation - https://langium.org/docs/
- W3C Data Cube Vocabulary - https://www.w3.org/TR/vocab-data-cube/
- CDISC Standards - https://www.cdisc.org/standards
