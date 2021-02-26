const puppeteer = require('puppeteer');
const path = require('path');
const Jimp = require('jimp');
const rgbHex = require('rgb-hex');

module.exports = class ImageGeneratorCtx {
  constructor(instance) {
    this.instance = instance;
  }

  async generate(outImgPath) {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
          "--incognito",
          "--no-sandbox",
          "--single-process",
          "--no-zygote"
        ],
      });
      this.page = await this.browser.newPage();
      this.page.setViewport(this.instance.size);
      await this.page.goto('file://' + path.join(__dirname, '../resources/blank.html'));
      await this.drawImage({ src: this.instance.backgroundImage, x: 0, y: 0 });
      //await this.blurs();
      //await this.page.screenshot({ path: outImgPath });
      this.loadedImage = await this.loadImage(this.instance.backgroundImage);
      await this.drawTexts();
      await this.adjustFontSize();
      await this.page.screenshot({ path: outImgPath });
    } finally {
      await this.browser.close();
    }
  }

  async loadImage(outImgPath) {
    return await Jimp.read(outImgPath);
  }

  async adjustFontSize() {
    this.page.evaluate(() => {
      $('.autofit').textfill({ maxFontPixels: 100 });
    });
  }

  async blurs() {
    for (const blur of this.instance.blurs) {
      await this.blur(blur);
    }
  }

  async drawTexts() {
    for (const text of this.instance.texts) {
      const colors = this.getColors(text);
      const args = { ...text, colors };
      await this.blur(args)
      await this.drawText(args);
    }
  }

  pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
  }

  getColors(args) {
    const startBgColor = Jimp.intToRGBA(this.loadedImage.getPixelColor(args.x, args.y));
    const endBgColor = Jimp.intToRGBA(this.loadedImage.getPixelColor(args.x + args.width, args.y + args.height));
    const startBgColorHex = '#' + rgbHex(startBgColor.r, startBgColor.g, startBgColor.b);
    const endBgColorHex = '#' + rgbHex(endBgColor.r, endBgColor.g, endBgColor.b);
    const startColor = this.pickTextColorBasedOnBgColorAdvanced(startBgColorHex, '#FFFFFF', '#000000');
    const endColor = this.pickTextColorBasedOnBgColorAdvanced(endBgColorHex, '#FFFFFF', '#000000');
    if (startBgColorHex == endBgColorHex) {
      if (startBgColorHex == "#FFFFFF" || endBgColorHex == "#FFFFFF") {
        return { text: "black", background: "white" };
      } else if (startBgColorHex == "#000000" || endBgColorHex == "#000000") {
        return { text: "white", background: "black" };
      } else {
        return { text: startColor, background: startBgColorHex };
      }
    }
    if (startColor == endColor) {
      return { text: startColor };
    }
    return { text: "white", background: "black" };
  }

  async drawText(args) {
    await this.page.evaluate((args) => {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = args.x;
      el.style.top = args.y;
      el.style.width = args.width;
      el.style.height = args.height;
      el.style.textAlign = 'center';
      //el.style.overflow = 'hidden';
      el.style.padding = '2px';
      el.style.boxSizing = 'border-box';
      el.style.zIndex = 2;
      el.classList.add('autofit');

      const span = document.createElement('span');
      span.innerText = args.text;
      span.style.color = args.colors.text;

      el.appendChild(span);
      document.body.appendChild(el);
    }, args);
  }

  async blur(args) {
    args.src = this.instance.backgroundImage;
    await this.page.evaluate((args) => {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = args.x;
      el.style.top = args.y;
      el.style.width = args.width;
      el.style.height = args.height;
      el.style.zIndex = 1;
      el.style.overflow = 'hidden';

      if (args.colors.background) {
        el.style.backgroundColor = args.colors.background;
      } else {
        const img = document.createElement('img');
        img.src = args.src;
        img.style.marginLeft = -args.x;
        img.style.marginTop = -args.y;
        img.style.filter = 'blur(10px)';
        el.style.backgroundColor = '#FFFFFF';
        el.appendChild(img);
      }

      document.body.appendChild(el);
    }, args);
  }

  async drawImage(args) {
    return await this.page.evaluate((args) => {
      const el = document.createElement('img');
      el.src = args.src;
      el.style.position = 'absolute';
      el.style.left = args.x;
      el.style.top = args.y;
      el.style.zIndex = 0;
      document.body.appendChild(el);
      return el;
    }, args);
  }

}