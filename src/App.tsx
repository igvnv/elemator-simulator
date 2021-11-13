import { ElevatorContainer } from './containers';
import { ElevatorProvider } from './providers';

import './styles/main.scss';

function App() {
  return (
    <ElevatorProvider>
      <ElevatorContainer />
    </ElevatorProvider>
  );
}

export default App;
