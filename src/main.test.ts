import { describe, test, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import {
    renderSimulation,
    restartSimulation,
    toggleAutoplay,
    waitForButtonClick,
    renderStep,
    animateVehicles,
    drawStationaryVehicles,
    autoplay,
    initUI
} from "./main.ts";
import type { SimulationStep, Vehicle } from "../server/types";
import { calculateFirstVehiclePosition, drawBackground, drawVehicle } from "./draw";

vi.mock("./draw", () => ({
    drawBackground: vi.fn(),
    drawVehicle: vi.fn(),
    getVehiclePath: vi.fn(() => [{ start: { x: 0, y: 0 }, end: { x: 100, y: 100 } }]),
    calculateFirstVehiclePosition: vi.fn(() => ({
        north: { x: 100, y: 200 },
        south: { x: 100, y: 400 },
        east: { x: 300, y: 100 },
        west: { x: 50, y: 100 }
    })),
    vehicleRadius: 10
}));

const mockElements = () => {
    const mockContext = {
        clearRect: vi.fn(),
        canvas: { width: 800, height: 600 }
    };

    const mockCanvas = {
        getContext: vi.fn(() => mockContext),
        width: 800,
        height: 600
    };

    const elements = {
        canvas: mockCanvas,
        context: mockContext,
        currentStepSpan: { textContent: "" },
        nextStepButton: { disabled: false, addEventListener: vi.fn() },
        restartButton: { disabled: false, addEventListener: vi.fn() },
        autoplayCheckbox: {
            checked: false,
            disabled: false,
            addEventListener: vi.fn()
        }
    };

    document.querySelector = vi.fn((selector) => {
        if (selector === "#canvas") return elements.canvas;
        if (selector === "#step") return elements.currentStepSpan;
        if (selector === "#next-step-button") return elements.nextStepButton;
        if (selector === "#restart-button") return elements.restartButton;
        if (selector === "#autoplay-checkbox") return elements.autoplayCheckbox;
        return null;
    });

    return elements;
};

describe("main.ts", () => {
    let elements: ReturnType<typeof mockElements>;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        elements = mockElements();
        ctx = elements.canvas.getContext() as unknown as CanvasRenderingContext2D;
        initUI();
        vi.useFakeTimers();

        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve([])
            })
        ) as Mock;

        global.requestAnimationFrame = vi.fn((callback) => {
            setTimeout(() => callback(Date.now()), 0);
            return 1;
        });

        vi.spyOn(performance, "now").mockImplementation(() => Date.now());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe("Functions using simulation step", () => {
        const mockStep: SimulationStep = {
            vehicles: [
                {
                    id: "v1",
                    direction: { start: "north", end: "south" }
                } as Vehicle
            ],
            greenDirections: [{ start: "north", end: "south" }]
        };

        test("waitForButtonClick resolves on button click", async () => {
            const mockButton = {
                disabled: false,
                addEventListener: vi.fn(),
                click: vi.fn(),
                focus: vi.fn()
            } as unknown as HTMLButtonElement;

            const promise = waitForButtonClick([mockButton]);

            const mockAddEventListener = mockButton.addEventListener as Mock;
            const clickHandler = mockAddEventListener.mock.calls[0][1];
            clickHandler();

            await expect(promise).resolves.toBeUndefined();
        });

        test("toggleAutoplay updates state correctly", () => {
            toggleAutoplay();
            expect(autoplay).toBe(true);
            expect(elements.autoplayCheckbox.checked).toBe(true);
            expect(elements.nextStepButton.disabled).toBe(true);

            toggleAutoplay();
            expect(autoplay).toBe(false);
            expect(elements.autoplayCheckbox.checked).toBe(false);
            expect(elements.nextStepButton.disabled).toBe(false);
        });

        test("drawStationaryVehicles skips moving vehicles", () => {
            const vehiclesToSkip = new Set<Vehicle>([mockStep.vehicles[0]]);
            drawStationaryVehicles(ctx, mockStep, vehiclesToSkip);
            expect(calculateFirstVehiclePosition).toHaveBeenCalled();
            expect(drawVehicle).not.toHaveBeenCalled();
        });
    });

    describe("Animation Functions", () => {
        const mockVehicle: Vehicle = {
            id: "v1",
            direction: { start: "north", end: "south" },
            arrivedAtStep: 0
        };

        test("animateVehicles completes animation", async () => {
            const mockStep: SimulationStep = {
                vehicles: [mockVehicle],
                greenDirections: [mockVehicle.direction]
            };

            let animationCallback: ((time: number) => void) | null = null;
            global.requestAnimationFrame = vi.fn((callback) => {
                animationCallback = callback;
                setTimeout(() => callback(Date.now() + 1500), 0);
                return 1;
            });

            const promise = animateVehicles(ctx, mockStep, [mockVehicle]);
            await vi.runAllTimersAsync();
            await expect(promise).resolves.toBeUndefined();
        });

        test("renderStep handles vehicle movement", async () => {
            const step: SimulationStep = {
                vehicles: [mockVehicle],
                greenDirections: [mockVehicle.direction]
            };

            const drawStationaryVehiclesSpy = vi.spyOn({ drawStationaryVehicles }, "drawStationaryVehicles");

            let currentTime = 1000;
            vi.spyOn(performance, "now").mockImplementation(() => currentTime);

            global.requestAnimationFrame = vi.fn((callback) => {
                setTimeout(() => {
                    currentTime += 1600;
                    callback(currentTime);
                }, 0);
                return 1;
            });

            const promise = renderStep(ctx, step);
            await vi.runAllTimersAsync();
            await promise;

            expect(drawBackground).toHaveBeenCalled();
            expect(calculateFirstVehiclePosition).toHaveBeenCalled();
            expect(promise).resolves.toBeUndefined();

            drawStationaryVehiclesSpy.mockRestore();
        });
    });

    describe("Simulation Flow", () => {
        const mockData: SimulationStep[] = [
            { vehicles: [], greenDirections: [] },
            { vehicles: [], greenDirections: [] }
        ];

        test("restartSimulation resets state", () => {
            restartSimulation();
            expect(elements.context.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
            expect(elements.nextStepButton.disabled).toBe(false);
            expect(elements.autoplayCheckbox.disabled).toBe(false);
            expect(elements.currentStepSpan.textContent).toBe("0");
        });

        test("renderSimulation progresses through steps", async () => {
            toggleAutoplay();

            global.requestAnimationFrame = vi.fn((callback) => {
                setTimeout(() => callback(Date.now() + 2000), 0);
                return 1;
            });

            const promise = renderSimulation(mockData);
            await vi.runAllTimersAsync();
            await promise;

            expect(elements.currentStepSpan.textContent).toBe("2");
        });
    });
});
