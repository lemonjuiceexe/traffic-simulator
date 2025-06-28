import type { Road } from "../server/types.ts";

export type Vector = {
    x: number;
    y: number;
};

const roadWidth: number = 60;
const roadGap: number = 40;
export const vehicleRadius: number = 15;

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
            y: firstVehiclePosition.north.y
        },
        south: {
            x: firstVehiclePosition.south.x - roadGap - roadWidth,
            y: firstVehiclePosition.south.y
        },
        east: {
            x: firstVehiclePosition.east.x,
            y: firstVehiclePosition.east.y + roadGap + roadWidth
        },
        west: {
            x: firstVehiclePosition.west.x,
            y: firstVehiclePosition.west.y - roadGap - roadWidth
        }
    };
}
export function drawVehicle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = "#f00") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, vehicleRadius, 0, Math.PI * 2);
    ctx.fill();
}

export function drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#2b931f";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // roads
    ctx.fillStyle = "#555";
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

    const trafficLightSize: Vector = {
        x: 60,
        y: 70
    };
    const centerX: number = ctx.canvas.width / 2;
    const centerY: number = ctx.canvas.height / 2;
    const offset: number = 80;

    // const trafficLightPositions: Vector[] = [
    //     { x: centerX - offset - trafficLightSize.x, y: centerY - trafficLightSize.y / 2 },
    //     { x: centerX + offset, y: centerY - trafficLightSize.y / 2 },
    //     { x: centerX - trafficLightSize.x / 2, y: centerY - offset - trafficLightSize.y },
    //     { x: centerX - trafficLightSize.x / 2, y: centerY + offset }
    // ];

    // trafficLightPositions.forEach((pos) => {
    //     // Draw traffic light box
    //     ctx.fillStyle = "#333";
    //     ctx.fillRect(pos.x, pos.y, trafficLightSize.x, trafficLightSize.y);
    //
    //     ["red", "yellow"].forEach((color, index) => {
    //         ctx.fillStyle = color;
    //         ctx.beginPath();
    //         ctx.arc(
    //             pos.x + trafficLightSize.x / 2,
    //             pos.y + ((index + 1) * trafficLightSize.y) / 4,
    //             Math.min(trafficLightSize.x, trafficLightSize.y) / 8,
    //             0,
    //             Math.PI * 2
    //         );
    //         ctx.fill();
    //     });
    //     // Draw three green lights: left, forward, right
    //     const greenY = pos.y + (3 * trafficLightSize.y) / 4;
    //     const greenRadius = Math.min(trafficLightSize.x, trafficLightSize.y) / 8;
    //     const greenOffsets = [
    //         trafficLightSize.x / 4, // left
    //         trafficLightSize.x / 2, // forward
    //         (3 * trafficLightSize.x) / 4 // right
    //     ];
    //     greenOffsets.forEach((offsetX) => {
    //         ctx.fillStyle = "green";
    //         ctx.beginPath();
    //         ctx.arc(pos.x + offsetX, greenY, greenRadius, 0, Math.PI * 2);
    //         ctx.fill();
    //     });
    // });
}

export function getVehicleCurvePoints(
    start: Vector,
    end: Vector,
    startRoad: Road,
    endRoad: Road
): { control: Vector; isCurve: boolean } {
    const isStraightLine =
        (startRoad === "north" && endRoad === "south") ||
        (startRoad === "south" && endRoad === "north") ||
        (startRoad === "east" && endRoad === "west") ||
        (startRoad === "west" && endRoad === "east");
    const isLeftTurn =
        (startRoad === "north" && endRoad === "west") ||
        (startRoad === "west" && endRoad === "south") ||
        (startRoad === "south" && endRoad === "east") ||
        (startRoad === "east" && endRoad === "north");
    if (isStraightLine) {
        return {
            control: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
            isCurve: false
        };
    }
    if (isLeftTurn) {
        return {
            control: {
                x: (start.x + end.x) / 2 + ((end.y - start.y) / 2) * 0.7,
                y: (start.y + end.y) / 2 - ((end.x - start.x) / 2) * 0.7
            },
            isCurve: true
        };
    }
    return {
        control: {
            x: (start.x + end.x) / 2 - ((end.y - start.y) / 2) * 0.7,
            y: (start.y + end.y) / 2 + ((end.x - start.x) / 2) * 0.7
        },
        isCurve: true
    };
}

export function interpolateVehiclePosition(
    start: Vector,
    control: Vector,
    end: Vector,
    t: number,
    isCurve: boolean
): Vector {
    if (!isCurve) {
        return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
        };
    }
    return {
        x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x,
        y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y
    };
}
