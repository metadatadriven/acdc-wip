import * as path from 'path';
import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  State,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;
let statusBarItem: vscode.StatusBarItem;

/**
 * Extension activation function
 * Called when the extension is activated (when a .tsk file is opened)
 */
export function activate(context: vscode.ExtensionContext) {
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
export function deactivate(): Thenable<void> | undefined {
  console.log('Thunderstruck extension is now deactivated');

  if (client) {
    return client.stop();
  }
  return undefined;
}

/**
 * Start the Language Server Protocol client
 */
function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
  // The server is bundled within the extension
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'main.js')
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.stdio,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.stdio,
      options: {
        execArgv: ['--nolazy', '--inspect=6009'],
      },
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
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
  const client = new LanguageClient(
    'thunderstruckLanguageServer',
    'Thunderstruck Language Server',
    serverOptions,
    clientOptions
  );

  // Listen to state changes
  client.onDidChangeState((event) => {
    updateStatusBar(event.newState);
  });

  // Start the client. This will also launch the server
  client.start().then(() => {
    console.log('Thunderstruck Language Server started');
    updateStatusBar(State.Running);
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
function updateStatusBar(state: State): void {
  switch (state) {
    case State.Running:
      statusBarItem.text = '$(check) Thunderstruck';
      statusBarItem.tooltip = 'Thunderstruck Language Server: Running';
      statusBarItem.backgroundColor = undefined;
      break;
    case State.Starting:
      statusBarItem.text = '$(sync~spin) Thunderstruck';
      statusBarItem.tooltip = 'Thunderstruck Language Server: Starting...';
      statusBarItem.backgroundColor = undefined;
      break;
    case State.Stopped:
      statusBarItem.text = '$(circle-slash) Thunderstruck';
      statusBarItem.tooltip = 'Thunderstruck Language Server: Stopped';
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      break;
  }
}
