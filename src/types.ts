export enum ElevatorStatus {
  Idling,
  MovingUp,
  MovingDown,
  DoorsOpen,
}

export const elevatorStatusLabel: Record<
  ElevatorStatus,
  string
> = Object.freeze({
  [ElevatorStatus.Idling]: 'Waiting',
  [ElevatorStatus.MovingUp]: 'UP',
  [ElevatorStatus.MovingDown]: 'DOWN',
  [ElevatorStatus.DoorsOpen]: 'Open',
});
