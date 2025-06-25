import fs from "fs";
import { type InputCommand } from "./types.js";

const output_path = "public/output.json";
fs.writeFileSync(output_path, "");

const data: InputCommand[] = JSON.parse(fs.readFileSync("input.json", "utf-8"))[
    "commands"
];
data.forEach((command) => {
    console.log(command.type);
});
