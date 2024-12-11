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

const upload = (accept: string) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = accept;
  fileInput.style.display = "none";

  // 文件選擇改變事件處理器
  fileInput.addEventListener("change", (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          console.log("Parsed JSON:", json);
        } catch (err) {
          console.error("Error parsing JSON:", err);
        }
      };

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        console.error("File reading error:", e);
      };

      reader.readAsText(file);

      document.body.removeChild(fileInput);
    }
  });

  document.body.appendChild(fileInput);

  fileInput.click();
};

export { download, upload };
