import * as PIXI from "pixi.js";
import { ZoomBlurFilter, TiltShiftFilter } from "pixi-filters";
import { useGoogleWebFonts } from "./WebFontsLoader";
import TicTacFourGame from "../TicTacFourGame";

useGoogleWebFonts(["Josefin Sans"]);

const defaultTextOptions = {
  fontFamily: "Josefin Sans",
  fontSize: 30,
  fill: 0x000000,
  align: "left",
};

class GameHud {
  private readonly _game: TicTacFourGame;
  private _helperText: PIXI.Text;
  private _dialogContainer: PIXI.Container;
  private _dialogTitle: PIXI.Text;
  private _dialogMessage: PIXI.Text;

  constructor(game: TicTacFourGame) {
    this._game = game;

    this._helperText = new PIXI.Text("", defaultTextOptions);
    this._game.addChild(this._helperText);

    this._dialogTitle = new PIXI.Text("", {
      ...defaultTextOptions,
      fontSize: 40,
      fill: 0xff8c00,
    });

    this._dialogMessage = new PIXI.Text("", defaultTextOptions);

    this._dialogContainer = new PIXI.Container();
    this._dialogContainer.width = game.screen.width;
    this._dialogContainer.height = game.screen.height;

    const modal = new PIXI.Graphics()
      .beginFill(0xffffff)
      .drawRect(0, 0, game.screen.width, game.screen.height)
      .endFill();

    modal.alpha = 0.2;

    this._dialogContainer.addChild(this._dialogTitle);
    this._dialogContainer.addChild(this._dialogMessage);
    this._dialogContainer.visible = false;
    this._dialogContainer.addChild(modal);

    game.stage.addChild(this._dialogContainer);
  }

  printHelperText(message: string, onPointerdown?: () => void) {
    this._helperText.text = message;
    this._helperText.position.set(40, 8);

    if (onPointerdown) {
      this._helperText.interactive = true;
      this._helperText.buttonMode = true;
      this._helperText.on("pointerdown", onPointerdown);
    } else {
      this._helperText.interactive = false;
      this._helperText.buttonMode = false;
    }
  }

  hideDialog() {
    const gameContainer = this._game.getGameContainer();
    gameContainer.interactive = true;
    gameContainer.children.forEach((child) => {
      child.interactive = true;
    });
    gameContainer.filters = [];

    this._dialogContainer.interactive = false;
    this._dialogContainer.visible = false;
  }

  dialog(title: string, message?: string) {
    this._dialogTitle.text = title;
    this._dialogMessage.text = message ? message : "";

    this._dialogTitle.position.set(
      (this._game.screen.width - this._dialogTitle.width) / 2,
      this._game.screen.height * 0.2
    );

    this._dialogMessage.position.set(
      (this._game.screen.width - this._dialogMessage.width) / 2,
      this._game.screen.height * 0.2 + 50
    );

    this._dialogContainer.visible = true;
    this._dialogContainer.interactive = true;

    const gameContainer = this._game.getGameContainer();
    gameContainer.interactive = false;
    gameContainer.children.forEach((child) => {
      child.interactive = false;
    });

    const zoomFilter = new ZoomBlurFilter({
      strength: 0.05,
      center: [this._game.screen.width / 2, this._game.screen.height / 2],
      innerRadius: 50,
    });
    gameContainer.filters = [zoomFilter];
  }
}

export default GameHud;
