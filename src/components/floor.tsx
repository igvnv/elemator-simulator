type FloorMiniatureProps = {
  number: number;
};

export const Floor: React.FC<FloorMiniatureProps> = ({ number }) => {
  return (
    <div className="floor">
      <span className="floor__number">{number}</span>
    </div>
  );
};
