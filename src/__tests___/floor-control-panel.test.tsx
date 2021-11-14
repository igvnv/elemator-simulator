import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../utils/test-utils';

beforeEach(() => {
  jest.useFakeTimers();
});

describe('Floor control panel', () => {
  it('displays floor control panels for each floor', () => {
    const { container } = render();

    const controlPanels = container.querySelectorAll('.control-panel_small');

    expect(controlPanels).toHaveLength(6);
  });

  describe('Idling elevator, floor control panel pushed', () => {
    it('moves elevator to the floor', () => {
      render();

      const floorPanel = screen.getByTestId('floor-2-control-panel');
      const buttonDown = within(floorPanel).getByRole('button', {
        name: 'Down',
      });

      fireEvent.click(buttonDown);

      jest.runAllTimers();

      expect(
        screen.getByRole('button', { name: '2' }).getAttribute('data-current')
      ).toBe('true');
    });
  });

  describe('Elevator is moving', () => {
    describe('Requested floor is on moving direction', () => {
      it('switches on the floor button in elevator control panel', () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonUp = within(floorPanel).getByRole('button', {
          name: 'Up',
        });
        const secondFloor = screen.getByRole('button', { name: '2' });

        fireEvent.click(buttonUp);

        expect(secondFloor.getAttribute('data-in-queue')).toBe('true');
      });

      it('switches on floor request buttons', () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonUp = within(floorPanel).getByRole('button', {
          name: 'Up',
        });
        const buttonDown = within(floorPanel).getByRole('button', {
          name: 'Down',
        });

        fireEvent.click(buttonUp);

        expect(buttonUp.getAttribute('data-in-queue')).toBe('true');
        expect(buttonDown.getAttribute('data-in-queue')).toBe('true');
      });

      it('adds the floor to route', async () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonUp = within(floorPanel).getByRole('button', {
          name: 'Up',
        });

        const firstFloor = screen.getByRole('button', { name: '2' });
        const secondFloor = screen.getByRole('button', { name: '2' });
        const thirdFloor = screen.getByRole('button', { name: '2' });

        fireEvent.click(thirdFloor);

        await waitFor(() =>
          expect(firstFloor.getAttribute('data-current')).toBe('true')
        );

        fireEvent.click(buttonUp);

        // Goes to 2nd floor first
        await waitFor(() => {
          expect(secondFloor.getAttribute('data-current')).toBe('true');
          expect(secondFloor.getAttribute('data-open')).toBe('true');
        });

        // Then continues going to 3rd
        await waitFor(() => {
          expect(thirdFloor.getAttribute('data-current')).toBe('true');
          expect(thirdFloor.getAttribute('data-open')).toBe('true');
        });
      });
    });

    describe('Requested floor is not on moving direction', () => {
      it('switches on the floor button in elevator control panel', async () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonUp = within(floorPanel).getByRole('button', {
          name: 'Up',
        });

        const firstFloor = screen.getByRole('button', { name: '2' });
        const thirdFloor = screen.getByRole('button', { name: '2' });

        fireEvent.click(thirdFloor);

        await waitFor(() =>
          expect(firstFloor.getAttribute('data-current')).toBe('true')
        );

        fireEvent.click(buttonUp);

        expect(buttonUp.getAttribute('data-in-queue')).toBe('true');
      });

      it('switches on floor request buttons', async () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonDown = within(floorPanel).getByRole('button', {
          name: 'Down',
        });

        const firstFloor = screen.getByRole('button', { name: '1' });
        const thirdFloor = screen.getByRole('button', { name: '3' });

        fireEvent.click(thirdFloor);

        await waitFor(() =>
          expect(firstFloor.getAttribute('data-current')).toBe('true')
        );

        fireEvent.click(buttonDown);

        expect(buttonDown.getAttribute('data-in-queue')).toBe('true');
      });

      it('moves to the requested floor last', async () => {
        render();

        const floorPanel = screen.getByTestId('floor-2-control-panel');
        const buttonDown = within(floorPanel).getByRole('button', {
          name: 'Down',
        });

        const firstFloor = screen.getByRole('button', { name: '1' });
        const secondFloor = screen.getByRole('button', { name: '2' });
        const thirdFloor = screen.getByRole('button', { name: '3' });

        fireEvent.click(thirdFloor);

        await waitFor(() =>
          expect(firstFloor.getAttribute('data-current')).toBe('true')
        );

        fireEvent.click(buttonDown);
        jest.runAllTimers();

        await waitFor(() => {
          expect(secondFloor.getAttribute('data-open')).toBe('true');
          expect(secondFloor.getAttribute('data-current')).toBe('true');
        });
      });
    });
  });
});
