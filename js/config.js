// config.js

// Global variables for speech recognition and WebSocket connection.
let recognition = null;
let ws = null;

document.addEventListener("DOMContentLoaded", function () {
  // Get references to form elements.
  const configForm = document.getElementById("configForm");
  const languageSelect = document.getElementById("language");
  const translationSelect = document.getElementById("translation");
  const roomInput = document.getElementById("roomId");
  const toggleMicButton = document.getElementById("toggleMic");

  // Process the configuration form submission.
  configForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Read the selected configuration values.
    const language = languageSelect.value;
    const translation = translationSelect.value;
    let room = roomInput.value.trim();

    // Generate a random room ID if none was provided.
    if (!room) {
      room = generateRoomId(12);
    }

    // Build the URL for the captions overlay page.
    let url = `captions.html?room=${encodeURIComponent(room)}&lang=${encodeURIComponent(language)}`;
    if (translation) {
      url += `&translation=${encodeURIComponent(translation)}`;
    }

    // Open the captions overlay page in a new tab.
    window.open(url, '_blank');

    // Display a clickable link to the captions room below the form.
    let linkContainer = document.getElementById('captionLinkContainer');
    if (!linkContainer) {
      linkContainer = document.createElement('div');
      linkContainer.id = 'captionLinkContainer';
      configForm.insertAdjacentElement('afterend', linkContainer);
    }
    linkContainer.innerHTML = `Captions room is open here: <a href="${url}" target="_blank">${url}</a>`;

    // Initialize WebSocket connection if not already connected.
    if (!ws) {
      ws = new WebSocket("ws://35.228.43.65:8080");
      ws.onopen = function () {
        const joinMessage = { type: "join", room: room };
        ws.send(JSON.stringify(joinMessage));
      };
      ws.onerror = function (err) {
        console.error("WebSocket error:", err);
      };
    }
  });

  // Microphone toggle button: enable or disable the microphone.
  toggleMicButton.addEventListener("click", function () {
    if (recognition) {
      // If recognition is running, stop it.
      recognition.stop();
      recognition = null;
      toggleMicButton.textContent = "Enable Microphone";
    } else {
      // Check for SpeechRecognition support.
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      // Create and configure a new SpeechRecognition instance.
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageSelect.value; // Use the currently selected language.

      recognition.onresult = function (event) {
        // Process each result and send it via WebSocket.
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const message = {
            type: "transcription",
            content: transcript,
            interim: !event.results[i].isFinal, // true if interim, false if final.
            timestamp: Date.now()
          };
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
          }
        }
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onend = function () {
        // Update button text if recognition ends unexpectedly.
        toggleMicButton.textContent = "Enable Microphone";
        recognition = null;
      };

      // Start speech recognition; this should trigger a microphone permission prompt.
      recognition.start();
      toggleMicButton.textContent = "Disable Microphone";
    }
  });

  // Twitch bot invite button (placeholder functionality).
  const botButton = document.getElementById("botButton");
  if (botButton) {
    botButton.addEventListener("click", function (event) {
      event.preventDefault();
      alert("To invite Jabberer to your Twitch channel, please add it as a bot in your Twitch chat.");
    });
  }
});

/**
 * Generates a random alphanumeric string of the given length.
 * @param {number} length - Desired length of the generated string.
 * @returns {string} The generated random string.
 */
function generateRoomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
