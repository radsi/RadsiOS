export function startClock() {
  function update() {
    const now = new Date();

    document.getElementById("clock").textContent = now.toLocaleTimeString(
      "es-ES",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  update();

  setInterval(update, 1000);
}
