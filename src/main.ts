import { type Road, type SimulationStep, type Vehicle } from "../server/types.ts";
import {
    calculateFirstVehiclePosition,
    calculateVehicleEndPosition,
    drawBackground,
    drawVehicle,
    getVehiclePath,
    interpolateVehiclePosition,
    type PathSegment,
    type Vector,
    vehicleRadius
} from "./draw.ts";
import { directionsAreEqual } from "../server/helpers.ts";
import "./style.css";

const animationDuration = 1500;
const delayBetweenSteps = 500;
const currentStepSpan: HTMLSpanElement = document.querySelector("#step")!;
const nextStepButton: HTMLButtonElement = document.querySelector("#next-step-button")!;
const restartButton: HTMLButtonElement = document.querySelector("#restart-button")!;
restartButton.addEventListener("click", restartSimulation);

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
        // await new Promise((r) => setTimeout(r, delayBetweenSteps));
        await waitForButtonClick(nextStepButton);
    }
}
function waitForButtonClick(buttonElement: HTMLButtonElement): Promise<void> {
    return new Promise((resolve) =>
        buttonElement.addEventListener("click", () => {
            resolve();
        })
    );
}
function restartSimulation(): void {
    const ctx = (document.querySelector("#canvas") as HTMLCanvasElement)!.getContext("2d")!;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    nextStepButton.disabled = false;
    startSimulation();
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
    const paths: Record<string, PathSegment[]> = {};
    for (const vehicle of movingVehicles) {
        const startRoad = vehicle.direction.start;
        const endRoad = vehicle.direction.end;
        paths[startRoad + "-" + endRoad] = getVehiclePath(ctx, startRoad, endRoad);
    }

    const startTime = performance.now();
    await new Promise<void>((resolve) => {
        function animateFrame(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            drawBackground(ctx);
            drawStationaryVehicles(ctx, step, new Set(movingVehicles));
            for (const vehicle of movingVehicles) {
                const segments: PathSegment[] = paths[vehicle.direction.start + "-" + vehicle.direction.end];
                const segmentLengths: number[] = segments.map((segment) => {
                    const dx = segment.end.x - segment.start.x;
                    const dy = segment.end.y - segment.start.y;
                    return Math.sqrt(dx * dx + dy * dy);
                });
                const pathLength = segmentLengths.reduce((a, b) => a + b, 0);
                const totalDistance = progress * pathLength;
                let vehiclePosition: Vector = { ...segments[0].start };
                if (segments.length > 0) {
                    let distanceLeft = totalDistance;
                    for (let i = 0; i < segments.length; ++i) {
                        if (segmentLengths[i] === 0) continue;
                        if (distanceLeft <= segmentLengths[i]) {
                            const seg = segments[i];
                            const localT = distanceLeft / segmentLengths[i];
                            vehiclePosition = {
                                x: seg.start.x + (seg.end.x - seg.start.x) * localT,
                                y: seg.start.y + (seg.end.y - seg.start.y) * localT
                            };
                            break;
                        }
                        distanceLeft -= segmentLengths[i];
                    }
                }
                drawVehicle(ctx, vehiclePosition.x, vehiclePosition.y, "#0f0");
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
