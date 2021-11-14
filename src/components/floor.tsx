import { FloorControlPanel } from './floor-control-panel';

type FloorMiniatureProps = {
  number: number;
};

export const Floor: React.FC<FloorMiniatureProps> = ({ number }) => {
  return (
    <div className="floor">
      <div className="floor__control-panel">
        <FloorControlPanel floor={number} />
      </div>
      <span className="floor__number">{number}</span>
    </div>
  );
};
