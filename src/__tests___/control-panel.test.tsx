import { fireEvent, render, screen, waitFor } from '../utils/test-utils';

beforeEach(() => {
  jest.useFakeTimers();
});

describe('Control panel', () => {
  describe('Default state', () => {
    it('selects the lowest floor', () => {
      render();

      const baseFloorButton = screen.getByRole('button', { name: '0' });
      expect(baseFloorButton.getAttribute('data-current')).toBeTruthy();
    });

    it('selects only one floor', () => {
      const { container } = render();

      const selectedButtons = container.querySelectorAll(
        '[data-current="true"]'
      );

      expect(selectedButtons).toHaveLength(1);
    });

    it('has no buttons in queue', () => {
      const { container } = render();

      const queuedButtons = container.querySelectorAll(
        '[data-in-queue="true"]'
      );

      expect(queuedButtons).toHaveLength(0);
    });
  });

  describe('Click on floor button', () => {
    describe('"In queue" status', () => {
      it('marks pushed floor as "in queue"', () => {
        render();

        const secondFloor = screen.getByRole('button', { name: '2' });

        expect(secondFloor.getAttribute('data-in-queue')).toBe('false');

        fireEvent.click(secondFloor);

        expect(secondFloor.getAttribute('data-in-queue')).toBe('true');
      });

      it('removes "in queue" mark when the floor is reached', () => {
        render();

        const secondFloor = screen.getByRole('button', { name: '2' });

        fireEvent.click(secondFloor);
        jest.runAllTimers();

        expect(secondFloor.getAttribute('data-in-queue')).toBe('false');
      });
    });

    it('moves elevator to the pushed floor', () => {
      render();

      const baseFloor = screen.getByRole('button', { name: '0' });
      const secondFloor = screen.getByRole('button', { name: '2' });

      fireEvent.click(secondFloor);
      jest.runAllTimers();

      expect(secondFloor.getAttribute('data-current')).toBe('true');
      expect(baseFloor.getAttribute('data-current')).toBe('false');
    });
  });

  describe('Multiple floors route', () => {
    test('elevator visits all the floors in shortest route', async () => {
      render();

      const baseFloor = screen.getByRole('button', { name: '0' });
      const firstFloor = screen.getByRole('button', { name: '1' });
      const thirdFloor = screen.getByRole('button', { name: '3' });
      const fifthFloor = screen.getByRole('button', { name: '5' });

      // Set 5th floor as start point
      fireEvent.click(fifthFloor);
      jest.runAllTimers();

      fireEvent.click(thirdFloor);
      fireEvent.click(firstFloor);
      fireEvent.click(baseFloor);

      // Uses shortest route: 3->1->0
      await waitFor(() =>
        expect(thirdFloor.getAttribute('data-open')).toBe('true')
      );
      await waitFor(() =>
        expect(firstFloor.getAttribute('data-open')).toBe('true')
      );
      await waitFor(() =>
        expect(baseFloor.getAttribute('data-open')).toBe('true')
      );
    });

    describe('New floor is added during moving', () => {
      it('adds the floor to current route', async () => {
        render();

        const firstFloor = screen.getByRole('button', { name: '1' });
        const thirdFloor = screen.getByRole('button', { name: '3' });
        const forthFloor = screen.getByRole('button', { name: '4' });
        const fifthFloor = screen.getByRole('button', { name: '5' });

        // Set 5th floor as start point
        fireEvent.click(fifthFloor);
        jest.runAllTimers();

        fireEvent.click(thirdFloor);
        fireEvent.click(firstFloor);

        // Uses shortest route: 3[reached]->1 +4 => 3->4->1
        await waitFor(() =>
          expect(thirdFloor.getAttribute('data-open')).toBe('true')
        );

        fireEvent.click(forthFloor);

        await waitFor(() =>
          expect(forthFloor.getAttribute('data-open')).toBe('true')
        );
        await waitFor(() =>
          expect(firstFloor.getAttribute('data-open')).toBe('true')
        );
      });
    });
  });
});
