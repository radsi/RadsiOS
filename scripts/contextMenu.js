import { deleteFile } from "./fileSystem.js";

export function initContextMenu() {
  const menu = document.createElement("div");

  menu.id = "context-menu";

  menu.className = `
        fixed
        hidden
        bg-white
        border
        rounded-lg
        shadow-xl
        p-1
        z-[999]
        text-black
    `;

  menu.innerHTML = `
        <button
            id="delete-option"
            class="
            block
            w-full
            text-left
            px-4
            py-2
            rounded
            hover:bg-red-100
            "
        >
            🗑 Delete
        </button>
    `;

  document.body.appendChild(menu);

  let selected = null;

  document.addEventListener("contextmenu", (e) => {
    const icon = e.target.closest(".app-icon");

    if (!icon) return;

    e.preventDefault();

    if (icon.classList.contains("no-delete")) {
      menu.classList.add("hidden");

      return;
    }

    selected = icon;

    menu.style.left = `${e.clientX}px`;

    menu.style.top = `${e.clientY}px`;

    menu.classList.remove("hidden");
  });

  document.addEventListener("click", () => {
    menu.classList.add("hidden");
  });

  menu.querySelector("#delete-option").onclick = () => {
    if (!selected) return;

    showDeleteModal(selected);
  };
}

function showDeleteModal(element) {
  const modal = document.createElement("div");

  modal.className = `
        fixed
        inset-0
        bg-black/40
        flex
        items-center
        justify-center
        z-[1000]
    `;

  modal.innerHTML = `

        <div
            class="
            bg-white
            rounded-xl
            p-6
            shadow-2xl
            text-black
            "
        >

            <h2 class="text-xl font-bold mb-3">
                Delete?
            </h2>


            <p class="mb-5">
                Do you want to delete this application?
            </p>


            <div class="flex gap-3 justify-end">

                <button
                    id="cancel"
                    class="
                    px-4
                    py-2
                    rounded
                    bg-gray-200
                    "
                >
                    Cancelar
                </button>


                <button
                    id="confirm"
                    class="
                    px-4
                    py-2
                    rounded
                    bg-red-500
                    text-white
                    "
                >
                    Delete
                </button>

            </div>

        </div>

    `;

  document.body.appendChild(modal);

  modal.querySelector("#cancel").onclick = () => {
    modal.remove();
  };

  modal.querySelector("#confirm").onclick = () => {
    const fileName = element.dataset.file;

    if (fileName) {
      deleteFile(fileName);
    } else {
      element.remove();
    }

    modal.remove();
  };
}
