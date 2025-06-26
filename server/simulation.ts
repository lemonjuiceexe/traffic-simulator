import fs from "fs";
import { type InputCommand, type Vehicle, type IntersectionState } from "./types.js";

const output_path = "public/output.json";

const data: InputCommand[] = JSON.parse(fs.readFileSync("input.json", "utf-8"))["commands"];
let intersectionState: IntersectionState = {
    currentStep: 0,
    north: [],
    east: [],
    south: [],
    west: []
};

data.forEach((command: InputCommand) => {
    intersectionState = processCommand(command, intersectionState);
});

console.log(JSON.stringify(intersectionState));

fs.writeFileSync(output_path, "");

export function processCommand(
    command: InputCommand,
    currentIntersectionState: IntersectionState
): IntersectionState {
    const newIntersectionState: IntersectionState = JSON.parse(JSON.stringify(currentIntersectionState)); // Deep copy

    if (command.type === "addVehicle") {
        const vehicle: Vehicle = {
            id: command.vehicleId,
            endRoad: command.endRoad,
            arrivedAtStep: currentIntersectionState.currentStep
        };
        newIntersectionState[command.startRoad].push(vehicle);
    } else if (command.type === "step") {
        newIntersectionState.currentStep++;
    }

    return newIntersectionState;
}
