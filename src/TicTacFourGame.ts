import * as PIXI from "pixi.js";
import { loadPawns } from "./utils/PawnsLoader";
import { loadBoard } from "./utils/BoardLoader";
import Pawn from "./gameobjects/Pawn";
import Board from "./gameobjects/Board";
import { Player } from "./gameobjects/Player";
import GameEventEmitter from "./utils/GameEventEmitter";
import { GameEvents, GameEventType } from "./gameevents";
import sound from "pixi-sound";
import GameHud from "./utils/GameHud";

export enum GameState {
  Ready,
  SelectPawn,
  SelectCell,
  GameOver,
}

export enum GameType {
  PassAndPlay,
  Online,
}

class TicTacFourGame extends PIXI.Application {
  private _state: GameState;
  private _pawns: Pawn[];
  private _board: Board;
  private _players: Player[];

  private _playerTurnId: number;
  private _startingPlayerId: number;
  private _cells: Pawn[];
  private _gameType: GameType;
  private readonly _gameContainer: PIXI.Container;
  private readonly _hud: GameHud;

  readonly emitter: GameEventEmitter;

  selectedPawn: Pawn;

  constructor(
    gameType: GameType,
    players: Player[],
    startingPlayerId: number,
    publishEvent?: (gameEvent: GameEvents) => void
  ) {
    super({
      backgroundColor: 0xf4f2f2,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this._gameContainer = new PIXI.Container();
    this.stage.addChild(this._gameContainer);

    this._gameType = gameType;
    this._players = players.sort((x) => x.id);

    this._startingPlayerId = startingPlayerId;
    this._hud = new GameHud(this);

    this.emitter = new GameEventEmitter(publishEvent);
    this._hud.printHelperText("Tea break - Let's play!");

    this._registerGameEvents();
    this._loadAssets();
  }

  getGameContainer() {
    return this._gameContainer;
  }

  addChild(obj: PIXI.DisplayObject) {
    this._gameContainer.addChild(obj);
  }

  _loadAssets = () => {
    this._pawns = loadPawns(this);
    this._board = loadBoard(this);

    const pawnsAssets = this._pawns.map((p) => p.asset);

    const sounds = [
      "./assets/sounds/move.mp3",
      "./assets/sounds/win.mp3",
      "./assets/sounds/casual_loop.wav",
    ];
    this.loader
      .add([this._board.asset, ...pawnsAssets, ...sounds])
      .load(this._initialize);
  };

  _initialize = () => {
    //Initialize the game sprites, set the game `state` to `play`
    //and start the 'gameLoop'
    this._cells = [];
    this.selectedPawn = undefined;
    this._playerTurnId = this._startingPlayerId;
    this._board.initialize();
    this._pawns.forEach((pawn) => pawn.initialize());

    this.changeGameState(GameState.SelectPawn);

    sound.play("./assets/sounds/casual_loop.wav", { loop: true });
  };

  _nextTurn = () => {
    const nextPlayer = this._players.find((x) => x.id !== this._playerTurnId);
    this._playerTurnId = nextPlayer.id;
  };

  _registerGameEvents = () => {
    const game = this;
    this.emitter.on({
      name: GameEventType.PawnSelected,
      listener: (payload) => {
        game.selectedPawn = game._pawns.find((x) => x.id === payload.pawnId);
        game.selectedPawn.highlight(0xe2a62e);
        game._nextTurn();

        game.changeGameState(GameState.SelectCell);
      },
    });

    this.emitter.on({
      name: GameEventType.CellSelected,
      listener: (cell) => {
        const cellId = cell.id;
        game.selectedPawn.moveToCell(cell);
        game._cells[cellId] = game.selectedPawn;

        const hasWon = game._isGameWon(cellId);

        game.changeGameState(
          hasWon ? GameState.GameOver : GameState.SelectPawn
        );
      },
    });

    this.emitter.on({
      name: GameEventType.RestartGame,
      listener: () => {
        console.warn("restarting game");
        this._initialize();
      },
    });
  };

  _isGameWon = (cellId: number) => {
    const colIdx = cellId % 4;
    const rowIdx = Math.trunc(cellId / 4);

    const rowPawns = this._cells.filter(
      (val, idx) => Math.trunc(idx / 4) === rowIdx
    );

    const colPawns = this._cells.filter((val, idx) => idx % 4 === colIdx);

    const primaryDiagPawns = this._cells.filter((val, idx) => {
      const x = idx % 4;
      const y = Math.trunc(idx / 4);

      return x === y;
    });

    const secondaryDiagPawns = this._cells.filter((val, idx) => {
      const x = idx % 4;
      const y = Math.trunc(idx / 4);

      return x === 4 - y - 1;
    });

    const pawnsHaveSameProps = (pawns: Pawn[]) =>
      pawns.every((pawn) => pawn.color === "white") ||
      pawns.every((pawn) => pawn.color === "black") ||
      pawns.every((pawn) => pawn.cave === "full") ||
      pawns.every((pawn) => pawn.cave === "empty") ||
      pawns.every((pawn) => pawn.size === "big") ||
      pawns.every((pawn) => pawn.size === "small") ||
      pawns.every((pawn) => pawn.shape === "square") ||
      pawns.every((pawn) => pawn.shape === "circle");

    const highlightPawns = (pawns: Pawn[]) =>
      pawns.forEach((pawn) => pawn.highlight(0xe2a62e));

    if (rowPawns.length === 4 && pawnsHaveSameProps(rowPawns)) {
      highlightPawns(rowPawns);
      return true;
    }

    if (colPawns.length === 4 && pawnsHaveSameProps(colPawns)) {
      highlightPawns(colPawns);
      return true;
    }

    if (primaryDiagPawns.length === 4 && pawnsHaveSameProps(primaryDiagPawns)) {
      highlightPawns(primaryDiagPawns);
      return true;
    }

    if (
      secondaryDiagPawns.length === 4 &&
      pawnsHaveSameProps(secondaryDiagPawns)
    ) {
      highlightPawns(secondaryDiagPawns);
      return true;
    }

    return false;
  };

  changeGameState = (state: GameState) => {
    if (state === this._state) {
      return;
    }

    this._state = state;
    const player = this._players.find((x) => x.id === this._playerTurnId);

    switch (state) {
      case GameState.Ready:
        break;
      case GameState.SelectCell:
        if (!this.isMyTurn() && this._gameType === GameType.Online) {
          this._hud.dialog(
            `Waiting for ${player.display}...`,
            `${player.display} is selecting a cell!`
          );
        } else {
          this._hud.printHelperText(`${player.display} select cell...`);
          this._hud.hideDialog();
        }
        break;
      case GameState.SelectPawn:
        if (!this.isMyTurn() && this._gameType === GameType.Online) {
          this._hud.dialog(
            `Waiting for ${player.display}...`,
            `${player.display} is picking a pawn for you!`
          );
        } else {
          this._hud.printHelperText(
            `${player.display} pick a pawn for your opponent...`
          );
          this._hud.hideDialog();
        }
        break;
      case GameState.GameOver:
        this._hud.hideDialog();
        this._hud.printHelperText(
          `${player.display} win, yay! Press here to restart...`,
          () => {
            this.emitter.emit(
              {
                name: GameEventType.RestartGame,
                payload: {},
              },
              true
            );
          }
        );
        sound.play("./assets/sounds/win.mp3");

        break;
    }
  };

  isCellSelected = (cellId) => {
    return this._cells && this._cells[cellId];
  };

  isState = (state: GameState) => {
    return this._state === state;
  };

  isMyTurn = () => {
    const player = this._players.find((x) => x.id === this._playerTurnId);
    return player.type === "local";
  };

  onlineEmit = (gameEvent: GameEvents) => {
    if (gameEvent) {
      const tranformedEvent = this.transformOnlineEvent(gameEvent);
      this.emitter.emit(tranformedEvent, false);
    }
  };

  transformOnlineEvent = (gameEvent: GameEvents): GameEvents => {
    switch (gameEvent.name) {
      case GameEventType.CellSelected:
        return {
          ...gameEvent,
          payload: this._board.getCell(gameEvent.payload.id),
        };
      default:
        return gameEvent;
    }
  };

  getBoardConfig = () => {
    return {
      width: this._board.boardSprite.width,
      height: this._board.boardSprite.height,
      x: this._board.boardSprite.x,
      y: this._board.boardSprite.y,
    };
  };
}

export default TicTacFourGame;
