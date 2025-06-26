import fs from "fs";
import {
    type InputCommand,
    type Vehicle,
    type IntersectionState,
    type Direction,
    type Road
} from "./types.js";
import { allowedDirections } from "./directions.js";

simulate("input.json", "output.json");

export function simulate(inputPath: string, outputPath: string): void {
    const data: InputCommand[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"))["commands"];
    let intersectionState: IntersectionState = {
        currentStep: 0,
        vehicles: []
    };

    data.forEach((command: InputCommand) => {
        intersectionState = processCommand(command, intersectionState);
    });

    console.log(allowedDirections);

    fs.writeFileSync(outputPath, "");
    fs.appendFileSync(outputPath, JSON.stringify(intersectionState, null, 2));
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
    console.log("BEST", bestDirectionSet);
    console.log("----------------------");

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
