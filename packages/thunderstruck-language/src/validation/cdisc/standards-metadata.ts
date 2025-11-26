/**
 * CDISC Standards Metadata Structures
 *
 * Defines the structure for CDISC standards metadata including:
 * - SDTM (Study Data Tabulation Model)
 * - ADaM (Analysis Data Model)
 * - Code lists and controlled terminology
 */

/**
 * Represents a variable definition in a CDISC standard.
 */
export interface VariableDefinition {
    /** Variable name (e.g., "USUBJID", "AVAL") */
    name: string;

    /** Variable label/description */
    label: string;

    /** Data type (Text, Numeric, Integer, Date, DateTime, etc.) */
    type: 'Text' | 'Numeric' | 'Integer' | 'Date' | 'DateTime' | 'CodedValue';

    /** Code list name if type is CodedValue */
    codeList?: string;

    /** Whether the variable is required */
    required: boolean;

    /** Role (Identifier, Topic, Qualifier, Timing, etc.) */
    role?: 'Identifier' | 'Topic' | 'Qualifier' | 'Timing' | 'Rule' | 'Record Qualifier';

    /** Core status (Required, Expected, Permissible) */
    core?: 'Required' | 'Expected' | 'Permissible';

    /** Maximum length for text variables */
    length?: number;

    /** Allowed values (for constrained variables) */
    allowedValues?: string[];
}

/**
 * Represents an SDTM domain definition.
 */
export interface SDTMDomainDefinition {
    /** Domain code (e.g., "DM", "AE", "LB") */
    domain: string;

    /** Domain name/description */
    name: string;

    /** Domain class (e.g., "Special Purpose", "Events", "Findings") */
    class: string;

    /** Standard version (e.g., "3.4") */
    version: string;

    /** Variable definitions for this domain */
    variables: VariableDefinition[];

    /** Required key variables for uniqueness */
    keyVariables: string[];
}

/**
 * Represents an ADaM dataset definition.
 */
export interface ADaMDatasetDefinition {
    /** Dataset type (e.g., "ADSL", "BDS", "OCCDS", "ADAE") */
    dataset: string;

    /** Dataset name/description */
    name: string;

    /** Dataset structure (e.g., "One record per subject", "One record per subject per parameter per analysis visit") */
    structure: string;

    /** Standard version (e.g., "1.2") */
    version: string;

    /** Variable definitions for this dataset */
    variables: VariableDefinition[];

    /** Required key variables for uniqueness */
    keyVariables: string[];
}

/**
 * Represents a code list definition.
 */
export interface CodeListDefinition {
    /** Code list identifier */
    id: string;

    /** Code list name */
    name: string;

    /** Extensible flag (can codes be added?) */
    extensible: boolean;

    /** Code/decode pairs */
    codes: Array<{
        code: string;
        decode: string;
    }>;
}

/**
 * Registry of CDISC standards metadata.
 */
export class StandardsMetadataRegistry {
    private sdtmDomains: Map<string, SDTMDomainDefinition> = new Map();
    private adamDatasets: Map<string, ADaMDatasetDefinition> = new Map();
    private codeLists: Map<string, CodeListDefinition> = new Map();

    /**
     * Register an SDTM domain definition.
     */
    registerSDTMDomain(domain: SDTMDomainDefinition): void {
        this.sdtmDomains.set(domain.domain, domain);
    }

    /**
     * Get an SDTM domain definition.
     */
    getSDTMDomain(domain: string): SDTMDomainDefinition | undefined {
        return this.sdtmDomains.get(domain);
    }

    /**
     * Get all registered SDTM domains.
     */
    getAllSDTMDomains(): SDTMDomainDefinition[] {
        return Array.from(this.sdtmDomains.values());
    }

    /**
     * Register an ADaM dataset definition.
     */
    registerADaMDataset(dataset: ADaMDatasetDefinition): void {
        this.adamDatasets.set(dataset.dataset, dataset);
    }

    /**
     * Get an ADaM dataset definition.
     */
    getADaMDataset(dataset: string): ADaMDatasetDefinition | undefined {
        return this.adamDatasets.get(dataset);
    }

    /**
     * Get all registered ADaM datasets.
     */
    getAllADaMDatasets(): ADaMDatasetDefinition[] {
        return Array.from(this.adamDatasets.values());
    }

    /**
     * Register a code list definition.
     */
    registerCodeList(codeList: CodeListDefinition): void {
        this.codeLists.set(codeList.id, codeList);
    }

    /**
     * Get a code list definition.
     */
    getCodeList(id: string): CodeListDefinition | undefined {
        return this.codeLists.get(id);
    }

    /**
     * Validate a code against a code list.
     */
    isValidCode(codeListId: string, code: string): boolean {
        const codeList = this.codeLists.get(codeListId);
        if (!codeList) {
            return false;
        }

        return codeList.codes.some(c => c.code === code);
    }

    /**
     * Clear all registered metadata (useful for testing).
     */
    clear(): void {
        this.sdtmDomains.clear();
        this.adamDatasets.clear();
        this.codeLists.clear();
    }
}
