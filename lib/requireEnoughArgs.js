module.exports = function requireEnoughArgs() {
  if (process.argv.length < 3) {
    throw new NoEnoughArgsException();
  }
}