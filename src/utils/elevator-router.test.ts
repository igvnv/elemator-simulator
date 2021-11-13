import { calculateRoute } from './elevator-router';

describe('Elevator router', () => {
  describe('Only one floor to visit', () => {
    it('returns only the passed floor', () => {
      expect(calculateRoute(5, [1])).toEqual([1]);
    });
  });

  it('finds simple way', () => {
    expect(calculateRoute(5, [0, 1, 3])).toEqual([3, 1, 0]);
  });

  it('finds simple way (up first)', () => {
    expect(calculateRoute(3, [0, 1, 4])).toEqual([4, 1, 0]);
  });

  it('finds simple way (down first)', () => {
    expect(calculateRoute(2, [1, 0, 5])).toEqual([1, 0, 5]);
  });

  describe('All floors lower than current', () => {
    it('visits floors in sorted order', () => {
      expect(calculateRoute(5, [1, 4, 2])).toEqual([4, 2, 1]);
    });
  });

  describe('All floors higher than current', () => {
    it('visits floors in sorted order', () => {
      expect(calculateRoute(0, [1, 4, 2])).toEqual([1, 2, 4]);
    });
  });
});
