import * as PIXI from "pixi.js";
import TicTacFourGame, { GameState } from "../TicTacFourGame";
import { GameEventType, CellConfig } from "../gameevents";

export type SelectedCell = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

class Board {
  private _cells: CellConfig[];
  readonly asset: string;
  readonly game: TicTacFourGame;
  boardSprite: PIXI.Sprite;

  constructor(game: TicTacFourGame, asset: string) {
    this.asset = asset;
    this.game = game;
    this._cells = [];
  }

  initialize() {
    const gameWidth = this.game.renderer.width;

    this.boardSprite = new PIXI.Sprite(
      this.game.loader.resources[this.asset].texture
    );

    this.boardSprite.interactive = true;

    this.boardSprite.x = 20;
    this.boardSprite.y = 50;

    this.game.addChild(this.boardSprite);

    const bWidthMargin = this.boardSprite.width * 0.1;
    const bHeightMargin = this.boardSprite.height * 0.1;

    const cellSize = {
      width: Math.round((this.boardSprite.width - bWidthMargin) / 4),
      height: Math.round((this.boardSprite.height - bHeightMargin) / 4),
    };

    for (var idx = 0; idx < 16; idx++) {
      const colIdx = idx % 4;
      const rowIdx = Math.trunc(idx / 4);

      const cellX = this.boardSprite.x + colIdx * (cellSize.width + 4) + 24;
      const cellY = this.boardSprite.y + rowIdx * (cellSize.height + 4) + 24;

      const cell = new PIXI.Graphics()
        .beginFill(0xffffff)
        .drawRect(cellX, cellY, cellSize.width, cellSize.height)
        .endFill();

      cell.cursor = "pointer";
      cell.interactive = true;

      const cellId = idx;
      this._cells[cellId] = {
        id: cellId,
        x: cellX,
        y: cellY,
        width: cellSize.width,
        height: cellSize.height,
      };

      cell.on("pointerdown", () => {
        if (
          this.game.isState(GameState.SelectCell) &&
          this.game.isMyTurn() &&
          !this.game.isCellSelected(cellId)
        ) {
          cell.tint = 0xffeecc;
          this.game.emitter.emit(
            {
              name: GameEventType.CellSelected,
              payload: this._cells[cellId],
            },
            true
          );
        }
      });

      cell.on("pointerover", () => {
        if (
          this.game.isState(GameState.SelectCell) &&
          this.game.isMyTurn() &&
          !this.game.isCellSelected(cellId)
        ) {
          cell.tint = 0xffeecc;
        }
      });

      cell.on("pointerout", () => {
        cell.tint = 0xffffff;
      });

      this.game.addChild(cell);
    }
  }

  getCell(idx) {
    return this._cells[idx];
  }
}

export default Board;
