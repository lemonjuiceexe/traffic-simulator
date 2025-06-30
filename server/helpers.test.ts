import { test, expect } from "vitest";
import { directionsAreEqual, vehiclesAreEqual } from "./helpers.js";
import { type Direction, type Vehicle } from "./types.js";

test("should compare directions correctly", () => {
    const direction1 = { start: "north", end: "east" } as Direction;
    const direction2 = { start: "north", end: "east" } as Direction;
    const direction3 = { start: "south", end: "west" } as Direction;
    expect(directionsAreEqual(direction1, direction2)).toBe(true);
    expect(directionsAreEqual(direction1, direction3)).toBe(false);
});
test("should compare vehicles correctly", () => {
    const vehicle1: Vehicle = { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 };
    const vehicle2: Vehicle = { id: "v2", direction: { start: "north", end: "east" }, arrivedAtStep: 0 };
    const vehicle3: Vehicle = { id: "v3", direction: { start: "south", end: "west" }, arrivedAtStep: 0 };
    const vehicle4: Vehicle = { id: "v1", direction: { start: "north", end: "east" }, arrivedAtStep: 0 };
    expect(vehiclesAreEqual(vehicle1, vehicle2)).toBe(false);
    expect(vehiclesAreEqual(vehicle1, vehicle3)).toBe(false);
    expect(vehiclesAreEqual(vehicle1, vehicle4)).toBe(true);
});
