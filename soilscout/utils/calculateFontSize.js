export const calculateFont = (text, containerWidth) => {
  const estimatedTextWidth = text.length * 8;
  let fontSize = (containerWidth / estimatedTextWidth) * 12;
  const minimumFontSize = 18;
  const maximumFontSize = 30;
  fontSize = Math.max(Math.min(fontSize, maximumFontSize), minimumFontSize);

  return Math.floor(fontSize);
};
