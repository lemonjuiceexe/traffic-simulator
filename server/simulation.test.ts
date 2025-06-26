import { describe, test, expect, beforeEach } from "vitest";
import { type IntersectionState } from "./types";
import { processCommand } from "./simulation";

describe("processCommand", () => {
    let intersectionState: IntersectionState;

    beforeEach(() => {
        intersectionState = {
            currentStep: 0,
            north: [],
            east: [],
            south: [],
            west: []
        };
    });

    test("should add a vehicle to the correct road", () => {
        const result = processCommand(
            { type: "addVehicle", vehicleId: "v1", startRoad: "north", endRoad: "east" },
            intersectionState
        );
        expect(result.north).toEqual([{ id: "v1", endRoad: "east", arrivedAtStep: 0 }]);
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
        state = processCommand({ type: "step" }, state);
        state = processCommand(
            { type: "addVehicle", vehicleId: "v2", startRoad: "south", endRoad: "west" },
            state
        );
        expect(state.currentStep).toBe(2);
        expect(state.north).toEqual([
            { id: "v1", endRoad: "east", arrivedAtStep: 0 },
            { id: "v2", endRoad: "east", arrivedAtStep: 0 }
        ]);
        expect(state.south).toEqual([{ id: "v2", endRoad: "west", arrivedAtStep: 2 }]);
    });
});
