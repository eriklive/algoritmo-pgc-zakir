import "jasmine";
import { aumentarMatriz } from "../main";
import { gerarFilhos } from "./gerar_filhos";

describe("Gerar filhos", () => {
  const matrizDeDistancias = () => [
    [99999, 2, 11, 10, 8, 7, 6],
    [6, 99999, 1, 8, 8, 4, 6],
    [5, 12, 99999, 11, 8, 12, 3],
    [11, 9, 10, 99999, 1, 9, 8],
    [11, 11, 9, 4, 99999, 2, 10],
    [12, 8, 5, 2, 11, 99999, 11],
    [10, 11, 12, 10, 9, 12, 99999],
  ];

  const matrizAumentada = aumentarMatriz(matrizDeDistancias(), 2);

  it("Deve gerar um offspring com base no artigo", () => {
    const offspring = gerarFilhos(
      60,
      [1, 2, 4, 8, 3, 6, 5, 7],
      [1, 3, 8, 5, 2, 7, 4, 6],
      matrizAumentada,
      7,
      2
    );

    expect(offspring.route).toEqual([1, 2, 7, 4, 6, 3, 8, 5]);
  });

  it("Deve gerar um corretamente", () => {
    const testeDoisPaiUm = [
      1, 6, 2, 5, 7, 4, 3, 8, 1,
    ];

    const testeDoisPaiDois = [
      1, 3, 2, 6, 4, 7, 5, 8, 1,
    ];

    const offspring = gerarFilhos(
      60,
      testeDoisPaiUm,
      testeDoisPaiDois,
      matrizAumentada,
      7,
      2
    );

    expect(offspring.route).toEqual([1, 6, 4, 7, 5, 3, 8, 2]);
  });
});
