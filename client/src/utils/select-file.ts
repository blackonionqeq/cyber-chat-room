export function selectFile() {
  return new Promise<File|null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';

    // 当文件选择完成时，解析Promise
    input.onchange = () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        resolve(file);
      } else {
        resolve(null); // 如果没有文件被选择
      }
    };

    input.click();
  });
}