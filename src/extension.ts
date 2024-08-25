import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
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
}

// This method is called when your extension is deactivated
export function deactivate() {}
