import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useElevatorController } from '../providers';
import { ElevatorStatus } from '../types';

import catImage from '../assets/cat.jpg';

/**
 * Displays miniature version of elevator. Moves it between floors
 * and opens doors when needed.
 */
export const ElevatorMiniature: React.FC = observer(() => {
  const elevatorController = useElevatorController();
  const topFloor = elevatorController.floorsNumbers[0];
  const floorsToTop =
    topFloor -
    (elevatorController.nextStopFloor ?? elevatorController.currentFloor);

  const elevatorPositionStyles = useMemo(() => {
    const diffPercent =
      (100 / elevatorController.floorsNumbers.length) * floorsToTop;

    return {
      top: `${diffPercent}%`,
      transitionDuration: `${elevatorController.travelTime}ms`,
    };
  }, [
    elevatorController.floorsNumbers.length,
    elevatorController.travelTime,
    floorsToTop,
  ]);

  return (
    <div className="elevator" style={elevatorPositionStyles}>
      <div
        className={classNames('elevator__doors', {
          elevator__doors_opened:
            elevatorController.status === ElevatorStatus.DoorsOpen ||
            elevatorController.status === ElevatorStatus.Idling,
        })}
      />
      <div className="elevator__interior">
        <img src={catImage} alt="Cat's painting in Van Gogh's style" />
      </div>
    </div>
  );
});
