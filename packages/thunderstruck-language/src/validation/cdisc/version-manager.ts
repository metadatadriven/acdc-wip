/**
 * Version Manager for CDISC and W3C Standards
 *
 * Manages standards version declarations and compatibility checking.
 * Provides default versions when not explicitly declared.
 */

import { Program, StandardsDeclaration, isStandardsDeclaration } from '../../generated/ast.js';
import { DiagnosticSeverity } from '../../types/type-checker.js';

/**
 * Supported standards and their versions
 */
export interface StandardsVersions {
    SDTM?: string;
    ADaM?: string;
    CDISC_CT?: string;
    W3C_Cube?: string;
}

export type StandardName = keyof StandardsVersions;

/**
 * Validation diagnostic for version issues
 */
export interface VersionDiagnostic {
    severity: DiagnosticSeverity;
    message: string;
    code: string;
    suggestion?: string;
}

/**
 * Version Manager
 *
 * Loads and manages standards versions from program declarations.
 * Provides version compatibility checking and default version handling.
 */
export class VersionManager {
    private declaredVersions: StandardsVersions = {};

    // Default versions when not specified
    private readonly defaultVersions: StandardsVersions = {
        SDTM: '3.4',
        ADaM: '1.2',
        CDISC_CT: '2024-09-27',
        W3C_Cube: '2014-01-16'
    };

    // Known compatible version pairs
    private readonly compatibilityMatrix: Record<string, string[]> = {
        // SDTM version -> compatible ADaM versions
        '3.4': ['1.2', '1.3'],
        '3.3': ['1.1', '1.2'],
        '3.2': ['1.0', '1.1']
    };

    // Supported versions for each standard
    private readonly supportedVersions: Record<StandardName, string[]> = {
        SDTM: ['3.2', '3.3', '3.4'],
        ADaM: ['1.0', '1.1', '1.2', '1.3'],
        CDISC_CT: ['2024-09-27', '2024-06-28', '2024-03-29'],
        W3C_Cube: ['2014-01-16']
    };

    /**
     * Load standards versions from program
     */
    loadFromProgram(program: Program): void {
        this.declaredVersions = {};

        for (const element of program.elements) {
            if (isStandardsDeclaration(element)) {
                this.loadFromDeclaration(element);
            }
        }
    }

    /**
     * Load versions from a standards declaration
     */
    private loadFromDeclaration(declaration: StandardsDeclaration): void {
        for (const stdVersion of declaration.standards) {
            const standard = stdVersion.standard;
            const version = stdVersion.version;

            // Validate that the standard is recognized
            if (this.isValidStandardName(standard)) {
                this.declaredVersions[standard as StandardName] = version;
            }
            // Invalid standard names will be caught in validation
        }
    }

    /**
     * Check if a string is a valid standard name
     */
    private isValidStandardName(name: string): name is StandardName {
        return name === 'SDTM' || name === 'ADaM' || name === 'CDISC_CT' || name === 'W3C_Cube';
    }

    /**
     * Get version for a standard (returns declared or default)
     */
    getVersion(standard: StandardName): string {
        return this.declaredVersions[standard] || this.defaultVersions[standard] || 'unknown';
    }

    /**
     * Get all declared versions (excludes defaults)
     */
    getDeclaredVersions(): StandardsVersions {
        return { ...this.declaredVersions };
    }

    /**
     * Get all effective versions (includes defaults for undeclared standards)
     */
    getEffectiveVersions(): StandardsVersions {
        return {
            SDTM: this.getVersion('SDTM'),
            ADaM: this.getVersion('ADaM'),
            CDISC_CT: this.getVersion('CDISC_CT'),
            W3C_Cube: this.getVersion('W3C_Cube')
        };
    }

    /**
     * Check if a version is declared (not just using default)
     */
    isDeclared(standard: StandardName): boolean {
        return standard in this.declaredVersions;
    }

    /**
     * Validate version declarations and compatibility
     *
     * @param program Optional program to check for invalid standard names
     */
    validateVersions(program?: Program): VersionDiagnostic[] {
        const diagnostics: VersionDiagnostic[] = [];

        // Check for invalid standard names in declarations
        if (program) {
            for (const element of program.elements) {
                if (isStandardsDeclaration(element)) {
                    for (const stdVersion of element.standards) {
                        if (!this.isValidStandardName(stdVersion.standard)) {
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                message: `Unknown standard '${stdVersion.standard}'. Valid standards are: SDTM, ADaM, CDISC_CT, W3C_Cube`,
                                code: 'VERSION-INVALID-STANDARD',
                                suggestion: 'Use one of: SDTM, ADaM, CDISC_CT, W3C_Cube'
                            });
                        }
                    }
                }
            }
        }

        // Check if declared versions are supported
        for (const [standard, version] of Object.entries(this.declaredVersions)) {
            const stdName = standard as StandardName;
            const supported = this.supportedVersions[stdName];

            if (supported && !supported.includes(version)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `${standard} version '${version}' is not officially supported. Supported versions: ${supported.join(', ')}`,
                    code: 'VERSION-UNSUPPORTED',
                    suggestion: `Use one of: ${supported.join(', ')}`
                });
            }
        }

        // Check SDTM/ADaM compatibility
        diagnostics.push(...this.validateSDTMADaMCompatibility());

        return diagnostics;
    }

    /**
     * Validate SDTM and ADaM version compatibility
     */
    private validateSDTMADaMCompatibility(): VersionDiagnostic[] {
        const diagnostics: VersionDiagnostic[] = [];

        const sdtmVersion = this.getVersion('SDTM');
        const adamVersion = this.getVersion('ADaM');

        // Only check if both are declared (not defaults)
        if (this.isDeclared('SDTM') && this.isDeclared('ADaM')) {
            if (!this.isVersionCompatible(sdtmVersion, adamVersion)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    message: `SDTM ${sdtmVersion} and ADaM ${adamVersion} may have compatibility issues. Recommended ADaM versions for SDTM ${sdtmVersion}: ${this.getCompatibleADaMVersions(sdtmVersion).join(', ')}`,
                    code: 'VERSION-COMPATIBILITY',
                    suggestion: `Use ADaM version ${this.getCompatibleADaMVersions(sdtmVersion)[0] || adamVersion}`
                });
            }
        }

        return diagnostics;
    }

    /**
     * Check if SDTM and ADaM versions are compatible
     */
    private isVersionCompatible(sdtmVersion: string, adamVersion: string): boolean {
        const compatible = this.compatibilityMatrix[sdtmVersion];
        return compatible ? compatible.includes(adamVersion) : true; // Default to compatible if not in matrix
    }

    /**
     * Get compatible ADaM versions for an SDTM version
     */
    private getCompatibleADaMVersions(sdtmVersion: string): string[] {
        return this.compatibilityMatrix[sdtmVersion] || [];
    }

    /**
     * Check if a specific version is supported for a standard
     */
    isVersionSupported(standard: StandardName, version: string): boolean {
        const supported = this.supportedVersions[standard];
        return supported ? supported.includes(version) : false;
    }

    /**
     * Get all supported versions for a standard
     */
    getSupportedVersions(standard: StandardName): string[] {
        return this.supportedVersions[standard] || [];
    }

    /**
     * Reset to defaults (useful for testing)
     */
    reset(): void {
        this.declaredVersions = {};
    }
}
