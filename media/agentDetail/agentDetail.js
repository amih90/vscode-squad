'use strict';

(function () {
  var vscode = acquireVsCodeApi();

  var state = {
    agent: null,
    stats: { tasksCompleted: 0, failureRate: 0, avgDuration: 0, linesChanged: 0 },
    activity: [],
    history: '',
    charter: '',
    commandQueue: []
  };

  var loadingEl = null;
  var detailEl = null;
  var headerEl = null;
  var statsRow = null;
  var activityBody = null;
  var historyBody = null;
  var charterBody = null;
  var queueBody = null;

  function init() {
    loadingEl = document.getElementById('loading');
    detailEl = document.getElementById('agent-detail');
    headerEl = document.getElementById('agent-header');
    statsRow = document.getElementById('stats-row');
    activityBody = document.getElementById('activity-body');
    historyBody = document.getElementById('history-body');
    charterBody = document.getElementById('charter-body');
    queueBody = document.getElementById('queue-body');

    vscode.postMessage({ type: 'ready' });
  }

  window.addEventListener('message', function (event) {
    var message = event.data;
    switch (message.type) {
      case 'agent-data':
        handleAgentData(message.data);
        break;
      case 'activity-update':
        handleActivityUpdate(message.entries);
        break;
      case 'command-update':
        handleCommandUpdate(message.item);
        break;
      case 'stats-update':
        handleStatsUpdate(message.stats);
        break;
    }
  });

  function handleAgentData(data) {
    state.agent = data.agent || state.agent;
    state.stats = data.stats || state.stats;
    state.activity = data.activity || state.activity;
    state.history = data.history || state.history;
    state.charter = data.charter || state.charter;
    state.commandQueue = data.commandQueue || state.commandQueue;

    if (loadingEl) { loadingEl.hidden = true; }
    if (detailEl) { detailEl.hidden = false; }

    renderAll();
  }

  function handleActivityUpdate(entries) {
    state.activity = entries;
    renderActivity(state.activity);
  }

  function handleCommandUpdate(item) {
    var idx = state.commandQueue.findIndex(function (q) { return q.id === item.id; });
    if (idx >= 0) {
      state.commandQueue[idx] = item;
    } else {
      state.commandQueue.push(item);
    }
    renderQueue(state.commandQueue);
  }

  function handleStatsUpdate(stats) {
    state.stats = stats;
    renderStatsRow(state.stats);
  }

  function renderAll() {
    renderHeader(state.agent);
    renderStatsRow(state.stats);
    renderActivity(state.activity);
    renderHistory(state.history);
    renderCharter(state.charter);
    renderQueue(state.commandQueue);
  }

  function renderHeader(agent) {
    if (!headerEl || !agent) { return; }
    clearChildren(headerEl);

    var emoji = createElement('div', 'agent-header__emoji');
    emoji.textContent = agent.emoji || '\uD83D\uDC64';

    var info = createElement('div', 'agent-header__info');
    var name = createElement('div', 'agent-header__name');
    name.textContent = agent.name || '';
    var role = createElement('div', 'agent-header__role');
    role.textContent = agent.role || '';
    info.appendChild(name);
    info.appendChild(role);

    var statusLabel = (agent.status || 'unknown').toLowerCase();
    var statusEl = createElement('div', 'agent-header__status agent-header__status--' + statusLabel);
    var dot = createElement('span', 'agent-header__status-dot');
    statusEl.appendChild(dot);
    var statusText = document.createTextNode(statusLabel);
    statusEl.appendChild(statusText);

    headerEl.appendChild(emoji);
    headerEl.appendChild(info);
    headerEl.appendChild(statusEl);
  }

  function renderStatsRow(stats) {
    if (!statsRow) { return; }
    clearChildren(statsRow);

    var items = [
      { label: 'Tasks Completed', value: stats.tasksCompleted || 0 },
      { label: 'Failure Rate', value: (stats.failureRate || 0) + '%' },
      { label: 'Avg Duration', value: (stats.avgDuration || 0) + 's' },
      { label: 'Lines Changed', value: stats.linesChanged || 0 }
    ];

    items.forEach(function (item) {
      var card = createElement('div', 'detail-stat');
      var val = createElement('div', 'detail-stat__value');
      val.textContent = String(item.value);
      var lbl = createElement('div', 'detail-stat__label');
      lbl.textContent = item.label;
      card.appendChild(val);
      card.appendChild(lbl);
      statsRow.appendChild(card);
    });
  }

  function renderActivity(activity) {
    if (!activityBody) { return; }
    clearChildren(activityBody);

    if (!activity || activity.length === 0) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No recent activity';
      activityBody.appendChild(empty);
      return;
    }

    var timeline = createElement('div', 'timeline');
    activity.forEach(function (entry) {
      var row = createElement('div', 'timeline-entry');
      var time = createElement('span', 'timeline-entry__time');
      time.textContent = formatTime(entry.timestamp);
      var content = createElement('span', 'timeline-entry__content');
      content.textContent = entry.message || '';
      row.appendChild(time);
      row.appendChild(content);
      timeline.appendChild(row);
    });
    activityBody.appendChild(timeline);
  }

  function renderHistory(historyText) {
    if (!historyBody) { return; }
    clearChildren(historyBody);

    if (!historyText) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No history available';
      historyBody.appendChild(empty);
      return;
    }

    var viewer = createElement('div', 'content-viewer');
    viewer.textContent = historyText;
    historyBody.appendChild(viewer);
  }

  function renderCharter(charterText) {
    if (!charterBody) { return; }
    clearChildren(charterBody);

    if (!charterText) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No charter available';
      charterBody.appendChild(empty);
      return;
    }

    var viewer = createElement('div', 'content-viewer');
    viewer.textContent = charterText;
    charterBody.appendChild(viewer);
  }

  function renderQueue(queue) {
    if (!queueBody) { return; }
    clearChildren(queueBody);

    if (!queue || queue.length === 0) {
      var empty = createElement('div', 'empty-state');
      empty.textContent = 'No queued commands';
      queueBody.appendChild(empty);
      return;
    }

    queue.forEach(function (item) {
      var row = createElement('div', 'agent-queue-item');
      var label = document.createTextNode(item.command || item.label || '');
      var badge = createElement('span', 'agent-queue-item__badge');
      badge.textContent = (item.status || 'pending').toLowerCase();
      row.appendChild(label);
      row.appendChild(badge);
      queueBody.appendChild(row);
    });
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

  // --- Boot ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
