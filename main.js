const requireEnoughArgs = require('./lib/requireEnoughArgs');
const handleException = require('./lib/handleException');
const tryGetExistingPath = require('./lib/tryGetExistingPath');
const loadJsonFile = require('./lib/loadJsonFile');
const validateInstructions = require('./lib/validateInstructions');
const generateImage = require('./lib/generateImage');
const path = require('path');

async function main() {
  try {
    requireEnoughArgs();
    const instructionsPath = tryGetExistingPath(process.argv[2]);
    const instructions = loadJsonFile(instructionsPath);
    const cwd = path.dirname(instructionsPath);
    validateInstructions(instructions);
    await generateImage(instructions, cwd);
    console.log(`Imagem gerada com sucesso:`, instructions.outImgPath);
  } catch (e) {
    handleException(e);
  }
}

main().then();
