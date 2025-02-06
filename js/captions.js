// captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  console.log("Room in captions.js:", room);
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
    console.log("Received message:", event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        // Update the caption text with the new transcription.
        captionLine.textContent = data.content;
      } else {
        console.warn("Unhandled message type:", data.type);
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
