const download = (data: any, type: string, filename: string) => {
  const jsonString = JSON.stringify(data);

  const blob = new Blob([jsonString], { type: type });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const upload = async (accept: string) => {
  const loadFile = new Promise((res, rej) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = accept;
    fileInput.style.display = "none";
    fileInput.addEventListener("change", (evt: Event) => {
      const target = evt.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return rej(new Error("file is not exsist"));
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          if (accept === "application/json") {
            const json = JSON.parse(e.target?.result as string);
            res(json);
          } else {
            rej(new Error(`Unsupported file type: ${accept}`));
          }
        } catch (err) {
          rej(new Error(`Error parsing JSON: ${err}`));
        }
      };

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        rej(new Error(`File reading error: ${e}`));
      };

      reader.readAsText(file);

      document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);

    fileInput.click();
  });

  const json = await loadFile;

  return {
    then: (callback: (json: any) => void) => {
      callback(json);
    },
  };
};

export { download, upload };
