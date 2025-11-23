#!/usr/bin/env node

/**
 * Test script to validate that all example .tsk files parse without errors
 */

import { createDefaultModule, createDefaultSharedModule } from 'langium/lsp';
import { Module } from 'langium';
import { ThunderstruckGeneratedModule, ThunderstruckGeneratedSharedModule } from '../lib/generated/module.js';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

// Create services
function createServices() {
    const shared = Module.merge(
        createDefaultSharedModule({}),
        ThunderstruckGeneratedSharedModule
    );
    const thunderstruck = Module.merge(
        createDefaultModule({ shared }),
        ThunderstruckGeneratedModule
    );
    shared.ServiceRegistry.register(thunderstruck);
    return { shared, thunderstruck };
}

const services = createServices().thunderstruck;

async function parseFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const document = services.shared.workspace.LangiumDocumentFactory.fromString(
            content,
            filePath
        );

        await services.shared.workspace.DocumentBuilder.build([document]);

        const errors = document.parseResult.parserErrors;
        const lexerErrors = document.parseResult.lexerErrors;

        return {
            file: relative(rootDir, filePath),
            success: errors.length === 0 && lexerErrors.length === 0,
            errors: errors,
            lexerErrors: lexerErrors
        };
    } catch (error) {
        return {
            file: relative(rootDir, filePath),
            success: false,
            errors: [{ message: error.message }],
            lexerErrors: []
        };
    }
}

async function main() {
    console.log('Testing Thunderstruck example files...\n');

    // Find all .tsk files in examples directory
    const examplesDir = join(rootDir, 'examples');
    const files = await glob(`${examplesDir}/*.tsk`);

    if (files.length === 0) {
        console.log('No example files found in', examplesDir);
        process.exit(1);
    }

    console.log(`Found ${files.length} example files\n`);

    const results = await Promise.all(files.map(parseFile));

    // Print results
    let totalErrors = 0;
    for (const result of results) {
        const status = result.success ? '✓' : '✗';
        console.log(`${status} ${result.file}`);

        if (!result.success) {
            totalErrors++;

            if (result.lexerErrors.length > 0) {
                console.log('  Lexer Errors:');
                result.lexerErrors.forEach(err => {
                    console.log(`    - ${err.message}`);
                });
            }

            if (result.errors.length > 0) {
                console.log('  Parser Errors:');
                result.errors.forEach(err => {
                    console.log(`    - ${err.message}`);
                });
            }
            console.log('');
        }
    }

    console.log(`\nResults: ${results.length - totalErrors}/${results.length} files parsed successfully`);

    if (totalErrors > 0) {
        console.log(`\n${totalErrors} file(s) failed to parse`);
        process.exit(1);
    } else {
        console.log('\n✓ All example files parsed successfully!');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Error running tests:', err);
    process.exit(1);
});
