import * as vscode from 'vscode';
import { DashboardPanel } from '../webview/dashboardPanel';

export async function handleOpenDashboard(context: vscode.ExtensionContext): Promise<void> {
  DashboardPanel.createOrShow(context.extensionUri);
}
