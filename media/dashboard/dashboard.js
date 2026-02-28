'use strict';

(function () {
  const vscode = acquireVsCodeApi();

  let state = {
    agents: [],
    logs: [],
    commandQueue: [],
    statistics: { totalAgents: 0, activeAgents: 0, totalTasks: 0, healthScore: 0 },
    selectedAgent: null,
    logFilter: { agent: null, level: null }
  };

  // --- DOM references (populated on DOMContentLoaded) ---
  let statsBar = null;
  let agentList = null;
  let logEntries = null;
  let queueList = null;
  let loadingEl = null;
  let dashboardEl = null;

  // --- Initialization ---

  function init() {
    statsBar = document.getElementById('stats-bar');
    agentList = document.getElementById('agent-list');
    logEntries = document.getElementById('log-entries');
    queueList = document.getElementById('queue-list');
    loadingEl = document.getElementById('loading');
    dashboardEl = document.getElementById('dashboard');

    setupFilterListeners();
    vscode.postMessage({ type: 'ready' });
  }

  // --- Message handling ---

  window.addEventListener('message', function (event) {
    var message = event.data;
    switch (message.type) {
      case 'state-update':
        handleStateUpdate(message.data);
        break;
      case 'log-entry':
        handleLogEntry(message.entry);
        break;
      case 'agent-status':
        handleAgentStatus(message.name, message.status);
        break;
      case 'stats-update':
        handleStatsUpdate(message.stats);
        break;
      case 'command-update':
        handleCommandUpdate(message.item);
        break;
      case 'theme-changed':
        handleThemeChanged(message.kind);
        break;
    }
  });

  function handleStateUpdate(data) {
    state.agents = data.agents || state.agents;
    state.logs = data.logs || state.logs;
    state.commandQueue = data.commandQueue || state.commandQueue;
    state.statistics = data.statistics || state.statistics;

    if (loadingEl) {
      loadingEl.hidden = true;
    }
    if (dashboardEl) {
      dashboardEl.hidden = false;
    }

    renderAll();
  }

  function handleLogEntry(entry) {
    state.logs.push(entry);
    if (state.logs.length > 2000) {
      state.logs = state.logs.slice(-1000);
    }
    appendLogEntry(entry);
  }

  function handleAgentStatus(name, status) {
    var agent = state.agents.find(function (a) { return a.name === name; });
    if (agent) {
      agent.status = status;
      renderAgentList(state.agents);
    }
  }

  function handleStatsUpdate(stats) {
    state.statistics = stats;
    renderStats(state.statistics);
  }

  function handleCommandUpdate(item) {
    var idx = state.commandQueue.findIndex(function (q) { return q.id === item.id; });
    if (idx >= 0) {
      state.commandQueue[idx] = item;
    } else {
      state.commandQueue.push(item);
    }
    renderCommandQueue(state.commandQueue);
  }

  function handleThemeChanged(_kind) {
    // Theme CSS variables update automatically; no extra work needed
  }

  // --- Rendering ---

  function renderAll() {
    renderStats(state.statistics);
    renderAgentList(state.agents);
    renderLogViewer(state.logs);
    renderCommandQueue(state.commandQueue);
  }

  function renderStats(stats) {
    if (!statsBar) { return; }
    clearChildren(statsBar);

    var items = [
      { label: 'Total Agents', value: stats.totalAgents || 0, cls: '' },
      { label: 'Active', value: stats.activeAgents || 0, cls: '' },
      { label: 'Tasks', value: stats.totalTasks || 0, cls: '' },
      { label: 'Health Score', value: (stats.healthScore || 0) + '%', cls: 'stat-card--health' }
    ];

    items.forEach(function (item) {
      var card = createElement('div', 'stat-card ' + item.cls);
      var label = createElement('span', 'stat-card__label');
      label.textContent = item.label;
      var value = createElement('span', 'stat-card__value');
      value.textContent = String(item.value);
      card.appendChild(label);
      card.appendChild(value);
      statsBar.appendChild(card);
    });
  }

  function renderAgentList(agents) {
    if (!agentList) { return; }
    clearChildren(agentList);

    if (agents.length === 0) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No agents detected';
      agentList.appendChild(empty);
      return;
    }

    agents.forEach(function (agent) {
      var card = createElement('div', 'agent-card');
      if (state.selectedAgent === agent.name) {
        card.classList.add('agent-card--selected');
      }

      var emoji = createElement('span', 'agent-card__emoji');
      emoji.textContent = agent.emoji || '\uD83D\uDC64';

      var info = createElement('div', 'agent-card__info');
      var name = createElement('div', 'agent-card__name');
      name.textContent = agent.name;
      var role = createElement('div', 'agent-card__role');
      role.textContent = agent.role || '';
      info.appendChild(name);
      info.appendChild(role);

      var statusDot = createElement('span', 'agent-card__status');
      if (agent.status) {
        statusDot.classList.add('agent-card__status--' + agent.status);
      }

      card.appendChild(emoji);
      card.appendChild(info);
      card.appendChild(statusDot);

      card.addEventListener('click', function () {
        selectAgent(agent.name);
      });

      agentList.appendChild(card);
    });
  }

  function renderLogViewer(logs) {
    if (!logEntries) { return; }
    clearChildren(logEntries);

    var filtered = getFilteredLogs(logs);

    if (filtered.length === 0) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No log entries';
      logEntries.appendChild(empty);
      return;
    }

    filtered.forEach(function (entry) {
      logEntries.appendChild(createLogEntryEl(entry));
    });

    logEntries.scrollTop = logEntries.scrollHeight;
  }

  function appendLogEntry(entry) {
    if (!logEntries) { return; }
    if (!matchesFilter(entry)) { return; }

    var emptyMsg = logEntries.querySelector('.empty-state');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    logEntries.appendChild(createLogEntryEl(entry));
    logEntries.scrollTop = logEntries.scrollHeight;
  }

  function createLogEntryEl(entry) {
    var level = (entry.level || 'info').toLowerCase();
    var row = createElement('div', 'log-entry log-entry--' + level);

    var time = createElement('span', 'log-entry__time');
    time.textContent = formatTime(entry.timestamp);

    var agent = createElement('span', 'log-entry__agent');
    agent.textContent = entry.agent || '';

    var msg = createElement('span', 'log-entry__message');
    msg.textContent = entry.message || '';

    row.appendChild(time);
    row.appendChild(agent);
    row.appendChild(msg);
    return row;
  }

  function renderCommandQueue(queue) {
    if (!queueList) { return; }
    clearChildren(queueList);

    if (queue.length === 0) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'Queue is empty';
      queueList.appendChild(empty);
      return;
    }

    queue.forEach(function (item) {
      var el = createElement('div', 'queue-item');

      var header = createElement('div', 'queue-item__header');
      var cmd = createElement('span', 'queue-item__command');
      cmd.textContent = item.command || item.label || '';
      var badge = createElement('span', 'queue-item__badge');
      var statusText = (item.status || 'pending').toLowerCase();
      badge.textContent = statusText;
      if (statusText === 'running' || statusText === 'done' || statusText === 'failed') {
        badge.classList.add('queue-item__badge--' + statusText);
      }
      header.appendChild(cmd);
      header.appendChild(badge);

      var agentLine = createElement('div', 'queue-item__agent');
      agentLine.textContent = item.agent || '';

      el.appendChild(header);
      el.appendChild(agentLine);
      queueList.appendChild(el);
    });
  }

  // --- Filtering ---

  function setupFilterListeners() {
    var agentFilter = document.getElementById('filter-agent');
    var levelFilter = document.getElementById('filter-level');

    if (agentFilter) {
      agentFilter.addEventListener('change', function () {
        state.logFilter.agent = agentFilter.value || null;
        renderLogViewer(state.logs);
      });
    }

    if (levelFilter) {
      levelFilter.addEventListener('change', function () {
        state.logFilter.level = levelFilter.value || null;
        renderLogViewer(state.logs);
      });
    }
  }

  function filterLogs(agent, level) {
    state.logFilter.agent = agent || null;
    state.logFilter.level = level || null;
    renderLogViewer(state.logs);
  }

  function getFilteredLogs(logs) {
    return logs.filter(matchesFilter);
  }

  function matchesFilter(entry) {
    if (state.logFilter.agent && entry.agent !== state.logFilter.agent) {
      return false;
    }
    if (state.logFilter.level && (entry.level || 'info').toLowerCase() !== state.logFilter.level) {
      return false;
    }
    return true;
  }

  function selectAgent(name) {
    state.selectedAgent = state.selectedAgent === name ? null : name;
    state.logFilter.agent = state.selectedAgent;

    renderAgentList(state.agents);
    renderLogViewer(state.logs);

    vscode.postMessage({ type: 'agent-selected', name: state.selectedAgent });
  }

  // --- Utilities ---

  function createElement(tag, className) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    return el;
  }

  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function formatTime(ts) {
    if (!ts) { return ''; }
    var d = new Date(ts);
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  // expose for extension-host scripting if needed
  window.squadDashboard = {
    filterLogs: filterLogs,
    selectAgent: selectAgent
  };

  // --- Boot ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
