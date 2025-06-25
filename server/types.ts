type Road = "North" | "South" | "East" | "West";
type AddVehicleCommand = {
    type: "addVehicle";
    vehicleId: string;
    startRoad: Road;
    endRoad: Road;
};
type StepCommand = {
    type: "step";
};

export type InputCommand = AddVehicleCommand | StepCommand;
