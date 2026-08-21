const defaultFiles = [];
let files = [...defaultFiles];

export function getFiles() {
  return [...files];
}

export function saveFile(name, content) {
  const existingIndex = files.findIndex((file) => file.name === name);

  let created = false;

  if (existingIndex >= 0) {
    files[existingIndex] = {
      ...files[existingIndex],
      content,
    };
  } else {
    files.push({
      name,
      content,
    });

    created = true;

    window.dispatchEvent(
      new CustomEvent("fileCreated", {
        detail: {
          name,
        },
      }),
    );
  }

  return {
    created,
    file: {
      name,
      content,
    },
  };
}

export function deleteFile(name) {
  const exists = files.some((file) => file.name === name);

  if (!exists) return false;

  files = files.filter((file) => file.name !== name);

  window.dispatchEvent(
    new CustomEvent("fileDeleted", {
      detail: {
        name,
      },
    }),
  );

  return true;
}

export function getFile(name) {
  return files.find((file) => file.name === name);
}
