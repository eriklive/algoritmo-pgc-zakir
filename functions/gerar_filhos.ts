import { Chromosome } from "../chromossomo.class";
import {
  calcularRotaAoGerarPopulacao,
  calcularTamanhoDaUltimaSubRota,
} from "./calcular_rota";

function _acharIndexDaCidadeSeguinte(currentCity: number, route: number[], offspring: number[]) {
  let indexDaCidadeAtual = route.findIndex((cidade) => cidade === currentCity);

  if (indexDaCidadeAtual === -1) {
    return route.filter(city => !offspring.includes(city))[0];
  }

  //
  const indexProximaCidade = indexDaCidadeAtual + 1;


  // se o offsprint conter a cidade selecionada, chamar essa func de forma recursiva
  if (offspring.includes(route[indexProximaCidade])) {
    return _acharIndexDaCidadeSeguinte(route[indexProximaCidade], route, offspring);
  }

  if (!!indexProximaCidade) {
    return indexProximaCidade;
  }


  if (indexProximaCidade >= route.length) {
    return undefined;
  }
}

function _acharIndexDaCidadeSubstituta(
  rota: number[],
  p: number,
  offspringRoute: number[]
) {
  const indexDaCidadeSelecionada = rota.findIndex((cidade) => cidade === p);

  if (
    indexDaCidadeSelecionada + 1 < rota.length &&
    indexDaCidadeSelecionada === rota.length
  ) {
    return indexDaCidadeSelecionada + 1;
  }

  // acha a primeira cidade na rota que não esteja em offspringRoute
  for (const cidade of rota) {
    if (!offspringRoute.includes(cidade)) {
      return rota.findIndex((cidadeDaRota) => cidade === cidadeDaRota);
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
  numeroDeVeiculos: number,
  crossoverProbability: number = 1
): Chromosome {
  // numero aleatorio r entre 0 e 1
  const r = Math.random();

  if (crossoverProbability >= r) {
    let p = 1; // cidade 1 é a origem

    const offspringRoute: number[] = [1]; // Inicia com o depósito (cidade 1)

    let dummyCity = numeroDeCidades + 1; // Inicia o valor da "dummy city" com o próximo número após o número de clientes (n)

    for (let i = 1; i <= numeroDeCidades; i++) {
      let indexProximaCidadeDoPaiUm = _acharIndexDaCidadeSeguinte(p, paiUm, offspringRoute);

      let indexProximaCidadeDoPaiDois = _acharIndexDaCidadeSeguinte(p, paiDois, offspringRoute);

      if (
        indexProximaCidadeDoPaiUm != 0 &&
        indexProximaCidadeDoPaiDois != 0 &&
        (!indexProximaCidadeDoPaiUm ||
          !indexProximaCidadeDoPaiDois ||
          indexProximaCidadeDoPaiUm >= paiUm.length ||
          indexProximaCidadeDoPaiDois >= paiDois.length)
      ) {
        if (
          !indexProximaCidadeDoPaiUm ||
          indexProximaCidadeDoPaiUm >= paiUm.length
        ) {
          indexProximaCidadeDoPaiUm = _acharIndexDaCidadeSubstituta(
            paiUm,
            p,
            offspringRoute
          );
        } else {
          indexProximaCidadeDoPaiDois = _acharIndexDaCidadeSubstituta(
            paiDois,
            p,
            offspringRoute
          );
        }
      }

      const cidadeAlpha = paiUm[indexProximaCidadeDoPaiUm];
      const cidadeBeta = paiDois[indexProximaCidadeDoPaiDois];

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

      const tamanhoDaUltimaSubRota = calcularTamanhoDaUltimaSubRota(
        offspringRoute,
        matrizDeDistancias,
        numeroDeCidades
      );

      const ultimaCidadeAdicionada = offspringRoute[offspringRoute.length - 1];

      if (tamanhoDaUltimaSubRota > Dmax) {
        offspringRoute.pop(); // Remove a última cidade adicionada

        if (dummyCity <= numeroDeCidades + numeroDeVeiculos - 1) {
          offspringRoute.push(dummyCity);
          dummyCity++;
          offspringRoute.push(ultimaCidadeAdicionada);
        }
      }

      p = ultimaCidadeAdicionada;
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
