import { openWindow } from "../scripts/windowManager.js";

const apps = [
  { id: "explorer", icon: "assets/directory.png", label: "Explorer" },
  { id: "browser", icon: "assets/explorer.png", label: "Browser" },
  { id: "notepad", icon: "assets/notepad.png", label: "Notepad" },
  { id: "weather", icon: "assets/weather.png", label: "Weather" },
  { id: "snake", icon: "assets/snake.png", label: "Snake" },
];

export function initScript(container) {
  const list = container.querySelector("#app-list");

  if (!list) return;

  list.innerHTML = apps
    .map(
      ({ id, icon, label }) => `
        <button class="app-card flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center hover:bg-gray-100" data-app="${id}">
          <div class="text-3xl">
            <img src="${icon}" alt="${label}" />
          </div>
          <span class="mt-2 font-medium">${label}</span>
        </button>
      `,
    )
    .join("");

  list.querySelectorAll(".app-card").forEach((button) => {
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
