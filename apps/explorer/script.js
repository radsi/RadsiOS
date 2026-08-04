import { openWindow } from "../../scripts/windowManager.js";

export function initScript(container) {
  container.querySelectorAll(".app-card").forEach((button) => {
    button.addEventListener("click", () => {
      const app = button.dataset.app;

      if (app === "weather") {
        openWindow("browser").then((windowInstance) => {
          const input = windowInstance.querySelector("#url");
          const viewer = windowInstance.querySelector("#viewer");

          if (input) {
            input.value = "https://wttr.in";
          }

          if (viewer) {
            viewer.src = "https://wttr.in";
          }
        });

        return;
      }

      if (app) {
        openWindow(app);
      }
    });
  });
}
