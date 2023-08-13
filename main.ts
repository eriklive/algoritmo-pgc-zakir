class Classe {
  constructor() { }

  /**
   * No artigo ele usa "99999" como distancia. Aqui, por algum motivo, ao usar isso,
   * o ultimo ponto (8 -> origem) estora a dist;
   */
  // public distanceMatrix: number[][] = [
  //   [0, 2, 11, 10, 8, 7, 6, 0],
  //   [6, 0, 1, 8, 8, 4, 6, 6],
  //   [5, 12, 0, 11, 8, 12, 3, 5],
  //   [11, 9, 10, 0, 1, 9, 8, 11],
  //   [11, 11, 9, 4, 0, 2, 10, 11],
  //   [12, 8, 5, 2, 11, 0, 11, 12],
  //   [10, 11, 12, 10, 9, 12, 0, 10],
  //   [0, 2, 11, 10, 8, 7, 6, 0],
  // ];

  public distanceMatrix: number[][] = [
    [99999, 12, 11, 10, 18, 7, 6],
    [16, 99999, 10, 8, 8, 4, 6],
    [15, 12, 99999, 11, 8, 12, 3],
    [11, 9, 10, 99999, 1, 9, 8],
    [11, 11, 9, 4, 99999, 2, 10],
    [12, 8, 5, 2, 11, 99999, 11],
    [10, 11, 12, 10, 9, 12, 99999],
  ];

  public gerarPopulacoes(
    numeroDeCidades: number,
    Dmax: number,
    Ps: number,
    matrizDeDistancias: number[][],
    numeroDeVeiculos: number
  ): Chromosome[] {
    const population: Chromosome[] = [];

    for (let i = 0; i < Ps; i++) {
      const route: number[] = [1]; // Inicia com o depósito (cidade 1)

      let distanciaDaRota = 0;

      /**
       * O filter é necessário para remover o depósito da lista de cidades restantes
       */
      const cidadesRestantes = Array.from(
        { length: numeroDeCidades },
        (_, i) => i + 1
      ).filter((cidade) => cidade !== 1);

      let dummyCity = numeroDeCidades + 1; // Inicia o valor da "dummy city" com o próximo número após o número de clientes (n)

      for (let j = 2; j <= numeroDeCidades; j++) {
        const indexAleatorio = Math.floor(
          Math.random() * cidadesRestantes.length
        );

        const cidadeSelecionada = cidadesRestantes[indexAleatorio];
        const distanciaNova = this.calcularRotaAoGerarPopulacao(
          [...route, cidadeSelecionada],
          matrizDeDistancias,
          numeroDeCidades
        );

        if (distanciaNova <= Dmax) {
          route.push(cidadeSelecionada);
          distanciaDaRota = distanciaNova;
        } else {
          /**
           * Verifica se existem "dummy cities" (veículos) disponíveis
           * para a realização da rota. Aqui há a possibilidade de não existir e a rota
           * não cobrir todas as cidades
           */
          if (dummyCity <= numeroDeCidades + numeroDeVeiculos - 1) {
            route.push(dummyCity);
            dummyCity++;
            distanciaDaRota = 0;

            route.push(cidadeSelecionada);
          }
        }

        /**
         * Caso eu possua um número de cidades muito grande ou um limite de distancia muito pequeno, pode ser que
         * a cidade seja removido do pool de cidades restantes e não seja colocada na rota.
         */
        cidadesRestantes.splice(indexAleatorio, 1);
      }

      const ditanciaTotal = this.calcularRotaAoGerarPopulacao(
        route,
        matrizDeDistancias,
        numeroDeCidades
      );

      // Volta para o depósito ao final da rota, mas não considera no cálculo de distancia
      route.push(1);

      /**
       * Coloquei isso apenas para garantir que todos os cromossomos irão usar os dois veículos
       * e que cada cromossomo terá tamanho igual ao número de cidades + número de veículos
       */
      if (dummyCity <= numeroDeCidades + numeroDeVeiculos - 1)
        route.push(dummyCity);

      population.push(new Chromosome(route, ditanciaTotal));
    }

    return population;
  }

  public calcularRotaAoGerarPopulacao(
    route: number[],
    distanceMatrix: number[][],
    numeroDeCidades: number
  ): number {
    let distancia = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const indexCidadePartida = route[i] - 1;
      const indexCidadeDestino = route[i + 1] - 1;

      // Se a cidade destino for maior que o número de cidades, não calcular a distancia pois é apenas um veículo adicional
      if (indexCidadeDestino != numeroDeCidades) {
        distancia += distanceMatrix[indexCidadePartida][indexCidadeDestino];
      }
    }

    return distancia;
  }

  public calcularRotaDaPopulacaoComMultiplosVeiculos(
    route: number[],
    distanceMatrix: number[][],
    numeroDeCidades: number
  ): number {
    // Quebrar o array route em sub array usando n > numeroDeCidades como critério de quebra. Em sequência, calcular a distancia de cada rota e soma-las
    let distance = 0;
    let subArray = [];
    let subArrayIndex = 0;

    for (let i = 0; i < route.length; i++) {
      if (route[i] > numeroDeCidades) {
        subArrayIndex++;
        subArray[subArrayIndex] = [];
      } else {
        subArray[subArrayIndex].push(route[i]);
      }
    }

    for (let i = 0; i < subArray.length; i++) {
      distance += this.calcularRotaAoGerarPopulacao(
        subArray[i],
        distanceMatrix,
        numeroDeCidades
      );
    }

    return distance;
  }

  // Usar esse processo pra combinar tamanho da rota e numero de veículos
  public aumentarMatriz(matrix: number[][], n: number): number[][] {
    if (matrix.length === 0 || matrix[0].length === 0 || n <= 0) {
      return matrix;
    }

    const numRows = matrix.length;

    // Replicar a primeira coluna "n" vezes e adicionar ao final da matriz
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < n; j++) {
        matrix[i].push(matrix[i][0]);
      }
    }

    // Replicar a primeira linha "n" vezes e adicionar ao final da matriz
    for (let i = 0; i < n; i++) {
      const firstRowCopy = matrix[0].slice();
      matrix.push(firstRowCopy);
    }

    return matrix;
  }

  public calculateRouteDistanceGepeto(
    route: number[],
    distanceMatrix: number[][]
  ): number {
    let distance = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const city1 = route[i] - 1;
      const city2 = route[i + 1] - 1;

      distance += distanceMatrix[city1][city2];
    }

    const lastCity = route[route.length - 1] - 1;
    const firstCity = route[0] - 1;
    distance += distanceMatrix[lastCity][firstCity]; // Volta ao depósito
    return distance;
  }

  public tamanhoDaRotaSemRetornoAoDeposito(route: number[]): number {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const city1 = route[i] - 1;
      const city2 = route[i + 1] - 1;

      distance += this.distanceMatrix[city1][city2];
    }

    return distance;
  }

  public acharCidadeSubstituta(
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

  /**
   * 👌
   */
  public gerarFilhos(
    Dmax: number,
    parent1: Chromosome,
    parent2: Chromosome
  ): Chromosome {
    const n = parent1.route.length - 1; // Total de cidades (excluindo o depósito)
    const offspringRoute: number[] = [1]; // Inicia com o depósito (cidade 1)

    for (let i = 2; i <= n; i++) {
      const parent1NextCityIndex =
        parent1.route.indexOf(offspringRoute[offspringRoute.length - 1]) + 1;
      const parent2NextCityIndex =
        parent2.route.indexOf(offspringRoute[offspringRoute.length - 1]) + 1;

      let selectedCity;

      let parent1NextCity =
        parent1NextCityIndex < parent1.route.length
          ? parent1.route[parent1NextCityIndex]
          : undefined;

      let parent2NextCity =
        parent2NextCityIndex < parent2.route.length
          ? parent2.route[parent2NextCityIndex]
          : undefined;

      selectedCity = parent1NextCity || parent2NextCity;

      if (!parent1NextCity || offspringRoute.includes(parent2NextCity)) {
        parent1NextCity = this.acharCidadeSubstituta(
          i,
          parent1.route,
          offspringRoute
        );
      } else if (!parent2NextCity || offspringRoute.includes(parent2NextCity)) {
        parent2NextCity = this.acharCidadeSubstituta(
          i,
          parent2.route,
          offspringRoute
        );
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

        const newRouteDistance =
          this.tamanhoDaRotaSemRetornoAoDeposito(offspringRoute);

        if (newRouteDistance > Dmax) {
          offspringRoute.pop(); // Remove a última cidade adicionada
          offspringRoute.push(1); // Adiciona o depósito como cidade "fictícia"
        }
      }
    }

    return new Chromosome(
      offspringRoute,
      this.calculateRouteDistanceGepeto(offspringRoute, this.distanceMatrix)
    );
  }

  public calcularFitnessDoCromossomo(cromossomo: Chromosome): number {
    return 1 / cromossomo.distance;
  }

  public calcularFitnessDaPopulacao(populacao: Chromosome[]): number {
    let fitnessPopulacao = 0;

    for (const cromossomo of populacao) {
      fitnessPopulacao += this.calcularFitnessDoCromossomo(cromossomo);
    }

    return fitnessPopulacao;
  }

  public calcularProbabilidadeDeCadaCromossomo(
    populacao: Chromosome[],
  ): Chromosome[] {
    const probPopulacao = this.calcularFitnessDaPopulacao(populacao);

    // iterar cada cromossomo e calcular a probabilidade, sendo ela o fitness do cromossomo dividido pelo fitness da população
    for (const cromossomo of populacao) {
      cromossomo.fitness = this.calcularFitnessDoCromossomo(cromossomo) / probPopulacao;
    }

    return populacao;
  }

  /**
    * Input:Ps,Populationofchromosomes.
    * Output:Newpopulationofchromosomes.
    */
  public roletaRussa(tamanhoDaNovaPopulacao: number, populacao: Chromosome): Chromosome[] {
    // Calculate the fitness fi, probability probi, and then cumulative probability cpi of each chromosome ( 1 ≤ i ≤Ps) of the population.
    // Notethatcp0 = 0.
    for (let i = 0; i < tamanhoDaNovaPopulacao; i++) {
      const cromossomo = populacao[i];
      const fitness = this.calcularFitnessDoCromossomo(cromossomo);

    }
  }
}

class Chromosome {
  route: number[]; // Array representing the route of the vehicle
  distance: number; // Distance of the route
  fitness: number;

  constructor(route: number[], distance: number) {
    this.route = route;
    this.distance = distance;
  }
}

const n = 7; // Total number of cities (sem depósito)
const Dmax = 60; // Maximum distance allowed for each route
const populationSize = 10; // Size of the population
const numeroDeVeiculos = 2;
const gerador = new Classe();

// const population = gerador.gerarPopulacao(n, Dmax, populationSize);

// const improvedPopulation = gerador.improvePopulation(population);

// const parentes = gerador.selectParents(2, improvedPopulation);

// const parent1 = new Chromosome([1, 2, 4, 8, 3, 6, 5, 7], 75); // Cromossomo do pai 1 (rota do veículo)
// const parent2 = new Chromosome([1, 3, 8, 5, 2, 7, 4, 6], 72); // Cromossomo do pai 2 (rota do veículo)

// const offspring = gerador.gerarFilhos(Dmax, parent1, parent2);

const novaMatriz = gerador.aumentarMatriz(
  gerador.distanceMatrix,
  numeroDeVeiculos - 1
);

const populacoes = gerador.gerarPopulacoes(
  n,
  Dmax,
  populationSize,
  novaMatriz,
  numeroDeVeiculos
);
