/**
 * Validation Report Generator
 *
 * Generates comprehensive validation reports from multiple validation sources.
 */

import { DiagnosticSeverity } from '../../types/type-checker.js';
import type {
    ValidationReport,
    ValidationIssue,
    ValidationSummary,
    ValidationResults,
    ValidationMetadata,
    ReportOptions
} from './validation-report.js';

/**
 * Report Generator
 *
 * Collects validation issues from multiple sources and generates
 * comprehensive validation reports with statistics and formatting.
 */
export class ReportGenerator {
    private issues: ValidationIssue[] = [];
    private metadata: Partial<ValidationMetadata> = {};
    private startTime?: number;

    /**
     * Start a new validation run
     */
    startValidation(target: string): void {
        this.issues = [];
        this.metadata = {
            target,
            timestamp: new Date()
        };
        this.startTime = Date.now();
    }

    /**
     * Add W3C validation issues
     */
    addW3CIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'W3C' as const })));
    }

    /**
     * Add SDTM validation issues
     */
    addSDTMIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'SDTM' as const })));
    }

    /**
     * Add ADaM validation issues
     */
    addADaMIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'ADaM' as const })));
    }

    /**
     * Add CORE rules violations
     */
    addCOREIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'CORE' as const })));
    }

    /**
     * Add version compatibility issues
     */
    addVersionIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'Version' as const })));
    }

    /**
     * Add type system issues
     */
    addTypeIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'Type' as const })));
    }

    /**
     * Add semantic validation issues
     */
    addSemanticIssues(issues: ValidationIssue[]): void {
        this.issues.push(...issues.map(issue => ({ ...issue, source: 'Semantic' as const })));
    }

    /**
     * Set standards versions used for validation
     */
    setVersions(versions: ValidationMetadata['versions']): void {
        this.metadata.versions = versions;
    }

    /**
     * Generate the complete validation report
     */
    generateReport(options: ReportOptions = {}): ValidationReport {
        const {
            includeWarnings = true,
            includeInfo = true,
            sortBySeverity = true,
            maxIssues = 0
        } = options;

        // Filter issues based on options
        let filteredIssues = this.filterIssues(this.issues, includeWarnings, includeInfo);

        // Sort issues if requested
        if (sortBySeverity) {
            filteredIssues = this.sortIssuesBySeverity(filteredIssues);
        }

        // Limit number of issues if requested
        if (maxIssues > 0 && filteredIssues.length > maxIssues) {
            filteredIssues = filteredIssues.slice(0, maxIssues);
        }

        // Calculate duration
        const duration = this.startTime ? Date.now() - this.startTime : undefined;

        // Build complete metadata
        const metadata: ValidationMetadata = {
            timestamp: this.metadata.timestamp || new Date(),
            target: this.metadata.target || 'unknown',
            versions: this.metadata.versions || {},
            duration
        };

        // Generate summary
        const summary = this.generateSummary(filteredIssues);

        // Group results by source
        const results = this.groupResultsBySource(filteredIssues);

        return {
            metadata,
            summary,
            results,
            allIssues: filteredIssues
        };
    }

    /**
     * Filter issues based on severity preferences
     */
    private filterIssues(
        issues: ValidationIssue[],
        includeWarnings: boolean,
        includeInfo: boolean
    ): ValidationIssue[] {
        return issues.filter(issue => {
            if (issue.severity === DiagnosticSeverity.Error) {
                return true;
            }
            if (issue.severity === DiagnosticSeverity.Warning) {
                return includeWarnings;
            }
            return includeInfo;
        });
    }

    /**
     * Sort issues by severity (errors first, then warnings, etc.)
     */
    private sortIssuesBySeverity(issues: ValidationIssue[]): ValidationIssue[] {
        return [...issues].sort((a, b) => {
            // Lower severity value = higher priority (Error=1, Warning=2, etc.)
            if (a.severity !== b.severity) {
                const severityOrder = this.getSeverityOrder(a.severity) - this.getSeverityOrder(b.severity);
                if (severityOrder !== 0) return severityOrder;
            }
            // Secondary sort by source
            if (a.source !== b.source) {
                return a.source.localeCompare(b.source);
            }
            // Tertiary sort by code
            return a.code.localeCompare(b.code);
        });
    }

    /**
     * Get numeric order for severity (lower = more severe)
     */
    private getSeverityOrder(severity: DiagnosticSeverity): number {
        switch (severity) {
            case DiagnosticSeverity.Error: return 1;
            case DiagnosticSeverity.Warning: return 2;
            case DiagnosticSeverity.Hint: return 3;
            default: return 4;
        }
    }

    /**
     * Generate summary statistics
     */
    private generateSummary(issues: ValidationIssue[]): ValidationSummary {
        const errors = issues.filter(i => i.severity === DiagnosticSeverity.Error).length;
        const warnings = issues.filter(i => i.severity === DiagnosticSeverity.Warning).length;
        const info = 0; // Reserved for future use
        const hints = issues.filter(i => i.severity === DiagnosticSeverity.Hint).length;

        let status: 'pass' | 'pass-with-warnings' | 'fail';
        if (errors > 0) {
            status = 'fail';
        } else if (warnings > 0) {
            status = 'pass-with-warnings';
        } else {
            status = 'pass';
        }

        return {
            totalIssues: issues.length,
            errors,
            warnings,
            info,
            hints,
            status
        };
    }

    /**
     * Group results by validation source
     */
    private groupResultsBySource(issues: ValidationIssue[]): ValidationResults {
        return {
            w3c: issues.filter(i => i.source === 'W3C'),
            sdtm: issues.filter(i => i.source === 'SDTM'),
            adam: issues.filter(i => i.source === 'ADaM'),
            core: issues.filter(i => i.source === 'CORE'),
            version: issues.filter(i => i.source === 'Version'),
            type: issues.filter(i => i.source === 'Type'),
            semantic: issues.filter(i => i.source === 'Semantic')
        };
    }

    /**
     * Get issues for a specific element (cube, slice, etc.)
     */
    getIssuesForElement(elementName: string): ValidationIssue[] {
        return this.issues.filter(issue => issue.element === elementName);
    }

    /**
     * Get issues by severity
     */
    getIssuesBySeverity(severity: DiagnosticSeverity): ValidationIssue[] {
        return this.issues.filter(issue => issue.severity === severity);
    }

    /**
     * Get issues by source
     */
    getIssuesBySource(source: ValidationIssue['source']): ValidationIssue[] {
        return this.issues.filter(issue => issue.source === source);
    }

    /**
     * Check if validation passed (no errors)
     */
    hasErrors(): boolean {
        return this.issues.some(issue => issue.severity === DiagnosticSeverity.Error);
    }

    /**
     * Check if validation has warnings
     */
    hasWarnings(): boolean {
        return this.issues.some(issue => issue.severity === DiagnosticSeverity.Warning);
    }

    /**
     * Get total issue count
     */
    getTotalIssues(): number {
        return this.issues.length;
    }

    /**
     * Reset the generator for a new validation run
     */
    reset(): void {
        this.issues = [];
        this.metadata = {};
        this.startTime = undefined;
    }
}
