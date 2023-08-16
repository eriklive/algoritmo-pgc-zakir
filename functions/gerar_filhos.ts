import { Chromosome } from "../chromossomo.class";
import { calcularRotaAoGerarPopulacao } from "./calcular_rota";

function _acharIndexDaCidadeSeguinte(currentCity: number, route: number[]) {
  let indexProximaCidade =
    route.findIndex((cidade) => cidade === currentCity) + 1;

  if (!indexProximaCidade) {
    return indexProximaCidade;
  }

  if (indexProximaCidade >= route.length) {
    return undefined;
  }
}

function _acharCidadeSubstituta(
  rota: number[],
  p: number,
  offspringRoute: number[]
) {
  const indexDaCidadeSelecionada = rota.findIndex((cidade) => cidade === p);

  if (indexDaCidadeSelecionada + 1 < rota.length) {
    return rota[p + 1];
  }
  // acha a primeira cidade na rota que não esteja em offspringRoute
  for (const cidade of rota) {
    if (!offspringRoute.includes(cidade)) {
      return cidade;
    }
  }
}

/**
 * Lembrando que a matriz de distancias está ordenada certinho.
 * Logo, a cidade 1 é a origem e tem posição 0 em qualquer linha e coluna.
 * Já a cidade 5 tem posição 4 em qualquer linha e coluna e assim por diante.
 * @param cidadeUm
 * @param cidadeDois
 * @param matrizDeDistancias
 * @returns
 */
function acharDistanciasEntreCidades(
  cidadeUm: number,
  cidadeDois: number,
  matrizDeDistancias: number[][]
): number {
  return matrizDeDistancias[cidadeUm - 1][cidadeDois - 1];
}

/**
 * 👌
 */
export function gerarFilhos(
  Dmax: number,
  paiUm: number[],
  paiDois: number[],
  matrizDeDistancias: number[][],
  numeroDeCidades: number,
  crossoverProbability: number = 1
): Chromosome {
  // numero aleatorio r entre 0 e 1
  const r = Math.random();

  if (crossoverProbability >= r) {
    let p = 1; // cidade 1 é a origem

    const offspringRoute: number[] = [1]; // Inicia com o depósito (cidade 1)

    const cidadesLegitimasPaiUm = paiUm;
    const cidadesLegitimasPaiDois = paiDois;

    for (let i = 1; i <= numeroDeCidades - 1; i++) {
      // In each chromosome consider the first “legitimate” (un-visited) city existed after “city p.”
      let indexProximaCidadeDoPaiUm = _acharIndexDaCidadeSeguinte(
        p,
        cidadesLegitimasPaiUm
      );

      let indexProximaCidadeDoPaiDois = _acharIndexDaCidadeSeguinte(
        p,
        cidadesLegitimasPaiDois
      );

      if (!indexProximaCidadeDoPaiUm || !indexProximaCidadeDoPaiDois) {
        if (!indexProximaCidadeDoPaiUm) {
          indexProximaCidadeDoPaiUm = _acharCidadeSubstituta(
            cidadesLegitimasPaiUm,
            p,
            offspringRoute
          );
        } else {
          indexProximaCidadeDoPaiDois = _acharCidadeSubstituta(
            cidadesLegitimasPaiDois,
            p,
            offspringRoute
          );
        }
      }

      const cidadeAlpha = cidadesLegitimasPaiUm[indexProximaCidadeDoPaiUm];
      const cidadeBeta = cidadesLegitimasPaiDois[indexProximaCidadeDoPaiDois];

      const distanciaDePpraAlpha = acharDistanciasEntreCidades(
        p,
        cidadeAlpha,
        matrizDeDistancias
      );

      const distanciaDePpraBeta = acharDistanciasEntreCidades(
        p,
        cidadeBeta,
        matrizDeDistancias
      );

      if (distanciaDePpraAlpha < distanciaDePpraBeta) {
        offspringRoute.push(cidadeAlpha);
      } else {
        offspringRoute.push(cidadeBeta);
      }

      const newRouteDistance = calcularRotaAoGerarPopulacao(
        offspringRoute,
        matrizDeDistancias,
        numeroDeCidades
      );

      if (newRouteDistance > Dmax) {
        offspringRoute.pop(); // Remove a última cidade adicionada
        offspringRoute.push(1); // Adiciona o depósito como cidade "fictícia"
      }
    }

    return new Chromosome(
      offspringRoute,
      calcularRotaAoGerarPopulacao(
        offspringRoute,
        matrizDeDistancias,
        numeroDeCidades
      )
    );
  }
}
