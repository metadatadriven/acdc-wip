"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const node_1 = require("vscode-languageclient/node");
let client;
let statusBarItem;
/**
 * Extension activation function
 * Called when the extension is activated (when a .tsk file is opened)
 */
function activate(context) {
    console.log('Thunderstruck extension is now active');
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(pulse) Thunderstruck';
    statusBarItem.tooltip = 'Thunderstruck Language Server';
    context.subscriptions.push(statusBarItem);
    // Register a simple command for testing
    const helloCommand = vscode.commands.registerCommand('thunderstruck.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Thunderstruck!');
    });
    context.subscriptions.push(helloCommand);
    // Start the Language Server
    client = startLanguageClient(context);
}
/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
function deactivate() {
    console.log('Thunderstruck extension is now deactivated');
    if (client) {
        return client.stop();
    }
    return undefined;
}
/**
 * Start the Language Server Protocol client
 */
function startLanguageClient(context) {
    // The server is implemented in the thunderstruck-language package
    const serverModule = context.asAbsolutePath(path.join('..', 'thunderstruck-language', 'lib', 'main.js'));
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--inspect=6009'],
            },
        },
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for Thunderstruck documents
        documentSelector: [
            { scheme: 'file', language: 'thunderstruck' },
        ],
        synchronize: {
            // Notify the server about file changes to '.tsk' files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/*.tsk'),
        },
    };
    // Create the language client and start the client
    const client = new node_1.LanguageClient('thunderstruckLanguageServer', 'Thunderstruck Language Server', serverOptions, clientOptions);
    // Listen to state changes
    client.onDidChangeState((event) => {
        updateStatusBar(event.newState);
    });
    // Start the client. This will also launch the server
    client.start().then(() => {
        console.log('Thunderstruck Language Server started');
        updateStatusBar(node_1.State.Running);
        statusBarItem.show();
    }).catch((error) => {
        console.error('Failed to start Thunderstruck Language Server:', error);
        statusBarItem.text = '$(error) Thunderstruck';
        statusBarItem.tooltip = `Language Server Error: ${error.message}`;
        statusBarItem.show();
    });
    return client;
}
/**
 * Update the status bar based on the language server state
 */
function updateStatusBar(state) {
    switch (state) {
        case node_1.State.Running:
            statusBarItem.text = '$(check) Thunderstruck';
            statusBarItem.tooltip = 'Thunderstruck Language Server: Running';
            statusBarItem.backgroundColor = undefined;
            break;
        case node_1.State.Starting:
            statusBarItem.text = '$(sync~spin) Thunderstruck';
            statusBarItem.tooltip = 'Thunderstruck Language Server: Starting...';
            statusBarItem.backgroundColor = undefined;
            break;
        case node_1.State.Stopped:
            statusBarItem.text = '$(circle-slash) Thunderstruck';
            statusBarItem.tooltip = 'Thunderstruck Language Server: Stopped';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            break;
    }
}
//# sourceMappingURL=extension.js.map