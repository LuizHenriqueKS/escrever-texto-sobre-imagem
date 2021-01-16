const ImageGeneratorCtx = require('./ImageGeneratorCtx');

module.exports = class ImageGenerator {

  constructor() {
    this.size = { width: 100, height: 100 };
    this.backgroundImage = "";
    this.blurs = [];
    this.texts = [];
  }

  blur({ x, y, width, height }) {
    this.blurs.push({ x, y, width, height });
  }

  drawText({ x, y, width, height, text }) {
    this.texts.push({ x, y, width, height, text });
  }

  async generate(outImgPath) {
    return await new ImageGeneratorCtx(this).generate(outImgPath);
  }

};