const defaultFiles = [];
let files = [...defaultFiles];

export function getFiles() {
  return [...files];
}

export function saveFile(name, content) {
  const currentFiles = getFiles();
  const existingIndex = currentFiles.findIndex((file) => file.name === name);

  let created = false;

  if (existingIndex >= 0) {
    currentFiles[existingIndex].content = content;
  } else {
    currentFiles.push({
      name,
      content,
    });

    created = true;
  }

  files = currentFiles;

  return {
    created,
    file: {
      name,
      content,
    },
  };
}

export function deleteFile(name) {
  files = getFiles().filter((f) => f.name !== name);
}

export function getFile(name) {
  return getFiles().find((file) => file.name === name);
}
