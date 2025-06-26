export type Road = "north" | "east" | "south" | "west";
export type Direction = {
    start: Road;
    end: Road;
};
export type Vehicle = {
    id: string;
    direction: Direction;
    arrivedAtStep: number;
};
export type IntersectionState = {
    currentStep: number;
    vehicles: Vehicle[];
};

export type AddVehicleCommand = {
    type: "addVehicle";
    vehicleId: string;
    startRoad: Road;
    endRoad: Road;
};
type StepCommand = {
    type: "step";
};
export type InputCommand = AddVehicleCommand | StepCommand;
