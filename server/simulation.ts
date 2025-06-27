import fs from "fs";
import {
    type InputCommand,
    type OutputData,
    type Vehicle,
    type IntersectionState,
    type Direction,
    type Road
} from "./types.js";
import { allowedDirections } from "./directions.js";

const { inputPath, outputPath } = getCLIArguments();
simulate(inputPath, outputPath);

export function getCLIArguments(): { inputPath: string; outputPath: string } {
    const args: string[] = process.argv.slice(2);
    const inputPath: string = args.includes("--inputFile")
        ? args[args.indexOf("--inputFile") + 1]
        : "input.json";
    const outputPath: string = args.includes("--outputFile")
        ? args[args.indexOf("--outputFile") + 1]
        : "output.json";

    return { inputPath, outputPath };
}
export function simulate(inputPath: string, outputPath: string): void {
    const args = process.argv.slice(2);
    console.log("Arguments:", args);

    const data: InputCommand[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"))["commands"];
    let intersectionState: IntersectionState = {
        currentStep: 0,
        vehicles: []
    };

    let outputData: OutputData = {
        stepStatuses: []
    };

    data.forEach((command: InputCommand) => {
        const previousIntersectionState: IntersectionState = intersectionState;
        intersectionState = processCommand(command, intersectionState);
        if (command.type === "step") {
            const vehiclesIdLeft: string[] = previousIntersectionState.vehicles
                .filter((v) => !intersectionState.vehicles.some((v1) => v1.id === v.id))
                .map((v) => v.id);
            outputData.stepStatuses.push({ leftVehicles: vehiclesIdLeft });
        }
    });

    fs.writeFileSync(outputPath, "");
    fs.appendFileSync(outputPath, JSON.stringify(outputData, null, 2));
}

export function processCommand(
    command: InputCommand,
    currentIntersectionState: IntersectionState
): IntersectionState {
    let newIntersectionState: IntersectionState = JSON.parse(JSON.stringify(currentIntersectionState)); // Deep copy

    if (command.type === "addVehicle") {
        const vehicle: Vehicle = {
            id: command.vehicleId,
            direction: {
                start: command.startRoad,
                end: command.endRoad
            },
            arrivedAtStep: currentIntersectionState.currentStep
        };
        newIntersectionState.vehicles.push(vehicle);
    } else if (command.type === "step") {
        newIntersectionState = processStep(currentIntersectionState);
    }

    return newIntersectionState;
}
export function processStep(currentIntersectionState: IntersectionState): IntersectionState {
    const newIntersectionState: IntersectionState = JSON.parse(JSON.stringify(currentIntersectionState)); // Deep copy
    newIntersectionState.currentStep = newIntersectionState.currentStep + 1;

    const bestDirectionSet = getBestDirectionSet(newIntersectionState);
    // console.log("BEST", bestDirectionSet);
    // console.log("----------------------");
    let vehiclesLeftFrom: Record<Road, boolean> = {
        north: false,
        east: false,
        south: false,
        west: false
    };
    for (const vehicle of newIntersectionState.vehicles) {
        if (
            bestDirectionSet.some((direction) => directionsAreEqual(direction, vehicle.direction)) &&
            !vehiclesLeftFrom[vehicle.direction.start]
        ) {
            newIntersectionState.vehicles = newIntersectionState.vehicles.filter((v) => v.id !== vehicle.id);
            vehiclesLeftFrom[vehicle.direction.start] = true;
        }
    }

    return newIntersectionState;
}
export function getBestDirectionSet(intersectionState: IntersectionState): Direction[] {
    const sumOfWaitingTimes: Record<Road, number> = getRoadsWaitingTimes(intersectionState);

    let firstDirectionsToGo: Direction[] = [];
    intersectionState.vehicles.forEach((vehicle) => {
        if (firstDirectionsToGo.some((direction) => vehicle.direction.start === direction.start)) return;
        firstDirectionsToGo.push(vehicle.direction);
    });
    console.log("FTG", firstDirectionsToGo);
    const scoredFirstDirectionsToGo: { direction: Direction; score: number }[] = firstDirectionsToGo.map(
        (direction: Direction) => {
            return {
                direction: direction,
                score: sumOfWaitingTimes[direction.start]
            };
        }
    );

    let bestResult: { directionSet: Direction[]; score: number } = { directionSet: [], score: -Infinity };
    allowedDirections.forEach((directionSet: Direction[]) => {
        let currentScore = 0;
        directionSet.forEach((direction) => {
            if (scoredFirstDirectionsToGo.some((el) => directionsAreEqual(el.direction, direction))) {
                currentScore +=
                    scoredFirstDirectionsToGo.find((el) => directionsAreEqual(el.direction, direction))
                        ?.score || 0;
            }
        });
        bestResult =
            currentScore <= bestResult.score
                ? bestResult
                : { directionSet: directionSet, score: currentScore };
    });

    return bestResult.directionSet;
}
export function getRoadsWaitingTimes(intersectionState: IntersectionState): Record<Road, number> {
    const sumOfWaitingTimes: Record<Road, number> = {
        north: 0,
        east: 0,
        south: 0,
        west: 0
    };
    intersectionState.vehicles.forEach((vehicle) => {
        sumOfWaitingTimes[vehicle.direction.start] += intersectionState.currentStep - vehicle.arrivedAtStep;
    });

    return sumOfWaitingTimes;
}
export function directionsAreEqual(a: Direction, b: Direction): boolean {
    return a.start === b.start && a.end === b.end;
}
