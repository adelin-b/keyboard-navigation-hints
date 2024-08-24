// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "keyboard-navigation-hints" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "keyboard-navigation-hints.enable",
    () => {
      // Get the extension path from the context
      const extensionPath = context.extensionPath;
      const hintsFilePath = path.join(extensionPath, "dist", "vscode-hints.js");

      // Update the configuration
      const config = vscode.workspace.getConfiguration();
      const currentImports = (config.get("apc.imports") as string[]) || [];
      const newImport = `file://${hintsFilePath}`;

      if (!currentImports.includes(newImport)) {
        currentImports.push(newImport);
        config
          .update(
            "apc.imports",
            currentImports,
            vscode.ConfigurationTarget.Global
          )
          .then(
            () => {
              vscode.window.showInformationMessage(
                "Keyboard Navigation Hints enabled successfully."
              );
            },
            (error) => {
              vscode.window.showErrorMessage(
                `Failed to enable Keyboard Navigation Hints: ${error}`
              );
            }
          );
      } else {
        vscode.window.showInformationMessage(
          "Keyboard Navigation Hints are already enabled."
        );
      }
    }
  );

  context.subscriptions.push(disposable);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  //   const disposable = vscode.commands.registerCommand(
  //     "keyboard-navigation-hints.helloWorld",
  //     () => {
  //       // The code you place here will be executed every time your command is executed
  //       // Display a message box to the user
  //       vscode.window.showInformationMessage(
  //         "Hello World from keyboard-navigation-hints!"
  //       );
  //     }
  //   );

  //   context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
