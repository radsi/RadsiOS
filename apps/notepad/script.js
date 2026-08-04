import { saveFile, getFile } from "../../scripts/fileSystem.js";

export function initScript(container, filename = null) {
  const editor = container.querySelector("#editor");

  const save = container.querySelector("#save");

  if (filename) {
    const file = getFile(filename);

    if (file) {
      editor.value = file.content;
    }
  }

  save.onclick = () => {
    let targetName = filename;

    if (targetName == null) {
      targetName = prompt("File name:", "New.txt");

      if (targetName == null) {
        return;
      }
    }

    if (!targetName.endsWith(".txt")) {
      targetName += ".txt";
    }

    filename = targetName;

    const result = saveFile(targetName, editor.value);

    if (result.created) {
      window.dispatchEvent(
        new CustomEvent("fileCreated", {
          detail: result.file,
        }),
      );
    }
  };
}
