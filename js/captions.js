// captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (!room) {
    console.error("No room specified in URL parameters.");
    return;
  }

  // Reference to the caption element
  const captionLine = document.getElementById('captionLine');
  // Initially, captionLine should already say "Waiting for transcription."
  
  // Connect to the WebSocket server
  const ws = new WebSocket("https://8b49-85-76-43-64.ngrok-free.app");

  ws.onopen = function () {
    console.log("Connected to WebSocket server on captions page.");
    // Join the specific room by sending a join message
    const joinMessage = {
      type: "join",
      room: room
    };
    ws.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = function (event) {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        // Update the caption text with the new transcription.
        // This simple version just replaces the text with the latest transcription.
        // You can enhance it to merge multiple chunks if needed.
        captionLine.textContent = data.content;
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
});
