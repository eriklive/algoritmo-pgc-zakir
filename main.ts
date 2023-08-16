import { Chromosome } from "./chromossomo.class";
import { calcularRotaAoGerarPopulacao } from "./functions/calcular_rota";
import { gerarFilhos } from "./functions/gerar_filhos";

const matrizDeDistancias = (): number[][] => [
  [99999, 12, 11, 10, 18, 7, 6],
  [16, 99999, 10, 8, 8, 4, 6],
  [15, 12, 99999, 11, 8, 12, 3],
  [11, 9, 10, 99999, 1, 9, 8],
  [11, 11, 9, 4, 99999, 2, 10],
  [12, 8, 5, 2, 11, 99999, 11],
  [10, 11, 12, 10, 9, 12, 99999],
];

// Usar esse processo pra combinar tamanho da rota e numero de veículos
export function aumentarMatriz(
  matrix: number[][],
  veiculos: number
): number[][] {
  if (matrix.length === 0 || matrix[0].length === 0 || veiculos <= 0) {
    return matrix;
  }

  const numRows = matrix.length;

  // Replicar a primeira coluna "n" vezes e adicionar ao final da matriz
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < veiculos; j++) {
      matrix[i].push(matrix[i][0]);
    }
  }

  // Replicar a primeira linha "n" vezes e adicionar ao final da matriz
  for (let i = 0; i < veiculos; i++) {
    const firstRowCopy = matrix[0].slice();
    matrix.push(firstRowCopy);
  }

  return matrix;
}

function gerarPopulacoes(
  numeroDeCidades: number,
  Dmax: number,
  Ps: number,
  matrizDeDistancias: number[][],
  numeroDeVeiculos: number
): Chromosome[] {
  const population: Chromosome[] = [];

  for (let i = 0; i < Ps; i++) {
    const route: number[] = [1]; // Inicia com o depósito (cidade 1)

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
      const distanciaNova = calcularRotaAoGerarPopulacao(
        [...route, cidadeSelecionada],
        matrizDeDistancias,
        numeroDeCidades
      );

      if (distanciaNova <= Dmax) {
        route.push(cidadeSelecionada);
      } else {
        /**
         * Verifica se existem "dummy cities" (veículos) disponíveis
         * para a realização da rota. Aqui há a possibilidade de não existir e a rota
         * não cobrir todas as cidades
         */
        if (dummyCity <= numeroDeCidades + numeroDeVeiculos - 1) {
          route.push(dummyCity);
          dummyCity++;
          route.push(cidadeSelecionada);
        }
      }

      /**
       * Caso eu possua um número de cidades muito grande ou um limite de distancia muito pequeno, pode ser que
       * a cidade seja removido do pool de cidades restantes e não seja colocada na rota.
       */
      cidadesRestantes.splice(indexAleatorio, 1);
    }

    const ditanciaTotal = calcularRotaAoGerarPopulacao(
      route,
      matrizDeDistancias,
      numeroDeCidades
    );

    // Volta para o depósito ao final da rota, mas não considera no cálculo de distancia
    route.push(1);

    const cromossomo = new Chromosome(route, ditanciaTotal);

    population.push(cromossomo);
  }

  return population;
}

function calcularFitnessDaPopulacao(populacao: Chromosome[]): number {
  let fitnessPopulacao = 0;

  for (const cromossomo of populacao) {
    fitnessPopulacao += cromossomo.fitness;
  }

  return fitnessPopulacao;
}

function calcularProbabilidades(populacao: Chromosome[]): Chromosome[] {
  let probAcumulada = 0;
  const fitnessDaPopulacao = calcularFitnessDaPopulacao(populacao);

  // iterar cada cromossomo e calcular a probabilidade, sendo ela o fitness do cromossomo dividido pelo fitness da população
  for (let i = 0; i < populacao.length; i++) {
    const cromossomo = populacao[i];

    cromossomo.probabilidade = cromossomo.fitness / fitnessDaPopulacao;
    probAcumulada += cromossomo.probabilidade;

    if (i === 0) {
      cromossomo.probabilidadeAcumulada = 0;
    } else {
      cromossomo.probabilidadeAcumulada = probAcumulada;
    }
  }

  return populacao;
}

/**
 * Input:Ps,Populationofchromosomes.
 * Output:Newpopulationofchromosomes.
 */
function roleta(populacao: Chromosome[]): Chromosome[] {
  // Calculate the fitness fi, probability probi, and then cumulative probability cpi of each chromosome ( 1 ≤ i ≤Ps) of the population.
  // Note that cp0 = 0.
  const populacaoComProb = calcularProbabilidades(populacao);

  const novaPopulacao = [];

  for (let i = 1; i < populacao.length; i++) {
    // numero aleatório r entre 0 e 1
    const r = Math.random();

    for (let j = 1; j < populacao.length; j++) {
      if (
        populacaoComProb[j - 1].probabilidadeAcumulada < r &&
        r <= populacaoComProb[j].probabilidadeAcumulada
      ) {
        novaPopulacao.push(populacaoComProb[j]);
        break;
      }
    }
  }

  return novaPopulacao;
}

const acharMelhorSolucao = (geracaoInicial: Chromosome[]) => {
  let melhorSolucao = geracaoInicial[0];

  for (const cromossomo of geracaoInicial) {
    if (cromossomo.distance < melhorSolucao.distance) {
      melhorSolucao = cromossomo;
    }
  }

  return melhorSolucao;
};

const gerarIndexesPais = (tamanhoPopulacao: number): Array<number> => {
  const indexPaiUm = Math.floor(Math.random() * tamanhoPopulacao);
  let indexPaiDois = Math.floor(Math.random() * tamanhoPopulacao);

  while (indexPaiDois === indexPaiUm) {
    indexPaiDois = Math.floor(Math.random() * tamanhoPopulacao);
  }

  return [indexPaiUm, indexPaiDois];
};

const gerarMelhorSolucao = (numeroDeGeracoes) => {
  const n = 7; // Total number of cities (sem depósito)
  const Dmax = 60; // Maximum distance allowed for each route
  const populationSize = 10; // Size of the population
  const numeroDeVeiculos = 2;

  const novaMatriz = aumentarMatriz(matrizDeDistancias(), numeroDeVeiculos - 1);

  const geracaoInicial = gerarPopulacoes(
    n,
    Dmax,
    populationSize,
    novaMatriz,
    numeroDeVeiculos
  );

  // evaluate g1 ?????
  let numeroDeGeracoesAposOUltimoUpdate = 0;
  let melhorSolucaoGlobal = acharMelhorSolucao(geracaoInicial);

  console.log({ melhorSolucaoGlobal });

  for (let i = 0; i < numeroDeGeracoes; i++) {
    /**
     * ESTÁ REPETINDO CIDADES
     */
    const subpopulacao = roleta(geracaoInicial);

    for (let j = 0; j < subpopulacao.length; j++) {
      // gerar dois pais aleatórios e diferentes entre si
      const [indexPaiUm, indexPaiDois] = gerarIndexesPais(subpopulacao.length);

      let prole = gerarFilhos(
        Dmax,
        subpopulacao[indexPaiUm].route,
        subpopulacao[indexPaiDois].route,
        novaMatriz,
        n,
        2
      );

      /**
       * Isso aqui eu que assumi. O artigo não explica muito bem, dá a entender
       * que pega sempre o index do primeiro pai pra substituir pela prole. Porém no
       * exemplo dado (fim da página 6.1), o pai 1 apresenta rota maior, logo menor fitness.
       * Dado isso, ou o algoritmo sempre pega o primeiro pai pra subsituir (como dito no fim da página 7.1)
       * e foi uma coincidência o pai com pior fitness ser o primeiro, ou de fato
       * faltou a info de que o algoritmo pega o pai com pior fitness independente de ser o primeiro
       * ou o segundo.
       */
      const indexDoMenorFitnessEntreOsPais =
        subpopulacao[indexPaiUm] > subpopulacao[indexPaiDois]
          ? indexPaiDois
          : indexPaiUm;

      if (
        prole.fitness > subpopulacao[indexDoMenorFitnessEntreOsPais].fitness
      ) {
        subpopulacao[indexPaiUm] = prole;
      }

      // offspring = melhorar usando mutation
      // offsprint = melhorar usando local search
    }
    //    avaliar gi
    //    bi = melhor populacao em gi
    const melhorSolucaoLocal = acharMelhorSolucao(subpopulacao);

    if (melhorSolucaoGlobal.fitness < melhorSolucaoLocal.fitness) {
      melhorSolucaoGlobal = melhorSolucaoLocal;
      numeroDeGeracoesAposOUltimoUpdate = 0;
    }
    //  else if( numeroDeGeracoesAposOUltimoUpdate > 0.1 * numeroDeGeracoes) {
    //    aplicar migracao
    //  } else {
    //    numeroDeGeracoesAposOUltimoUpdate++;
    //  }
  }

  console.log({ melhorSolucaoGlobal });
  //
  // return melhorSolucao
};

// gerarMelhorSolucao(10);
