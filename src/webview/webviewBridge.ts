import * as vscode from 'vscode';
import * as crypto from 'crypto';

export function getNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

export function getWebviewUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathSegments: string[],
): vscode.Uri {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathSegments));
}

export function getWebviewOptions(
  extensionUri: vscode.Uri,
): vscode.WebviewOptions {
  return {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
  };
}
