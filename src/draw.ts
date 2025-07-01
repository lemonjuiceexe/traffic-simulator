import type { Road, Direction } from "../server/types.ts";

export type Vector = {
    x: number;
    y: number;
};
export type PathSegment = {
    start: Vector;
    end: Vector;
};

const roadWidth: number = 60;
const roadGap: number = 40;
export const vehicleRadius: number = 15;
const redVehicleColor = "#BE3D2A";
const grassColor = "#88C273";
const greenVehicleColor = "#A0C878";
const roadColor = "#555879";

export function calculateFirstVehiclePosition(canvas: HTMLCanvasElement): Record<Road, Vector> {
    return {
        north: {
            x: canvas.width / 2 - roadGap / 2 - roadWidth / 2,
            y: canvas.height / 2 - roadGap - roadWidth - 10
        },
        south: {
            x: canvas.width / 2 + roadGap / 2 + roadWidth / 2,
            y: canvas.height / 2 + roadGap + roadWidth + 10
        },
        east: {
            x: canvas.width / 2 + roadGap + roadWidth + 10,
            y: canvas.height / 2 - roadGap / 2 - roadWidth / 2
        },
        west: {
            x: canvas.width / 2 - roadGap - roadWidth - 10,
            y: canvas.height / 2 + roadGap / 2 + roadWidth / 2
        }
    };
}
export function calculateVehicleEndPosition(canvas: HTMLCanvasElement): Record<Road, Vector> {
    const firstVehiclePosition: Record<Road, Vector> = calculateFirstVehiclePosition(canvas);
    return {
        north: {
            x: firstVehiclePosition.north.x + roadGap + roadWidth,
            y: 0 - vehicleRadius
        },
        south: {
            x: firstVehiclePosition.south.x - roadGap - roadWidth,
            y: canvas.height + vehicleRadius
        },
        east: {
            x: canvas.width + vehicleRadius,
            y: firstVehiclePosition.east.y + roadGap + roadWidth
        },
        west: {
            x: 0 - vehicleRadius,
            y: firstVehiclePosition.west.y - roadGap - roadWidth
        }
    };
}
export function drawVehicle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: Direction,
    stationary: boolean
) {
    ctx.fillStyle = stationary ? redVehicleColor : greenVehicleColor;
    ctx.beginPath();
    ctx.arc(x, y, vehicleRadius, 0, Math.PI * 2);
    ctx.fill();
    const arrowDirection: string = ["up", "right", "down", "left"][
        ["north", "east", "south", "west"].indexOf(direction.end)
    ];
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    switch (arrowDirection) {
        case "up":
            ctx.moveTo(x, y - vehicleRadius);
            ctx.lineTo(x - vehicleRadius / 2, y - vehicleRadius / 2);
            ctx.lineTo(x + vehicleRadius / 2, y - vehicleRadius / 2);
            break;
        case "down":
            ctx.moveTo(x, y + vehicleRadius);
            ctx.lineTo(x - vehicleRadius / 2, y + vehicleRadius / 2);
            ctx.lineTo(x + vehicleRadius / 2, y + vehicleRadius / 2);
            break;
        case "left":
            ctx.moveTo(x - vehicleRadius, y);
            ctx.lineTo(x - vehicleRadius / 2, y - vehicleRadius / 2);
            ctx.lineTo(x - vehicleRadius / 2, y + vehicleRadius / 2);
            break;
        case "right":
            ctx.moveTo(x + vehicleRadius, y);
            ctx.lineTo(x + vehicleRadius / 2, y - vehicleRadius / 2);
            ctx.lineTo(x + vehicleRadius / 2, y + vehicleRadius / 2);
            break;
    }
    ctx.closePath();
    ctx.fill();
}

export function drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = grassColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // roads
    ctx.fillStyle = roadColor;
    ctx.fillRect(0, ctx.canvas.height / 2 - roadGap / 2 - roadWidth, ctx.canvas.width, roadWidth);
    ctx.fillRect(0, ctx.canvas.height / 2 + roadGap / 2, ctx.canvas.width, roadWidth);
    ctx.fillRect(ctx.canvas.width / 2 - roadGap / 2 - roadWidth, 0, roadWidth, ctx.canvas.height);
    ctx.fillRect(ctx.canvas.width / 2 + roadGap / 2, 0, roadWidth, ctx.canvas.height);
    ctx.fillRect(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth,
        roadGap + roadWidth * 2,
        roadGap + roadWidth * 2
    );
    // stop lines
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([6, 3]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.stroke();
}

export function getVehiclePath(ctx: CanvasRenderingContext2D, startRoad: Road, endRoad: Road): PathSegment[] {
    const isStraightLine =
        (startRoad === "north" && endRoad === "south") ||
        (startRoad === "south" && endRoad === "north") ||
        (startRoad === "east" && endRoad === "west") ||
        (startRoad === "west" && endRoad === "east");
    const isRightTurn =
        (startRoad === "north" && endRoad === "west") ||
        (startRoad === "west" && endRoad === "south") ||
        (startRoad === "south" && endRoad === "east") ||
        (startRoad === "east" && endRoad === "north");
    const isUTurn = startRoad === endRoad;
    const isLeftTurn = !isStraightLine && !isRightTurn && !isUTurn;
    const finalOffsetBase = 100;

    let finalOffset = 0;

    const startPosition = calculateFirstVehiclePosition(ctx.canvas)[startRoad];
    const endPosition = calculateVehicleEndPosition(ctx.canvas)[endRoad];

    if (isUTurn) {
        const offset1 =
            (vehicleRadius * 2 + roadWidth / 2) * (["north", "west"].includes(startRoad) ? 1 : -1);
        const offset2 =
            (vehicleRadius * 2 + roadGap + roadWidth / 2) * (["north", "east"].includes(startRoad) ? 1 : -1);
        finalOffset = finalOffsetBase * 2 * (["south", "east"].includes(startRoad) ? 1 : -1);
        let turnPosition1: PathSegment = {
            start: {
                x: startPosition.x,
                y: startPosition.y
            },
            end: {
                x: startPosition.x + (["west", "east"].includes(startRoad) ? offset1 : 0),
                y: startPosition.y + (["north", "south"].includes(startRoad) ? offset1 : 0)
            }
        };
        const turnPosition2: PathSegment = {
            start: { ...turnPosition1.end },
            end: {
                x: turnPosition1.end.x + (["north", "south"].includes(startRoad) ? offset2 : 0),
                y: turnPosition1.end.y + (["west", "east"].includes(startRoad) ? offset2 : 0)
            }
        };
        return [
            turnPosition1,
            turnPosition2,
            {
                start: { ...turnPosition2.end },
                end: {
                    x: endPosition.x + (["west", "east"].includes(endRoad) ? finalOffset : 0),
                    y: endPosition.y + (["north", "south"].includes(endRoad) ? finalOffset : 0)
                }
            }
        ];
    }

    let offset = 0;
    if (isRightTurn) {
        offset = (vehicleRadius * 2 + roadWidth / 2) * (["north", "west"].includes(startRoad) ? 1 : -1);
        finalOffset = finalOffsetBase * 3 * (["north", "west"].includes(startRoad) ? 1 : -1);
    } else if (isLeftTurn) {
        offset =
            (vehicleRadius * 2 + roadGap + (roadWidth * 3) / 2) *
            (["north", "west"].includes(startRoad) ? 1 : -1);
        finalOffset = finalOffsetBase * 1 * (["south", "east"].includes(startRoad) ? 1 : -1);
    }
    const turnPosition: PathSegment = {
        start: {
            x: startPosition.x,
            y: startPosition.y
        },
        end: {
            x: startPosition.x + (["west", "east"].includes(startRoad) ? offset : 0),
            y: startPosition.y + (["north", "south"].includes(startRoad) ? offset : 0)
        }
    };
    return [
        turnPosition,
        {
            start: { ...turnPosition.end },
            end: {
                x: endPosition.x + (["west", "east"].includes(endRoad) ? finalOffset : 0),
                y: endPosition.y + (["north", "south"].includes(endRoad) ? finalOffset : 0)
            }
        }
    ];
}
