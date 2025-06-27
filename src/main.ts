import { type OutputData } from "../server/types.ts";
import { drawBackground } from "./draw.ts";
import "./style.css";

startSimulation();

function startSimulation(): void {
    fetch("/output.json")
        .then((res: Response): Promise<OutputData> => res.json())
        .then((data: OutputData): void => {
            renderSimulation(data);
        });
}
function renderSimulation(data: OutputData): void {
    const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    drawBackground(ctx);
}
