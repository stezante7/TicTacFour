import { Player } from "../gameobjects/Player";

export const getRandomPlayerIdx = (players: Player[]) => {
  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return randomInteger(0, players.length - 1);
};
