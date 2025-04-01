// Funktion zum Füllen des Dropdowns mit verfügbaren Videogeräten
function populateCameraSelection() {
  navigator.mediaDevices.enumerateDevices().then(devices => {
    const videoDevices = devices.filter(device => device.kind === "videoinput");
    const select = document.getElementById("cameraSelect");
    videoDevices.forEach(device => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label || `Kamera ${select.length}`;
      select.appendChild(option);
    });
  }).catch(err => {
    console.error("Fehler beim Abrufen der Geräte:", err);
  });
}

// Funktion, um getUserMedia mit einem bestimmten deviceId zu überschreiben
function overrideCamera(deviceId) {
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(constraints) {
    constraints.video = Object.assign({}, constraints.video, {
      deviceId: { exact: deviceId }
    });
    return originalGetUserMedia(constraints);
  };
}

// Beim Ändern der Auswahl wird die Kamera überschrieben und WebGazer initialisiert
document.getElementById("cameraSelect").addEventListener("change", function(e) {
  const selectedDeviceId = e.target.value;
  if (selectedDeviceId) {
    overrideCamera(selectedDeviceId);
    console.log("Externe Kamera ausgewählt:", selectedDeviceId);
  } else {
    console.log("Standardkamera wird verwendet");
  }
  webgazer.begin();
});

// Stelle sicher, dass das Dropdown befüllt wird, bevor WebGazer initialisiert wird
window.onload = function () {
  populateCameraSelection();
  
  // Starte WebGazer erst, nachdem die Kameraselektion getroffen wurde.
  webgazer.setGazeListener(function (data, elapsedTime) {

  }).begin();

  webgazer.showVideo(true);
  webgazer.showFaceOverlay(true);
  webgazer.showFaceFeedbackBox(true);
  
  const dwellThreshold = 3000; // Zeit in Millisekunden
  let currentButton = null;
  let gazeStartTime = null;
  let spokenForButton = null;

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    window.speechSynthesis.speak(utterance);
  };

  setInterval(() => {
    const prediction = webgazer.getCurrentPrediction();
    if (prediction) {
      const x = prediction.x;
      const y = prediction.y;
      const element = document.elementFromPoint(x, y);
      if (element && element.tagName === "BUTTON") {
        if (element === currentButton) {
          if (!gazeStartTime) {
            gazeStartTime = Date.now();
          } else {
            const elapsed = Date.now() - gazeStartTime;
            if (elapsed >= dwellThreshold && spokenForButton !== element) {
              element.classList.add("gaze-active");
              speak(element.textContent);
              spokenForButton = element;
            }
          }
        } else {
          if (currentButton) {
            currentButton.classList.remove("gaze-highlight", "gaze-active");
          }
          currentButton = element;
          currentButton.classList.add("gaze-highlight");
          gazeStartTime = Date.now();
          spokenForButton = null;
        }
      } else {
        if (currentButton) {
          currentButton.classList.remove("gaze-highlight", "gaze-active");
        }
        currentButton = null;
        gazeStartTime = null;
        spokenForButton = null;
      }
    }
  }, 100);
};