# Increment 4: CDISC + W3C Validation - Implementation Plan

**Version:** 1.0
**Date:** 2025-11-26
**Status:** In Progress - Phases 1-5 Complete
**Last Updated:** 2025-11-26
**Dependencies:** Increment 3 (Type System + Semantic Validation) complete
**GitHub Issue:** #7
**Estimated Duration:** 4 weeks

## Implementation Progress

- ✅ **Phase 1:** W3C Data Cube Integrity Constraints (Complete)
- ✅ **Phase 2:** CDISC Validation Framework (Complete)
- ✅ **Phase 3:** CDISC CORE Rules Engine (Complete)
- ✅ **Phase 4:** Version Management (Complete)
- ✅ **Phase 5:** Validation Reporting (Complete)
- ⏳ **Phase 6:** Testing Strategy (Pending)

---

## Executive Summary

This increment adds standards compliance validation to Thunderstruck, implementing both W3C Data Cube integrity constraints and CDISC validation rules. The goal is to ensure that Thunderstruck programs produce valid, standards-compliant outputs that meet regulatory requirements.

### Key Deliverables

1. **W3C Data Cube Integrity Constraints** - Validate cube definitions against W3C spec
2. **CDISC Validation Framework** - Validate SDTM and ADaM conformance
3. **CDISC CORE Rules Engine** - Implement conformance rules validation
4. **Version Management** - Support version-aware validation
5. **Validation Reporting** - Generate actionable compliance reports

---

## Architecture Overview

### Component Structure

```
packages/thunderstruck-language/
├── src/
│   ├── validation/
│   │   ├── w3c/
│   │   │   ├── integrity-constraint-validator.ts    # IC framework
│   │   │   ├── ic-01-unique-dataset.ts
│   │   │   ├── ic-02-unique-dsd.ts
│   │   │   ├── ic-11-all-dimensions-required.ts
│   │   │   ├── ic-12-no-duplicate-observations.ts
│   │   │   └── ic-19-codes-from-codelist.ts
│   │   ├── cdisc/
│   │   │   ├── cdisc-validator.ts                   # Main CDISC validator
│   │   │   ├── sdtm-validator.ts                    # SDTM-specific rules
│   │   │   ├── adam-validator.ts                    # ADaM-specific rules
│   │   │   ├── core-rules-engine.ts                 # CORE conformance engine
│   │   │   └── terminology-validator.ts             # CT validation
│   │   ├── standards/
│   │   │   ├── standards-metadata.ts                # Metadata loader
│   │   │   ├── version-manager.ts                   # Version resolution
│   │   │   └── standards-registry.ts                # Standards catalog
│   │   └── reporting/
│   │       ├── validation-report.ts                 # Report generation
│   │       └── diagnostic-formatter.ts              # Format for VS Code
│   ├── standards-data/                              # Embedded standards
│   │   ├── sdtm/
│   │   │   ├── sdtm-3.4-domains.json
│   │   │   ├── sdtm-core-rules.json
│   │   │   └── sdtm-terminology.json
│   │   ├── adam/
│   │   │   ├── adam-1.2-structures.json
│   │   │   ├── adam-core-rules.json
│   │   │   └── adam-terminology.json
│   │   └── w3c/
│   │       └── integrity-constraints.json
│   └── __tests__/
│       ├── validation/
│       │   ├── w3c-ic-validator.test.ts
│       │   ├── sdtm-validator.test.ts
│       │   ├── adam-validator.test.ts
│       │   └── core-rules.test.ts
│       └── fixtures/
│           ├── valid-sdtm-cube.tsk
│           ├── invalid-sdtm-cube.tsk
│           ├── valid-adam-cube.tsk
│           └── invalid-adam-cube.tsk
```

### Data Flow

```
┌─────────────────┐
│ Thunderstruck   │
│ Program (.tsk)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parser + AST    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Symbol Table    │
│ (from Inc 3)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Standards Validation (Increment 4)  │
│  ┌──────────────────────────────┐   │
│  │ 1. W3C IC Validation         │   │
│  │    - Check cube structure    │   │
│  │    - Validate dimensions     │   │
│  │    - Check code lists        │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ 2. CDISC Validation          │   │
│  │    - Load standards metadata │   │
│  │    - Check domain/structure  │   │
│  │    - Validate variables      │   │
│  │    - Check terminology       │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ 3. CORE Rules Engine         │   │
│  │    - Load conformance rules  │   │
│  │    - Execute rule checks     │   │
│  │    - Report violations       │   │
│  └──────────────────────────────┘   │
└───────────┬─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│ Validation Report       │
│ - IC violations         │
│ - CDISC rule violations │
│ - Severity levels       │
│ - Fix suggestions       │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ VS Code Problems Panel  │
└─────────────────────────┘
```

---

## Phase 1: W3C Data Cube Integrity Constraints ✅ COMPLETE

**Status:** Implemented and tested
**Commit:** bc8fc59
**Files Added:** 8 (framework + 5 ICs + validator + tests)

### 1.1 IC Validator Framework

**Goal:** Create extensible framework for implementing integrity constraints

**Implementation:**

```typescript
// src/validation/w3c/integrity-constraint-validator.ts

export interface IntegrityConstraintViolation {
    constraintId: string;      // e.g., "IC-11"
    severity: DiagnosticSeverity;
    message: string;
    location: AstNode;
    suggestion?: string;
}

export abstract class IntegrityConstraint {
    abstract id: string;
    abstract description: string;
    abstract priority: 'critical' | 'important' | 'optional';

    abstract validate(
        program: Program,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[];
}

export class IntegrityConstraintValidator {
    private constraints: IntegrityConstraint[] = [];

    registerConstraint(constraint: IntegrityConstraint): void {
        this.constraints.push(constraint);
    }

    validateProgram(
        program: Program,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const constraint of this.constraints) {
            violations.push(...constraint.validate(program, symbolTable));
        }

        return violations;
    }
}
```

**Tests:**
- Framework correctly registers and executes constraints
- Violations are properly collected and reported
- Priority ordering works correctly

### 1.2 IC-1: Unique DataSet

**Description:** Each qb:DataSet has a unique URI

**Implementation:**

```typescript
// src/validation/w3c/ic-01-unique-dataset.ts

export class IC01_UniqueDataSet extends IntegrityConstraint {
    id = 'IC-1';
    description = 'Each DataSet must have a unique identifier';
    priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];
        const datasetNames = new Set<string>();

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                if (datasetNames.has(element.name)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Duplicate cube definition '${element.name}'. Each cube must have a unique name (W3C IC-1).`,
                        location: element,
                        suggestion: `Rename this cube to a unique identifier.`
                    });
                }
                datasetNames.add(element.name);
            }
        }

        return violations;
    }

    private isCubeDefinition(element: ProgramElement): element is CubeDefinition {
        return element.$type === 'CubeDefinition';
    }
}
```

**Tests:**
- Valid program with unique cube names passes
- Duplicate cube names trigger IC-1 violation
- Error message includes helpful suggestion

### 1.3 IC-2: Unique DSD (Data Structure Definition)

**Description:** Each qb:DataStructureDefinition must be unique within a cube

**Implementation:**

```typescript
// src/validation/w3c/ic-02-unique-dsd.ts

export class IC02_UniqueDSD extends IntegrityConstraint {
    id = 'IC-2';
    description = 'Each DataStructureDefinition must be unique';
    priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                violations.push(...this.validateCubeDSD(element));
            }
        }

        return violations;
    }

    private validateCubeDSD(cube: CubeDefinition): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];
        const componentNames = new Set<string>();

        // Check dimensions
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                if (componentNames.has(dim.name)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Duplicate component '${dim.name}' in cube '${cube.name}' (W3C IC-2).`,
                        location: dim,
                        suggestion: `Each dimension, measure, and attribute must have a unique name within the cube.`
                    });
                }
                componentNames.add(dim.name);
            }
        }

        // Check measures
        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                if (componentNames.has(measure.name)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Duplicate component '${measure.name}' in cube '${cube.name}' (W3C IC-2).`,
                        location: measure,
                        suggestion: `Each dimension, measure, and attribute must have a unique name within the cube.`
                    });
                }
                componentNames.add(measure.name);
            }
        }

        // Check attributes
        if (cube.structure.attributes) {
            for (const attr of cube.structure.attributes.components) {
                if (componentNames.has(attr.name)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Duplicate component '${attr.name}' in cube '${cube.name}' (W3C IC-2).`,
                        location: attr,
                        suggestion: `Each dimension, measure, and attribute must have a unique name within the cube.`
                    });
                }
                componentNames.add(attr.name);
            }
        }

        return violations;
    }
}
```

**Tests:**
- Valid cube with unique component names passes
- Duplicate dimension names trigger IC-2 violation
- Duplicate measure names trigger IC-2 violation
- Duplicate attribute names trigger IC-2 violation
- Cross-category duplicates (dimension + measure with same name) trigger IC-2

### 1.4 IC-11: All Dimensions Required

**Description:** Every qb:Observation must have a value for every dimension

**Implementation:**

```typescript
// src/validation/w3c/ic-11-all-dimensions-required.ts

export class IC11_AllDimensionsRequired extends IntegrityConstraint {
    id = 'IC-11';
    description = 'Every observation must have a value for every dimension';
    priority = 'critical' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        for (const element of program.elements) {
            if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSliceDimensions(element, symbolTable));
            }
        }

        return violations;
    }

    private validateSliceDimensions(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Get source cube type
        const cubeSymbol = symbolTable.resolveGlobal(slice.cubeRef);
        if (!cubeSymbol || !(cubeSymbol.type instanceof CubeType)) {
            return violations; // Will be caught by reference validator
        }

        const cubeType = cubeSymbol.type as CubeType;
        const allDimensions = new Set(cubeType.dimensions.keys());

        // Collect dimensions that are fixed or varying
        const specifiedDimensions = new Set<string>();

        if (slice.fixedDimensions) {
            for (const constraint of slice.fixedDimensions.constraints) {
                specifiedDimensions.add(constraint.dimension);
            }
        }

        if (slice.varyingDimensions) {
            for (const dim of slice.varyingDimensions.dimensions) {
                specifiedDimensions.add(dim);
            }
        }

        // Check for missing dimensions
        const missingDimensions = Array.from(allDimensions)
            .filter(dim => !specifiedDimensions.has(dim));

        if (missingDimensions.length > 0) {
            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Error,
                message: `Slice '${slice.name}' does not specify all dimensions from cube '${slice.cubeRef}'. Missing: ${missingDimensions.join(', ')} (W3C IC-11).`,
                location: slice,
                suggestion: `Add missing dimensions to either 'fix' or 'vary' clause.`
            });
        }

        return violations;
    }
}
```

**Tests:**
- Slice with all dimensions specified passes
- Slice missing dimensions triggers IC-11 violation
- Combination of fixed and varying dimensions covering all passes
- Error message lists missing dimensions

### 1.5 IC-12: No Duplicate Observations

**Description:** No two observations in the same DataSet can have the same values for all dimensions

**Implementation:**

```typescript
// src/validation/w3c/ic-12-no-duplicate-observations.ts

export class IC12_NoDuplicateObservations extends IntegrityConstraint {
    id = 'IC-12';
    description = 'No two observations can have identical dimension values';
    priority = 'important' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // This constraint is checked at runtime/code generation time
        // For static analysis, we can check for potential issues:
        // - Slices with no varying dimensions (would produce single observation)
        // - Aggregates that don't group by enough dimensions

        for (const element of program.elements) {
            if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSlice(element, symbolTable));
            } else if (this.isAggregateDefinition(element)) {
                violations.push(...this.validateAggregate(element, symbolTable));
            }
        }

        return violations;
    }

    private validateSlice(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // If no varying dimensions, slice produces at most one observation
        // This is OK if there are fixed dimensions, otherwise it's suspicious
        if (!slice.varyingDimensions || slice.varyingDimensions.dimensions.length === 0) {
            if (!slice.fixedDimensions || slice.fixedDimensions.constraints.length === 0) {
                violations.push({
                    constraintId: this.id,
                    severity: DiagnosticSeverity.Warning,
                    message: `Slice '${slice.name}' has no varying dimensions and no fixed dimensions. This will produce at most one observation (W3C IC-12).`,
                    location: slice,
                    suggestion: `Consider adding varying dimensions if you expect multiple observations.`
                });
            }
        }

        return violations;
    }

    private validateAggregate(
        aggregate: AggregateDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Get input cube type
        const inputSymbol = symbolTable.resolveGlobal(aggregate.inputRef);
        if (!inputSymbol || !(inputSymbol.type instanceof CubeType)) {
            return violations;
        }

        const inputCube = inputSymbol.type as CubeType;
        const groupByDims = new Set(aggregate.groupBy.dimensions);
        const allDims = new Set(inputCube.dimensions.keys());

        // If grouping by all dimensions, no aggregation happens
        if (groupByDims.size === allDims.size) {
            violations.push({
                constraintId: this.id,
                severity: DiagnosticSeverity.Warning,
                message: `Aggregate '${aggregate.name}' groups by all dimensions. Each input observation will map to exactly one output observation (W3C IC-12).`,
                location: aggregate,
                suggestion: `Consider removing some dimensions from groupBy to perform actual aggregation.`
            });
        }

        return violations;
    }
}
```

**Tests:**
- Slice with varying dimensions passes
- Slice with no varying/fixed dimensions triggers warning
- Aggregate grouping by all dimensions triggers warning
- Valid aggregate with subset of dimensions passes

### 1.6 IC-19: Codes from CodeList

**Description:** If a dimension has a qb:codeList, every observation must use a code from that list

**Implementation:**

```typescript
// src/validation/w3c/ic-19-codes-from-codelist.ts

export class IC19_CodesFromCodeList extends IntegrityConstraint {
    id = 'IC-19';
    description = 'Dimension values must come from specified code list';
    priority = 'important' as const;

    validate(program: Program, symbolTable: SymbolTable): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // For static analysis, we check that:
        // 1. CodedValue types have valid code list references
        // 2. Fixed dimension values are valid for their type

        for (const element of program.elements) {
            if (this.isCubeDefinition(element)) {
                violations.push(...this.validateCubeComponents(element));
            } else if (this.isSliceDefinition(element)) {
                violations.push(...this.validateSliceConstraints(element, symbolTable));
            }
        }

        return violations;
    }

    private validateCubeComponents(cube: CubeDefinition): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        // Check that CodedValue dimensions have code lists specified
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                if (this.isCodedValueType(dim.type) && !dim.type.codeList) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Warning,
                        message: `Dimension '${dim.name}' in cube '${cube.name}' is CodedValue but has no code list specified (W3C IC-19).`,
                        location: dim,
                        suggestion: `Specify a code list: CodedValue<CodeListName>`
                    });
                }
            }
        }

        return violations;
    }

    private validateSliceConstraints(
        slice: SliceDefinition,
        symbolTable: SymbolTable
    ): IntegrityConstraintViolation[] {
        const violations: IntegrityConstraintViolation[] = [];

        if (!slice.fixedDimensions) {
            return violations;
        }

        // Get cube type
        const cubeSymbol = symbolTable.resolveGlobal(slice.cubeRef);
        if (!cubeSymbol || !(cubeSymbol.type instanceof CubeType)) {
            return violations;
        }

        const cubeType = cubeSymbol.type as CubeType;

        // Check that fixed values are valid for CodedValue types
        for (const constraint of slice.fixedDimensions.constraints) {
            const dimType = cubeType.dimensions.get(constraint.dimension);

            if (dimType && dimType instanceof CodedValueType) {
                // TODO: In future, validate against actual code list
                // For now, just check that it's a string literal
                if (!this.isStringLiteral(constraint.value)) {
                    violations.push({
                        constraintId: this.id,
                        severity: DiagnosticSeverity.Error,
                        message: `Fixed value for CodedValue dimension '${constraint.dimension}' must be a string literal (W3C IC-19).`,
                        location: constraint,
                        suggestion: `Use a quoted string like "CODE_VALUE"`
                    });
                }
            }
        }

        return violations;
    }

    private isCodedValueType(typeRef: TypeReference): typeRef is CodedValueType {
        return typeRef.$type === 'CodedValueType';
    }

    private isStringLiteral(expr: Expression): boolean {
        return expr.$type === 'StringLiteral';
    }
}
```

**Tests:**
- CodedValue with code list specified passes
- CodedValue without code list triggers warning
- Fixed dimension with non-string value for CodedValue triggers error
- Fixed dimension with string value for CodedValue passes

### 1.7 Integration with Validation System

**Implementation:**

```typescript
// src/validation/w3c/w3c-validator.ts

export class W3CValidator {
    private icValidator: IntegrityConstraintValidator;

    constructor() {
        this.icValidator = new IntegrityConstraintValidator();

        // Register all integrity constraints
        this.icValidator.registerConstraint(new IC01_UniqueDataSet());
        this.icValidator.registerConstraint(new IC02_UniqueDSD());
        this.icValidator.registerConstraint(new IC11_AllDimensionsRequired());
        this.icValidator.registerConstraint(new IC12_NoDuplicateObservations());
        this.icValidator.registerConstraint(new IC19_CodesFromCodeList());
    }

    validate(program: Program, symbolTable: SymbolTable): TypeDiagnostic[] {
        const violations = this.icValidator.validateProgram(program, symbolTable);

        return violations.map(v => ({
            severity: v.severity,
            message: v.message,
            code: v.constraintId,
            suggestion: v.suggestion
        }));
    }
}
```

**Tests:**
- All ICs are registered and executed
- Violations from all ICs are collected
- Diagnostics are properly formatted

---

## Phase 2: CDISC Validation Framework ✅ COMPLETE

**Status:** Implemented and tested
**Commit:** 82a47c9
**Files Added:** 6 (metadata structures + SDTM/ADaM validators + JSON definitions)

### 2.1 Standards Metadata Structure

**Goal:** Define structure for CDISC standards metadata

**Data Structure:**

```typescript
// src/validation/standards/standards-metadata.ts

export interface CDISCDomain {
    name: string;           // e.g., "AE", "DM", "LB"
    label: string;          // e.g., "Adverse Events"
    structure: string;      // "one-record-per-subject" | "one-record-per-event"
    variables: CDISCVariable[];
    keys: string[];         // Key variables for domain
}

export interface CDISCVariable {
    name: string;           // e.g., "USUBJID", "AESTDTC"
    label: string;          // Human-readable label
    type: 'Char' | 'Num';   // CDISC variable type
    role: 'Identifier' | 'Topic' | 'Timing' | 'Qualifier' | 'Rule';
    core: 'Req' | 'Exp' | 'Perm' | 'Cond';  // CDISC CORE status
    format?: string;        // e.g., "ISO8601", "YYMMDD10"
    codelist?: string;      // Reference to controlled terminology
    condition?: string;     // Conditional requirement rule
}

export interface ADaMStructure {
    name: string;           // e.g., "ADSL", "BDS"
    label: string;
    requiredVariables: string[];
    recommendedVariables: string[];
    derivedVariables?: ADaMDerivedVariable[];
}

export interface ADaMDerivedVariable {
    name: string;
    label: string;
    derivationRule: string;
    requiredFor?: string[]; // Which analyses require this variable
}

export interface CORERule {
    ruleId: string;         // e.g., "SDTM.DM.001"
    domain: string;
    severity: 'Error' | 'Warning';
    description: string;
    check: string;          // Pseudo-code or formal rule expression
    message: string;
}
```

**Embedded Standards Data:**

```json
// src/standards-data/sdtm/sdtm-3.4-domains.json
{
  "version": "3.4",
  "domains": [
    {
      "name": "DM",
      "label": "Demographics",
      "structure": "one-record-per-subject",
      "variables": [
        {
          "name": "STUDYID",
          "label": "Study Identifier",
          "type": "Char",
          "role": "Identifier",
          "core": "Req"
        },
        {
          "name": "DOMAIN",
          "label": "Domain Abbreviation",
          "type": "Char",
          "role": "Identifier",
          "core": "Req"
        },
        {
          "name": "USUBJID",
          "label": "Unique Subject Identifier",
          "type": "Char",
          "role": "Identifier",
          "core": "Req"
        },
        {
          "name": "AGE",
          "label": "Age",
          "type": "Num",
          "role": "Qualifier",
          "core": "Exp"
        },
        {
          "name": "AGEU",
          "label": "Age Units",
          "type": "Char",
          "role": "Qualifier",
          "core": "Exp",
          "codelist": "AGEU"
        }
      ],
      "keys": ["STUDYID", "USUBJID"]
    }
  ]
}
```

```json
// src/standards-data/adam/adam-1.2-structures.json
{
  "version": "1.2",
  "structures": [
    {
      "name": "ADSL",
      "label": "Subject-Level Analysis Dataset",
      "requiredVariables": [
        "STUDYID", "USUBJID", "SUBJID", "SITEID",
        "AGE", "AGEU", "SEX", "RACE",
        "ARM", "ARMCD", "ACTARM", "ACTARMCD",
        "TRT01P", "TRT01A"
      ],
      "recommendedVariables": [
        "COUNTRY", "DMDTC", "ITTFL", "SAFFL", "RANDDT"
      ]
    },
    {
      "name": "BDS",
      "label": "Basic Data Structure",
      "requiredVariables": [
        "STUDYID", "USUBJID", "PARAMCD", "PARAM",
        "AVAL", "AVALU", "DTYPE"
      ],
      "recommendedVariables": [
        "BASE", "CHG", "PCHG", "AVISIT", "AVISITN", "ADT", "ADTM"
      ]
    }
  ]
}
```

### 2.2 SDTM Validator

**Goal:** Validate cubes against SDTM domain specifications

**Implementation:**

```typescript
// src/validation/cdisc/sdtm-validator.ts

export class SDTMValidator {
    private domainsMetadata: Map<string, CDISCDomain> = new Map();

    constructor(private version: string = '3.4') {
        this.loadMetadata();
    }

    private loadMetadata(): void {
        // Load embedded SDTM metadata for specified version
        const metadata = require(`../../standards-data/sdtm/sdtm-${this.version}-domains.json`);

        for (const domain of metadata.domains) {
            this.domainsMetadata.set(domain.name, domain);
        }
    }

    validateCube(
        cube: CubeDefinition,
        symbolTable: SymbolTable
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Determine if this cube represents an SDTM domain
        // Check namespace or explicit domain annotation
        const domain = this.identifyDomain(cube);

        if (!domain) {
            return diagnostics; // Not an SDTM cube
        }

        const domainSpec = this.domainsMetadata.get(domain);
        if (!domainSpec) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                message: `Unknown SDTM domain '${domain}'. Cannot validate against SDTM ${this.version}.`,
                code: 'SDTM-UNKNOWN-DOMAIN'
            });
            return diagnostics;
        }

        // Validate required variables
        diagnostics.push(...this.validateRequiredVariables(cube, domainSpec));

        // Validate variable types
        diagnostics.push(...this.validateVariableTypes(cube, domainSpec));

        // Validate controlled terminology
        diagnostics.push(...this.validateControlledTerminology(cube, domainSpec));

        // Validate key variables
        diagnostics.push(...this.validateKeyVariables(cube, domainSpec));

        return diagnostics;
    }

    private identifyDomain(cube: CubeDefinition): string | null {
        // Check if namespace indicates SDTM domain
        // e.g., namespace: "http://cdisc.org/sdtm/ae"
        if (cube.namespace) {
            const match = cube.namespace.match(/cdisc\.org\/sdtm\/(\w+)/);
            if (match) {
                return match[1].toUpperCase();
            }
        }

        // Check cube name
        if (cube.name.length === 2 || cube.name.match(/^[A-Z]{2}$/)) {
            return cube.name.toUpperCase();
        }

        return null;
    }

    private validateRequiredVariables(
        cube: CubeDefinition,
        domain: CDISCDomain
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const requiredVars = domain.variables
            .filter(v => v.core === 'Req')
            .map(v => v.name);

        const cubeComponents = new Set<string>();

        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                cubeComponents.add(dim.name);
            }
        }

        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                cubeComponents.add(measure.name);
            }
        }

        for (const requiredVar of requiredVars) {
            if (!cubeComponents.has(requiredVar)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `SDTM ${domain.name} domain requires variable '${requiredVar}' (CORE: Required).`,
                    code: 'SDTM-MISSING-REQUIRED-VAR',
                    suggestion: `Add ${requiredVar} to cube dimensions or measures.`
                });
            }
        }

        return diagnostics;
    }

    private validateVariableTypes(
        cube: CubeDefinition,
        domain: CDISCDomain
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const varTypeMap = new Map(
            domain.variables.map(v => [v.name, v])
        );

        // Check dimensions
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                const varSpec = varTypeMap.get(dim.name);
                if (varSpec) {
                    diagnostics.push(...this.checkVariableType(dim, varSpec, domain.name));
                }
            }
        }

        // Check measures
        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                const varSpec = varTypeMap.get(measure.name);
                if (varSpec) {
                    diagnostics.push(...this.checkVariableType(measure, varSpec, domain.name));
                }
            }
        }

        return diagnostics;
    }

    private checkVariableType(
        component: Component,
        varSpec: CDISCVariable,
        domainName: string
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const expectedType = varSpec.type === 'Char' ? 'Text' : 'Numeric';
        const actualType = this.getComponentBaseType(component.type);

        if (actualType !== expectedType) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                message: `Variable '${component.name}' in SDTM ${domainName} should be ${expectedType} but is ${actualType}.`,
                code: 'SDTM-WRONG-TYPE',
                suggestion: `Change type to ${expectedType}`
            });
        }

        return diagnostics;
    }

    private validateControlledTerminology(
        cube: CubeDefinition,
        domain: CDISCDomain
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const varsWithCodeLists = domain.variables.filter(v => v.codelist);

        for (const varSpec of varsWithCodeLists) {
            const component = this.findComponent(cube, varSpec.name);

            if (component && !this.hasCodeList(component.type)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `Variable '${varSpec.name}' in SDTM ${domain.name} should use controlled terminology '${varSpec.codelist}'.`,
                    code: 'SDTM-MISSING-CODELIST',
                    suggestion: `Use CodedValue<${varSpec.codelist}> type`
                });
            }
        }

        return diagnostics;
    }

    private validateKeyVariables(
        cube: CubeDefinition,
        domain: CDISCDomain
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check that key variables are dimensions (not measures)
        for (const keyVar of domain.keys) {
            const component = this.findComponent(cube, keyVar);

            if (component && !this.isDimension(cube, component)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `Key variable '${keyVar}' in SDTM ${domain.name} must be a dimension, not a measure.`,
                    code: 'SDTM-KEY-NOT-DIMENSION',
                    suggestion: `Move ${keyVar} to dimensions list`
                });
            }
        }

        return diagnostics;
    }

    private findComponent(cube: CubeDefinition, name: string): Component | null {
        // Search in dimensions
        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                if (dim.name === name) return dim;
            }
        }

        // Search in measures
        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                if (measure.name === name) return measure;
            }
        }

        return null;
    }

    private getComponentBaseType(typeRef: TypeReference): string {
        if (typeRef.$type === 'PrimitiveType') {
            return typeRef.type;
        } else if (typeRef.$type === 'IdentifierType') {
            return 'Text';
        } else if (typeRef.$type === 'CodedValueType') {
            return 'Text';
        }
        return 'Unknown';
    }

    private hasCodeList(typeRef: TypeReference): boolean {
        return typeRef.$type === 'CodedValueType' && !!typeRef.codeList;
    }

    private isDimension(cube: CubeDefinition, component: Component): boolean {
        if (cube.structure.dimensions) {
            return cube.structure.dimensions.components.includes(component);
        }
        return false;
    }
}
```

**Tests:**
- SDTM domain identification works correctly
- Required variables are validated
- Variable types are checked against SDTM spec
- Controlled terminology usage is validated
- Key variables must be dimensions

### 2.3 ADaM Validator

**Goal:** Validate cubes against ADaM structure specifications

**Implementation:**

```typescript
// src/validation/cdisc/adam-validator.ts

export class ADaMValidator {
    private structuresMetadata: Map<string, ADaMStructure> = new Map();

    constructor(private version: string = '1.2') {
        this.loadMetadata();
    }

    private loadMetadata(): void {
        const metadata = require(`../../standards-data/adam/adam-${this.version}-structures.json`);

        for (const structure of metadata.structures) {
            this.structuresMetadata.set(structure.name, structure);
        }
    }

    validateCube(
        cube: CubeDefinition,
        symbolTable: SymbolTable
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const structure = this.identifyStructure(cube);

        if (!structure) {
            return diagnostics; // Not an ADaM cube
        }

        const structureSpec = this.structuresMetadata.get(structure);
        if (!structureSpec) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                message: `Unknown ADaM structure '${structure}'. Cannot validate against ADaM ${this.version}.`,
                code: 'ADAM-UNKNOWN-STRUCTURE'
            });
            return diagnostics;
        }

        diagnostics.push(...this.validateRequiredVariables(cube, structureSpec));
        diagnostics.push(...this.validateNamingConventions(cube, structureSpec));
        diagnostics.push(...this.validateDerivedVariables(cube, structureSpec));

        return diagnostics;
    }

    private identifyStructure(cube: CubeDefinition): string | null {
        // Check namespace
        if (cube.namespace) {
            const match = cube.namespace.match(/cdisc\.org\/adam\/(\w+)/);
            if (match) {
                return match[1].toUpperCase();
            }
        }

        // Check cube name
        const name = cube.name.toUpperCase();
        if (name === 'ADSL' || name.startsWith('AD')) {
            if (name === 'ADSL') return 'ADSL';
            // Check for BDS-like structure
            if (this.hasBDSVariables(cube)) return 'BDS';
        }

        return null;
    }

    private hasBDSVariables(cube: CubeDefinition): boolean {
        const bdsIndicators = ['PARAMCD', 'PARAM', 'AVAL'];
        const components = this.getAllComponentNames(cube);

        return bdsIndicators.every(indicator => components.has(indicator));
    }

    private validateRequiredVariables(
        cube: CubeDefinition,
        structure: ADaMStructure
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];
        const components = this.getAllComponentNames(cube);

        for (const requiredVar of structure.requiredVariables) {
            if (!components.has(requiredVar)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `ADaM ${structure.name} requires variable '${requiredVar}'.`,
                    code: 'ADAM-MISSING-REQUIRED-VAR',
                    suggestion: `Add ${requiredVar} to cube structure.`
                });
            }
        }

        return diagnostics;
    }

    private validateNamingConventions(
        cube: CubeDefinition,
        structure: ADaMStructure
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // ADaM naming convention: dataset name should start with 'AD'
        if (!cube.name.toUpperCase().startsWith('AD')) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                message: `ADaM dataset names should start with 'AD'. Found '${cube.name}'.`,
                code: 'ADAM-NAMING-CONVENTION',
                suggestion: `Consider renaming to 'AD${cube.name}'`
            });
        }

        // Check variable naming patterns
        // (Additional checks can be added here)

        return diagnostics;
    }

    private validateDerivedVariables(
        cube: CubeDefinition,
        structure: ADaMStructure
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check for derived variables like CHG, PCHG that require BASE
        const components = this.getAllComponentNames(cube);

        if (structure.name === 'BDS') {
            if (components.has('CHG') && !components.has('BASE')) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `ADaM BDS: Variable 'CHG' (Change from Baseline) requires 'BASE' (Baseline Value) to be present.`,
                    code: 'ADAM-MISSING-DEPENDENCY',
                    suggestion: `Add BASE variable to cube.`
                });
            }

            if (components.has('PCHG') && !components.has('BASE')) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    message: `ADaM BDS: Variable 'PCHG' (Percent Change from Baseline) requires 'BASE' (Baseline Value) to be present.`,
                    code: 'ADAM-MISSING-DEPENDENCY',
                    suggestion: `Add BASE variable to cube.`
                });
            }
        }

        return diagnostics;
    }

    private getAllComponentNames(cube: CubeDefinition): Set<string> {
        const names = new Set<string>();

        if (cube.structure.dimensions) {
            for (const dim of cube.structure.dimensions.components) {
                names.add(dim.name);
            }
        }

        if (cube.structure.measures) {
            for (const measure of cube.structure.measures.components) {
                names.add(measure.name);
            }
        }

        if (cube.structure.attributes) {
            for (const attr of cube.structure.attributes.components) {
                names.add(attr.name);
            }
        }

        return names;
    }
}
```

**Tests:**
- ADaM structure identification works
- Required variables are validated for ADSL
- Required variables are validated for BDS
- Naming conventions are checked
- Derived variable dependencies are validated

---

## Phase 3: CDISC CORE Rules Engine ✅ COMPLETE

**Status:** Implemented and tested
**Commit:** bf43c4e
**Files Added:** 5 (rules engine + 5 checkers + SDTM/ADaM rules + tests)

### 3.1 CORE Rules Engine Framework

**Implementation:** Created extensible framework for CORE rules validation with pluggable checker architecture.

**Files:**
- `src/validation/cdisc/core-rules-engine.ts` - Main engine with checker registration
- `src/validation/cdisc/core-checkers.ts` - Five concrete checker implementations
- `src/validation/cdisc/sdtm-core-rules.json` - 16 SDTM CORE rules (v3.4)
- `src/validation/cdisc/adam-core-rules.json` - 15 ADaM CORE rules (v1.2)
- `src/validation/cdisc/cdisc-validator.ts` - Updated with CORE integration
- `src/__tests__/core-rules.test.ts` - Comprehensive test suite (16 tests)

**Key Features:**
- Extensible checker registration system
- JSON-driven rule definitions
- Domain-specific rule filtering
- Five checker types implemented:
  - `NoDuplicateKeyChecker` - Validates key variables presence
  - `ISO8601DateChecker` - Validates DateTime/Date type usage
  - `DateTimeOrderChecker` - Validates date ordering (start before end)
  - `RequiredIfChecker` - Validates conditional requirements
  - `ValueInCodeListChecker` - Validates CodedValue code lists

**Test Results:** All 322 tests pass (16 new CORE rules tests added)

### 3.2 CORE Rules Structure

**Data Format:**

```json
// src/standards-data/sdtm/sdtm-core-rules.json
{
  "version": "3.4",
  "rules": [
    {
      "ruleId": "SDTM.DM.001",
      "domain": "DM",
      "severity": "Error",
      "description": "USUBJID must be unique within study",
      "check": "no-duplicate-key",
      "checkParams": {
        "keys": ["STUDYID", "USUBJID"]
      },
      "message": "Duplicate USUBJID found in DM domain"
    },
    {
      "ruleId": "SDTM.AE.001",
      "domain": "AE",
      "severity": "Error",
      "description": "AESTDTC must be valid ISO 8601 datetime",
      "check": "iso8601-datetime",
      "checkParams": {
        "variable": "AESTDTC"
      },
      "message": "AESTDTC contains invalid ISO 8601 datetime value"
    },
    {
      "ruleId": "SDTM.AE.002",
      "domain": "AE",
      "severity": "Warning",
      "description": "AEENDTC should not be before AESTDTC",
      "check": "datetime-order",
      "checkParams": {
        "startVar": "AESTDTC",
        "endVar": "AEENDTC"
      },
      "message": "AE end date is before start date"
    }
  ]
}
```

### 3.2 CORE Rules Engine

**Implementation:**

```typescript
// src/validation/cdisc/core-rules-engine.ts

export type RuleCheckType =
    | 'no-duplicate-key'
    | 'iso8601-date'
    | 'iso8601-datetime'
    | 'datetime-order'
    | 'required-if'
    | 'value-in-codelist';

export interface RuleChecker {
    check(
        cube: CubeDefinition,
        rule: CORERule,
        symbolTable: SymbolTable
    ): TypeDiagnostic[];
}

export class COREulesEngine {
    private rules: CORERule[] = [];
    private checkers: Map<RuleCheckType, RuleChecker> = new Map();

    constructor() {
        this.initializeCheckers();
        this.loadRules();
    }

    private initializeCheckers(): void {
        this.checkers.set('no-duplicate-key', new NoDuplicateKeyChecker());
        this.checkers.set('iso8601-date', new ISO8601DateChecker());
        this.checkers.set('iso8601-datetime', new ISO8601DateTimeChecker());
        this.checkers.set('datetime-order', new DateTimeOrderChecker());
        this.checkers.set('required-if', new RequiredIfChecker());
        this.checkers.set('value-in-codelist', new ValueInCodeListChecker());
    }

    private loadRules(): void {
        // Load SDTM CORE rules
        const sdtmRules = require('../../standards-data/sdtm/sdtm-core-rules.json');
        this.rules.push(...sdtmRules.rules);

        // Load ADaM CORE rules
        const adamRules = require('../../standards-data/adam/adam-core-rules.json');
        this.rules.push(...adamRules.rules);
    }

    validateCube(
        cube: CubeDefinition,
        domain: string,
        symbolTable: SymbolTable
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Find applicable rules for this domain
        const applicableRules = this.rules.filter(r => r.domain === domain);

        for (const rule of applicableRules) {
            const checker = this.checkers.get(rule.check as RuleCheckType);

            if (!checker) {
                console.warn(`Unknown rule check type: ${rule.check}`);
                continue;
            }

            const ruleDiagnostics = checker.check(cube, rule, symbolTable);

            // Add rule ID to diagnostics
            for (const diag of ruleDiagnostics) {
                diag.code = rule.ruleId;
            }

            diagnostics.push(...ruleDiagnostics);
        }

        return diagnostics;
    }
}

// Example checker implementation
class NoDuplicateKeyChecker implements RuleChecker {
    check(
        cube: CubeDefinition,
        rule: CORERule,
        symbolTable: SymbolTable
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Static analysis: Check that key variables are dimensions
        const keys = rule.checkParams.keys as string[];
        const dimensions = new Set(
            cube.structure.dimensions?.components.map(c => c.name) || []
        );

        const nonDimensionKeys = keys.filter(k => !dimensions.has(k));

        if (nonDimensionKeys.length > 0) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                message: `CORE Rule ${rule.ruleId}: Key variables [${nonDimensionKeys.join(', ')}] should be dimensions to ensure uniqueness.`,
                suggestion: `Move key variables to dimensions list.`
            });
        }

        return diagnostics;
    }
}

class ISO8601DateTimeChecker implements RuleChecker {
    check(
        cube: CubeDefinition,
        rule: CORERule,
        symbolTable: SymbolTable
    ): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        const varName = rule.checkParams.variable as string;
        const component = this.findComponent(cube, varName);

        if (component) {
            // Check that variable is DateTime type
            const baseType = this.getBaseType(component.type);

            if (baseType !== 'DateTime' && baseType !== 'Text') {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `CORE Rule ${rule.ruleId}: Variable '${varName}' should be DateTime or Text type to store ISO 8601 datetime.`,
                    suggestion: `Change type to DateTime or Text`
                });
            }
        }

        return diagnostics;
    }

    private findComponent(cube: CubeDefinition, name: string): Component | null {
        // (Same as in SDTMValidator)
        // ...
        return null;
    }

    private getBaseType(typeRef: TypeReference): string {
        // (Same as in SDTMValidator)
        // ...
        return 'Unknown';
    }
}
```

**Tests:**
- Rules are loaded correctly
- Appropriate checkers are executed for each rule
- Rule violations are detected
- Rule IDs are included in diagnostics

---

## Phase 4: Version Management ✅ COMPLETE

**Status:** Implemented and tested
**Commit:** 1abcf47
**Files Added:** 2 (version-manager.ts + tests)
**Files Modified:** 3 (grammar, cdisc-validator, generated AST)

### Implementation Summary

**Grammar Extension:**
- Added `StandardsDeclaration` to Thunderstruck grammar
- Supports `standards { SDTM: "3.4", ADaM: "1.2", ... }` syntax
- Standard names (SDTM, ADaM, CDISC_CT, W3C_Cube) validated semantically

**Version Manager Implementation:**
- Loads versions from program standards declarations
- Provides default versions when not explicitly declared
- Tracks declared vs effective versions (declared + defaults)
- Validates version support and compatibility

**Version Validation:**
- Checks if declared versions are officially supported
- Warns about unsupported versions with upgrade suggestions
- Validates SDTM/ADaM compatibility matrix
- Only checks compatibility when both standards are explicitly declared

**Integration:**
- Integrated VersionManager with CDISCValidator
- Added methods: `loadVersionsFromProgram()`, `validateVersions()`, `getEffectiveVersions()`
- Version-aware validation support for future phases

**Default Versions:**
- SDTM: 3.4, ADaM: 1.2, CDISC_CT: 2024-09-27, W3C_Cube: 2014-01-16

**Supported Versions:**
- SDTM: 3.2, 3.3, 3.4
- ADaM: 1.0, 1.1, 1.2, 1.3
- CDISC_CT: 2024-09-27, 2024-06-28, 2024-03-29
- W3C_Cube: 2014-01-16

**Compatibility Matrix:**
- SDTM 3.4 → ADaM 1.2, 1.3
- SDTM 3.3 → ADaM 1.1, 1.2
- SDTM 3.2 → ADaM 1.0, 1.1

**Test Results:** 20 new tests added, all 326 tests passing ✓

### 4.1 Standards Version Declaration (Original Design)

**Grammar Extension:**

```langium
// Add to thunderstruck.langium

ProgramElement:
    ImportStatement | StandardsDeclaration | CubeDefinition | ...;

StandardsDeclaration:
    'standards' '{' standards+=StandardVersion (',' standards+=StandardVersion)* '}';

StandardVersion:
    standard=StandardName ':' version=STRING;

StandardName returns string:
    'SDTM' | 'ADaM' | 'CDISC_CT' | 'W3C_Cube';
```

**Example Usage:**

```thunderstruck
standards {
    SDTM: "3.4",
    ADaM: "1.2",
    CDISC_CT: "2024-09-27"
}

cube DM {
    namespace: "http://cdisc.org/sdtm/dm",
    structure: {
        dimensions: [
            STUDYID: Identifier,
            USUBJID: Identifier
        ],
        measures: [
            AGE: Numeric,
            SEX: CodedValue<SEX>
        ]
    }
}
```

### 4.2 Version Manager

**Implementation:**

```typescript
// src/validation/standards/version-manager.ts

export interface StandardsVersions {
    SDTM?: string;
    ADaM?: string;
    CDISC_CT?: string;
    W3C_Cube?: string;
}

export class VersionManager {
    private declaredVersions: StandardsVersions = {};

    // Default versions if not specified
    private readonly defaultVersions: StandardsVersions = {
        SDTM: '3.4',
        ADaM: '1.2',
        CDISC_CT: '2024-09-27',
        W3C_Cube: '2014-01-16'
    };

    loadFromProgram(program: Program): void {
        for (const element of program.elements) {
            if (this.isStandardsDeclaration(element)) {
                for (const stdVersion of element.standards) {
                    this.declaredVersions[stdVersion.standard] = stdVersion.version;
                }
            }
        }
    }

    getVersion(standard: keyof StandardsVersions): string {
        return this.declaredVersions[standard] || this.defaultVersions[standard] || 'unknown';
    }

    validateVersionCompatibility(): TypeDiagnostic[] {
        const diagnostics: TypeDiagnostic[] = [];

        // Check for known compatibility issues
        const sdtmVersion = this.getVersion('SDTM');
        const adamVersion = this.getVersion('ADaM');

        if (!this.isVersionCompatible(sdtmVersion, adamVersion)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                message: `SDTM ${sdtmVersion} and ADaM ${adamVersion} may have compatibility issues.`,
                code: 'VERSION-COMPATIBILITY'
            });
        }

        return diagnostics;
    }

    private isVersionCompatible(sdtmVersion: string, adamVersion: string): boolean {
        // Define compatibility matrix
        const compatibilityMatrix: Record<string, string[]> = {
            '3.4': ['1.2', '1.3'],
            '3.3': ['1.1', '1.2'],
        };

        return compatibilityMatrix[sdtmVersion]?.includes(adamVersion) || false;
    }

    private isStandardsDeclaration(element: ProgramElement): element is StandardsDeclaration {
        return element.$type === 'StandardsDeclaration';
    }
}
```

**Tests:**
- Version declarations are parsed correctly
- Default versions are used when not specified
- Version compatibility checks work
- Multiple standards can be declared

---

## Phase 5: Validation Reporting ✅ COMPLETE

**Status:** Implemented and tested
**Commit:** 9592aaa
**Files Added:** 4 reporting modules + tests (1,584 insertions)

### Implementation Summary

**Report Structures:**
- Complete ValidationReport with metadata, summary, and grouped results
- ValidationIssue with severity, source, code, message, suggestions
- ValidationSummary with statistics and pass/fail/pass-with-warnings status
- ValidationResults grouped by source (W3C, SDTM, ADaM, CORE, Version, Type, Semantic)

**Report Generator:**
- Collects issues from all validation sources
- Filters by severity (errors, warnings, hints)
- Sorts by priority (errors first)
- Limits output for large reports
- Tracks validation duration
- Generates comprehensive statistics

**Report Formatters (3 formats):**
- **JSONFormatter**: Structured JSON for programmatic consumption
- **TextFormatter**: Human-readable 80-column text with sections
- **MarkdownFormatter**: Documentation-ready with tables and badges
- FormatterFactory for unified formatter access

**Integrated Validator:**
- Unified validateProgram() runs W3C + version validation
- Per-cube validation for SDTM/ADaM with CORE rules
- Automatic version loading and metadata collection
- Flexible ValidationOptions configuration

**Features:**
- Multi-source issue aggregation
- Severity-based filtering and sorting
- Issue count limiting
- Duration tracking
- Standards version metadata in reports
- Grouped results by validation source and element

**Test Results:** 25 new tests, all 366 tests passing ✓

### 5.1 Validation Report Structure (Original Design)

**Implementation:**

```typescript
// src/validation/reporting/validation-report.ts

export interface ValidationReport {
    timestamp: Date;
    programPath: string;
    standards: StandardsVersions;
    summary: ValidationSummary;
    violations: ValidationViolation[];
}

export interface ValidationSummary {
    totalViolations: number;
    errors: number;
    warnings: number;
    info: number;
    w3cViolations: number;
    cdiscViolations: number;
    coreViolations: number;
}

export interface ValidationViolation {
    category: 'W3C' | 'SDTM' | 'ADaM' | 'CORE';
    ruleId: string;
    severity: 'Error' | 'Warning' | 'Info';
    message: string;
    location?: {
        file: string;
        line: number;
        column: number;
    };
    suggestion?: string;
}

export class ValidationReportGenerator {
    generateReport(
        program: Program,
        diagnostics: TypeDiagnostic[],
        standards: StandardsVersions
    ): ValidationReport {
        const violations = this.convertDiagnosticsToViolations(diagnostics);

        return {
            timestamp: new Date(),
            programPath: program.$document?.uri?.toString() || 'unknown',
            standards,
            summary: this.generateSummary(violations),
            violations
        };
    }

    private convertDiagnosticsToViolations(
        diagnostics: TypeDiagnostic[]
    ): ValidationViolation[] {
        return diagnostics.map(diag => ({
            category: this.inferCategory(diag.code),
            ruleId: diag.code || 'UNKNOWN',
            severity: this.severityToString(diag.severity),
            message: diag.message,
            suggestion: diag.suggestion
        }));
    }

    private generateSummary(violations: ValidationViolation[]): ValidationSummary {
        return {
            totalViolations: violations.length,
            errors: violations.filter(v => v.severity === 'Error').length,
            warnings: violations.filter(v => v.severity === 'Warning').length,
            info: violations.filter(v => v.severity === 'Info').length,
            w3cViolations: violations.filter(v => v.category === 'W3C').length,
            cdiscViolations: violations.filter(v => ['SDTM', 'ADaM'].includes(v.category)).length,
            coreViolations: violations.filter(v => v.category === 'CORE').length
        };
    }

    exportToJSON(report: ValidationReport): string {
        return JSON.stringify(report, null, 2);
    }

    exportToHTML(report: ValidationReport): string {
        // Generate HTML report with styling
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Thunderstruck Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 15px; margin-bottom: 20px; }
        .error { color: #d32f2f; }
        .warning { color: #f57c00; }
        .info { color: #1976d2; }
        .violation { border-left: 4px solid #ccc; padding: 10px; margin: 10px 0; }
        .violation.error { border-left-color: #d32f2f; }
        .violation.warning { border-left-color: #f57c00; }
    </style>
</head>
<body>
    <h1>Thunderstruck Validation Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Violations: ${report.summary.totalViolations}</p>
        <p class="error">Errors: ${report.summary.errors}</p>
        <p class="warning">Warnings: ${report.summary.warnings}</p>
        <p class="info">Info: ${report.summary.info}</p>
    </div>
    <div class="violations">
        <h2>Violations</h2>
        ${report.violations.map(v => this.renderViolationHTML(v)).join('')}
    </div>
</body>
</html>
        `;
    }

    private renderViolationHTML(violation: ValidationViolation): string {
        return `
        <div class="violation ${violation.severity.toLowerCase()}">
            <strong>[${violation.category}] ${violation.ruleId}</strong>: ${violation.message}
            ${violation.suggestion ? `<br><em>Suggestion: ${violation.suggestion}</em>` : ''}
        </div>
        `;
    }

    private inferCategory(code?: string): 'W3C' | 'SDTM' | 'ADaM' | 'CORE' {
        if (!code) return 'W3C';
        if (code.startsWith('IC-')) return 'W3C';
        if (code.startsWith('SDTM')) return 'SDTM';
        if (code.startsWith('ADAM')) return 'ADaM';
        if (code.includes('.')) return 'CORE'; // CORE rules have format SDTM.DM.001
        return 'W3C';
    }

    private severityToString(severity: DiagnosticSeverity): 'Error' | 'Warning' | 'Info' {
        switch (severity) {
            case DiagnosticSeverity.Error: return 'Error';
            case DiagnosticSeverity.Warning: return 'Warning';
            case DiagnosticSeverity.Information: return 'Info';
            case DiagnosticSeverity.Hint: return 'Info';
        }
    }
}
```

**Tests:**
- Report generation works correctly
- Summary statistics are accurate
- JSON export is valid
- HTML export renders properly

### 5.2 VS Code Integration

**Implementation:**

```typescript
// Update thunderstruck-validator.ts

export class ThunderstruckValidator {
    private w3cValidator: W3CValidator;
    private cdiscValidator: CDISCValidator;
    private coreRulesEngine: COREulesEngine;
    private versionManager: VersionManager;

    constructor() {
        this.w3cValidator = new W3CValidator();
        this.cdiscValidator = new CDISCValidator();
        this.coreRulesEngine = new COREulesEngine();
        this.versionManager = new VersionManager();
    }

    checkDocument(document: LangiumDocument): ValidationAcceptor {
        const program = document.parseResult.value as Program;
        const symbolTable = new SymbolTable();
        symbolTable.buildFromProgram(program);

        // Load version declarations
        this.versionManager.loadFromProgram(program);

        // Run all validators
        const diagnostics: TypeDiagnostic[] = [];

        // W3C validation
        diagnostics.push(...this.w3cValidator.validate(program, symbolTable));

        // CDISC validation
        const sdtmVersion = this.versionManager.getVersion('SDTM');
        const adamVersion = this.versionManager.getVersion('ADaM');

        diagnostics.push(...this.cdiscValidator.validate(
            program,
            symbolTable,
            sdtmVersion,
            adamVersion
        ));

        // CORE rules validation
        diagnostics.push(...this.coreRulesEngine.validateProgram(
            program,
            symbolTable
        ));

        // Version compatibility
        diagnostics.push(...this.versionManager.validateVersionCompatibility());

        return this.convertToValidationAcceptor(diagnostics, document);
    }

    private convertToValidationAcceptor(
        diagnostics: TypeDiagnostic[],
        document: LangiumDocument
    ): ValidationAcceptor {
        // Convert diagnostics to Langium ValidationAcceptor format
        // ...
    }
}
```

---

## Phase 6: Testing Strategy

### 6.1 Test Fixtures

**Create test fixtures for each scenario:**

```thunderstruck
// fixtures/valid-sdtm-cube.tsk
standards {
    SDTM: "3.4"
}

cube DM {
    namespace: "http://cdisc.org/sdtm/dm",
    structure: {
        dimensions: [
            STUDYID: Identifier,
            USUBJID: Identifier,
            SUBJID: Text
        ],
        measures: [
            AGE: Numeric,
            AGEU: CodedValue<AGEU>,
            SEX: CodedValue<SEX>,
            RACE: CodedValue<RACE>
        ]
    }
}
```

```thunderstruck
// fixtures/invalid-sdtm-cube.tsk
standards {
    SDTM: "3.4"
}

cube DM {
    namespace: "http://cdisc.org/sdtm/dm",
    structure: {
        dimensions: [
            STUDYID: Identifier
            // Missing USUBJID (required)
        ],
        measures: [
            AGE: Text,  // Wrong type (should be Numeric)
            SEX: Text   // Should be CodedValue
        ]
    }
}
```

### 6.2 Unit Tests

**Test Structure:**

```
__tests__/validation/
├── w3c/
│   ├── ic-01-unique-dataset.test.ts
│   ├── ic-02-unique-dsd.test.ts
│   ├── ic-11-all-dimensions.test.ts
│   ├── ic-12-no-duplicates.test.ts
│   └── ic-19-codes-from-codelist.test.ts
├── cdisc/
│   ├── sdtm-validator.test.ts
│   ├── adam-validator.test.ts
│   ├── terminology-validator.test.ts
│   └── core-rules-engine.test.ts
├── standards/
│   ├── version-manager.test.ts
│   └── standards-metadata.test.ts
└── reporting/
    ├── validation-report.test.ts
    └── diagnostic-formatter.test.ts
```

**Example Test:**

```typescript
// __tests__/validation/w3c/ic-01-unique-dataset.test.ts

describe('IC-01: Unique DataSet', () => {
    it('should pass for cubes with unique names', async () => {
        const program = await parseProgram(`
            cube Cube1 { ... }
            cube Cube2 { ... }
        `);

        const validator = new IC01_UniqueDataSet();
        const violations = validator.validate(program, symbolTable);

        expect(violations).toHaveLength(0);
    });

    it('should error for duplicate cube names', async () => {
        const program = await parseProgram(`
            cube TestCube { ... }
            cube TestCube { ... }
        `);

        const validator = new IC01_UniqueDataSet();
        const violations = validator.validate(program, symbolTable);

        expect(violations).toHaveLength(1);
        expect(violations[0].constraintId).toBe('IC-1');
        expect(violations[0].severity).toBe(DiagnosticSeverity.Error);
        expect(violations[0].message).toContain('Duplicate cube definition');
    });
});
```

### 6.3 Integration Tests

**End-to-end validation tests:**

```typescript
// __tests__/validation/validation-integration.test.ts

describe('Standards Validation Integration', () => {
    it('should validate complete SDTM program', async () => {
        const program = await parseProgram(
            fs.readFileSync('fixtures/valid-sdtm-cube.tsk', 'utf-8')
        );

        const validator = new ThunderstruckValidator();
        const diagnostics = validator.checkDocument(program);

        expect(diagnostics.filter(d => d.severity === DiagnosticSeverity.Error)).toHaveLength(0);
    });

    it('should detect multiple validation issues', async () => {
        const program = await parseProgram(
            fs.readFileSync('fixtures/invalid-sdtm-cube.tsk', 'utf-8')
        );

        const validator = new ThunderstruckValidator();
        const diagnostics = validator.checkDocument(program);

        const errors = diagnostics.filter(d => d.severity === DiagnosticSeverity.Error);
        expect(errors.length).toBeGreaterThan(0);

        // Check specific violations
        expect(errors.some(e => e.code === 'SDTM-MISSING-REQUIRED-VAR')).toBe(true);
        expect(errors.some(e => e.code === 'SDTM-WRONG-TYPE')).toBe(true);
    });

    it('should generate validation report', async () => {
        const program = await parseProgram(
            fs.readFileSync('fixtures/invalid-sdtm-cube.tsk', 'utf-8')
        );

        const validator = new ThunderstruckValidator();
        const diagnostics = validator.checkDocument(program);

        const reportGenerator = new ValidationReportGenerator();
        const report = reportGenerator.generateReport(
            program,
            diagnostics,
            { SDTM: '3.4' }
        );

        expect(report.summary.totalViolations).toBeGreaterThan(0);
        expect(report.violations).toBeDefined();

        const json = reportGenerator.exportToJSON(report);
        expect(() => JSON.parse(json)).not.toThrow();

        const html = reportGenerator.exportToHTML(report);
        expect(html).toContain('<!DOCTYPE html>');
    });
});
```

---

## Implementation Timeline

### Week 1: W3C Integrity Constraints

**Days 1-2: Framework + IC-1, IC-2**
- Set up IC validator framework
- Implement IC-1 (Unique DataSet)
- Implement IC-2 (Unique DSD)
- Write tests

**Days 3-5: IC-11, IC-12, IC-19**
- Implement IC-11 (All Dimensions Required)
- Implement IC-12 (No Duplicate Observations)
- Implement IC-19 (Codes from CodeList)
- Write tests
- Integration with validation system

### Week 2: CDISC Validation Framework

**Days 1-2: Standards Metadata**
- Define metadata structures
- Create SDTM 3.4 domain definitions (focus on DM, AE, LB)
- Create ADaM 1.2 structure definitions (ADSL, BDS)

**Days 3-5: SDTM and ADaM Validators**
- Implement SDTMValidator
- Implement ADaMValidator
- Write comprehensive tests

### Week 3: CORE Rules Engine

**Days 1-2: Rules Engine Framework**
- Implement COREulesEngine
- Create rule checker interfaces
- Implement basic checkers (no-duplicate-key, iso8601-date)

**Days 3-4: Additional Checkers**
- Implement datetime-order checker
- Implement required-if checker
- Implement value-in-codelist checker

**Day 5: CORE Rules Data**
- Create SDTM CORE rules (start with 10-15 critical rules)
- Create ADaM CORE rules (start with 10-15 critical rules)
- Write tests

### Week 4: Version Management & Reporting

**Days 1-2: Version Management**
- Extend grammar for standards declarations
- Implement VersionManager
- Implement version compatibility checks
- Write tests

**Days 3-4: Validation Reporting**
- Implement ValidationReportGenerator
- Create JSON export
- Create HTML export
- VS Code integration

**Day 5: Final Integration & Testing**
- End-to-end integration tests
- Performance testing
- Documentation
- Final review

---

## Success Criteria

### Functional Requirements

- [ ] All 5 W3C integrity constraints are implemented and tested
- [ ] SDTM validation works for at least 3 domains (DM, AE, LB)
- [ ] ADaM validation works for ADSL and BDS structures
- [ ] CORE rules engine executes at least 20 rules
- [ ] Version management supports SDTM 3.4 and ADaM 1.2
- [ ] Validation reports can be exported to JSON and HTML
- [ ] All violations appear in VS Code Problems panel

### Performance Requirements

- [ ] Validation completes in <100ms for typical program
- [ ] No memory leaks during repeated validation
- [ ] Standards metadata loads efficiently

### Quality Requirements

- [ ] 100% test coverage for validators
- [ ] All validators have integration tests
- [ ] Error messages are actionable
- [ ] Suggestions are provided where applicable
- [ ] No false positives in validation

---

## Review Checkpoint Questions

### Scope Questions

1. **Are the most important validation rules covered?**
   - Have we prioritized the right W3C ICs?
   - Are the SDTM domains sufficient for initial release?
   - Do we need more CORE rules initially?

2. **Is the validation comprehensive enough?**
   - Should we add more integrity constraints?
   - Are there missing CDISC rules?
   - Do we need custom rule support?

### Technical Questions

3. **Is validation performance acceptable?**
   - Can we validate typical programs in <100ms?
   - Should we implement caching?
   - Do we need incremental validation?

4. **Are error messages actionable?**
   - Do users understand what to fix?
   - Are suggestions helpful?
   - Should we add quickfixes?

5. **Is version management intuitive?**
   - Is the standards declaration syntax clear?
   - Do defaults make sense?
   - How do we handle version migrations?

### Integration Questions

6. **How does this integrate with Increment 3?**
   - Does it reuse symbol table correctly?
   - Are there any conflicts with existing validation?
   - Should semantic validation be refactored?

7. **What about future increments?**
   - Does this support code generation (Increment 6)?
   - Can we extend CORE rules easily?
   - How do we add new standards?

### User Experience Questions

8. **Is the validation helpful or noisy?**
   - Are there too many warnings?
   - Should some checks be optional?
   - Do we need severity configuration?

9. **How do users disable validation?**
   - Can they turn off specific rules?
   - Can they configure per-project?
   - Do we need ignore directives?

10. **What about documentation?**
    - Do we document all rules?
    - Should we provide examples?
    - How do users learn about standards?

---

## Dependencies

### From Increment 3

- Symbol table with type resolution
- Type system (CubeType, component types)
- Semantic validation infrastructure
- Diagnostic reporting

### External Resources

- CDISC standards metadata (SDTM, ADaM)
- W3C Data Cube specification
- Controlled terminology (code lists)

### Libraries

- None (use existing Langium/TypeScript)

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Standards metadata too large | High | Medium | Start with subset, lazy load |
| Rule engine performance | High | Low | Profile early, optimize |
| Version compatibility complex | Medium | Medium | Keep compatibility matrix simple |
| False positives | High | Medium | Extensive testing, user feedback |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| CORE rules data takes too long | Medium | Medium | Prioritize critical rules first |
| Integration issues with Inc 3 | High | Low | Review API before starting |
| Testing takes longer than expected | Medium | Medium | Write tests in parallel |

---

## Next Steps After Review

1. **Review & Approve Plan** - User reviews and approves this plan
2. **Set Up Branch** - Create feature branch for Increment 4
3. **Phase 1: W3C ICs** - Start with integrity constraints
4. **Phase 2: CDISC** - Build validation framework
5. **Phase 3: CORE** - Implement rules engine
6. **Phase 4: Versions** - Add version management
7. **Phase 5: Reports** - Build reporting
8. **Phase 6: Testing** - Complete test suite
9. **Documentation** - Update user docs
10. **Final Review** - Review checkpoint questions
