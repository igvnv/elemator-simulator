import { observer } from 'mobx-react-lite';
import { useElevatorController } from '../providers';

type FloorControlPanelProps = {
  floor: number;
};

export const FloorControlPanel: React.FC<FloorControlPanelProps> = observer(
  ({ floor }) => {
    const elevatorController = useElevatorController();

    return (
      <div
        className="control-panel control-panel_small"
        data-testid={`floor-${floor}-control-panel`}
      >
        <button
          aria-label="Down"
          className="control-panel__button control-panel__button_small"
          data-in-queue={elevatorController.isFloorButtonInQueue(floor, 'down')}
          onClick={() => {
            elevatorController.pressFloorPanelButton(floor, 'down');
          }}
        >
          ▼
        </button>
        <button
          aria-label="Up"
          className="control-panel__button control-panel__button_small"
          data-in-queue={elevatorController.isFloorButtonInQueue(floor, 'up')}
          onClick={() => {
            elevatorController.pressFloorPanelButton(floor, 'up');
          }}
        >
          ▲
        </button>
      </div>
    );
  }
);
