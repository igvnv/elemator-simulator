import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useElevatorController } from '../providers';
import { ElevatorStatus } from '../types';

/**
 * Displays elevator's control panel with floors buttons and current
 * elevator's status.
 */
export const ControlPanel: React.FC = observer(() => {
  const elevatorController = useElevatorController();

  const pressButtonHandler = (floorNumber: number): (() => void) => {
    return () => {
      elevatorController.pressControlPanelButton(floorNumber);
    };
  };

  return (
    <div className="control-panel">
      <div className="control-panel__buttons">
        {elevatorController.floorsNumbers.map((floorNumber) => (
          <button
            className="control-panel__button"
            data-current={floorNumber === elevatorController.currentFloor}
            data-in-queue={
              elevatorController.route.includes(floorNumber) ||
              elevatorController.nextStopFloor === floorNumber
            }
            key={floorNumber}
            onClick={pressButtonHandler(floorNumber)}
          >
            {floorNumber}
          </button>
        ))}
      </div>

      <p
        className={classNames('control-panel__status', {
          'control-panel__status_operating':
            elevatorController.status !== ElevatorStatus.Idling,
        })}
      >
        {elevatorController.statusLabel}
      </p>
    </div>
  );
});
