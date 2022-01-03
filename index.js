#!/usr/bin/env node
const fs = require("fs");
const yargs = require("yargs");
const { Transform } = require("stream");
const { hideBin } = require("yargs/helpers");
const { join } = require("path");

const { Help, t, i, o } = yargs(hideBin(process.argv)).argv;

main(Help, t, i, o);

function main(Help, t, i, o) {
  if (Help) {
    console.log("\nusage: chendln -t lf -i input -o output\n");
    console.log("-t <enc>    ,         New endline, lf or crlf.");
    console.log("-i <input>  ,         Input file path.");
    console.log("-o <output> ,         Output file path.");
    console.log("--Help      ,         Show help.\n");
    return;
  }

  if (!i) {
    throw new Error("There's no input file.");
  }

  const input = fs.createReadStream(join(process.cwd(), i));
  const out = o || "temp";

  input.on("error", (err) => {
    if (fs.existsSync(join(process.cwd(), out)))
      fs.rmSync(join(process.cwd(), out));
    throw err;
  });

  const output = fs.createWriteStream(join(process.cwd(), out));

  const transform = new Transform({
    transform: function (chunk, _enc, next) {
      if (t === "lf") {
        this.push(chunk.toString().replace(/\r\n/g, "\n"));
        next();
      }
      if (t === "crlf") {
        this.push(chunk.toString().replace(/\n/g, "\r\n"));
        next();
      }
    },
  });

  input.pipe(transform).pipe(output);

  output.on("finish", () => {
    if (!o) {
      fs.unlinkSync(join(process.cwd(), i));
      fs.renameSync(join(process.cwd(), out), join(process.cwd(), i));
    }
    console.log("done");
  });
}
