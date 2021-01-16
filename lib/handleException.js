const NoEnoughArgsException = require("./NoEnoughArgsException");

module.exports = function handleException(e) {
  if (e instanceof NoEnoughArgsException) {
    console.log("Como usar:");
    console.log("\t", process.argv[1], "instruções.json");
  } else {
    console.error(e);
  }
}