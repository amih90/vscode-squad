"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOpenDashboard = handleOpenDashboard;
const dashboardPanel_1 = require("../webview/dashboardPanel");
async function handleOpenDashboard(context) {
    dashboardPanel_1.DashboardPanel.createOrShow(context.extensionUri);
}
//# sourceMappingURL=openDashboard.js.map