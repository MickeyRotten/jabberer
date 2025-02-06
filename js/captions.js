// captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Parse URL parameters for room and language.
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (!room) {
    console.error("No room specified in URL parameters.");
    return;
  }

  // Reference to the caption element.
  const captionLine = document.getElementById('captionLine');
  // Start with the default message.
  captionLine.textContent = "Waiting for transcription.";

  // Variables for managing caption content and silence timer.
  let currentWords = []; // array to store words
  const maxWords = 30;   // adjust this number so that it roughly fits three rows
  let silenceTimeout = null;

  // Function to update the caption display.
  function updateCaptionDisplay() {
    // Join the words array into a string.
    captionLine.textContent = currentWords.join(" ");
  }

  // Function to clear the caption after 3 seconds of silence.
  function resetSilenceTimer() {
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
    }
    silenceTimeout = setTimeout(() => {
      currentWords = [];
      updateCaptionDisplay();
    }, 3000); // 3000 ms = 3 seconds
  }

  // Connect to the WebSocket server using your ngrok (or wss) URL.
  const ws = new WebSocket("https://ceb7-85-76-43-64.ngrok-free.app");  // update with your secure URL

  ws.onopen = function () {
    console.log("Connected to WebSocket server on captions page.");
    // Join the specific room.
    const joinMessage = { type: "join", room: room };
    ws.send(JSON.stringify(joinMessage));
  };

  ws.onmessage = function (event) {
    console.log("Received message:", event.data);
    try {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        // Reset the silence timer each time we receive a message.
        resetSilenceTimer();

        // For interim results, update dynamically. For final results, we may finalize the text.
        // Here, we simply take the content provided and split it into words.
        let words = data.content.trim().split(/\s+/);
        
        // If the result is final, append a space to separate from the next interim chunk.
        if (!data.interim) {
          words.push(""); // this adds a space separator
        }

        // Append the new words to our currentWords buffer.
        currentWords = currentWords.concat(words);
        
        // If the buffer exceeds maxWords, remove words from the beginning.
        while (currentWords.length > maxWords) {
          currentWords.shift();
        }
        
        // Update the caption display.
        updateCaptionDisplay();
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
