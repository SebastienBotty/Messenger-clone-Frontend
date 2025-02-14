export const formatFileSize = (bytes: number) => {
  const units = ["o", "Ko", "Mo", "Go", "To"];
  let index = 0;

  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }

  return `${parseFloat(bytes.toFixed(2))} ${units[index]}`;
};

export const getFileTypeFromPathName = (pathName: string) => {
  return pathName.split("/")[1];
};

export const calculateTotalSize = (files: File[]): number => {
  return files.reduce((totalSize, file) => totalSize + file.size, 0);
};
