class Classe {
  constructor() {}

  public distanceMatrix: number[][] = [
    [99999, 2, 11, 10, 8, 7, 6, 99999],
    [6, 99999, 1, 8, 8, 4, 6, 6],
    [5, 12, 99999, 11, 8, 12, 3, 5],
    [11, 9, 10, 99999, 1, 9, 8, 11],
    [11, 11, 9, 4, 99999, 2, 10, 11],
    [12, 8, 5, 2, 11, 99999, 11, 12],
    [10, 11, 12, 10, 9, 12, 99999, 10],
    [99999, 2, 11, 10, 8, 7, 6, 99999],
  ];

  public numberOfVehicles: number = 2;
  public numberOfCities: number = 7;
  public maxDistance: number = 60;

  // ALGORITHM 1
  public generatePopulation(n: number, Dmax: number, Ps: number): Chromosome[] {
    const population: Chromosome[] = [];

    for (let i = 0; i < Ps; i++) {
      const firstCity = 1;
      const currentChromosome: Chromosome = {
        route: [firstCity],
        distance: 0,
      };

      const remainingCities: number[] = [];

      for (let j = 2; j <= n; j++) {
        remainingCities.push(j);
      }

      let p = firstCity;

      for (let j = 2; j <= n; j++) {
        const randomIndex = Math.floor(Math.random() * remainingCities.length);
        const q = remainingCities[randomIndex];
        const distanceToQ = this.calculateDistance(p, q); // Replace 'calculateDistance' with your distance calculation function

        if (currentChromosome.distance + distanceToQ <= Dmax) {
          currentChromosome.route.push(q);
          currentChromosome.distance += distanceToQ;
          remainingCities.splice(randomIndex, 1); // Remove the selected city from the remaining cities list
        } else {
          currentChromosome.route.push(firstCity); // Add a dummy depot (city q)
          currentChromosome.distance += this.calculateDistance(p, firstCity); // Distance from last city to the depot
          p = q; // Set city q as the new current city
        }
      }

      population.push(currentChromosome);
    }

    // this.improvePopulation(population); // Apply 2-opt local search to improve the population
    return population;
  }

  public calculateDistance(city1: number, city2: number): number {
    if (city1 === city2) {
      return 0; // A distância da cidade para ela mesma é 0
    }

    // Lembrando que os índices da matriz começam em 0, enquanto as cidades começam em 1
    const index1 = city1 - 1;
    const index2 = city2 - 1;

    // Acessamos a distância entre as duas cidades através da matriz de distâncias
    return this.distanceMatrix[index1][index2];
  }

  public improvePopulation(population: Chromosome[]): Chromosome[] {
    for (let i = 0; i < population.length; i++) {
      population[i] = this.twoOptLocalSearch(population[i]);
    }

    return population;
  }

  public twoOptLocalSearch(chromosome: Chromosome): Chromosome {
    let improvement = true;

    while (improvement) {
      improvement = false;

      for (let i = 0; i < chromosome.route.length - 1; i++) {
        for (let j = i + 1; j < chromosome.route.length; j++) {
          const newRoute = this.twoOptSwap(chromosome.route, i, j);

          const newDistance = this.calculateRouteDistance(newRoute);

          if (newDistance < chromosome.distance) {
            chromosome.route = newRoute;
            chromosome.distance = newDistance;
            improvement = true;
          }
        }
      }
    }

    return chromosome;
  }

  public twoOptSwap(route: number[], i: number, j: number): number[] {
    const newRoute = route.slice(0, i);
    for (let k = j; k >= i; k--) {
      newRoute.push(route[k]);
    }
    for (let k = j + 1; k < route.length; k++) {
      newRoute.push(route[k]);
    }
    return newRoute;
  }

  public calculateRouteDistance(route: number[]): number {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const city1 = route[i] - 1;
      const city2 = route[i + 1] - 1;

      distance += this.distanceMatrix[city1][city2];
    }
    const lastCity = route[route.length - 1] - 1;
    const firstCity = route[0] - 1;
    distance += this.distanceMatrix[lastCity][firstCity]; // Volta ao depósito
    return distance;
  }

  public selectParents(Ps: number, population: Chromosome[]): Chromosome[] {
    const totalFitness = population.reduce(
      (sum, chromosome) => sum + 1 / chromosome.distance,
      0
    );
    const probabilities: number[] = population.map(
      (chromosome) => 1 / chromosome.distance / totalFitness
    );
    const cumulativeProbabilities: number[] = probabilities.reduce(
      (acc, probability, index) =>
        acc.concat(index === 0 ? probability : acc[index - 1] + probability),
      []
    );

    const newPopulation: Chromosome[] = [];

    for (let i = 0; i < Ps; i++) {
      const r = Math.random();

      for (let j = 0; j < cumulativeProbabilities.length; j++) {
        if (j === 0 && r <= cumulativeProbabilities[j]) {
          newPopulation.push({ ...population[j] });
          break;
        } else if (
          r > cumulativeProbabilities[j - 1] &&
          r <= cumulativeProbabilities[j]
        ) {
          newPopulation.push({ ...population[j] });
          break;
        }
      }
    }

    return newPopulation;
  }

  public generateOffspring(
    Dmax: number,
    parent1: Chromosome,
    parent2: Chromosome
  ): Chromosome {
    const n = parent1.route.length - 1; // Total de cidades (excluindo o depósito)
    const offspringRoute: number[] = [1]; // Inicia com o depósito (cidade 1)

    let p = 1; // Cidade atual, começa no depósito

    for (let i = 2; i <= n; i++) {
      const parent1NextCityIndex =
        parent1.route.indexOf(offspringRoute[offspringRoute.length - 1]) + 1;
      const parent2NextCityIndex =
        parent2.route.indexOf(offspringRoute[offspringRoute.length - 1]) + 1;

      // const parent1NextCity = parent1.route[parent1NextCityIndex];
      // const parent2NextCity = parent2.route[parent2NextCityIndex];

      let selectedCity;

      const parent1NextCity =
        parent1NextCityIndex < parent1.route.length
          ? parent1.route[parent1NextCityIndex]
          : undefined;
      const parent2NextCity =
        parent2NextCityIndex < parent2.route.length
          ? parent2.route[parent2NextCityIndex]
          : undefined;

      if (!parent2NextCity || offspringRoute.includes(parent2NextCity)) {
        selectedCity = this.findClosestCity(i, parent2.route, offspringRoute);
      } else {
        // Ambos os pais têm a cidade, selecionamos o mais próximo
        const distanceFromParent1 =
          this.distanceMatrix[offspringRoute[offspringRoute.length - 1] - 1][
            parent1NextCity - 1
          ];
        const distanceFromParent2 =
          this.distanceMatrix[offspringRoute[offspringRoute.length - 1] - 1][
            parent2NextCity - 1
          ];

        selectedCity =
          distanceFromParent1 < distanceFromParent2
            ? parent1NextCity
            : parent2NextCity;
      }
      // if (
      //   parent1NextCityIndex < parent1.route.length &&
      //   !offspringRoute.includes(parent1NextCity)
      // ) {
      //   selectedCity = parent1NextCity;
      // } else if (
      //   parent2NextCityIndex < parent2.route.length &&
      //   !offspringRoute.includes(parent2NextCity)
      // ) {
      //   selectedCity = parent2NextCity;
      // } else {
      //   // Nenhuma cidade legítima é encontrada no pai atual, então examinamos desde o início do pai
      //   for (let j = 1; j < parent1.route.length; j++) {
      //     if (!offspringRoute.includes(parent1.route[j])) {
      //       selectedCity = parent1.route[j];
      //       break;
      //     }
      //   }
      // }

      if (selectedCity) {
        const distanceFromParent1 =
          this.distanceMatrix[offspringRoute[offspringRoute.length - 1] - 1][
            selectedCity - 1
          ];
        const distanceFromParent2 =
          this.distanceMatrix[offspringRoute[offspringRoute.length - 1] - 1][
            parent2NextCity - 1
          ];

        if (distanceFromParent1 < distanceFromParent2) {
          offspringRoute.push(selectedCity);
        } else {
          offspringRoute.push(parent2NextCity);
        }

        const newRouteDistance = this.calculateRouteDistance(offspringRoute);
        if (newRouteDistance > Dmax) {
          offspringRoute.pop(); // Remove a última cidade adicionada
          offspringRoute.push(1); // Adiciona o depósito como cidade "fictícia"
        }
      }

      p = offspringRoute[offspringRoute.length - 1]; // Atualiza a cidade atual

      console.log({ offspringRoute });
      console.log({ p });
    }

    return new Chromosome(
      offspringRoute,
      this.calculateRouteDistance(offspringRoute)
    );
  }

  public findClosestCity(
    currentCity: number,
    routes: number[],
    offspringRoute: number[]
  ): number {
    let closestCity;
    let minDistance = Number.MAX_VALUE;

    for (const city of routes) {
      const distance = this.distanceMatrix[currentCity - 1][city - 1];
      if (distance < minDistance && !offspringRoute.includes(city)) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return closestCity!;
  }
}

class Chromosome {
  route: number[]; // Array representing the route of the vehicle
  distance: number; // Distance of the route

  constructor(route: number[], distance: number) {
    this.route = route;
    this.distance = distance;
  }
}

const n = 7; // Total number of cities (sem depósito)
const Dmax = 60; // Maximum distance allowed for each route
const populationSize = 10; // Size of the population

const ronaldo = new Classe();

const population = ronaldo.generatePopulation(n, Dmax, populationSize);

console.log({ population });

const improvedPopulation = ronaldo.improvePopulation(population);

console.log({ improvedPopulation });

const parentes = ronaldo.selectParents(2, improvedPopulation);

console.log({ parentes });

const parent1 = new Chromosome([1, 2, 4, 8, 3, 6, 5, 7], 75); // Cromossomo do pai 1 (rota do veículo)
const parent2 = new Chromosome([1, 3, 8, 5, 2, 7, 4, 6], 72); // Cromossomo do pai 2 (rota do veículo)

console.log({ exemplo: parentes[0] });
console.log({ parent1 });

const offspring = ronaldo.generateOffspring(Dmax, parent1, parent2);

console.log({ offspring });
