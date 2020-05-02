import { TicTacFourCollection } from "./TicTacFourDb";
import { Player } from "../gameobjects/Player";
import TicTacFourGame, { GameType } from "../TicTacFourGame";
import { GameEvents } from "../gameevents";

type GameCanvasRenderer = (canvas: HTMLCanvasElement) => void;

class MultiplayerGame {
  private readonly _renderGameCanvas: GameCanvasRenderer;

  constructor(
    name: string,
    code: string,
    isMasterPlayer: boolean,
    renderGameCanvas: GameCanvasRenderer
  ) {
    this._renderGameCanvas = renderGameCanvas;

    if (isMasterPlayer) {
      this._registerPrimaryPlayer(name, code);
    } else {
      this._registerSecondaryPlayer(name, code);
    }
  }

  async _registerPrimaryPlayer(name: string, code: string) {
    await TicTacFourCollection.doc(code).set({
      primary: name,
      secondary: null,
      event: null,
    });

    this._waitForPlayerToJoin(code);
  }

  async _registerSecondaryPlayer(name: string, code: string) {
    const gameDoc = TicTacFourCollection.doc(code);
    const doc = await (await gameDoc.get()).data();

    await gameDoc.set({
      ...doc,
      secondary: name,
      event: null,
    });

    const localPlayer: Player = { id: 1, display: name, type: "local" };
    const onlinePlayer: Player = {
      id: 0,
      display: doc.primary,
      type: "online",
    };

    this._playGame(code, onlinePlayer, localPlayer);
  }

  _waitForPlayerToJoin(code: string) {
    const unsubscribe = TicTacFourCollection.doc(code).onSnapshot((doc) => {
      const data = doc.data();

      if (data.primary && data.secondary) {
        unsubscribe();
        const localPlayer: Player = {
          id: 0,
          display: data.primary,
          type: "local",
        };
        const onlinePlayer: Player = {
          id: 1,
          display: data.secondary,
          type: "online",
        };

        this._playGame(code, onlinePlayer, localPlayer);
      }
    });
  }

  _playGame(code: string, onlinePlayer: Player, localPlayer: Player) {
    const app = new TicTacFourGame(
      GameType.Online,
      [onlinePlayer, localPlayer],
      0,
      (gameEvent: GameEvents) => {
        if (gameEvent) {
          const doc = {
            gameEvent: gameEvent,
            playerId: localPlayer.id,
          };
          TicTacFourCollection.doc(code).set(doc);
        }
      }
    );

    TicTacFourCollection.doc(code).onSnapshot((doc) => {
      const data = doc.data();

      if (data.gameEvent && data.playerId !== localPlayer.id) {
        app.onlineEmit(data.gameEvent);
      }
    });

    this._renderGameCanvas(app.view);
  }
}

export default MultiplayerGame;
