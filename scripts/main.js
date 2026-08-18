import { loadComponent } from "./componentLoader.js";
import { startClock } from "./clock.js";
import { initDesktop } from "./desktop.js";
import { initContextMenu } from "./contextMenu.js";

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
