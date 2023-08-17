import { Chromosome } from "../chromossomo.class";
import { calcularRotaAoGerarPopulacao } from "./calcular_rota";

export function gerarPopulacoes(
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

    // preencher cromossomo com dummy cities restantes
    if (route.length < numeroDeCidades + numeroDeVeiculos - 1) {
      for (
        let i = route.length;
        i < numeroDeCidades + numeroDeVeiculos - 1;
        i++
      ) {
        route.push(dummyCity);
        dummyCity++;
      }
    }

    // Volta para o depósito ao final da rota, mas não considera no cálculo de distancia
    route.push(1);

    const cromossomo = new Chromosome(route, ditanciaTotal);

    population.push(cromossomo);
  }

  return population;
}
