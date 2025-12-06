/**
 * Validation Report Structures
 *
 * Defines structures for comprehensive validation reporting including:
 * - W3C Data Cube integrity constraints
 * - CDISC SDTM/ADaM validation
 * - CORE rules conformance
 * - Version compatibility
 */

import { DiagnosticSeverity } from '../../types/type-checker.js';
import type { COREViolation } from '../cdisc/core-rules-engine.js';
import type { VersionDiagnostic } from '../cdisc/version-manager.js';

/**
 * Represents a single validation issue
 */
export interface ValidationIssue {
    /** Severity level */
    severity: DiagnosticSeverity;

    /** Error/warning message */
    message: string;

    /** Diagnostic code (e.g., "IC-1", "CG0001") */
    code: string;

    /** Source of the validation (W3C, SDTM, ADaM, CORE, Version) */
    source: 'W3C' | 'SDTM' | 'ADaM' | 'CORE' | 'Version' | 'Type' | 'Semantic';

    /** Category (e.g., "Structure", "Content", "Formatting") */
    category?: string;

    /** Variable name if applicable */
    variable?: string;

    /** Element name (cube, slice, etc.) if applicable */
    element?: string;

    /** Line number if available */
    line?: number;

    /** Column number if available */
    column?: number;

    /** Suggested fix or remediation */
    suggestion?: string;
}

/**
 * Summary statistics for a validation report
 */
export interface ValidationSummary {
    /** Total number of issues */
    totalIssues: number;

    /** Number of errors */
    errors: number;

    /** Number of warnings */
    warnings: number;

    /** Number of info messages */
    info: number;

    /** Number of hints */
    hints: number;

    /** Overall validation status */
    status: 'pass' | 'pass-with-warnings' | 'fail';
}

/**
 * Validation results grouped by source
 */
export interface ValidationResults {
    /** W3C Data Cube integrity constraint violations */
    w3c: ValidationIssue[];

    /** SDTM validation issues */
    sdtm: ValidationIssue[];

    /** ADaM validation issues */
    adam: ValidationIssue[];

    /** CORE rules violations */
    core: ValidationIssue[];

    /** Version compatibility issues */
    version: ValidationIssue[];

    /** Type system issues */
    type: ValidationIssue[];

    /** Other semantic validation issues */
    semantic: ValidationIssue[];
}

/**
 * Metadata about the validation run
 */
export interface ValidationMetadata {
    /** Timestamp of validation */
    timestamp: Date;

    /** File or program being validated */
    target: string;

    /** Standards versions used */
    versions: {
        SDTM?: string;
        ADaM?: string;
        CDISC_CT?: string;
        W3C_Cube?: string;
    };

    /** Duration of validation in milliseconds */
    duration?: number;
}

/**
 * Complete validation report
 */
export interface ValidationReport {
    /** Report metadata */
    metadata: ValidationMetadata;

    /** Summary statistics */
    summary: ValidationSummary;

    /** All validation results grouped by source */
    results: ValidationResults;

    /** All issues in a flat list (sorted by severity) */
    allIssues: ValidationIssue[];
}

/**
 * Options for report generation
 */
export interface ReportOptions {
    /** Include warnings in report */
    includeWarnings?: boolean;

    /** Include info/hints in report */
    includeInfo?: boolean;

    /** Sort issues by severity (default: true) */
    sortBySeverity?: boolean;

    /** Group issues by element/cube */
    groupByElement?: boolean;

    /** Maximum number of issues to include (0 = unlimited) */
    maxIssues?: number;
}

/**
 * Helper functions for creating validation issues
 */
export class ValidationIssueFactory {
    /**
     * Create a W3C integrity constraint violation
     */
    static createW3CIssue(
        code: string,
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error,
        element?: string
    ): ValidationIssue {
        return {
            severity,
            message,
            code,
            source: 'W3C',
            category: 'Integrity Constraint',
            element
        };
    }

    /**
     * Create an SDTM validation issue
     */
    static createSDTMIssue(
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error,
        variable?: string,
        element?: string
    ): ValidationIssue {
        return {
            severity,
            message,
            code: 'SDTM',
            source: 'SDTM',
            category: 'Standards Conformance',
            variable,
            element
        };
    }

    /**
     * Create an ADaM validation issue
     */
    static createADaMIssue(
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error,
        variable?: string,
        element?: string
    ): ValidationIssue {
        return {
            severity,
            message,
            code: 'ADaM',
            source: 'ADaM',
            category: 'Standards Conformance',
            variable,
            element
        };
    }

    /**
     * Create a CORE rules violation issue
     */
    static createCOREIssue(violation: COREViolation): ValidationIssue {
        return {
            severity: violation.severity,
            message: violation.message,
            code: violation.ruleId,
            source: 'CORE',
            variable: violation.variable
        };
    }

    /**
     * Create a version compatibility issue
     */
    static createVersionIssue(diagnostic: VersionDiagnostic): ValidationIssue {
        return {
            severity: diagnostic.severity,
            message: diagnostic.message,
            code: diagnostic.code,
            source: 'Version',
            category: 'Version Compatibility',
            suggestion: diagnostic.suggestion
        };
    }

    /**
     * Determine severity level from string
     */
    static getSeverity(level: 'error' | 'warning' | 'hint'): DiagnosticSeverity {
        switch (level) {
            case 'error': return DiagnosticSeverity.Error;
            case 'warning': return DiagnosticSeverity.Warning;
            case 'hint': return DiagnosticSeverity.Hint;
        }
    }
}
