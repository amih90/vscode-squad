import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { squadRegistry } from '../core/squadRegistry';

const TEAM_TEMPLATE = `# Squad Team

## Project Context
- **Project:** (your project name)
- **Stack:** (your tech stack)
- **Lead:** (your name)

## Members

| Name | Role | Charter | Badge |
|------|------|---------|-------|
`;

export async function handleCreateSquad(): Promise<void> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    vscode.window.showWarningMessage('No workspace folder open');
    return;
  }

  let targetFolder: vscode.WorkspaceFolder;
  if (folders.length === 1) {
    targetFolder = folders[0];
  } else {
    const picked = await vscode.window.showWorkspaceFolderPick({
      placeHolder: 'Select workspace folder for the new squad',
    });
    if (!picked) {
      return;
    }
    targetFolder = picked;
  }

  const squadDir = path.join(targetFolder.uri.fsPath, '.squad');
  if (fs.existsSync(squadDir)) {
    vscode.window.showWarningMessage('A .squad directory already exists in this folder');
    return;
  }

  fs.mkdirSync(squadDir, { recursive: true });
  fs.writeFileSync(path.join(squadDir, 'team.md'), TEAM_TEMPLATE, 'utf-8');
  fs.mkdirSync(path.join(squadDir, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(squadDir, 'decisions'), { recursive: true });
  fs.writeFileSync(path.join(squadDir, 'decisions.md'), '# Decisions\n', 'utf-8');

  await squadRegistry.registerSquad(targetFolder.uri.fsPath);
  vscode.window.showInformationMessage(`Squad: Created .squad in ${targetFolder.name}`);
}
