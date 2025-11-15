import * as vscode from 'vscode';

/**
 * Extension activation function
 * Called when the extension is activated (when a .tsk file is opened)
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Thunderstruck extension is now active');

  // Register a simple command for testing
  const disposable = vscode.commands.registerCommand('thunderstruck.helloWorld', () => {
    vscode.window.showInformationMessage('Hello from Thunderstruck!');
  });

  context.subscriptions.push(disposable);

  // TODO: In Increment 2, we will add Language Server Protocol integration here
  // TODO: In Increment 5, we will add advanced LSP features (completion, hover, etc.)
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('Thunderstruck extension is now deactivated');
}
