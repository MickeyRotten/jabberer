// captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Parse URL parameters to get the room ID (and optionally language, if needed)
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (!room) {
    console.error("No room specified in URL parameters.");
    return;
  }

  // Get the caption display element
  const captionLine = document.getElementById('captionLine');
  if (!captionLine) {
    console.error("No element found with id 'captionLine'.");
    return;
  }
  // Initialize with a default message
  captionLine.textContent = "Waiting for transcription.";

  // State variables for caption buffering
  let finalLines = []; // Array of finalized caption lines (max 3)
  let activeLine = ""; // Current interim result
  let silenceTimeout = null; // Timer to clear activeLine after silence

  // Update the caption display by combining finalized lines and the active line.
  function updateCaptionDisplay() {
    // Join the finalized lines with newline separators and add the active line (if any)
    const displayText = finalLines.join("\n") + (activeLine ? "\n" + activeLine : "");
    captionLine.textContent = displayText;
  }

  // Reset the silence timer. If no transcription comes in within 3 seconds, clear the active line.
  function resetSilenceTimer() {
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
    }
    silenceTimeout = setTimeout(() => {
      activeLine = "";
      updateCaptionDisplay();
    }, 3000);
  }

  // Handle a new transcription message
  function handleTranscription(data) {
    // Reset the silence timer on every incoming message.
    resetSilenceTimer();

    if (data.interim) {
      // For interim results, update the active line.
      activeLine = data.content.trim();
    } else {
      // For final results, update the active line and then finalize it.
      activeLine = data.content.trim();
      if (activeLine) {
        finalLines.push(activeLine);
        // Cap the number of final lines to 3.
        if (finalLines.length > 3) {
          finalLines.shift();
        }
      }
      // Clear the active line after finalizing.
      activeLine = "";
    }
    updateCaptionDisplay();
  }

  // Connect to the WebSocket server using your ngrok secure URL.
  const ws = new WebSocket("wss://ceb7-85-76-43-64.ngrok-free.app");

  ws.onopen = function () {
    console.log("Connected to WebSocket server on captions page.");
    // Join the specified room.
    const joinMessage = { type: "join", room: room };
    ws.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = function (event) {
    console.log("Received message:", event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        handleTranscription(data);
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
