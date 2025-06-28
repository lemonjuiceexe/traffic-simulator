import { type Direction } from "./types.js";

export function directionsAreEqual(a: Direction, b: Direction): boolean {
    return a.start === b.start && a.end === b.end;
}
