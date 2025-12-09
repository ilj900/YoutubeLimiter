let isWatching = false;

function checkWatching() {
  const video = document.querySelector("video");

  const watching =
    document.visibilityState === "visible" &&
    video &&
    !video.paused &&
    !video.ended;

  if (watching !== isWatching) {
    isWatching = watching;
    chrome.runtime.sendMessage({
		type: "WATCHING_STATUS",
		watching
	});
  }
}

setInterval(checkWatching, 1000);
