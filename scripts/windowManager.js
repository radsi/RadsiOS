let topZIndex = 100;
let resizeHandlerRegistered = false;

function getWindowTitle(app, file = null) {
  if (!file) return app;

  return `${app} · ${file}`;
}

function getViewportBounds() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    maxWidth: Math.max(320, width - 32),
    maxHeight: Math.max(280, height - 90),
  };
}

function fitWindowToViewport(win) {
  const { maxWidth, maxHeight } = getViewportBounds();
  const currentWidth = parseFloat(win.style.width || "0") || 0;
  const currentHeight = parseFloat(win.style.height || "0") || 0;

  const width = Math.min(Math.max(currentWidth, 320), maxWidth);
  const height = Math.min(Math.max(currentHeight, 260), maxHeight);
  const left = Math.min(
    Math.max(parseFloat(win.style.left || "16") || 16, 16),
    Math.max(16, maxWidth - width),
  );
  const top = Math.min(
    Math.max(parseFloat(win.style.top || "16") || 16, 16),
    Math.max(16, maxHeight - height),
  );

  win.style.maxWidth = `${maxWidth}px`;
  win.style.maxHeight = `${maxHeight}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;
}

export async function openWindow(app, file = null) {
  const existingWindow = [...document.querySelectorAll(".window")].find(
    (win) => win.dataset.app === app && win.dataset.file === (file || ""),
  );

  if (existingWindow) {
    if (existingWindow.classList.contains("hidden")) {
      restoreWindow(existingWindow);
    } else {
      focusWindow(existingWindow);
    }

    return existingWindow;
  }

  const win = document.createElement("div");

  const { width: viewportWidth, height: viewportHeight } = getViewportBounds();
  const defaultWidth = Math.min(860, Math.max(320, viewportWidth * 0.78));
  const defaultHeight = Math.min(620, Math.max(320, viewportHeight * 0.74));

  win.className = `
        fixed
        flex
        flex-col
        bg-gray-600
        rounded-xl
        shadow-2xl
        overflow-hidden
        z-50
        window
    `;

  win.style.left = `${Math.max(16, Math.min(40, viewportWidth * 0.05))}px`;
  win.style.top = `${Math.max(16, Math.min(40, viewportHeight * 0.05))}px`;
  win.style.width = `${defaultWidth}px`;
  win.style.height = `${defaultHeight}px`;
  win.style.maxWidth = `${viewportWidth - 32}px`;
  win.style.maxHeight = `${viewportHeight - 90}px`;
  win.style.minWidth = "320px";
  win.style.minHeight = "260px";
  win.style.boxSizing = "border-box";

  if (app === "snake") {
    win.style.width = `${Math.min(460, Math.max(320, viewportWidth * 0.62))}px`;
    win.style.height = `${Math.min(540, Math.max(420, viewportHeight * 0.74))}px`;
    win.style.minWidth = "320px";
    win.style.minHeight = "420px";
  }

  win.dataset.app = app;
  win.dataset.file = file || "";
  win.dataset.minimized = "false";

  win.innerHTML = `

    <div class="
        titlebar
        h-10
        bg-gray-600
        flex
        justify-between
        items-center
        px-3
        cursor-move
    ">

        <span class="font-semibold paint-text">
            ${getWindowTitle(app, file)}
        </span>

        <div class="flex items-center gap-2">
            <button class="minimize w-8 h-8 rounded-full hover:bg-gray-300">
                <img src="./assets/min.png" />
            </button>

            <button class="close w-8 h-8 rounded-full hover:bg-red-500 hover:text-white">
                <img src="./assets/close.png" />
            </button>
        </div>

    </div>


    <div
        id="app-content"
        class="flex-1 min-h-0 w-full overflow-auto p-4"
    >
        Loading...
    </div>


    <div
        class="
            resize-handle
            absolute
            right-0
            bottom-0
            w-4
            h-4
            cursor-se-resize
        "
    >//</div>

    `;

  if (!resizeHandlerRegistered) {
    window.addEventListener("resize", () => {
      document.querySelectorAll(".window").forEach((windowElement) => {
        fitWindowToViewport(windowElement);
      });
    });

    resizeHandlerRegistered = true;
  }

  document.body.appendChild(win);
  fitWindowToViewport(win);

  win.taskButton = createTaskbarButton(win);

  focusWindow(win);

  win.addEventListener("mousedown", () => {
    focusWindow(win);
  });

  const content = await fetch(`apps/${app}/index.html`).then((r) => r.text());

  win.querySelector("#app-content").innerHTML = content;

  win.querySelector(".close").onclick = () => {
    closeWindow(win);
  };

  win.querySelector(".minimize").onclick = () => {
    minimizeWindow(win);
  };

  makeResizable(win);
  makeDraggable(win, win.querySelector(".titlebar"));

  const container = win.querySelector("#app-content");

  const module = await import(`../apps/${app}/script.js`);
  const init = module.initScript;

  if (typeof init === "function") {
    init(container, file);
  }

  return win;
}

function createTaskbarButton(win) {
  const taskbar = document.querySelector("#window-tasks");

  if (!taskbar) return null;

  const button = document.createElement("button");

  button.className = `
        window-task
        px-3
        py-2
        rounded-lg
        bg-white/10
        text-white
        text-sm
        hover:bg-white/20
    `;

  button.textContent = getWindowTitle(win.dataset.app, win.dataset.file);

  button.onclick = () => {
    if (win.classList.contains("hidden")) {
      restoreWindow(win);
    } else if (win.classList.contains("active")) {
      minimizeWindow(win);
    } else {
      focusWindow(win);
    }
  };

  taskbar.appendChild(button);

  updateTaskbarButton(win);

  return button;
}

function focusWindow(win) {
  topZIndex++;

  win.style.zIndex = topZIndex;

  document.querySelectorAll(".window").forEach((windowElement) => {
    windowElement.classList.remove("active");
  });

  win.classList.add("active");
  win.dataset.minimized = "false";

  updateTaskbarButton(win);
}

export function restoreWindow(win) {
  win.classList.remove("hidden");
  win.dataset.minimized = "false";
  focusWindow(win);
}

export function minimizeWindow(win) {
  win.classList.add("hidden");
  win.classList.remove("active");
  win.dataset.minimized = "true";

  updateTaskbarButton(win);
}

function closeWindow(win) {
  if (win.taskButton) {
    win.taskButton.remove();
  }

  win.remove();

  const remainingWindows = [...document.querySelectorAll(".window")].filter(
    (windowElement) => !windowElement.classList.contains("hidden"),
  );

  if (remainingWindows.length > 0) {
    focusWindow(remainingWindows[remainingWindows.length - 1]);
  }
}

function updateTaskbarButton(win) {
  if (!win.taskButton) return;

  const isActive = win.classList.contains("active");
  const isMinimized = win.dataset.minimized === "true";

  win.taskButton.classList.toggle("bg-blue-600", isActive);
  win.taskButton.classList.toggle("text-white", isActive);
  win.taskButton.classList.toggle("bg-white/10", !isActive);
  win.taskButton.classList.toggle("opacity-60", isMinimized);
}

function makeDraggable(window, handle) {
  let offsetX = 0;
  let offsetY = 0;

  let dragging = false;

  handle.addEventListener("mousedown", (e) => {
    dragging = true;

    const rect = window.getBoundingClientRect();

    offsetX = e.clientX - rect.left;

    offsetY = e.clientY - rect.top;

    focusWindow(window);
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    window.style.left = `${e.clientX - offsetX}px`;

    window.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function makeResizable(win) {
  const handle = win.querySelector(".resize-handle");

  let resizing = false;

  let startX;
  let startY;

  let startWidth;
  let startHeight;

  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();

    focusWindow(win);

    resizing = true;

    startX = e.clientX;
    startY = e.clientY;

    startWidth = win.offsetWidth;
    startHeight = win.offsetHeight;

    handle.setPointerCapture(e.pointerId);

    document.body.style.cursor = "se-resize";
  });

  handle.addEventListener("pointermove", (e) => {
    if (!resizing) return;

    const newWidth = startWidth + (e.clientX - startX);
    const newHeight = startHeight + (e.clientY - startY);

    win.style.width = `${newWidth}px`;
    win.style.height = `${newHeight}px`;
    fitWindowToViewport(win);
  });

  handle.addEventListener("pointerup", (e) => {
    resizing = false;

    handle.releasePointerCapture(e.pointerId);

    document.body.style.cursor = "";
  });
}
