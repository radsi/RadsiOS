const ICON_WIDTH = 88;
const ICON_HEIGHT = 104;
const GAP_X = 24;
const GAP_Y = 24;

function getDesktopLayoutBounds() {
  const desktop = document.querySelector("#desktop");

  if (!desktop) {
    return {
      paddingLeft: 16,
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 96,
      width: 0,
      height: 0,
    };
  }

  const styles = getComputedStyle(desktop);
  const paddingLeft = parseFloat(styles.paddingLeft) || 20;
  const paddingRight = parseFloat(styles.paddingRight) || 0;
  const paddingTop = parseFloat(styles.paddingTop) || 20;
  const paddingBottom = parseFloat(styles.paddingBottom) || 0;
  const rect = desktop.getBoundingClientRect();

  return {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    width: rect.width,
    height: rect.height,
  };
}

export function getNextDesktopPosition(index = null) {
  const {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    width,
    height,
  } = getDesktopLayoutBounds();
  const contentWidth = Math.max(0, width - paddingLeft - paddingRight);
  const contentHeight = Math.max(0, height - paddingTop - paddingBottom);

  const columns = Math.max(
    1,
    Math.floor((contentWidth + GAP_X) / (ICON_WIDTH + GAP_X)),
  );
  const totalIcons = document.querySelectorAll(".app-icon").length;
  const targetIndex = index ?? totalIcons;
  const row = Math.floor(targetIndex / columns);
  const col = targetIndex % columns;

  return {
    left: paddingLeft + col * (ICON_WIDTH + GAP_X),
    top: paddingTop + row * (ICON_HEIGHT + GAP_Y),
  };
}
