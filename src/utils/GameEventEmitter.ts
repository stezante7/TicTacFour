import { EventEmitter } from "events";
import { GameEvents } from "../gameevents";

export type GameEvent<TEventName, TEventPayload> = {
  name: TEventName;
  payload?: TEventPayload;
  listener?: (payload: TEventPayload) => void;
};

class LocalGameEventEmitter extends EventEmitter {}

class GameEventEmitter {
  private _emitter: LocalGameEventEmitter;
  private _publishEvent: (gameEvent: GameEvents) => void;

  constructor(publishEvent: (gameEvent: GameEvents) => void) {
    this._publishEvent = publishEvent;
    this._emitter = new LocalGameEventEmitter();
  }

  on = (gameEvent: GameEvents) => {
    return this._emitter.on(gameEvent.name, gameEvent.listener);
  };

  emit = (gameEvent: GameEvents, shouldPublish: boolean) => {
    if (shouldPublish) {
      this._publishEvent(gameEvent);
    }

    return this._emitter.emit(gameEvent.name, gameEvent.payload);
  };
}

export default GameEventEmitter;
