import { makeAutoObservable, runInAction } from 'mobx';
import { Config } from '../config';
import { ElevatorStatus, elevatorStatusLabel } from '../types';
import { calculateRoute } from '../utils/elevator-router';

/**
 * Elevator controller.
 *
 * Processes buttons presses and navigates elevator between floors.
 */
export class ElevatorController {
  public readonly floorsNumbers: number[];
  public currentFloor: number;
  public nextStopFloor?: number;
  public status: ElevatorStatus = ElevatorStatus.Idling;
  public route: number[] = [];

  /** Time from start floor before next stop. */
  public travelTime: number = 0;

  /**
   * Human readable elevator status.
   */
  public get statusLabel(): string {
    return elevatorStatusLabel[this.status];
  }

  private buttonPressDelayTimeout?: NodeJS.Timeout;
  private routeCalculated = false;

  constructor() {
    makeAutoObservable(this);

    this.currentFloor = Config.floorFrom;
    this.floorsNumbers = [...Array(Config.floorTo - Config.floorFrom + 1)].map(
      (_, i) => Config.floorTo - i
    );

    this.floorReached = this.floorReached.bind(this);
    this.pressControlPanelButton = this.pressControlPanelButton.bind(this);
    this.startRoute = this.startRoute.bind(this);
  }

  public pressControlPanelButton(floor: number) {
    // Skips unnecessary floors: already existed in route and current.
    if (this.route.includes(floor) || floor === this.currentFloor) {
      return;
    }

    this.route = [...this.route, floor];
    this.routeCalculated = false;

    if (this.buttonPressDelayTimeout) {
      clearTimeout(this.buttonPressDelayTimeout);
    }

    // Starting route after configured delay.
    this.buttonPressDelayTimeout = setTimeout(
      this.startRoute,
      Config.buttonPressDelay
    );
  }

  private startRoute() {
    // Elevator is already moving.
    if (
      this.status !== ElevatorStatus.Idling &&
      this.status !== ElevatorStatus.DoorsOpen
    ) {
      console.warn(
        'ElevatorController: can not start travel, elevator is already moving.'
      );
      return;
    }

    // No floors to visit. Stop moving.
    if (!this.route.length) {
      this.status = ElevatorStatus.Idling;
      this.nextStopFloor = undefined;
      return;
    }

    let route = [...this.route];

    if (!this.routeCalculated) {
      // When `nextStopFloor` is defined it should be added as a floor to visit.
      route = calculateRoute(
        this.currentFloor,
        this.nextStopFloor !== undefined
          ? [this.nextStopFloor, ...this.route]
          : this.route
      );
      this.routeCalculated = true;
    }

    this.nextStopFloor = route.shift();
    this.route = route;
    this.status =
      this.nextStopFloor! > this.currentFloor
        ? ElevatorStatus.MovingUp
        : ElevatorStatus.MovingDown;
    this.travelTime =
      (Math.abs(this.currentFloor - this.nextStopFloor!) + 1) *
      Config.floorTravelDuration;

    setTimeout(() => {
      this.floorReached(
        this.status === ElevatorStatus.MovingUp
          ? this.currentFloor + 1
          : this.currentFloor - 1
      );
    }, Config.floorTravelDuration);
  }

  /**
   * Is called when any floor is reached. Checks if should open
   * the doors or recalculate route; and goes to the next floor if possible.
   */
  private floorReached(floorNumber: number) {
    this.currentFloor = floorNumber;

    // Floor in route is reached.
    // Waiting elevator to stop (it takes `Config.floorTravelDuration`)
    // then try to start travel to another floor is possible.
    if (floorNumber === this.nextStopFloor) {
      this.currentFloor = this.nextStopFloor!;

      setTimeout(() => {
        runInAction(() => {
          this.status = ElevatorStatus.DoorsOpen;
          setTimeout(this.startRoute, Config.doorsOpenDuration);
        });
      }, Config.floorTravelDuration);
      return;
    }

    // Route was changed during moving.
    // Setting elevator to Idle and restarting travel to add new floors
    // to route.
    if (!this.routeCalculated) {
      setTimeout(() => {
        runInAction(() => {
          this.status = ElevatorStatus.Idling;
          this.startRoute();
        });
      }, Config.doorsOpenDuration);

      return;
    }

    // Nothing happened. Moving to the next floor.
    setTimeout(() => {
      this.floorReached(
        this.status === ElevatorStatus.MovingUp
          ? floorNumber + 1
          : floorNumber - 1
      );
    }, Config.floorTravelDuration);
  }
}
