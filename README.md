# Traffic simulator
This is a simple simulation of a traffic management system on a four-way intersection. Both server and client are written in TypeScript. In it's current state it is not a production-ready application.
## Installation
Make sure you have Node.js and npm installed. Then clone the repository and install the dependencies:
```bash
git clone https://github.com/lemonjuiceexe/traffic-simulator.git
cd traffic-simulator
npm install
```
## Usage
You can use `npm run workflow` to run both the server and the client. The client will be available at Vite's default localhost port (usually `http://localhost:5173`). In the client you can visualise the traffic flow calculated by the server. 

You can specify input and output files for the server by using `--inputFile` and `--outputFile` flags. If you don't specify them, the server will use `input.json` and `output.json` respectively. Due to how npm scripts work, the flags must be preceeded by double-double dash `-- --` (sic!):
```bash
npm run workflow -- -- --inputFile myInput.json --outputFile myOutput.json
```
### Input and output files format
The input file should be a JSON file structured as follows:
```json
{
  "commands": [
    {
      "type": "addVehicle",
      "vehicleId": "uturn1",
      "startRoad": "north",
      "endRoad": "north"
    },
    {
      "type": "step"
    },
    ...
  ]
}
```

It's an array of commands for the simulation. Each command can be of type:
- `step` - advances the simulation by one step. One car from each lane with green light will pass through the intersection. It takes no other parameters than type.
- `addVehicle` - adds a vehicle to the simulation. It requires:
    - `vehicleId` - a __unique identifier__ for the vehicle
    - `startRoad` - the road the vehicle is coming from. It can be one of "north", "south", "east", "west".
    - `endRoad` - the road the vehicle is going to. It can be one of "north", "south", "east", "west". If the vehicle is making a U-turn, endRoad should be the same as startRoad.

The output file will contain an array of ids of the vehicles that left the intersection each step:
```json
{
  "stepStatuses": [
    {
      "leftVehicles": [
        "vehicle1",
        "vehicle2"
      ]
    },
    {
      "leftVehicles": []
    },
    {
      "leftVehicles": [
        "vehicle3"
      ]
    },
    {
      "leftVehicles": [
        "vehicle4"
      ]
    }
  ]
}
```
The array can be empty if no vehicles left the intersection in that step.

## The algorithm
The traffic management algorithm is inspired by [1]. It takes into account the number of cars waiting at each lane and the time they have been waiting for. It chooses such a combination of not-conflicting green lights that maximises the sum of wait times of passing cars. The assumption is that each green cycle one car can go through from each lane. This way we ensure that the most crowded lanes get their deserved attention while not restricting other lanes for too long.

The `/server/directions.ts` file contains the definitions for non-conflicting directions. The assumption is that a vehicle can always turn right, similarly to  models described in [1], [2].

## Additional information
In the visualisation, the color of a vehicle indicates whether it has a green or a red light. A small arrowhead indicates the direction that the vehicle is going towards.

CI is set up using GitHub Actions to run tests on every push and pull request to the `main` branch. The tests are written in vitest and can be run locally using `npm run test`.

## Bibliography
[1] Rida, N., Ouadoud, M., Hasbi, A., & Chebli, S. (2018). Adaptive Traffic Light Control System Using Wireless Sensors Networks. 2018 IEEE 5th International Congress on Information Science and Technology (CiSt). doi:10.1109/cist.2018.8596620 

[2] Zhou, B., Cao, J., Zeng, X., & Wu, H. (2010). Adaptive Traffic Light Control in Wireless Sensor Network-Based Intelligent Transportation System. 2010 IEEE 72nd Vehicular Technology Conference - Fall. doi:10.1109/vetecf.2010.5594435 