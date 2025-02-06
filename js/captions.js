// captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Parse URL parameters to get the room
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (!room) {
    console.error("No room specified in URL parameters.");
    return;
  }

  const captionBox = document.getElementById('captionBox');
  // We'll store finalized lines in this array
  const finalLines = [];
  const maxLines = 3;

  // Connect to the secure WebSocket endpoint (using ngrok or your WSS endpoint)
  const ws = new WebSocket("wss://YOUR_NGROK_URL_OR_WSS_DOMAIN");

  ws.onopen = function () {
    console.log("Connected to WebSocket server on captions page.");
    // Send join message with the room ID
    const joinMessage = { type: "join", room: room };
    ws.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = function (event) {
    console.log("Received message:", event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        // If it's a final transcription, push it to the array.
        if (!data.interim) {
          // Trim and push the finalized text.
          finalLines.push(data.content.trim());
          // If we have more than allowed lines, remove the oldest.
          if (finalLines.length > maxLines) {
            finalLines.shift();
          }
          // Clear interim text.
          updateCaption("");
        } else {
          // Interim result: show it appended to finalized lines.
          updateCaption(data.content);
        }
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  };

  ws.onerror = function (err) {
    console.error("WebSocket error on captions page:", err);
  };

  ws.onclose = function () {
    console.log("WebSocket connection closed on captions page.");
  };

  /**
   * Updates the caption box display.
   * @param {string} interim - The current interim transcription.
   */
  function updateCaption(interim) {
    // Combine finalized lines with interim text as the last line.
    const displayedText = finalLines.concat(interim ? [interim] : []).join("\n");
    captionBox.textContent = displayedText;
  }
});
