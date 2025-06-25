import fs from "fs";

console.log("ZASKHJGHJZIDJ");
const data = JSON.parse(fs.readFileSync("input.json", "utf-8"))["a"];
fs.writeFileSync("public/output.json", '{ "a": "test12" }');
console.log(data);
