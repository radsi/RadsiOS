export function initScript(container) {
  const input = container.querySelector("#url");

  const viewer = container.querySelector("#viewer");

  const go = container.querySelector("#go");

  const back = container.querySelector("#back");

  function navigate() {
    let url = input.value.trim();

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    url = resolveUrl(url);

    viewer.src = url;
  }

  go.onclick = navigate;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      navigate();
    }
  });

  back.onclick = () => {
    viewer.contentWindow.history.back();
  };

  navigate();
}

function resolveUrl(url) {
  if (url.includes("youtube.com/watch")) {
    const params = new URL(url).searchParams;

    const id = params.get("v");

    if (id) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  if (url.includes("youtu.be")) {
    const id = url.split("/").pop();

    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("twitch.tv/videos")) {
    const id = url.split("/").pop();

    return `https://player.twitch.tv/?video=${id}&parent=localhost`;
  }

  return url;
}
