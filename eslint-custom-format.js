// custom-formatter.js
module.exports = function (results) {
  return results
    .filter((result) => result.errorCount > 0 || result.warningCount > 0)
    .map((result) => result.filePath)
    .join('\n');
};
