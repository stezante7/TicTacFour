import Board from "../gameobjects/Board";
import TicTacFourGame from "../TicTacFourGame";

export const loadBoard = (game: TicTacFourGame): Board => {
  return new Board(game, "./assets/images/board.svg");
};
