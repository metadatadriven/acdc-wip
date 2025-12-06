/**
 * Unit Checker for Thunderstruck Language
 *
 * Provides unit compatibility checking for numeric types.
 *
 * Design decision (Q2): Strict unit compatibility
 * - Units must match exactly (string equality)
 * - No normalization or conversion in this increment
 * - Future: Add UCUM validation and unit conversion
 */

/**
 * Unit checker for validating and comparing units.
 *
 * Current implementation uses strict string matching.
 * Future enhancements:
 * - UCUM (Unified Code for Units of Measure) validation
 * - Unit normalization (e.g., "kilogram" → "kg")
 * - Unit conversion compatibility (e.g., "mg" ↔ "g")
 */
export class UnitChecker {
    /**
     * Check if two units are compatible.
     *
     * Current implementation: Exact string match (case-sensitive)
     *
     * @param unit1 First unit
     * @param unit2 Second unit
     * @returns true if units are compatible
     */
    areCompatible(unit1: string | undefined, unit2: string | undefined): boolean {
        // Both undefined = compatible (no units specified)
        if (unit1 === undefined && unit2 === undefined) {
            return true;
        }

        // One undefined, one specified = incompatible
        if (unit1 === undefined || unit2 === undefined) {
            return false;
        }

        // Exact string match (case-sensitive)
        return unit1 === unit2;
    }

    /**
     * Check if a unit string is valid.
     *
     * Current implementation: Any non-empty string is valid
     * Future: Validate against UCUM standard
     *
     * @param unit Unit string to validate
     * @returns true if unit is valid
     */
    isValid(unit: string): boolean {
        // Basic validation: non-empty string
        if (typeof unit !== 'string' || unit.trim().length === 0) {
            return false;
        }
        return true;
    }

    /**
     * Get normalized form of a unit.
     *
     * Current implementation: Returns unit as-is
     * Future: Normalize to standard UCUM form (e.g., "kilogram" → "kg")
     *
     * @param unit Unit string to normalize
     * @returns Normalized unit string
     */
    normalize(unit: string): string {
        // For now, just return the unit as-is
        // Future: implement UCUM normalization
        return unit.trim();
    }

    /**
     * Get a user-friendly error message for unit incompatibility.
     *
     * @param unit1 First unit
     * @param unit2 Second unit
     * @param operation Operation being performed (e.g., "addition", "assignment")
     * @returns Error message
     */
    getIncompatibilityMessage(
        unit1: string | undefined,
        unit2: string | undefined,
        operation: string = 'operation'
    ): string {
        if (unit1 === undefined && unit2 !== undefined) {
            return `Cannot perform ${operation}: value has no unit, but expected unit "${unit2}"`;
        }
        if (unit1 !== undefined && unit2 === undefined) {
            return `Cannot perform ${operation}: value has unit "${unit1}", but no unit expected`;
        }
        if (unit1 !== undefined && unit2 !== undefined) {
            return `Cannot perform ${operation}: incompatible units "${unit1}" and "${unit2}"`;
        }
        // Both undefined - shouldn't reach here if areCompatible() is checked first
        return `Cannot perform ${operation}: unit incompatibility`;
    }
}

/**
 * Singleton instance of UnitChecker for convenience.
 */
export const unitChecker = new UnitChecker();
