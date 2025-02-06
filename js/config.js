// config.js

document.addEventListener("DOMContentLoaded", function () {
  // Get form elements from the configuration page
  const configForm = document.getElementById("configForm");
  const languageSelect = document.getElementById("language");
  const translationSelect = document.getElementById("translation");
  const roomInput = document.getElementById("roomId");

  configForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Read form values
    const language = languageSelect.value;
    const translation = translationSelect.value;
    let room = roomInput.value.trim();

    // Generate a random room ID if none was provided
    if (!room) {
      room = generateRoomId(12); // 12-character random string
    }

    // Build the URL for the captions overlay page
    let url = `captions.html?room=${encodeURIComponent(room)}&lang=${encodeURIComponent(language)}`;
    if (translation) {
      url += `&translation=${encodeURIComponent(translation)}`;
    }

    // Open the captions overlay in a new tab
    window.open(url, '_blank');

    // Display a clickable link to the captions room below the form
    let linkContainer = document.getElementById('captionLinkContainer');
    if (!linkContainer) {
      linkContainer = document.createElement('div');
      linkContainer.id = 'captionLinkContainer';
      configForm.insertAdjacentElement('afterend', linkContainer);
    }
    linkContainer.innerHTML = `<a href="${url}" target="_blank">Captions room is open here</a>`;

    // Start the microphone-based speech recognition and send transcriptions
    startSpeechRecognition(language, room);
  });

  // Handle the Twitch bot invite button (placeholder functionality)
  const botButton = document.getElementById("botButton");
  if (botButton) {
    botButton.addEventListener("click", function (event) {
      event.preventDefault();
      // For now, simply alert the user.
      alert("To invite Jabberer to your Twitch channel, please add it as a bot in your Twitch chat.");
    });
  }
});

/**
 * Starts the microphone-based speech recognition and sends transcription chunks via WebSocket.
 * @param {string} lang - The language code for the SpeechRecognition API (e.g., "en-US").
 * @param {string} room - The room ID to join on the WebSocket server.
 */
function startSpeechRecognition(lang, room) {
  // Connect to the WebSocket server.
  const ws = new WebSocket("ws://35.228.43.65:8080");

  ws.onopen = function () {
    // Once connected, join the room.
    const joinMessage = { type: "join", room: room };
    ws.send(JSON.stringify(joinMessage));
  };

  // Check for the SpeechRecognition API support.
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("Speech recognition is not supported in this browser.");
    return;
  }

  // Create a new SpeechRecognition instance.
  const recognition = new SpeechRecognition();
  recognition.continuous = true;      // Keep listening continuously.
  recognition.interimResults = true;  // Get interim results while speaking.
  recognition.lang = lang;            // Use the selected language.

  recognition.onresult = function (event) {
    // Loop through the results from the event.
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      // Prepare the message payload.
      const message = {
        type: "transcription",
        content: transcript,
        interim: !event.results[i].isFinal,  // true if not final, false if final.
        timestamp: Date.now()
      };
      // Send the transcription chunk to the WebSocket server.
      ws.send(JSON.stringify(message));
    }
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error: ", event.error);
  };

  recognition.onend = function () {
    // If recognition ends unexpectedly, restart it.
    recognition.start();
  };

  // Start the speech recognition (this will ask for microphone permission).
  recognition.start();
}

/**
 * Generates a random alphanumeric string of the given length.
 * @param {number} length - The desired length of the generated string.
 * @returns {string} - The generated random string.
 */
function generateRoomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
