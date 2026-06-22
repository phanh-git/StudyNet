export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Không thể đọc tệp đính kèm.'));
    reader.readAsDataURL(file);
  });
}

export function isImageAttachment(fileType = '', fileUrl = '') {
  return fileType.startsWith('image/') || fileUrl.startsWith('data:image/');
}
