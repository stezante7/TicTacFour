import Pawn from "../gameobjects/Pawn";
import { PawnSize, PawnShape, PawnColor, PawnCave } from "../gameobjects/Pawn";
import TicTacFourGame from "../TicTacFourGame";

interface PawnPosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

const assets = [
  "big-circle-empty-black",
  "big-circle-full-black",
  "big-square-empty-black",
  "big-square-full-black",
  "big-circle-empty-white",
  "big-circle-full-white",
  "big-square-empty-white",
  "big-square-full-white",
  "small-square-full-black",
  "small-square-empty-black",
  "small-circle-full-black",
  "small-circle-empty-black",
  "small-square-full-white",
  "small-square-empty-white",
  "small-circle-full-white",
  "small-circle-empty-white",
];

export const loadPawns = (game: TicTacFourGame): Pawn[] => {
  return assets.map((asset, idx) => {
    const pawnProps = asset.split("-");

    const pawn: Pawn = new Pawn(
      game,
      idx,
      `./assets/images/${asset}.svg`,
      pawnProps[3] as PawnColor,
      pawnProps[0] as PawnSize,
      pawnProps[2] as PawnCave,
      pawnProps[1] as PawnShape
    );

    return pawn;
  });
};
