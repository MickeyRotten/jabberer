// config.js

document.addEventListener("DOMContentLoaded", function () {
  // Handle the configuration form submission
  const configForm = document.getElementById("configForm");
  const languageSelect = document.getElementById("language");
  const translationSelect = document.getElementById("translation");
  const roomInput = document.getElementById("roomId");

  configForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Grab the selected values
    const language = languageSelect.value;
    const translation = translationSelect.value;
    let room = roomInput.value.trim();

    // Generate a random room ID if none is provided
    if (!room) {
      room = generateRoomId(12); // generates a 12-character random string
    }

    // Build the URL with query parameters
    let url = `captions.html?room=${encodeURIComponent(room)}&lang=${encodeURIComponent(language)}`;
    if (translation) {
      url += `&translation=${encodeURIComponent(translation)}`;
    }

    // Open the captions overlay in a new tab
    window.open(url, '_blank');

    // Display a link to the captions room below the "Start Captions" button
    let linkContainer = document.getElementById('captionLinkContainer');
    if (!linkContainer) {
      linkContainer = document.createElement('div');
      linkContainer.id = 'captionLinkContainer';
      // Insert the container right after the form
      configForm.insertAdjacentElement('afterend', linkContainer);
    }
    linkContainer.innerHTML = `Captions room is open here: <a href="${url}" target="_blank">${url}</a>`;
  });

  // Handle the Twitch bot invite button (placeholder functionality)
  const botButton = document.getElementById("botButton");
  if (botButton) {
    botButton.addEventListener("click", function (event) {
      event.preventDefault();
      // For now, just alert the user.
      // Later you might open a Twitch OAuth link or perform additional steps.
      alert("To invite Jabberer to your Twitch channel, please add it as a bot in your Twitch chat.");
    });
  }
});

// Helper function to generate a random alphanumeric room ID of a given length
function generateRoomId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
