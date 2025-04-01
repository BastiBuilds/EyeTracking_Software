// Initialisierung von WebGazer beim Laden der Seite
window.onload = function () {
    webgazer.setGazeListener(function (data, elapsedTime) {
    }).begin();
  
    webgazer.showVideo(true);
    webgazer.showFaceOverlay(true);
    webgazer.showFaceFeedbackBox(true);
  };
  
  const dwellThreshold = 3000; // Fixierzeit-Zeit in Millisekunden
  let currentButton = null;
  let gazeStartTime = null;
  let spokenForButton = null;
  
  // Funktion zur Sprachausgabe mit der Web Speech API
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    window.speechSynthesis.speak(utterance);
  };
  
  // Regelmässige Überprüfung der Blickposition alle 100 ms
  setInterval(() => {
    const prediction = webgazer.getCurrentPrediction();
    if (prediction) {
      const x = prediction.x;
      const y = prediction.y;
      // Bestimme das Element an der aktuellen Blickposition
      const element = document.elementFromPoint(x, y);
      if (element && element.tagName === "BUTTON") {
        if (element === currentButton) {
          // Gleicher Button wird weiterhin fixiert
          if (!gazeStartTime) {
            gazeStartTime = Date.now();
          } else {
            const elapsed = Date.now() - gazeStartTime;
            if (elapsed >= dwellThreshold && spokenForButton !== element) {
              speak(element.textContent);
              spokenForButton = element;
            }
          }
        } else {
          // Wechsel zu einem anderen Button: Reset der Variablen und visuelles Highlight setzen
          if (currentButton) {
            currentButton.classList.remove("gaze-highlight");
          }
          currentButton = element;
          currentButton.classList.add("gaze-highlight");
          gazeStartTime = Date.now();
          spokenForButton = null;
        }
      } else {
        // Blick nicht auf einem Button – Variablen zurücksetzen und Highlight entfernen
        if (currentButton) {
          currentButton.classList.remove("gaze-highlight");
        }
        currentButton = null;
        gazeStartTime = null;
        spokenForButton = null;
      }
    }
  }, 100);  