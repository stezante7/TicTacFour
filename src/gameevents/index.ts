import { GameEvent } from "../utils/GameEventEmitter";

export enum GameEventType {
  PawnSelected = "PawnSelected",
  CellSelected = "CellSelected",
  RestartGame = "RestartGame",
}

export type CellConfig = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GameEvents =
  | GameEvent<GameEventType.PawnSelected, { pawnId: number }>
  | GameEvent<GameEventType.CellSelected, CellConfig>
  | GameEvent<GameEventType.RestartGame, {}>;
