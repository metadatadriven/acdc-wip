#!/usr/bin/env node

/**
 * Thunderstruck Language Server
 *
 * This is the main entry point for the Thunderstruck Language Server.
 * It creates and starts a language server that communicates via the
 * Language Server Protocol (LSP).
 */

import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createThunderstruckServices } from './thunderstruck-module.js';

// Create an LSP connection using stdin/stdout
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createThunderstruckServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);
