import TicTacFourGame, { GameType } from "./TicTacFourGame";
import { getRandomPlayerIdx } from "./utils/PlayersLoader";
import { Player } from "./gameobjects/Player";
import MultiplayerGame from "./multiplayer/MultiplayerGame";

function uuidv4() {
  return "xxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getInputElementById(id) {
  return document.getElementById(id) as HTMLInputElement;
}

enum HtmlElementId {
  PassAndPlayBtn = "passandplay-btn",
  GameModeSelector = "game-mode-selector",
  PassAndPlayForm = "passandplay-form",
  OnlinePlayerName = "online-player-name",
  LocalPlayer1Name = "local-player1-name",
  LocalPlayer2Name = "local-player2-name",
  StartLocalGameBtn = "start-local-game-btn",
  StartOnlineGameBtn = "start-online-game-btn",
  GameInitContainer = "game-init-container",
  TicTacFourGame = "tictacfour-game",
  OnlineBtn = "online-btn",
  OnlineForm = "online-form",
  OnlinePlayerInfo = "online-player-info",
  WaitingForPlayerToJoin = "waiting-for-player",
  GameLoader = "game-loader",
  GameLinkContainer = "game-link-container",
  GameLink = "game-link",
}

class GameHub {
  private _isMasterPlayer: boolean;
  private _code: string;

  constructor() {
    document
      .getElementById(HtmlElementId.PassAndPlayBtn)
      .addEventListener("click", () => {
        document.getElementById(HtmlElementId.GameModeSelector).remove();
        document
          .getElementById(HtmlElementId.PassAndPlayForm)
          .classList.remove("hidden");
      });

    document
      .getElementById(HtmlElementId.OnlineBtn)
      .addEventListener("click", () => {
        document.getElementById(HtmlElementId.GameModeSelector).remove();
        document
          .getElementById(HtmlElementId.OnlineForm)
          .classList.remove("hidden");
      });

    document
      .getElementById(HtmlElementId.OnlinePlayerName)
      .addEventListener("keypress", (evt) => {
        if (evt.key === "Enter") {
          this.startOnlineGame(this._code);
        }
      });

    document
      .getElementById(HtmlElementId.LocalPlayer2Name)
      .addEventListener("keypress", (evt) => {
        if (evt.key === "Enter") {
          this.startLocalGame();
        }
      });

    document
      .getElementById(HtmlElementId.StartLocalGameBtn)
      .addEventListener("click", () => this.startLocalGame());

    document
      .getElementById(HtmlElementId.StartOnlineGameBtn)
      .addEventListener("click", () => this.startOnlineGame(this._code));

    this.checkJoiningOnlinePlayer();
  }

  checkJoiningOnlinePlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    document.getElementById(HtmlElementId.GameLoader).classList.add("hidden");

    if (code) {
      this._isMasterPlayer = false;
      this._code = code;
      document.getElementById(HtmlElementId.GameModeSelector).remove();
      document
        .getElementById(HtmlElementId.OnlineForm)
        .classList.remove("hidden");
    } else {
      document
        .getElementById(HtmlElementId.GameModeSelector)
        .classList.remove("hidden");
    }
  }

  startLocalGame() {
    const localPlayer1 = getInputElementById(HtmlElementId.LocalPlayer1Name)
      .value;
    const localPlayer2 = getInputElementById(HtmlElementId.LocalPlayer2Name)
      .value;

    const players: Player[] = [
      { id: 0, display: this.getPlayerName(localPlayer1, 1), type: "local" },
      { id: 1, display: this.getPlayerName(localPlayer2, 2), type: "local" },
    ];

    const app = new TicTacFourGame(
      GameType.PassAndPlay,
      players,
      getRandomPlayerIdx(players),
      (evt) => console.info(evt.name)
    );

    this.renderGameCanvas(app.view);
  }

  renderGameCanvas(canvas: HTMLCanvasElement) {
    document.getElementById(HtmlElementId.GameInitContainer).remove();
    const tictacfourContainer = document.getElementById(
      HtmlElementId.TicTacFourGame
    );
    tictacfourContainer.appendChild(canvas);
  }

  startOnlineGame(code?: string) {
    this.initOnlineCode(code);

    const playerName = getInputElementById(HtmlElementId.OnlinePlayerName)
      .value;
    document.getElementById(HtmlElementId.OnlinePlayerInfo).remove();
    document
      .getElementById(HtmlElementId.WaitingForPlayerToJoin)
      .classList.remove("hidden");

    new MultiplayerGame(
      this.getPlayerName(playerName, this._isMasterPlayer ? 1 : 2),
      this._code,
      this._isMasterPlayer,
      this.renderGameCanvas
    );
  }

  getPlayerName(name: string, playerNumber: 1 | 2) {
    if (name && name !== "") {
      return name;
    }

    return playerNumber === 1 ? "Tima" : "Hermione";
  }

  initOnlineCode(code?: string) {
    if (!code) {
      this._isMasterPlayer = true;
      this.generateNewGameCode();
    } else {
      this._isMasterPlayer = false;
      this._code = code;
      document.getElementById(HtmlElementId.GameLinkContainer).remove();
    }

    const copy = document.getElementById("copy");

    if (copy) {
      document.getElementById("copy").addEventListener("click", () => {
        const linkDiv = getInputElementById(HtmlElementId.GameLink);
        linkDiv.select();
        document.execCommand("copy");
      });
    }
  }

  generateNewGameCode() {
    const code = uuidv4();
    const codeUrl = window.location.href + "?code=" + code;

    const codeInput = getInputElementById(HtmlElementId.GameLink);
    codeInput.value = codeUrl;
    this._code = code;
  }
}

// Init GameHub
new GameHub();
