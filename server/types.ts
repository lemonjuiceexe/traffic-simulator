export type Road = "north" | "east" | "south" | "west";
export type Vehicle = {
    id: string;
    endRoad: Road;
    arrivedAtStep: number;
};
export type IntersectionState = {
    currentStep: number;
    north: Vehicle[];
    east: Vehicle[];
    south: Vehicle[];
    west: Vehicle[];
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
