const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

const calculateLuminance = (r: number, g: number, b: number) => {
  return 0.299 * (r / 255) + 0.587 * (g / 255) + 0.114 * (b / 255);
};

const isLightColor = (backgroundColor: string) => {
  const { r, g, b } = hexToRgb(backgroundColor);
  const luminance = calculateLuminance(r, g, b);
  return luminance > 0.6;
};

export const getTextColor = (backgroundColor: string) => {
  return isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
};
