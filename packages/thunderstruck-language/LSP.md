# Thunderstruck Language Server

This directory contains the Language Server Protocol (LSP) implementation for the Thunderstruck DSL.

## Overview

The Thunderstruck Language Server provides IDE features for `.tsk` files:

- **Syntax Validation**: Real-time parsing and syntax error detection
- **Error Diagnostics**: Clear error messages with source locations
- **Language Services**: Foundation for future features like:
  - Code completion
  - Go to definition
  - Find references
  - Hover information
  - Code formatting

## Architecture

The language server is built using [Langium](https://langium.org/), a framework for building language servers with TypeScript.

### Key Components

1. **main.ts**: Language server entry point
   - Creates LSP connection via stdin/stdout
   - Initializes Thunderstruck services
   - Starts the language server

2. **thunderstruck-module.ts**: Service configuration
   - Creates and configures Langium services
   - Registers custom services and validators
   - Dependency injection setup

3. **thunderstruck-validator.ts**: Validation framework
   - Registers validation rules
   - Provides extensible validation framework
   - Currently includes syntax validation from parser

4. **Generated files** (`src/generated/`):
   - AST types from grammar
   - Parser and lexer
   - Default services

## Starting the Language Server

### From Command Line

```bash
# Build the project first
npm run build

# Start the language server
npm run start:server
```

The server communicates via stdin/stdout using the LSP protocol.

### As a Package Binary

```bash
# After building, the server is available as:
thunderstruck-language-server
```

### From Node.js

```typescript
import { createThunderstruckServices } from 'thunderstruck-language';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';

const connection = createConnection(ProposedFeatures.all);
const { shared } = createThunderstruckServices({ connection, ...NodeFileSystem });
startLanguageServer(shared);
```

## VS Code Integration

The language server is designed to be used with the Thunderstruck VS Code extension. The extension:

1. Starts the language server as a child process
2. Connects to it via LSP
3. Displays diagnostics in the Problems panel
4. Shows error squiggles in the editor

See the `thunderstruck-vscode` package for the extension implementation.

## Testing

The language server includes comprehensive tests:

```bash
# Run all tests
npm test

# Run only LSP tests
npm test -- lsp.test

# Run all tests including examples
npm test
```

### Test Coverage

- **Parser tests** (30 tests): Validate grammar parsing
- **LSP tests** (4 tests): Validate server initialization and services
- **Example tests** (10 tests): Validate all example files parse correctly

## Current Features

### ✅ Implemented

- Syntax validation for all Thunderstruck constructs:
  - Cube definitions
  - Slice definitions
  - Transform definitions
  - Model definitions (with Wilkinson formulas)
  - Aggregate definitions
  - Display definitions
  - Pipeline definitions
  - Concept definitions
- Real-time parsing and error reporting
- LSP protocol communication
- Service registry and dependency injection

### 🚧 Planned (Future Increments)

- Semantic validation:
  - Type checking for expressions
  - Reference resolution validation
  - Undefined variable detection
  - Type compatibility checking
- Code intelligence:
  - Auto-completion
  - Go to definition
  - Find all references
  - Hover documentation
  - Rename refactoring
- Advanced diagnostics:
  - Warnings for best practices
  - Statistical model validation
  - Data flow analysis

## Development

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `lib/` directory.

### Watching for Changes

```bash
npm run watch
```

Automatically rebuilds on file changes.

### Grammar Changes

When modifying the grammar (`src/grammar/thunderstruck.langium`):

```bash
npm run langium:generate
npm run build
```

## Architecture Details

### Service Injection

Langium uses dependency injection for modularity:

```typescript
const shared = inject(
  createDefaultSharedModule(context),
  ThunderstruckGeneratedSharedModule
);

const thunderstruck = inject(
  createDefaultModule({ shared }),
  ThunderstruckGeneratedModule,
  ThunderstruckModule
);
```

### Validation Pipeline

1. **Lexical Analysis**: Text → Tokens
2. **Syntax Parsing**: Tokens → AST
3. **Validation**: AST → Diagnostics
4. **LSP Communication**: Diagnostics → Client

### Extension Points

Add custom services in `ThunderstruckModule`:

```typescript
export const ThunderstruckModule: Module<...> = {
  validation: {
    DocumentValidator: (services) => new CustomValidator(services)
  }
};
```

## Files Structure

```
thunderstruck-language/
├── src/
│   ├── main.ts                      # Server entry point
│   ├── thunderstruck-module.ts      # Service configuration
│   ├── thunderstruck-validator.ts   # Validation rules
│   ├── index.ts                     # Public API exports
│   ├── grammar/
│   │   └── thunderstruck.langium    # Grammar definition
│   ├── generated/                   # Generated by Langium
│   │   ├── ast.ts                   # AST types
│   │   ├── grammar.ts               # Parser
│   │   └── module.ts                # Generated services
│   └── __tests__/
│       ├── parser.test.ts           # Parser tests
│       ├── examples.test.ts         # Example validation
│       └── lsp.test.ts              # LSP service tests
├── lib/                             # Compiled output
├── package.json                     # NPM configuration
└── tsconfig.json                    # TypeScript config
```

## Troubleshooting

### Server Won't Start

1. Ensure all dependencies are installed: `npm install`
2. Build the project: `npm run build`
3. Check for TypeScript errors: `npm run build`

### Tests Failing

1. Regenerate grammar: `npm run langium:generate`
2. Clean and rebuild: `npm run clean && npm run build`
3. Run tests with verbose output: `npm test -- --verbose`

### Validation Not Working

1. Check validator registration in `thunderstruck-module.ts`
2. Verify validator methods are bound correctly
3. Check that `ValidationRegistry` is receiving checks

## Resources

- [Langium Documentation](https://langium.org/docs/)
- [Language Server Protocol Specification](https://microsoft.github.io/language-server-protocol/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Thunderstruck PRD](../../docs/THUNDERSTRUCK_PRD.md)
- [Thunderstruck Plan](../../docs/THUNDERSTRUCK_PLAN.md)
