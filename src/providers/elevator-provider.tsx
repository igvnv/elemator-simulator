import { createContext, useContext, useState } from 'react';
import { ElevatorController } from '../controllers';

const ElevatorContext = createContext<ElevatorController | undefined>(
  undefined
);

/**
 * Creates and keeps elevator controller.
 */
export const ElevatorProvider: React.FC = ({ children }) => {
  const [elevatorController] = useState(() => new ElevatorController());

  return (
    <ElevatorContext.Provider value={elevatorController}>
      {children}
    </ElevatorContext.Provider>
  );
};
/**
 * Returns `ElevatorController` from context.
 */
export const useElevatorController = (): ElevatorController => {
  const elevatorController = useContext(ElevatorContext);

  if (!elevatorController) {
    throw new Error(
      'useElevatorProvider: parent component must be wrapped in ElevatorProvider'
    );
  }

  return elevatorController;
};
