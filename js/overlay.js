// js/captions.js

document.addEventListener('DOMContentLoaded', function () {
  // Get language from URL parameters; default to 'en-US' if not provided.
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang') || 'en-US';
  
  // Check if the Web Speech API is supported.
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported in this browser.");
    document.getElementById('captionLine').textContent = "Speech recognition not supported in this browser.";
    return;
  }
  
  // Create a new recognition instance.
  let recognition = new SpeechRecognition();
  recognition.continuous = true;      // Keep listening continuously.
  recognition.interimResults = true;  // Show interim results as the user speaks.
  recognition.lang = lang;            // Set language based on the URL parameter.
  
  let finalTranscript = "";
  
  recognition.onresult = function (event) {
    let interimTranscript = "";
    
    // Process all the results from the event.
    for (let i = event.resultIndex; i < event.results.length; i++) {
      let transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update the caption text on screen.
    document.getElementById('captionLine').textContent = finalTranscript + interimTranscript;
  };
  
  recognition.onerror = function (event) {
    console.error("Speech recognition error: ", event.error);
  };
  
  recognition.onend = function () {
    // In case recognition stops, restart it.
    recognition.start();
  };
  
  // Start the speech recognition.
  recognition.start();
});
