const ImageGenerator = require('./ImageGenerator');
const sizeOf = require('image-size');
const tryGetExistingPath = require('./tryGetExistingPath');

module.exports = async function generateImage(instructions, cwd = process.cwd()) {
  const srcImgPath = tryGetExistingPath(instructions.srcImgPath, cwd);
  const outImgPath = tryGetExistingPath(instructions.outImgPath, cwd);
  const imageSize = sizeOf(srcImgPath);
  const imageGenerator = new ImageGenerator();
  imageGenerator.size = imageSize;
  imageGenerator.backgroundImage = srcImgPath;
  for (const text of instructions.texts) {
    const args = { x: text.x - 1, y: text.y - 1, width: text.w + 2, height: text.h + 2, text: text.text };
    imageGenerator.blur(args);
    imageGenerator.drawText(args);
  }
  await imageGenerator.generate(outImgPath);
}