import { describe, test, expect, vi, beforeEach } from "vitest";
import {
    calculateFirstVehiclePosition,
    calculateVehicleEndPosition,
    drawVehicle,
    drawBackground,
    getVehiclePath,
    vehicleRadius
} from "./draw";
import type { Road, Direction } from "../server/types";

describe("draw.ts", () => {
    let mockCanvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;

    beforeEach(() => {
        mockContext = {
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 0,
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            canvas: { width: 800, height: 600 }
        } as unknown as CanvasRenderingContext2D;

        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(() => mockContext)
        } as unknown as HTMLCanvasElement;
    });

    describe("calculateFirstVehiclePosition", () => {
        test("calculates correct positions for all roads", () => {
            const positions = calculateFirstVehiclePosition(mockCanvas);

            expect(positions.north).toEqual({
                x: mockCanvas.width / 2 - 40 / 2 - 60 / 2,
                y: mockCanvas.height / 2 - 40 - 60 - 10
            });
            expect(positions.south).toEqual({
                x: mockCanvas.width / 2 + 40 / 2 + 60 / 2,
                y: mockCanvas.height / 2 + 40 + 60 + 10
            });
            expect(positions.east).toEqual({
                x: mockCanvas.width / 2 + 40 + 60 + 10,
                y: mockCanvas.height / 2 - 40 / 2 - 60 / 2
            });
            expect(positions.west).toEqual({
                x: mockCanvas.width / 2 - 40 - 60 - 10,
                y: mockCanvas.height / 2 + 40 / 2 + 60 / 2
            });
        });

        test("works with different canvas sizes", () => {
            const smallCanvas = { width: 400, height: 300 } as HTMLCanvasElement;
            const positions = calculateFirstVehiclePosition(smallCanvas);

            expect(positions.north.x).toBe(smallCanvas.width / 2 - 40 / 2 - 60 / 2);
            expect(positions.north.y).toBe(smallCanvas.height / 2 - 40 - 60 - 10);
        });
    });

    describe("calculateVehicleEndPosition", () => {
        test("calculates correct end positions for all roads", () => {
            const endPositions = calculateVehicleEndPosition(mockCanvas);
            const firstPositions = calculateFirstVehiclePosition(mockCanvas);

            expect(endPositions.north).toEqual({
                x: firstPositions.north.x + 40 + 60,
                y: 0 - vehicleRadius
            });
            expect(endPositions.south).toEqual({
                x: firstPositions.south.x - 40 - 60,
                y: mockCanvas.height + vehicleRadius
            });
            expect(endPositions.east).toEqual({
                x: mockCanvas.width + vehicleRadius,
                y: firstPositions.east.y + 40 + 60
            });
            expect(endPositions.west).toEqual({
                x: 0 - vehicleRadius,
                y: firstPositions.west.y - 40 - 60
            });
        });
    });

    describe("drawVehicle", () => {
        test("draws stationary vehicle with red color", () => {
            const direction: Direction = { start: "north", end: "south" };
            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.beginPath).toHaveBeenCalled();
            expect(mockContext.arc).toHaveBeenCalledWith(100, 100, vehicleRadius, 0, Math.PI * 2);
            expect(mockContext.fill).toHaveBeenCalled();
        });

        test("draws arrow pointing up for north direction", () => {
            const direction: Direction = { start: "south", end: "north" };

            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100 - vehicleRadius);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 - vehicleRadius / 2, 100 - vehicleRadius / 2);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 + vehicleRadius / 2, 100 - vehicleRadius / 2);
        });

        test("draws arrow pointing down for south direction", () => {
            const direction: Direction = { start: "north", end: "south" };

            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100 + vehicleRadius);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 - vehicleRadius / 2, 100 + vehicleRadius / 2);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 + vehicleRadius / 2, 100 + vehicleRadius / 2);
        });

        test("draws arrow pointing left for west direction", () => {
            const direction: Direction = { start: "east", end: "west" };

            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.moveTo).toHaveBeenCalledWith(100 - vehicleRadius, 100);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 - vehicleRadius / 2, 100 - vehicleRadius / 2);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 - vehicleRadius / 2, 100 + vehicleRadius / 2);
        });

        test("draws arrow pointing right for east direction", () => {
            const direction: Direction = { start: "west", end: "east" };

            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.moveTo).toHaveBeenCalledWith(100 + vehicleRadius, 100);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 + vehicleRadius / 2, 100 - vehicleRadius / 2);
            expect(mockContext.lineTo).toHaveBeenCalledWith(100 + vehicleRadius / 2, 100 + vehicleRadius / 2);
        });

        test("sets white fill style for arrow", () => {
            const direction: Direction = { start: "north", end: "south" };

            drawVehicle(mockContext, 100, 100, direction, true);

            expect(mockContext.fillStyle).toBe("#fff");
            expect(mockContext.closePath).toHaveBeenCalled();
        });
    });

    describe("drawBackground", () => {
        test("draws whole background", () => {
            drawBackground(mockContext);

            expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        test("draws roads with correct color and dimensions", () => {
            drawBackground(mockContext);

            expect(mockContext.fillStyle).toBe("#555879");

            expect(mockContext.fillRect).toHaveBeenCalledWith(0, 600 / 2 - 40 / 2 - 60, 800, 60);
            expect(mockContext.fillRect).toHaveBeenCalledWith(0, 600 / 2 + 40 / 2, 800, 60);
            expect(mockContext.fillRect).toHaveBeenCalledWith(800 / 2 - 40 / 2 - 60, 0, 60, 600);
            expect(mockContext.fillRect).toHaveBeenCalledWith(800 / 2 + 40 / 2, 0, 60, 600);
        });

        test("draws intersection", () => {
            drawBackground(mockContext);

            expect(mockContext.fillRect).toHaveBeenCalledWith(
                800 / 2 - 40 / 2 - 60,
                600 / 2 - 40 / 2 - 60,
                40 + 60 * 2,
                40 + 60 * 2
            );
        });

        test("draws stop lines with dashed style", () => {
            drawBackground(mockContext);

            expect(mockContext.strokeStyle).toBe("#fff");
            expect(mockContext.setLineDash).toHaveBeenCalledWith([6, 3]);
            expect(mockContext.lineWidth).toBe(6);
            expect(mockContext.stroke).toHaveBeenCalled();
        });
    });

    describe("getVehiclePath", () => {
        test("handles straight line paths", () => {
            const straightPaths = [
                { start: "north" as Road, end: "south" as Road },
                { start: "south" as Road, end: "north" as Road },
                { start: "east" as Road, end: "west" as Road },
                { start: "west" as Road, end: "east" as Road }
            ];

            straightPaths.forEach(({ start, end }) => {
                const path = getVehiclePath(mockContext, start, end);
                expect(path).toHaveLength(2);
                expect(path[0].start).toBeDefined();
                expect(path[0].end).toBeDefined();
                expect(path[1].start).toEqual(path[0].end);
                expect(path[1].end).toBeDefined();
            });
        });

        test("handles right turn paths", () => {
            const rightTurns = [
                { start: "north" as Road, end: "west" as Road },
                { start: "west" as Road, end: "south" as Road },
                { start: "south" as Road, end: "east" as Road },
                { start: "east" as Road, end: "north" as Road }
            ];

            rightTurns.forEach(({ start, end }) => {
                const path = getVehiclePath(mockContext, start, end);
                expect(path).toHaveLength(2);
                expect(path[0].start).toBeDefined();
                expect(path[0].end).toBeDefined();
                expect(path[1].start).toEqual(path[0].end);
                expect(path[1].end).toBeDefined();
            });
        });

        test("handles left turn paths", () => {
            const leftTurns = [
                { start: "north" as Road, end: "east" as Road },
                { start: "east" as Road, end: "south" as Road },
                { start: "south" as Road, end: "west" as Road },
                { start: "west" as Road, end: "north" as Road }
            ];

            leftTurns.forEach(({ start, end }) => {
                const path = getVehiclePath(mockContext, start, end);
                expect(path).toHaveLength(2);
                expect(path[0].start).toBeDefined();
                expect(path[0].end).toBeDefined();
                expect(path[1].start).toEqual(path[0].end);
                expect(path[1].end).toBeDefined();
            });
        });

        test("handles U-turn paths", () => {
            const uTurns: Road[] = ["north", "south", "east", "west"];

            uTurns.forEach((road) => {
                const path = getVehiclePath(mockContext, road, road);
                expect(path).toHaveLength(3);
                expect(path[0].start).toBeDefined();
                expect(path[0].end).toBeDefined();
                expect(path[1].start).toEqual(path[0].end);
                expect(path[1].end).toBeDefined();
                expect(path[2].start).toEqual(path[1].end);
                expect(path[2].end).toBeDefined();
            });
        });

        test("calculates correct offsets for north/west roads in right turns", () => {
            const path = getVehiclePath(mockContext, "north", "west");
            const startPos = calculateFirstVehiclePosition(mockContext.canvas)["north"];
            const expectedOffset = (vehicleRadius * 2 + 60 / 2) * 1;

            expect(path[0].end.y).toBe(startPos.y + expectedOffset);
        });

        test("calculates correct offsets for south/east roads in right turns", () => {
            const path = getVehiclePath(mockContext, "south", "east");
            const startPos = calculateFirstVehiclePosition(mockContext.canvas)["south"];
            const expectedOffset = (vehicleRadius * 2 + 60 / 2) * -1;

            expect(path[0].end.y).toBe(startPos.y + expectedOffset);
        });

        test("calculates correct offsets for left turns", () => {
            const path = getVehiclePath(mockContext, "north", "east");
            const startPos = calculateFirstVehiclePosition(mockContext.canvas)["north"];
            const expectedOffset = (vehicleRadius * 2 + 40 + (60 * 3) / 2) * 1;

            expect(path[0].end.y).toBe(startPos.y + expectedOffset);
        });

        test("calculates correct final offsets for different turn types", () => {
            const rightTurnPath = getVehiclePath(mockContext, "north", "west");
            const leftTurnPath = getVehiclePath(mockContext, "north", "east");
            const uTurnPath = getVehiclePath(mockContext, "north", "north");

            expect(rightTurnPath[1].end).toBeDefined();
            expect(leftTurnPath[1].end).toBeDefined();
            expect(uTurnPath[2].end).toBeDefined();
        });

        test("handles east-west roads correctly in U-turns", () => {
            const eastUTurn = getVehiclePath(mockContext, "east", "east");
            const westUTurn = getVehiclePath(mockContext, "west", "west");

            expect(eastUTurn).toHaveLength(3);
            expect(westUTurn).toHaveLength(3);

            expect(eastUTurn[0].start).toBeDefined();
            expect(westUTurn[0].start).toBeDefined();
        });

        test("path segments are properly connected", () => {
            const allCombinations = [
                ["north", "south"],
                ["north", "east"],
                ["north", "west"],
                ["north", "north"],
                ["south", "north"],
                ["south", "east"],
                ["south", "west"],
                ["south", "south"],
                ["east", "north"],
                ["east", "south"],
                ["east", "west"],
                ["east", "east"],
                ["west", "north"],
                ["west", "south"],
                ["west", "east"],
                ["west", "west"]
            ] as [Road, Road][];

            allCombinations.forEach(([start, end]) => {
                const path = getVehiclePath(mockContext, start, end);
                for (let i = 1; i < path.length; i++) {
                    expect(path[i].start).toEqual(path[i - 1].end);
                }
            });
        });
    });

    describe("vehicleRadius", () => {
        test("exports correct vehicle radius", () => {
            expect(vehicleRadius).toBe(15);
        });
    });
});
