# Increment 6: Standard Library + Examples - Additional Enhancements

This document tracks additional enhancements identified during Increment 5 testing that should be included in Increment 6.

## Enhancement 1: Dimension/Measure Hover Information

**Status:** Proposed
**Priority:** High
**Source:** User feedback from Increment 5 testing (2025-11-27)

### Background

During testing of Increment 5 LSP features, users noted that hover information works well for top-level entities (cubes, slices, models) but does not work for dimension and measure names within expressions.

### Current Behavior

**Works:**
- Hovering over `SafetyPopulation` shows slice details
- Hovering over `ADAE` shows cube structure
- Hovering over `ANCOVA` shows model formula

**Does Not Work:**
- Hovering over `AESOC` in `groupBy: [AESOC, TRT01A]`
- Hovering over `CHG` or `BASE` in formula `CHG ~ TRT01A + BASE`
- Hovering over dimensions in `vary: [USUBJID, TRT01A]`
- Hovering over measures in statistics

### Root Cause

The current hover provider only handles **cross-references** to top-level program elements. Dimension and measure names are **string identifiers** within expressions, not cross-references.

To provide hover information for these:
1. We need to resolve the context (which cube provides this dimension)
2. Look up the dimension definition in the cube structure
3. Display the dimension's type, unit, and documentation

### Proposed Solution

#### 1. Semantic Model Enhancement

Build a context-aware semantic model that tracks:
- Which cube/slice is in scope for each expression
- Where each dimension/measure is defined
- The inheritance chain (slice → cube → dimension)

#### 2. Enhanced Hover Provider

Extend `ThunderstruckHoverProvider` to:
- Detect dimension/measure identifiers in expressions
- Resolve them to their defining cube structure
- Show detailed information

Example hover content:
```markdown
**Dimension:** `AESOC`

**Type:** CodedValue<SOC>

**From:** SafetyPopulation → ADAE

**Unit:** N/A

**Description:** System Organ Class - CDISC SDTM standard dimension
```

#### 3. Documentation Support

Allow users to document dimensions/measures in cube definitions:

```thunderstruck
cube ADAE {
    namespace: "http://example.org/",
    structure: {
        dimensions: [
            // System Organ Class - Primary classification of adverse events
            AESOC: CodedValue<SOC> "System Organ Class for adverse event",

            // Treatment group
            TRT01A: CodedValue<TRTCD> "Actual Treatment Received"
        ]
    }
}
```

### Implementation Tasks

- [ ] **Task 6.7.1**: Extend type system to track dimension sources
  - Add scope resolution for expressions
  - Build context chain (expression → aggregate → slice → cube)
  - Create dimension lookup service

- [ ] **Task 6.7.2**: Enhance hover provider
  - Add dimension/measure hover support
  - Implement context-aware lookups
  - Format hover content for dimensions

- [ ] **Task 6.7.3**: Add documentation string support
  - Extend grammar for inline documentation
  - Parse documentation strings
  - Include in hover content

- [ ] **Task 6.7.4**: Formula variable resolution
  - Handle Wilkinson notation variables
  - Resolve formula terms to dimensions/measures
  - Support interaction terms (e.g., `TRT01A:AVISITN`)

- [ ] **Task 6.7.5**: Testing
  - Test hover on dimensions in groupBy
  - Test hover on measures in formulas
  - Test hover on variables in statistics
  - Test hover with documentation strings

### Benefits

1. **Better IDE Experience**: Users can understand dimensions without navigating to cube definitions
2. **Type Discovery**: Shows available dimensions and their types inline
3. **Documentation Access**: Inline documentation visible on hover
4. **Learning Aid**: Helps new users understand CDISC structures

### Example Use Cases

#### Use Case 1: Hover on groupBy dimension
```thunderstruck
aggregate AE_BySocAndTreatment {
    input: SafetyPopulation,
    groupBy: [AESOC, TRT01A],  // Hover on AESOC shows type and description
    statistics: [...]
}
```

#### Use Case 2: Hover on formula variable
```thunderstruck
model ANCOVA {
    input: Week24,
    formula: CHG ~ TRT01A + BASE,  // Hover on CHG/BASE shows measure types
    family: Gaussian
}
```

#### Use Case 3: Hover on vary dimension
```thunderstruck
slice Week24 from ADADAS {
    fix: { AVISITN: 24 },
    vary: [USUBJID, TRT01A]  // Hover shows dimension types
}
```

### Technical Considerations

1. **Performance**: Dimension lookups must be fast (<10ms)
2. **Scope Resolution**: Handle nested contexts correctly
3. **Cross-file References**: Support dimensions from imported cubes
4. **Error Handling**: Graceful handling of undefined dimensions

### Success Criteria

- [ ] Hover works on all dimension names in all contexts
- [ ] Hover works on all measure names in all contexts
- [ ] Hover shows correct type information
- [ ] Hover includes documentation when available
- [ ] Performance is < 50ms for hover response
- [ ] Works across file boundaries (imported cubes)

### Dependencies

- Increment 5 complete (LSP infrastructure)
- Symbol table with scope tracking
- Type system with dimension tracking

### Estimated Effort

**2-3 days** of development work within Increment 6 timeframe

---

## Future Enhancements

Additional LSP enhancements to consider for later increments:

### Code Completion for Dimensions
When typing in a `groupBy` or formula, suggest available dimensions from the input cube/slice.

### Quick Info for Code Lists
Show code list values when hovering over `CodedValue<SOC>` types.

### Signature Help for Functions
Show function signatures when typing aggregate functions like `mean()`, `count()`.

### Inlay Hints for Types
Show inferred types inline without hovering (e.g., `CHG: Numeric` shown in grey).

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Author:** Claude (based on user feedback)
