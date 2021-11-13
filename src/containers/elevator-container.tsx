import { BuildingMiniature, ControlPanel } from '../components';

export const ElevatorContainer: React.FC = () => {
  return (
    <div className="simulator">
      <h2 className="simulator__title">Elevator emulator</h2>

      <div className="simulator__screen">
        <div className="simulator__control-panel">
          <ControlPanel />
        </div>
        <div className="simulator__building">
          <BuildingMiniature />
        </div>
      </div>
    </div>
  );
};
