let timerInterval = null;
let isWatching = false;

const watchingTabs = new Set();

function getTodayKey() {
  const today = new Date().toISOString().split("T")[0];
  return `usage_${today}`;
}

function startTimer() {
  if (timerInterval) return;
  
  timerInterval = setInterval(() => {
  const key = getTodayKey();

  chrome.storage.local.get([key], (data) => {
    const current = data[key] || 0;
    chrome.storage.local.set({ [key]: current + 1 }, updateBadge);
  });
}, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function setBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

function updateBadge() {
  const todayKey = getTodayKey();

  chrome.storage.local.get([todayKey, "dailyLimit"], (data) => {
    const watched = data[todayKey] || 0;
    const limit = (data.dailyLimit || 60) * 60;

    const remaining = limit - watched;
    const percentRemaining = Math.round((remaining / limit) * 100);

    let color;

    const usedRatio = watched / limit;

    if (remaining < 0) {
      color = "#f44336"; // red
    } else if (usedRatio >= 0.75) {
      color = "#ff9800"; // yellow
    } else if (usedRatio >= 0.5) {
      color = "#4caf50"; // green
    } else {
      color = "#2196f3"; // blue
    }

    const text =
      remaining < 0 ? `${percentRemaining}%` : `${Math.max(percentRemaining, 0)}%`;

    setBadge(text, color);
  });
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== "WATCHING_STATUS") return;

  const tabId = sender.tab?.id;
  if (!tabId) return;

  if (msg.watching) {
    watchingTabs.add(tabId);
  } else {
    watchingTabs.delete(tabId);
  }

  if (watchingTabs.size > 0) {
    startTimer();
  } else {
    stopTimer();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  watchingTabs.delete(tabId);

  if (watchingTabs.size === 0) {
    stopTimer();
  }
});

updateBadge();
