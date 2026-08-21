import { openWindow, minimizeWindow } from "./windowManager.js";
import { getNextDesktopPosition } from "./desktopGrid.js";
import { getFiles } from "./fileSystem.js";

let loadedFiles = [];
let initializedElements = [];
let resizeHandlerRegistered = false;
let desktopInitialized = false;

function hasFileIcon(name) {
  return [...document.querySelectorAll(".app-icon")].some(
    (icon) => icon.dataset.file === name,
  );
}

function applyIconPosition(icon, index) {
  const pos = getNextDesktopPosition(index);
  icon.style.left = `${pos.left}px`;
  icon.style.top = `${pos.top}px`;
}

function initializeIcon(icon) {
  if (initializedElements.includes(icon)) return;

  let dragging = false;
  let moved = false;

  let offsetX = 0;
  let offsetY = 0;

  icon.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = false;

    const rect = icon.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    icon.setPointerCapture(e.pointerId);
  });

  icon.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
      moved = true;
      icon.dataset.manualPositioned = "true";
    }

    const parent = icon.parentElement.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    const maxLeft = parent.width - iconRect.width;
    const maxTop = parent.height - iconRect.height;
    const nextLeft = e.clientX - parent.left - offsetX;
    const nextTop = e.clientY - parent.top - offsetY;

    icon.style.left = `${Math.max(0, Math.min(nextLeft, maxLeft))}px`;
    icon.style.top = `${Math.max(0, Math.min(nextTop, maxTop))}px`;
  });

  icon.addEventListener("pointerup", (e) => {
    dragging = false;

    icon.releasePointerCapture(e.pointerId);
  });

  icon.addEventListener("dblclick", () => {
    if (!moved) {
      if (icon.dataset.app === "weather" && icon.dataset.url) {
        openWindow("browser", null).then((windowInstance) => {
          const input = windowInstance.querySelector("#url");
          const viewer = windowInstance.querySelector("#viewer");
          if (input) {
            input.value = icon.dataset.url;
          }
          if (viewer) {
            viewer.src = icon.dataset.url;
          }
        });
      } else {
        openWindow(icon.dataset.app, icon.dataset.file);
      }
    }
  });

  initializedElements.push(icon);
}

function removeFileIcon(fileName) {
  const icon = [...document.querySelectorAll(".app-icon")].find(
    (icon) => icon.dataset.file === fileName,
  );

  if (icon) {
    icon.remove();
  }

  loadedFiles = loadedFiles.filter((name) => name !== fileName);

  reflowDesktopIcons();
}

function createFileIcon(file) {
  if (!file?.name) return;

  if (hasFileIcon(file.name)) return;

  const desktop = document.querySelector("#desktop");

  const button = document.createElement("button");

  button.className = `
    app-icon
    absolute
    flex
    flex-col
    items-center
    cursor-move
    hover:scale-105
    transition
    `;

  button.dataset.app = "notepad";

  button.dataset.file = file.name;

  button.innerHTML = `
    <div
      class="
      w-16
      h-16
      rounded-xl
      bg-gray-800
      flex
      items-center
      justify-center
      text-3xl
      shadow
      "
    >
      <img src="assets/file.png" />
    </div>


    <span class=" mt-2 text-sm font-medium paint-text">
      ${file.name}
    </span>
    `;

  const iconCount = desktop.querySelectorAll(".app-icon").length;
  applyIconPosition(button, iconCount);

  if (!loadedFiles.includes(file.name)) {
    loadedFiles.push(file.name);
  }

  desktop.appendChild(button);
  initializeIcon(button);
}

export function loadFiles() {
  const desktop = document.querySelector("#desktop");

  getFiles().forEach((file) => {
    if (loadedFiles.includes(file.name)) return;

    createFileIcon(file);
  });
}

function reflowDesktopIcons() {
  const desktop = document.querySelector("#desktop");

  if (!desktop) return;

  const icons = Array.from(desktop.querySelectorAll(".app-icon"));

  icons.forEach((icon, index) => {
    if (icon.dataset.manualPositioned === "true") return;
    applyIconPosition(icon, index);
  });
}

function placeDefaultIcons() {
  reflowDesktopIcons();
}

const startApps = [
  { id: "browser", icon: "assets/explorer.png", label: "Browser" },
  { id: "notepad", icon: "assets/notepad.png", label: "Notepad" },
  { id: "weather", icon: "assets/weather.png", label: "Weather" },
  { id: "snake", icon: "assets/snake.png", label: "Snake" },
];

function openWeather() {
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
}

function createStartMenu() {
  const existingMenu = document.querySelector("#start-menu");

  if (existingMenu) return existingMenu;

  const menu = document.createElement("div");

  menu.id = "start-menu";

  menu.className = `
    fixed
    bottom-16
    left-4
    z-[9999]
    hidden
    w-[380px]
    overflow-hidden
    rounded-2xl
    bg-gray-600
    shadow-2xl
  `;

  menu.innerHTML = `
    <div class=" p-4">
      <div class="relative">
        <input
          id="start-search"
          type="text"
          placeholder="Search apps and files..."
          autocomplete="off"
          class="
            w-full
            rounded-lg
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:border-blue-500
          "
        />
      </div>
    </div>

    <div class="max-h-[420px] overflow-y-auto p-3">

      <div class="mb-2 px-2 text-xs font-bold uppercase">
        Apps
      </div>

      <div id="start-app-list" class="mb-5 grid grid-cols-3 gap-2"></div>

      <div class="mb-2 px-2 text-xs font-bold uppercase">
        Files
      </div>

      <div id="start-file-list" class="flex flex-col gap-1"></div>

    </div>
  `;

  document.body.appendChild(menu);

  const search = menu.querySelector("#start-search");

  search.addEventListener("input", () => {
    renderStartMenu(menu, search.value);
  });

  return menu;
}

function renderStartMenu(menu, query = "") {
  const normalizedQuery = query.trim().toLowerCase();

  const appList = menu.querySelector("#start-app-list");
  const fileList = menu.querySelector("#start-file-list");

  const filteredApps = startApps.filter((app) => {
    return app.label.toLowerCase().includes(normalizedQuery);
  });

  const filteredFiles = getFiles().filter((file) => {
    return file.name.toLowerCase().includes(normalizedQuery);
  });

  appList.innerHTML = filteredApps
    .map(
      (app) => `
        <button
          class="
            start-app
            flex
            flex-col
            items-center
            justify-center
            rounded-xl
            p-3
            hover:bg-gray-500
          "
          data-app="${app.id}"
        >
          <img
            src="${app.icon}"
            alt="${app.label}"
            class="h-10 w-10 object-contain"
          />

          <span class="mt-2 text-xs font-medium">
            ${app.label}
          </span>
        </button>
      `,
    )
    .join("");

  if (filteredFiles.length === 0) {
    fileList.innerHTML = `
      <div class="px-2 py-3 text-sm text-gray-400">
        No files found
      </div>
    `;
  } else {
    fileList.innerHTML = filteredFiles
      .map(
        (file) => `
          <button
            class="
              start-file
              flex
              items-center
              gap-3
              rounded-lg
              px-3
              py-2
              text-left
              hover:bg-gray-500
            "
            data-file="${file.name}"
          >
            <img
              src="assets/file.png"
              alt=""
              class="h-8 w-8 object-contain"
            />

            <span class="truncate text-sm font-medium">
              ${file.name}
            </span>
          </button>
        `,
      )
      .join("");
  }

  appList.querySelectorAll(".start-app").forEach((button) => {
    button.addEventListener("click", () => {
      const app = button.dataset.app;

      hideStartMenu();

      if (app === "weather") {
        openWeather();
        return;
      }

      openWindow(app);
    });
  });

  fileList.querySelectorAll(".start-file").forEach((button) => {
    button.addEventListener("click", () => {
      const fileName = button.dataset.file;

      hideStartMenu();

      openWindow("notepad", fileName);
    });
  });
}

function showStartMenu() {
  const menu = createStartMenu();

  menu.classList.remove("hidden");

  renderStartMenu(menu);

  const search = menu.querySelector("#start-search");

  search.value = "";
  search.focus();
}

function hideStartMenu() {
  const menu = document.querySelector("#start-menu");

  if (menu) {
    menu.classList.add("hidden");
  }
}

function toggleStartMenu() {
  const menu = createStartMenu();

  if (menu.classList.contains("hidden")) {
    showStartMenu();
  } else {
    hideStartMenu();
  }
}

export function initDesktop() {
  if (desktopInitialized) return;

  loadFiles();
  placeDefaultIcons();
  desktopInitialized = true;

  if (!resizeHandlerRegistered) {
    window.addEventListener("resize", () => {
      reflowDesktopIcons();
    });
    resizeHandlerRegistered = true;
  }

  const homeButton = document.querySelector(".home-button");

  if (homeButton) {
    homeButton.addEventListener("click", (e) => {
      e.stopPropagation();

      toggleStartMenu();
    });
  }

  document.addEventListener("pointerdown", (e) => {
    const menu = document.querySelector("#start-menu");
    const homeButton = document.querySelector(".home-button");

    if (!menu || menu.classList.contains("hidden")) return;

    if (
      !menu.contains(e.target) &&
      homeButton &&
      !homeButton.contains(e.target)
    ) {
      hideStartMenu();
    }
  });

  document.querySelectorAll(".app-icon").forEach((icon) => {
    initializeIcon(icon);
  });

  window.addEventListener("fileCreated", (e) => {
    createFileIcon({
      name: e.detail.name,
    });
  });

  window.addEventListener("fileDeleted", (e) => {
    removeFileIcon(e.detail.name);

    const menu = document.querySelector("#start-menu");

    if (menu && !menu.classList.contains("hidden")) {
      const search = menu.querySelector("#start-search");

      renderStartMenu(menu, search?.value || "");
    }
  });
}
