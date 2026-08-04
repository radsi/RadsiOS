function setWallpaper(imageUrl) {
  const wallpaper = document.querySelector("#wallpaper-layer");

  if (!wallpaper) return;

  wallpaper.style.backgroundImage = `url('${imageUrl}')`;
}

function getThemeFromImage(imageUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve("dark");
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;

      for (let i = 0; i < data.length; i += 4) {
        total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }

      const averageBrightness = total / (data.length / 4) / 255;
      resolve(averageBrightness > 0.6 ? "light" : "dark");
    };

    image.onerror = () => resolve("dark");
    image.src = imageUrl;
  });
}

async function applyWallpaperTheme(imageUrl) {
  const theme = await getThemeFromImage(imageUrl);
  document.body.dataset.contrast = theme;
}

export function initScript(container) {
  container.querySelectorAll(".wallpaper-option").forEach((button) => {
    button.addEventListener("click", async () => {
      const imageUrl = button.dataset.wallpaper;
      setWallpaper(imageUrl);
      await applyWallpaperTheme(imageUrl);
    });
  });

  const uploadInput = container.querySelector("#wallpaper-upload");
  const preview = container.querySelector("#wallpaper-preview");

  if (!uploadInput || !preview) return;

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const result = reader.result;
      preview.style.backgroundImage = `url('${result}')`;
      preview.classList.remove("hidden");
      setWallpaper(result);
      await applyWallpaperTheme(result);
    };

    reader.readAsDataURL(file);
  });
}
