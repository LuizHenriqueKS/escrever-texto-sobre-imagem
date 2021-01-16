function validateTextObj(text) {
  requireNumber(text, "w");
  requireNumber(text, "h");
  requireNumber(text, "x");
  requireNumber(text, "y");
  requireText(text, "text");
}

function requireNumber(instructions, key) {
  if (key in instructions) {
    return (typeof instructions[key]) === "number";
  }
  return false;
}

function requireText(instructions, key) {
  if (key in instructions) {
    return (typeof instructions[key]) === "string";
  }
  return false;
}

function requireArray(instructions, key) {
  if (key in instructions) {
    return Array.isArray(instructions[key]);
  }
  return false;
}

module.exports = function validateInstructions(instructions) {
  requireText(instructions, "srcImgPath");
  requireText(instructions, "outImgPath");
  requireArray(instructions, "texts");
  for (const text of instructions.texts) {
    validateTextObj(text);
  }
}
