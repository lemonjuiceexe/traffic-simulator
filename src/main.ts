import { type Road, type SimulationStep } from "../server/types.ts";
import {
    calculateFirstVehiclePosition,
    drawBackground,
    drawVehicle,
    type Vector,
    vehicleRadius
} from "./draw.ts";
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
            let nextVehiclePosition: Record<Road, Vector> = calculateFirstVehiclePosition(canvas);
            console.log(canvas.width, canvas.height);
            console.log(nextVehiclePosition);
            for (const vehicle of step.vehicles) {
                const startRoad: Road = vehicle.direction.start;
                const endRoad: Road = vehicle.direction.end;
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
        }, 2000 * i);
        // await new Promise((r) => setTimeout(r, 2000));
        // break;
    }
}
