import { type Direction } from "./types.js";

// Right-hand turn directions
const rightHandTurnDirections: Direction[] = [
    { start: "north", end: "west" },
    { start: "west", end: "south" },
    { start: "south", end: "east" },
    { start: "east", end: "north" }
];
const otherAllowedDirections: Direction[][] = [
    [
        { start: "west", end: "north" },
        { start: "west", end: "west" },
        { start: "west", end: "east" }
    ],
    [
        { start: "west", end: "north" },
        { start: "west", end: "west" },
        { start: "east", end: "south" },
        { start: "east", end: "east" }
    ],
    [
        { start: "west", end: "east" },
        { start: "east", end: "west" }
    ],
    [
        { start: "south", end: "north" },
        { start: "south", end: "west" },
        { start: "south", end: "south" }
    ],
    [
        { start: "south", end: "north" },
        { start: "north", end: "south" }
    ],
    [
        { start: "south", end: "west" },
        { start: "south", end: "south" },
        { start: "north", end: "east" },
        { start: "north", end: "north" }
    ],
    [
        { start: "east", end: "west" },
        { start: "east", end: "south" },
        { start: "east", end: "east" }
    ],
    [
        { start: "north", end: "south" },
        { start: "north", end: "east" },
        { start: "north", end: "north" }
    ]
];
export const allowedDirections: Direction[][] = otherAllowedDirections.map((direction) => [
    ...direction,
    ...rightHandTurnDirections
]);
