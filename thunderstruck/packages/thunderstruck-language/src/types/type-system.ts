/**
 * Type System for Thunderstruck Language
 *
 * Provides type representations for all types in the Thunderstruck language:
 * - Primitive types (Numeric, Integer, Text, DateTime, Date, Flag)
 * - Special types (Identifier, CodedValue)
 * - Composite types (Cube)
 * - Special handling types (Unknown, Error)
 *
 * Design decisions (from INCREMENT_3_IMPLEMENTATION_PLAN.md):
 * - Q1: Moderate type inference (explicit for definitions, inferred for expressions)
 * - Q9: CodedValue<X> is assignable to CodedValue (specific → general)
 * - Q10: ErrorType propagates through expressions
 */

/**
 * Base class for all types in the Thunderstruck type system.
 *
 * All types must implement:
 * - toString(): Human-readable representation
 * - equals(): Structural equality check
 * - isAssignableTo(): Type compatibility check
 */
export abstract class Type {
    /**
     * Returns a human-readable string representation of this type.
     */
    abstract toString(): string;

    /**
     * Checks if this type is structurally equal to another type.
     * @param other The type to compare with
     */
    abstract equals(other: Type): boolean;

    /**
     * Checks if a value of this type can be assigned to a variable of the target type.
     * Implements subtyping rules:
     * - Integer ⊆ Numeric
     * - Date ⊆ DateTime
     * - CodedValue<X> ⊆ CodedValue
     *
     * @param target The target type
     * @returns true if this type is assignable to target
     */
    abstract isAssignableTo(target: Type): boolean;
}

/**
 * Numeric type - represents floating-point numbers.
 * Used for continuous measurements like AVAL, CHG, etc.
 */
export class NumericType extends Type {
    private readonly unit?: string;

    constructor(unit?: string) {
        super();
        this.unit = unit;
    }

    getUnit(): string | undefined {
        return this.unit;
    }

    toString(): string {
        return this.unit ? `Numeric unit: "${this.unit}"` : 'Numeric';
    }

    equals(other: Type): boolean {
        if (!(other instanceof NumericType)) {
            return false;
        }
        return this.unit === other.unit;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof NumericType) {
            // Units must match exactly (Q2: Strict unit compatibility)
            return this.unit === target.unit;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Integer type - represents whole numbers.
 * Subtype of Numeric (Integer ⊆ Numeric).
 * Used for counts, visit numbers, etc.
 */
export class IntegerType extends Type {
    toString(): string {
        return 'Integer';
    }

    equals(other: Type): boolean {
        return other instanceof IntegerType;
    }

    isAssignableTo(target: Type): boolean {
        // Integer is assignable to Numeric (subtyping)
        if (target instanceof IntegerType || target instanceof NumericType) {
            // Integer without unit is assignable to Numeric without unit
            if (target instanceof NumericType && target.getUnit() !== undefined) {
                return false;
            }
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Text type - represents string values.
 * Used for labels, descriptions, etc.
 */
export class TextType extends Type {
    toString(): string {
        return 'Text';
    }

    equals(other: Type): boolean {
        return other instanceof TextType;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof TextType) {
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * DateTime type - represents date and time values.
 * Used for timestamps, analysis reference times, etc.
 */
export class DateTimeType extends Type {
    toString(): string {
        return 'DateTime';
    }

    equals(other: Type): boolean {
        return other instanceof DateTimeType;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof DateTimeType) {
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Date type - represents date-only values (no time component).
 * Subtype of DateTime (Date ⊆ DateTime).
 */
export class DateType extends Type {
    toString(): string {
        return 'Date';
    }

    equals(other: Type): boolean {
        return other instanceof DateType;
    }

    isAssignableTo(target: Type): boolean {
        // Date is assignable to DateTime (subtyping)
        if (target instanceof DateType || target instanceof DateTimeType) {
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Flag type - represents boolean values.
 * Used for flags like ITTFL, EFFFL, etc.
 */
export class FlagType extends Type {
    toString(): string {
        return 'Flag';
    }

    equals(other: Type): boolean {
        return other instanceof FlagType;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof FlagType) {
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Identifier type - represents unique identifiers.
 * Used for subject IDs, study IDs, etc.
 */
export class IdentifierType extends Type {
    toString(): string {
        return 'Identifier';
    }

    equals(other: Type): boolean {
        return other instanceof IdentifierType;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof IdentifierType) {
            return true;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * CodedValue type - represents values from a controlled terminology.
 * Can optionally specify a code list for validation.
 *
 * Type compatibility (Q9):
 * - CodedValue<X> is assignable to CodedValue (specific → general)
 * - CodedValue is NOT assignable to CodedValue<X> (general → specific not allowed)
 */
export class CodedValueType extends Type {
    private readonly codeList?: string;

    constructor(codeList?: string) {
        super();
        this.codeList = codeList;
    }

    getCodeList(): string | undefined {
        return this.codeList;
    }

    toString(): string {
        return this.codeList ? `CodedValue<${this.codeList}>` : 'CodedValue';
    }

    equals(other: Type): boolean {
        if (!(other instanceof CodedValueType)) {
            return false;
        }
        return this.codeList === other.codeList;
    }

    isAssignableTo(target: Type): boolean {
        if (target instanceof CodedValueType) {
            // Specific code list can be assigned to general CodedValue
            if (this.codeList !== undefined && target.codeList === undefined) {
                return true;
            }
            // Same code list or both unspecified
            return this.codeList === target.codeList;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }
}

/**
 * Cube type - represents a data cube with dimensions, measures, and attributes.
 * Used to type-check references to cubes and their components.
 */
export class CubeType extends Type {
    constructor(
        public readonly name: string,
        public readonly dimensions: Map<string, Type>,
        public readonly measures: Map<string, Type>,
        public readonly attributes: Map<string, Type>
    ) {
        super();
    }

    toString(): string {
        return `Cube<${this.name}>`;
    }

    equals(other: Type): boolean {
        if (!(other instanceof CubeType)) {
            return false;
        }
        // Structural equality: same name and same components
        if (this.name !== other.name) {
            return false;
        }
        if (this.dimensions.size !== other.dimensions.size ||
            this.measures.size !== other.measures.size ||
            this.attributes.size !== other.attributes.size) {
            return false;
        }
        // Check all dimensions match
        for (const [name, type] of this.dimensions) {
            const otherType = other.dimensions.get(name);
            if (!otherType || !type.equals(otherType)) {
                return false;
            }
        }
        // Check all measures match
        for (const [name, type] of this.measures) {
            const otherType = other.measures.get(name);
            if (!otherType || !type.equals(otherType)) {
                return false;
            }
        }
        // Check all attributes match
        for (const [name, type] of this.attributes) {
            const otherType = other.attributes.get(name);
            if (!otherType || !type.equals(otherType)) {
                return false;
            }
        }
        return true;
    }

    isAssignableTo(target: Type): boolean {
        // Cubes are nominal types - must be exactly the same cube
        if (target instanceof CubeType) {
            return this.name === target.name;
        }
        if (target instanceof ErrorType || target instanceof UnknownType) {
            return true;
        }
        return false;
    }

    /**
     * Get a component (dimension, measure, or attribute) by name.
     */
    getComponent(name: string): Type | undefined {
        return this.dimensions.get(name) ||
               this.measures.get(name) ||
               this.attributes.get(name);
    }

    /**
     * Check if a component exists in this cube.
     */
    hasComponent(name: string): boolean {
        return this.dimensions.has(name) ||
               this.measures.has(name) ||
               this.attributes.has(name);
    }
}

/**
 * UnknownType - represents a type that hasn't been inferred yet.
 * Used during type checking when information is incomplete.
 * Compatible with all types (lenient).
 */
export class UnknownType extends Type {
    toString(): string {
        return 'Unknown';
    }

    equals(other: Type): boolean {
        return other instanceof UnknownType;
    }

    isAssignableTo(target: Type): boolean {
        // Unknown is assignable to anything (lenient)
        return true;
    }
}

/**
 * ErrorType - represents a type error that occurred during validation.
 * Propagates through expressions to avoid cascading errors (Q10).
 *
 * When an expression has an error (e.g., undefined variable), we use ErrorType
 * to mark it. This allows validation to continue and collect multiple errors
 * without generating false cascading errors.
 */
export class ErrorType extends Type {
    constructor(public readonly message?: string) {
        super();
    }

    toString(): string {
        return this.message ? `Error(${this.message})` : 'Error';
    }

    equals(other: Type): boolean {
        return other instanceof ErrorType;
    }

    isAssignableTo(target: Type): boolean {
        // Error is assignable to anything to prevent cascading errors
        return true;
    }
}
