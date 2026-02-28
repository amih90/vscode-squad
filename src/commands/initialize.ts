import * as vscode from 'vscode';
import { log } from '../utils/logger';

export async function handleInitialize(context: vscode.ExtensionContext, workspaceRoot: string): Promise<void> {
  log('Command: squad.initialize called');
  vscode.window.showInformationMessage('Squad: Initialize will set up .squad/team.md in this repository');
  // TODO: Implement actual initialization logic
}
