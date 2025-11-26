/**
 * Validation Report Formatters
 *
 * Formats validation reports in various output formats:
 * - JSON: Structured data for programmatic consumption
 * - Text: Human-readable plain text
 * - Markdown: Formatted documentation-style output
 */

import { DiagnosticSeverity } from '../../types/type-checker.js';
import type { ValidationReport, ValidationIssue } from './validation-report.js';

/**
 * Abstract base formatter
 */
export abstract class ReportFormatter {
    abstract format(report: ValidationReport): string;

    /**
     * Get severity label
     */
    protected getSeverityLabel(severity: DiagnosticSeverity): string {
        switch (severity) {
            case DiagnosticSeverity.Error: return 'ERROR';
            case DiagnosticSeverity.Warning: return 'WARNING';
            case DiagnosticSeverity.Hint: return 'HINT';
            default: return 'UNKNOWN';
        }
    }

    /**
     * Get status emoji/symbol
     */
    protected getStatusSymbol(status: string): string {
        switch (status) {
            case 'pass': return '✓';
            case 'pass-with-warnings': return '⚠';
            case 'fail': return '✗';
            default: return '?';
        }
    }
}

/**
 * JSON Formatter
 *
 * Outputs complete report as JSON for programmatic consumption
 */
export class JSONFormatter extends ReportFormatter {
    format(report: ValidationReport): string {
        return JSON.stringify(report, null, 2);
    }

    /**
     * Format as compact JSON (no whitespace)
     */
    formatCompact(report: ValidationReport): string {
        return JSON.stringify(report);
    }
}

/**
 * Text Formatter
 *
 * Outputs human-readable plain text report
 */
export class TextFormatter extends ReportFormatter {
    format(report: ValidationReport): string {
        const lines: string[] = [];

        // Header
        lines.push('='.repeat(80));
        lines.push('VALIDATION REPORT');
        lines.push('='.repeat(80));
        lines.push('');

        // Metadata
        lines.push(`Target:    ${report.metadata.target}`);
        lines.push(`Timestamp: ${report.metadata.timestamp.toISOString()}`);
        if (report.metadata.duration) {
            lines.push(`Duration:  ${report.metadata.duration}ms`);
        }
        lines.push('');

        // Versions
        if (report.metadata.versions && Object.keys(report.metadata.versions).length > 0) {
            lines.push('Standards Versions:');
            for (const [standard, version] of Object.entries(report.metadata.versions)) {
                lines.push(`  ${standard}: ${version}`);
            }
            lines.push('');
        }

        // Summary
        lines.push('-'.repeat(80));
        lines.push('SUMMARY');
        lines.push('-'.repeat(80));
        lines.push(`Status:   ${this.getStatusSymbol(report.summary.status)} ${report.summary.status.toUpperCase()}`);
        lines.push(`Total:    ${report.summary.totalIssues} issue(s)`);
        lines.push(`Errors:   ${report.summary.errors}`);
        lines.push(`Warnings: ${report.summary.warnings}`);
        if (report.summary.info > 0) {
            lines.push(`Info:     ${report.summary.info}`);
        }
        if (report.summary.hints > 0) {
            lines.push(`Hints:    ${report.summary.hints}`);
        }
        lines.push('');

        // Issues by source
        if (report.allIssues.length > 0) {
            lines.push('-'.repeat(80));
            lines.push('ISSUES');
            lines.push('-'.repeat(80));
            lines.push('');

            const groupedBySeverity = this.groupBySeverity(report.allIssues);

            for (const [severity, issues] of groupedBySeverity) {
                const label = this.getSeverityLabel(severity);
                lines.push(`${label}S (${issues.length}):`);
                lines.push('');

                for (const issue of issues) {
                    lines.push(this.formatIssue(issue));
                    lines.push('');
                }
            }
        } else {
            lines.push('No issues found.');
            lines.push('');
        }

        // Footer
        lines.push('='.repeat(80));

        return lines.join('\n');
    }

    /**
     * Group issues by severity
     */
    private groupBySeverity(issues: ValidationIssue[]): Map<DiagnosticSeverity, ValidationIssue[]> {
        const grouped = new Map<DiagnosticSeverity, ValidationIssue[]>();

        for (const issue of issues) {
            if (!grouped.has(issue.severity)) {
                grouped.set(issue.severity, []);
            }
            grouped.get(issue.severity)!.push(issue);
        }

        return grouped;
    }

    /**
     * Format a single issue
     */
    private formatIssue(issue: ValidationIssue): string {
        const parts: string[] = [];

        // Severity and code
        parts.push(`[${issue.code}] ${issue.message}`);

        // Source and category
        const meta: string[] = [];
        meta.push(`Source: ${issue.source}`);
        if (issue.category) {
            meta.push(`Category: ${issue.category}`);
        }
        if (issue.element) {
            meta.push(`Element: ${issue.element}`);
        }
        if (issue.variable) {
            meta.push(`Variable: ${issue.variable}`);
        }
        parts.push(`  ${meta.join(', ')}`);

        // Location
        if (issue.line !== undefined) {
            const location = issue.column !== undefined
                ? `Line ${issue.line}, Column ${issue.column}`
                : `Line ${issue.line}`;
            parts.push(`  Location: ${location}`);
        }

        // Suggestion
        if (issue.suggestion) {
            parts.push(`  Suggestion: ${issue.suggestion}`);
        }

        return parts.join('\n');
    }
}

/**
 * Markdown Formatter
 *
 * Outputs formatted markdown report suitable for documentation
 */
export class MarkdownFormatter extends ReportFormatter {
    format(report: ValidationReport): string {
        const lines: string[] = [];

        // Header
        lines.push('# Validation Report');
        lines.push('');

        // Metadata
        lines.push('## Metadata');
        lines.push('');
        lines.push(`- **Target:** ${report.metadata.target}`);
        lines.push(`- **Timestamp:** ${report.metadata.timestamp.toISOString()}`);
        if (report.metadata.duration) {
            lines.push(`- **Duration:** ${report.metadata.duration}ms`);
        }
        lines.push('');

        // Versions
        if (report.metadata.versions && Object.keys(report.metadata.versions).length > 0) {
            lines.push('### Standards Versions');
            lines.push('');
            for (const [standard, version] of Object.entries(report.metadata.versions)) {
                lines.push(`- **${standard}:** ${version}`);
            }
            lines.push('');
        }

        // Summary
        lines.push('## Summary');
        lines.push('');
        lines.push(`**Status:** ${this.getStatusSymbol(report.summary.status)} ${report.summary.status.toUpperCase()}`);
        lines.push('');
        lines.push('| Metric | Count |');
        lines.push('|--------|-------|');
        lines.push(`| Total Issues | ${report.summary.totalIssues} |`);
        lines.push(`| Errors | ${report.summary.errors} |`);
        lines.push(`| Warnings | ${report.summary.warnings} |`);
        lines.push(`| Info | ${report.summary.info} |`);
        lines.push(`| Hints | ${report.summary.hints} |`);
        lines.push('');

        // Issues by source
        if (report.allIssues.length > 0) {
            lines.push('## Issues by Source');
            lines.push('');

            for (const [source, issues] of Object.entries(report.results)) {
                if (issues.length > 0) {
                    const sourceLabel = this.formatSourceLabel(source);
                    lines.push(`### ${sourceLabel} (${issues.length})`);
                    lines.push('');

                    for (const issue of issues) {
                        lines.push(this.formatIssueMarkdown(issue));
                        lines.push('');
                    }
                }
            }
        } else {
            lines.push('## Issues');
            lines.push('');
            lines.push('✓ No issues found.');
            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Format source label for markdown
     */
    private formatSourceLabel(source: string): string {
        switch (source) {
            case 'w3c': return 'W3C Data Cube';
            case 'sdtm': return 'SDTM';
            case 'adam': return 'ADaM';
            case 'core': return 'CORE Rules';
            case 'version': return 'Version Compatibility';
            case 'type': return 'Type System';
            case 'semantic': return 'Semantic Validation';
            default: return source.toUpperCase();
        }
    }

    /**
     * Format a single issue in markdown
     */
    private formatIssueMarkdown(issue: ValidationIssue): string {
        const severityBadge = this.getSeverityBadge(issue.severity);
        const parts: string[] = [];

        // Title with code and severity
        parts.push(`**${severityBadge} [${issue.code}]** ${issue.message}`);

        // Details list
        const details: string[] = [];
        if (issue.category) {
            details.push(`Category: ${issue.category}`);
        }
        if (issue.element) {
            details.push(`Element: \`${issue.element}\``);
        }
        if (issue.variable) {
            details.push(`Variable: \`${issue.variable}\``);
        }
        if (issue.line !== undefined) {
            const location = issue.column !== undefined
                ? `Line ${issue.line}, Column ${issue.column}`
                : `Line ${issue.line}`;
            details.push(`Location: ${location}`);
        }

        if (details.length > 0) {
            parts.push(`  - ${details.join(' | ')}`);
        }

        // Suggestion
        if (issue.suggestion) {
            parts.push(`  - **Suggestion:** ${issue.suggestion}`);
        }

        return parts.join('\n');
    }

    /**
     * Get severity badge for markdown
     */
    private getSeverityBadge(severity: DiagnosticSeverity): string {
        switch (severity) {
            case DiagnosticSeverity.Error: return '🔴 ERROR';
            case DiagnosticSeverity.Warning: return '🟡 WARNING';
            case DiagnosticSeverity.Hint: return '💡 HINT';
            default: return '❓ UNKNOWN';
        }
    }
}

/**
 * Formatter factory
 */
export class FormatterFactory {
    private static formatters: Map<string, ReportFormatter> = new Map<string, ReportFormatter>([
        ['json', new JSONFormatter()],
        ['text', new TextFormatter()],
        ['markdown', new MarkdownFormatter()],
        ['md', new MarkdownFormatter()]
    ]);

    /**
     * Get formatter by name
     */
    static getFormatter(format: string): ReportFormatter {
        const formatter = this.formatters.get(format.toLowerCase());
        if (!formatter) {
            throw new Error(`Unknown report format: ${format}. Supported formats: ${Array.from(this.formatters.keys()).join(', ')}`);
        }
        return formatter;
    }

    /**
     * Format report using specified format
     */
    static format(report: ValidationReport, format: string): string {
        const formatter = this.getFormatter(format);
        return formatter.format(report);
    }

    /**
     * Get list of supported formats
     */
    static getSupportedFormats(): string[] {
        return Array.from(this.formatters.keys());
    }
}
