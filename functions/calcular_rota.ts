export function calcularRotaAoGerarPopulacao(
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
