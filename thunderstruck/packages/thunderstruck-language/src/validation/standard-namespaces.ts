/**
 * Standard Namespaces for Thunderstruck Concepts
 *
 * Defines the standard namespaces used for concept organization:
 * - CDISC.Glossary: CDISC terminology and concepts
 * - USDM.Concepts: Unified Study Definitions Model concepts
 * - STATO.Concepts: Statistical Methods Ontology concepts
 * - NCI.Concepts: National Cancer Institute thesaurus concepts
 */

/**
 * Standard namespace definitions.
 */
export const STANDARD_NAMESPACES = {
    /**
     * CDISC Glossary namespace for CDISC terminology and concepts.
     * Example: CDISC.Glossary.AdverseEvent, CDISC.Glossary.VitalSign
     */
    CDISC_GLOSSARY: 'CDISC.Glossary',

    /**
     * Unified Study Definitions Model (USDM) concepts namespace.
     * Example: USDM.Concepts.StudyDesign, USDM.Concepts.Population
     */
    USDM_CONCEPTS: 'USDM.Concepts',

    /**
     * Statistical Methods Ontology (STATO) namespace.
     * Example: STATO.Concepts.ANCOVA, STATO.Concepts.LeastSquaresMean
     */
    STATO_CONCEPTS: 'STATO.Concepts',

    /**
     * National Cancer Institute (NCI) Thesaurus namespace.
     * Example: NCI.Concepts.Neoplasm, NCI.Concepts.Biomarker
     */
    NCI_CONCEPTS: 'NCI.Concepts',

    /**
     * Default namespace for concepts without explicit namespace.
     */
    DEFAULT: 'default'
} as const;

/**
 * Type for standard namespace names.
 */
export type StandardNamespace = typeof STANDARD_NAMESPACES[keyof typeof STANDARD_NAMESPACES];

/**
 * Check if a namespace is a recognized standard namespace.
 */
export function isStandardNamespace(namespace: string): namespace is StandardNamespace {
    return Object.values(STANDARD_NAMESPACES).includes(namespace as StandardNamespace);
}

/**
 * Get all standard namespace names.
 */
export function getStandardNamespaces(): StandardNamespace[] {
    return Object.values(STANDARD_NAMESPACES);
}

/**
 * Namespace descriptions for documentation and error messages.
 */
export const NAMESPACE_DESCRIPTIONS: Record<StandardNamespace, string> = {
    [STANDARD_NAMESPACES.CDISC_GLOSSARY]: 'CDISC Glossary terminology and concepts',
    [STANDARD_NAMESPACES.USDM_CONCEPTS]: 'Unified Study Definitions Model concepts',
    [STANDARD_NAMESPACES.STATO_CONCEPTS]: 'Statistical Methods Ontology concepts',
    [STANDARD_NAMESPACES.NCI_CONCEPTS]: 'National Cancer Institute Thesaurus concepts',
    [STANDARD_NAMESPACES.DEFAULT]: 'Default namespace for user-defined concepts'
};

/**
 * Reserved namespace prefixes that cannot be used for custom namespaces.
 */
export const RESERVED_NAMESPACE_PREFIXES = [
    'CDISC',
    'USDM',
    'STATO',
    'NCI'
] as const;

/**
 * Check if a namespace uses a reserved prefix.
 */
export function usesReservedPrefix(namespace: string): boolean {
    const prefix = namespace.split('.')[0];
    return RESERVED_NAMESPACE_PREFIXES.includes(prefix as any);
}

/**
 * Validate a custom namespace name.
 * Returns null if valid, error message if invalid.
 */
export function validateNamespace(namespace: string): string | null {
    if (!namespace || namespace.trim().length === 0) {
        return 'Namespace cannot be empty';
    }

    if (usesReservedPrefix(namespace) && !isStandardNamespace(namespace)) {
        const prefix = namespace.split('.')[0];
        return `Namespace prefix '${prefix}' is reserved for standard namespaces`;
    }

    // Check for valid format (segments separated by dots)
    const segments = namespace.split('.');
    for (const segment of segments) {
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(segment)) {
            return `Invalid namespace segment '${segment}'. Segments must start with a letter and contain only letters, numbers, and underscores`;
        }
    }

    return null;
}
