import { makeAutoObservable, runInAction } from 'mobx';
import { Config } from '../config';
import { ElevatorStatus, elevatorStatusLabel } from '../types';
import { calculateRoute } from '../utils/elevator-router';

type RequestDirection = 'up' | 'down';

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
  private route: number[] = [];
  private floorsInQueue: Array<[number, RequestDirection | undefined]> = [];

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
    this.pressElevatorPanelButton = this.pressElevatorPanelButton.bind(this);
    this.pressFloorPanelButton = this.pressFloorPanelButton.bind(this);
    this.startRoute = this.startRoute.bind(this);
  }

  /**
   * Handles floor panel buttons presses.
   */
  public pressFloorPanelButton(floor: number, direction: RequestDirection) {
    this.addFloor(floor, direction);
  }

  /**
   * Handles elevator buttons presses.
   */
  public pressElevatorPanelButton(floor: number) {
    this.addFloor(floor);
  }

  /**
   * Decides if the floor in queue (for direction or independent of direction).
   */
  public isFloorButtonInQueue(
    floor: number,
    direction?: RequestDirection
  ): boolean {
    if (this.nextStopFloor === floor) {
      return true;
    }

    if (this.route.includes(floor)) {
      return true;
    }

    return !!this.floorsInQueue.find(
      ([queueFloor, queueDirection]) =>
        floor === queueFloor && (direction === queueDirection || !direction)
    );
  }

  private addFloor(floor: number, direction?: RequestDirection) {
    // Skips unnecessary floors: already existed in route and current.
    if (this.route.includes(floor) || floor === this.currentFloor) {
      return;
    }

    // If elevator is idling then add to route and start work.
    if (
      this.status === ElevatorStatus.Idling ||
      this.status === ElevatorStatus.DoorsOpen
    ) {
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

      return;
    }

    // If requested floor is on current direction then add floor to the route.
    if (
      ((!direction || direction === 'up') &&
        this.status === ElevatorStatus.MovingUp &&
        floor > this.currentFloor) ||
      ((!direction || direction === 'down') &&
        this.status === ElevatorStatus.MovingDown &&
        floor < this.currentFloor)
    ) {
      this.route = [...this.route, floor];
      this.routeCalculated = false;
      return;
    }

    this.floorsInQueue = [...this.floorsInQueue, [floor, direction]];
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

      // Floors queue is not empty, add them to route and mark route as updated.
      if (this.floorsInQueue.length) {
        const floors = Array.from(
          new Set(this.floorsInQueue.map(([floor]) => floor))
        );
        this.route = [...this.route, ...floors];
        this.floorsInQueue = [];
        this.routeCalculated = true;
      }

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
