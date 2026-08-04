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
      bg-gray-200
      flex
      items-center
      justify-center
      text-3xl
      shadow
      "
    >
      📄
    </div>


    <span class="mt-2 text-sm font-medium">
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
    homeButton.addEventListener("click", () => {
      for (const win of document.querySelectorAll(".window")) {
        minimizeWindow(win);
      }
    });
  }

  document.querySelectorAll(".app-icon").forEach((icon) => {
    initializeIcon(icon);
  });

  window.addEventListener("fileCreated", (e) => {
    createFileIcon({
      name: e.detail.name,
    });
  });
}
