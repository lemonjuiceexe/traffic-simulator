import { describe, test, expect, beforeEach, afterEach } from "vitest";
import {
    directionsAreEqual,
    getRoadsWaitingTimes,
    getBestDirectionSet,
    processCommand,
    getCLIArguments
} from "./simulation.js";
import { type IntersectionState, type Direction } from "./types.js";
import { allowedDirections } from "./directions.js";

describe("getCLIArguments", () => {
    const originalArgv = process.argv;
    afterEach(() => {
        process.argv = originalArgv;
    });

    test("should return default paths when no arguments provided", () => {
        process.argv = ["node", "simulation.js"];
        const args = getCLIArguments();
        expect(args).toEqual({ inputPath: "input.json", outputPath: "output.json" });
    });
    test("should parse --inputFile and --outputFile arguments", () => {
        process.argv = [
            "node",
            "simulation.js",
            "--inputFile",
            "customInput.json",
            "--outputFile",
            "customOutput.json"
        ];
        const args = getCLIArguments();
        expect(args).toEqual({ inputPath: "customInput.json", outputPath: "customOutput.json" });
    });
    test("should properly parse only --inputFile argument", () => {
        process.argv = ["node", "simulation.js", "--inputFile", "myInput.json"];
        const args = getCLIArguments();
        expect(args).toEqual({ inputPath: "myInput.json", outputPath: "output.json" });
    });
    test("should properly parse only --outputFile argument", () => {
        process.argv = ["node", "simulation.js", "--outputFile", "myOutput.json"];
        const args = getCLIArguments();
        expect(args).toEqual({ inputPath: "input.json", outputPath: "myOutput.json" });
    });
});

describe("processCommand", () => {
    let intersectionState: IntersectionState;
    beforeEach(() => {
        intersectionState = {
            currentStep: 0,
            vehicles: []
        };
    });

    test("should add a vehicle to the correct road", () => {
        const result = processCommand(
            { type: "addVehicle", vehicleId: "v1", startRoad: "north", endRoad: "east" },
            intersectionState
        );
        expect(result.vehicles).toEqual([
            { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 }
        ]);
        expect(result.currentStep).toBe(0);
    });

    test("should increment currentStep on step command", () => {
        let result = processCommand({ type: "step" }, intersectionState);
        expect(result.currentStep).toBe(1);
        result = processCommand({ type: "step" }, result);
        expect(result.currentStep).toBe(2);
    });

    test("should handle multiple vehicles and steps", () => {
        let state = intersectionState;
        state = processCommand(
            { type: "addVehicle", vehicleId: "v1", startRoad: "north", endRoad: "east" },
            state
        );
        state = processCommand(
            { type: "addVehicle", vehicleId: "v2", startRoad: "north", endRoad: "east" },
            state
        );
        state = processCommand({ type: "step" }, state);
        state = processCommand(
            { type: "addVehicle", vehicleId: "v3", startRoad: "south", endRoad: "west" },
            state
        );
        expect(state.currentStep).toBe(1);
        expect(
            state.vehicles.some((v) => v.id === "v2" && v.arrivedAtStep === 0) &&
                state.vehicles.some((v) => v.id === "v3" && v.arrivedAtStep === 1)
        ).toBe(true);
    });
});

describe("processStep", () => {
    test("should increment currentStep", () => {
        const initialState: IntersectionState = {
            currentStep: 0,
            vehicles: []
        };
        const result = processCommand({ type: "step" }, initialState);
        expect(result.currentStep).toBe(1);
    });
    test("only one vehicle with given start should leave at a time", () => {
        let intersectionState: IntersectionState = {
            currentStep: 2,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "north", end: "east" }, arrivedAtStep: 0 }
            ]
        };
        intersectionState = processCommand({ type: "step" }, intersectionState);
        expect(intersectionState.vehicles.length).toBe(1);
    });
    test("multiple vehicles with different directions can leave at a time", () => {
        let intersectionState: IntersectionState = {
            currentStep: 3,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "west" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "west", end: "south" }, arrivedAtStep: 0 },
                { id: "v3", direction: { start: "south", end: "east" }, arrivedAtStep: 0 },
                { id: "v4", direction: { start: "east", end: "north" }, arrivedAtStep: 0 }
            ]
        };
        intersectionState = processCommand({ type: "step" }, intersectionState);
        expect(intersectionState.vehicles.length).toBe(0);
    });
});
describe("getBestDirectionSet", () => {
    test("should return set from allowedDirections array", () => {
        let intersectionState: IntersectionState = {
            currentStep: 4,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "south", end: "west" }, arrivedAtStep: 2 },
                { id: "v3", direction: { start: "east", end: "north" }, arrivedAtStep: 1 }
            ]
        };
        let result = getBestDirectionSet(intersectionState);
        expect(allowedDirections.includes(result)).toBe(true);
    });
    test("should return directions with the highest waiting times", () => {
        let intersectionState: IntersectionState = {
            currentStep: 50,
            vehicles: [
                { id: "v1", direction: { start: "west", end: "east" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "east", end: "west" }, arrivedAtStep: 21 },
                { id: "v3", direction: { start: "east", end: "north" }, arrivedAtStep: 40 },
                { id: "v4", direction: { start: "west", end: "south" }, arrivedAtStep: 48 }
            ]
        };
        let result = getBestDirectionSet(intersectionState);
        expect(
            result.some((d) => d.start === "west" && d.end === "east") &&
                result.some((d) => d.start === "east" && d.end === "west") &&
                allowedDirections.some(
                    (directionSet) =>
                        directionSet.some((d) => d.start === "west" && d.end === "east") &&
                        directionSet.some((d) => d.start === "east" && d.end === "west")
                )
        ).toBe(true);
    });
    test("should return directions with the highest waiting times #2", () => {
        let intersectionState: IntersectionState = {
            currentStep: 0,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "south" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "south", end: "north" }, arrivedAtStep: 0 }
            ]
        };
        let result = getBestDirectionSet(intersectionState);
        expect(
            result.some((d) => d.start === "north" && d.end === "south") &&
                result.some((d) => d.start === "south" && d.end === "north")
        ).toBe(true);
    });
});
describe("getRoadsWaitingTimes", () => {
    test("should calculate waiting times for each road", () => {
        let intersectionState: IntersectionState = {
            currentStep: 4,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "south", end: "west" }, arrivedAtStep: 2 }
            ]
        };
        let result = getRoadsWaitingTimes(intersectionState);
        expect(result).toEqual({
            north: 4 + 1,
            east: 0,
            south: 2 + 1,
            west: 0
        });
    });
    test("should sum waiting times for one road", () => {
        let intersectionState: IntersectionState = {
            currentStep: 5,
            vehicles: [
                { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 },
                { id: "v2", direction: { start: "north", end: "west" }, arrivedAtStep: 1 },
                { id: "v3", direction: { start: "north", end: "east" }, arrivedAtStep: 3 }
            ]
        };
        let result = getRoadsWaitingTimes(intersectionState);
        expect(result).toEqual({
            north: 11 + 3,
            east: 0,
            south: 0,
            west: 0
        });
    });
});
describe("directionsAreEqual", () => {
    test("should compare directions correctly", () => {
        const direction1 = { start: "north", end: "east" } as Direction;
        const direction2 = { start: "north", end: "east" } as Direction;
        const direction3 = { start: "south", end: "west" } as Direction;
        expect(directionsAreEqual(direction1, direction2)).toBe(true);
        expect(directionsAreEqual(direction1, direction3)).toBe(false);
    });
});
