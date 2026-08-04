export async function loadComponent(id, path) {
  const response = await fetch(path);

  if (!response.ok) {
    console.error("Couldnt load", path);
    return;
  }

  document.getElementById(id).innerHTML = await response.text();
}
