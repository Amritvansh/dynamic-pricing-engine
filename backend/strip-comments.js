const fs = require("fs");
const path = require("path");
const decomment = require("decomment");

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".js")) {
      results.push(file);
    }
  });
  return results;
}

const filesToProcess = walk(path.join(__dirname, "src")).concat([
  path.join(__dirname, "test.js"),
  path.join(__dirname, "server.js"),
]);

filesToProcess.forEach((f) => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, "utf8");
    try {
      const stripped = decomment(code);
      fs.writeFileSync(f, stripped);
      console.log(`Stripped comments from: ${f}`);
    } catch (e) {
      console.error(`Error stripping ${f}: ${e.message}`);
    }
  }
});
