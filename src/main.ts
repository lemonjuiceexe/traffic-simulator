import { type Road, type SimulationStep, type Vehicle } from "../server/types.ts";
import {
    calculateFirstVehiclePosition,
    drawBackground,
    drawVehicle,
    getVehiclePath,
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
const autoplayCheckbox: HTMLInputElement = document.querySelector("#autoplay-checkbox")!;
restartButton.addEventListener("click", restartSimulation);
autoplayCheckbox.addEventListener("change", toggleAutoplay);
autoplayCheckbox.checked = false;

let autoplay: boolean = false;

startSimulation();

function startSimulation(): void {
    fetch("/output.json")
        .then((res: Response): Promise<SimulationStep[]> => res.json())
        .then((data: SimulationStep[]): void => {
            renderSimulation(data);
        });
}

async function renderSimulation(data: SimulationStep[]): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    drawBackground(ctx);
    for (let i: number = 0; i < data.length; i++) {
        const step: SimulationStep = data[i];
        currentStepSpan.textContent = `${i}`;
        if (!autoplay) {
            await waitForButtonClick([nextStepButton, autoplayCheckbox]);
        }
        // not equivalent to else{} because the state of autoplay can change
        if (autoplay) {
            await new Promise((r) => setTimeout(r, delayBetweenSteps));
        }
        await renderStep(ctx, step);
    }
    if (autoplay) {
        autoplay = false;
        autoplayCheckbox.disabled = true;
        restartButton.disabled = false;
        currentStepSpan.textContent = `${data.length}`;
    }
    nextStepButton.disabled = true;
}
function waitForButtonClick(buttons: (HTMLButtonElement | HTMLInputElement)[]): Promise<void> {
    return new Promise((resolve) =>
        buttons.forEach((buttonElement) =>
            buttonElement.addEventListener("click", () => {
                resolve();
            })
        )
    );
}
function restartSimulation(): void {
    const ctx = (document.querySelector("#canvas") as HTMLCanvasElement)!.getContext("2d")!;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    nextStepButton.disabled = false;
    autoplay = false;
    autoplayCheckbox.checked = false;
    autoplayCheckbox.disabled = false;
    currentStepSpan.textContent = "0";
    startSimulation();
}
function toggleAutoplay(): void {
    autoplay = !autoplay;
    autoplayCheckbox.checked = autoplay;
    if (autoplay) {
        autoplayCheckbox.checked = true;
        nextStepButton.disabled = true;
    } else {
        autoplayCheckbox.checked = false;
        nextStepButton.disabled = false;
    }
}

async function renderStep(ctx: CanvasRenderingContext2D, step: SimulationStep) {
    restartButton.disabled = true;
    const movingVehicles: Vehicle[] = [];
    let isFirstVehicle: Record<Road, boolean> = { north: true, south: true, east: true, west: true };
    let movingRoads: Record<Road, boolean> = { north: false, south: false, east: false, west: false };
    for (const vehicle of step.vehicles) {
        const startRoad: Road = vehicle.direction.start;
        if (
            isFirstVehicle[startRoad] &&
            step.greenDirections.some((greenDirection) =>
                directionsAreEqual(greenDirection, vehicle.direction)
            )
        ) {
            movingRoads[startRoad] = true;
        }
        isFirstVehicle[startRoad] = false;
    }
    for (const vehicle of step.vehicles) {
        const startRoad: Road = vehicle.direction.start;
        if (movingRoads[startRoad]) {
            movingVehicles.push(vehicle);
        }
    }
    drawBackground(ctx);
    drawStationaryVehicles(ctx, step, new Set(movingVehicles));
    await animateVehicles(ctx, step, movingVehicles);
    if (!autoplay) restartButton.disabled = false;
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
            drawVehicle(ctx, x, y, vehicle.direction, true);
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
    let vehicleIndexes: Record<Road, number> = { north: 0, south: 0, east: 0, west: 0 };
    let positionsOnRoad: Record<Road, Vector[]> = { north: [], south: [], east: [], west: [] };
    for (const vehicle of movingVehicles) {
        const startRoad = vehicle.direction.start;
        if (vehicleIndexes[startRoad] === 0) {
            positionsOnRoad[startRoad].push(calculateFirstVehiclePosition(ctx.canvas)[startRoad]);
        } else {
            const previousPosition: Vector =
                positionsOnRoad[startRoad][positionsOnRoad[startRoad].length - 1];
            const nextPosition: Vector = {
                x:
                    previousPosition.x +
                    (["north", "south"].includes(startRoad) ? 0 : 2 * vehicleRadius + 10) *
                        (startRoad === "east" ? 1 : -1),
                y:
                    previousPosition.y +
                    (["east", "west"].includes(startRoad) ? 0 : 2 * vehicleRadius + 10) *
                        (startRoad === "south" ? 1 : -1)
            };
            positionsOnRoad[startRoad].push(nextPosition);
        }
        vehicleIndexes[startRoad]++;
    }
    vehicleIndexes = { north: 0, south: 0, east: 0, west: 0 };
    for (const vehicle of movingVehicles) {
        const [startRoad, endRoad] = [vehicle.direction.start, vehicle.direction.end];
        if (vehicleIndexes[startRoad] === 0) {
            paths[`${startRoad}-${endRoad}`] = getVehiclePath(ctx, startRoad, endRoad);
        } else {
            paths[`${vehicle.id}`] = [
                {
                    start: positionsOnRoad[startRoad][vehicleIndexes[startRoad]],
                    end: positionsOnRoad[startRoad][vehicleIndexes[startRoad] - 1]
                }
            ];
        }
        vehicleIndexes[startRoad]++;
    }

    const startTime = performance.now();
    await new Promise<void>((resolve) => {
        function animateFrame(now: number) {
            let firstVehicles: Record<Road, Vehicle | null> = {
                north: null,
                south: null,
                east: null,
                west: null
            };
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            drawBackground(ctx);
            drawStationaryVehicles(ctx, step, new Set(movingVehicles));
            for (const vehicle of movingVehicles) {
                const segments: PathSegment[] =
                    firstVehicles[vehicle.direction.start] === null
                        ? paths[vehicle.direction.start + "-" + vehicle.direction.end]
                        : paths[vehicle.id];
                if (firstVehicles[vehicle.direction.start] === null) {
                    firstVehicles[vehicle.direction.start] = vehicle;
                }
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
                drawVehicle(
                    ctx,
                    vehiclePosition.x,
                    vehiclePosition.y,
                    vehicle.direction,
                    ![
                        firstVehicles.east,
                        firstVehicles.west,
                        firstVehicles.north,
                        firstVehicles.south
                    ].includes(vehicle)
                );
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
