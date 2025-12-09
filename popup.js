const timerEl = document.getElementById("timer");
const limitInput = document.getElementById("limitInput");

function getTodayKey() {
  return `usage_${new Date().toISOString().split("T")[0]}`;
}

function formatTime(seconds) {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${seconds < 0 ? "-" : ""}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateUI() {
  chrome.storage.local.get(["dailyLimit", getTodayKey()], (data) => {
    const watched = data[getTodayKey()] || 0;
    const limit = (data.dailyLimit || 60) * 60;

    const remaining = limit - watched;
    timerEl.textContent = formatTime(remaining);

    const usedPercent = watched / limit;

    timerEl.className =
      remaining < 0       ? "red" :
      usedPercent >= 0.75 ? "yellow" :
      usedPercent >= 0.5  ? "green" :
                            "blue";
  });
}

limitInput.addEventListener("change", () => {
  chrome.storage.local.set({ dailyLimit: Number(limitInput.value) });
});

chrome.storage.local.get(["dailyLimit"], (data) => {
  limitInput.value = data.dailyLimit || 60;
});

setInterval(updateUI, 1000);
updateUI();
