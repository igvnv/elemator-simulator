/**
 * Calculates route which visits all the passed floors in shortest amount of time.
 *
 * Finds length for travels between minimum down and maximum up floors and
 * moves to the closes destination first.
 *
 * @param currentFloor Floor to start
 * @param floorsToVisit List of floors to visit
 * @returns Shortest route that visits all the passed floors.
 */
export function calculateRoute(
  currentFloor: number,
  floorsToVisit: number[]
): number[] {
  if (floorsToVisit.length <= 1) {
    return floorsToVisit;
  }

  const sortedFloors = [...floorsToVisit].sort();

  const minFloor = sortedFloors[0];
  const maxFloor = sortedFloors[sortedFloors.length - 1];

  // No direction switch.
  if (maxFloor < currentFloor) {
    return sortedFloors.reverse();
  } else if (minFloor > currentFloor) {
    return sortedFloors;
  }

  const routeDown = sortedFloors
    .filter((floor) => floor < currentFloor)
    .reverse();
  const routeUp = sortedFloors.filter((floor) => floor > currentFloor);

  // When lowest floor is closer to reach, go down first.
  if (currentFloor - minFloor < maxFloor - currentFloor) {
    return [...routeDown, ...routeUp];
  }
  // When highest floor is closer to reach, go up first.
  else {
    return [...routeUp, ...routeDown];
  }
}
