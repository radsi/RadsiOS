import { loadComponent } from "scripts/componentLoader.js";
import { startClock } from "scripts/clock.js";
import { initDesktop } from "scripts/desktop.js";
import { initContextMenu } from "scripts/contextMenu.js";

async function init() {
  await Promise.all([
    loadComponent("wallpaper", "components/wallpaper.html"),
    loadComponent("desktop", "components/desktop.html"),
    loadComponent("taskbar", "components/taskbar.html"),
  ]);

  startClock();

  initDesktop();
}

init();
initContextMenu();
