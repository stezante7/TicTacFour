import * as PIXI from "pixi.js";

import sound from "pixi-sound";
import TicTacFourGame, { GameState } from "../TicTacFourGame";
import { SelectedCell } from "./Board";
import { GlowFilter } from "pixi-filters";
import { GameEventType } from "../gameevents";

export type PawnSize = "small" | "big";
export type PawnColor = "white" | "black";
export type PawnCave = "full" | "empty";
export type PawnShape = "circle" | "square";

class Pawn {
  readonly id: number;
  readonly asset: string;
  readonly color: PawnColor;
  readonly size: PawnSize;
  readonly cave: PawnCave;
  readonly shape: PawnShape;
  readonly game: TicTacFourGame;

  pawnSprite: PIXI.Sprite;

  private _selected: boolean;
  private _dragging: boolean;
  private _draggingData: PIXI.interaction.InteractionData;

  constructor(
    game: TicTacFourGame,
    pId: number,
    pAsset: string,
    pColor: PawnColor,
    pSize: PawnSize,
    pCave: PawnCave,
    pShape: PawnShape
  ) {
    this.id = pId;
    this.asset = pAsset;
    this.color = pColor;
    this.size = pSize;
    this.cave = pCave;
    this.shape = pShape;
    this.game = game;
  }

  initialize() {
    this._dragging = false;
    this._selected = false;

    this.pawnSprite = new PIXI.Sprite(
      this.game.loader.resources[this.asset].texture
    );

    this.repositionPawn();
    this.game.addChild(this.pawnSprite);

    this.pawnSprite.cursor = "pointer";
    this.pawnSprite.interactive = true;

    this.pawnSprite.on("pointerover", () => {
      if (this.game.isState(GameState.SelectPawn) && this.game.isMyTurn()) {
        this.pawnSprite.alpha = 0.7;
      }
    });

    this.pawnSprite.on("pointerout", () => {
      if (this.game.isState(GameState.SelectPawn) && this.game.isMyTurn()) {
        this.pawnSprite.alpha = 1;
      }
    });

    this.pawnSprite.on(
      "pointerdown",
      (evt: PIXI.interaction.InteractionEvent) => {
        if (
          this.game.isState(GameState.SelectPawn) &&
          this.game.isMyTurn() &&
          !this._selected
        ) {
          this._dragging = true;
          this._draggingData = evt.data;
          this._selected = true;

          this.game.emitter.emit(
            {
              name: GameEventType.PawnSelected,
              payload: { pawnId: this.id },
            },
            true
          );
        }
      }
    );

    this.pawnSprite.on("pointermove", () => {
      if (this._dragging && this.game.isMyTurn()) {
        const newPosition = this._draggingData.getLocalPosition(
          this.game.stage
        );
        this.pawnSprite.x = newPosition.x + 5;
        this.pawnSprite.y = newPosition.y + 5;
      }
    });
  }

  repositionPawn() {
    const pawnColLimit = 4;
    const maxPawnSide = this.pawnSprite.width;
    const boardConfig = this.game.getBoardConfig();
    const startingX = boardConfig.x + boardConfig.width + 10;
    const startingY = 20;
    const padding = 5;

    const maxCol = Math.min(
      Math.trunc((this.game.screen.width - startingX) / maxPawnSide),
      pawnColLimit
    );

    const col = this.id % maxCol;
    const row = Math.trunc(this.id / maxCol);

    const x = startingX + col * (maxPawnSide + padding);
    const y = startingY + row * (maxPawnSide + padding);

    this.pawnSprite.x = x;
    this.pawnSprite.y = y;
  }

  moveToCell(cell: SelectedCell) {
    const x = cell.x + cell.width / 2 - this.pawnSprite.width / 2;
    const y = cell.y + cell.height / 2 - this.pawnSprite.height / 2;

    this.pawnSprite.x = x;
    this.pawnSprite.y = y;
    this.pawnSprite.alpha = 1;
    this.pawnSprite.filters = [];
    this._dragging = false;

    sound.play("./assets/sounds/move.mp3");
  }

  highlight(color: number) {
    const glowFilter = new GlowFilter({ outerStrength: 0, color: color });
    this.pawnSprite.alpha = 1;
    this.pawnSprite.filters = [glowFilter];

    this.game.ticker.add(() => {
      if (glowFilter.outerStrength < 20) {
        glowFilter.outerStrength += 0.3;
      }
    });
  }
}

export default Pawn;
