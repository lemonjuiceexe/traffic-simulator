import { type Road, type SimulationStep } from "../shared/types.ts";
import {
    calculateFirstVehiclePosition,
    drawBackground,
    drawVehicle,
    type Vector,
    vehicleRadius
} from "./draw.ts";
import { directionsAreEqual } from "../shared/helpers.ts";
import "./style.css";

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
        setTimeout(() => {
            drawBackground(ctx);
            drawStationaryVehicles(step, canvas);
        }, 2000 * i);
        // await new Promise((r) => setTimeout(r, 2000));
        // break;
    }
}
function drawStationaryVehicles(step: SimulationStep, canvas: HTMLCanvasElement) {
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    let nextVehiclePosition: Record<Road, Vector> = calculateFirstVehiclePosition(canvas);
    let isFirstVehicle: Record<Road, boolean> = {
        north: true,
        south: true,
        east: true,
        west: true
    };
    for (const vehicle of step.vehicles) {
        if (
            !isFirstVehicle[vehicle.direction.start] ||
            !step.greenDirections.some((greenDirection) =>
                directionsAreEqual(greenDirection, vehicle.direction)
            )
        ) {
            continue;
        }
        const startRoad: Road = vehicle.direction.start;
        const x: number = nextVehiclePosition[startRoad].x;
        const y: number = nextVehiclePosition[startRoad].y;
        drawVehicle(ctx, x, y);
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
