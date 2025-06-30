import { type Direction, type Vehicle } from "./types.js";

export function directionsAreEqual(a: Direction, b: Direction): boolean {
    return a.start === b.start && a.end === b.end;
}
export function vehiclesAreEqual(a: Vehicle, b: Vehicle): boolean {
    return (
        a.id === b.id && directionsAreEqual(a.direction, b.direction) && a.arrivedAtStep === b.arrivedAtStep
    );
}
