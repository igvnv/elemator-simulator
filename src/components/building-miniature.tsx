import { ElevatorMiniature } from './elevator';
import { Floor } from './floor';
import { useElevatorController } from '../providers';

export const BuildingMiniature: React.FC = () => {
  const elevatorController = useElevatorController();

  return (
    <div className="building">
      <div className="building__floors">
        <ElevatorMiniature />
        {elevatorController.floorsNumbers.map((floorNumber) => (
          <Floor key={floorNumber} number={floorNumber} />
        ))}
      </div>
    </div>
  );
};
