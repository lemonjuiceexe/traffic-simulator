import { describe, test, expect } from "vitest";
import { directionsAreEqual } from "./helpers.js";
import { type Direction } from "./types.js";

describe("directionsAreEqual", () => {
    test("should compare directions correctly", () => {
        const direction1 = { start: "north", end: "east" } as Direction;
        const direction2 = { start: "north", end: "east" } as Direction;
        const direction3 = { start: "south", end: "west" } as Direction;
        expect(directionsAreEqual(direction1, direction2)).toBe(true);
        expect(directionsAreEqual(direction1, direction3)).toBe(false);
    });
});
