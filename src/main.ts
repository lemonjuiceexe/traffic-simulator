import { type Road, type SimulationStep, type Vehicle } from "../server/types.ts";
import {
    calculateFirstVehiclePosition,
    calculateVehicleEndPosition,
    drawBackground,
    drawVehicle,
    getVehicleCurvePoints,
    interpolateVehiclePosition,
    type Vector,
    vehicleRadius
} from "./draw.ts";
import { directionsAreEqual } from "../server/helpers.ts";
import "./style.css";

const animationDuration = 1500;
const delayBetweenSteps = 500;
const currentStepSpan: HTMLSpanElement = document.querySelector("#step")!;
startSimulation();

function startSimulation(): void {
    fetch("/output.json")
        .then((res: Response): Promise<SimulationStep[]> => res.json())
        .then((data: SimulationStep[]): void => {
            renderSimulation(data);
        });
}

async function renderSimulation(data: SimulationStep[]): Promise<void> {
    console.log(data);
    const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    for (let i: number = 0; i < data.length; i++) {
        const step: SimulationStep = data[i];
        currentStepSpan.textContent = `${i}`;
        await renderStep(ctx, step);
        await new Promise((r) => setTimeout(r, delayBetweenSteps));
    }
}

async function renderStep(ctx: CanvasRenderingContext2D, step: SimulationStep) {
    const movingVehicles: Vehicle[] = [];
    let isFirstVehicle: Record<Road, boolean> = { north: true, south: true, east: true, west: true };
    for (const vehicle of step.vehicles) {
        const startRoad: Road = vehicle.direction.start;
        if (
            isFirstVehicle[startRoad] &&
            step.greenDirections.some((greenDirection) =>
                directionsAreEqual(greenDirection, vehicle.direction)
            )
        ) {
            movingVehicles.push(vehicle);
        }
        isFirstVehicle[startRoad] = false;
    }
    drawBackground(ctx);
    drawStationaryVehicles(ctx, step, new Set(movingVehicles));
    await animateVehicles(ctx, step, movingVehicles);
}

function drawStationaryVehicles(
    ctx: CanvasRenderingContext2D,
    step: SimulationStep,
    vehiclesToSkip: Set<Vehicle>
): void {
    let nextVehiclePosition: Record<Road, Vector> = calculateFirstVehiclePosition(ctx.canvas);
    let isFirstVehicle: Record<Road, boolean> = {
        north: true,
        south: true,
        east: true,
        west: true
    };
    for (const vehicle of step.vehicles) {
        const startRoad: Road = vehicle.direction.start;
        const x: number = nextVehiclePosition[startRoad].x;
        const y: number = nextVehiclePosition[startRoad].y;
        if (!vehiclesToSkip.has(vehicle)) {
            drawVehicle(ctx, x, y);
        }
        isFirstVehicle[startRoad] = false;
        switch (startRoad) {
            case "north":
                nextVehiclePosition[startRoad].y -= 2 * vehicleRadius + 10;
                break;
            case "south":
                nextVehiclePosition[startRoad].y += 2 * vehicleRadius + 10;
                break;
            case "east":
                nextVehiclePosition[startRoad].x += 2 * vehicleRadius + 10;
                break;
            case "west":
                nextVehiclePosition[startRoad].x -= 2 * vehicleRadius + 10;
                break;
        }
    }
}

async function animateVehicles(
    ctx: CanvasRenderingContext2D,
    step: SimulationStep,
    movingVehicles: Vehicle[]
) {
    const startPositions: Record<string, Vector> = {};
    const endPositions: Record<string, Vector> = {};
    const curveData: Record<string, { control: Vector; isCurve: boolean }> = {};
    for (const vehicle of movingVehicles) {
        const { startRoad, endRoad } = { startRoad: vehicle.direction.start, endRoad: vehicle.direction.end };
        startPositions[startRoad] = calculateFirstVehiclePosition(ctx.canvas)[startRoad];
        endPositions[startRoad] = calculateVehicleEndPosition(ctx.canvas)[endRoad];
        const start = startPositions[startRoad];
        const end = endPositions[startRoad];
        curveData[startRoad + "-" + endRoad] = getVehicleCurvePoints(start, end, startRoad, endRoad);
    }
    const duration = 1500; // ms
    const startTime = performance.now();
    const skipMoving = new Set(movingVehicles);
    await new Promise<void>((resolve) => {
        function animateFrame(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            drawBackground(ctx);
            drawStationaryVehicles(ctx, step, skipMoving);
            for (const vehicle of movingVehicles) {
                const { startRoad, endRoad } = {
                    startRoad: vehicle.direction.start,
                    endRoad: vehicle.direction.end
                };
                const start = startPositions[startRoad];
                const end = endPositions[startRoad];
                const { control, isCurve } = curveData[startRoad + "-" + endRoad];
                const pos = interpolateVehiclePosition(start, control, end, progress, isCurve);
                drawVehicle(ctx, pos.x, pos.y, "#0f0");
            }
            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(animateFrame);
    });
}
