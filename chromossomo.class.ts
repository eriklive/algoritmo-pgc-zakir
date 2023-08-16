export class Chromosome {
  route: number[]; // Array representing the route of the vehicle
  distance: number; // Distance of the route
  fitness: number;
  probabilidade: number;
  probabilidadeAcumulada: number;

  constructor(route: number[], distance: number) {
    this.route = route;
    this.distance = distance;
    this.fitness = 1 / distance;
  }
}
