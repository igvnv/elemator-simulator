import { render } from '../utils/test-utils';

describe('Building preview', () => {
  it('displays all the floors', () => {
    const { container } = render();

    const floors = container.querySelectorAll('.floor');

    expect(floors).toHaveLength(6);
  });

  // prettier-ignore
  test.each`
    index | label
    ${0} | ${'5'}
    ${1} | ${'4'}
    ${2} | ${'3'}
    ${3} | ${'2'}
    ${4} | ${'1'}
    ${5} | ${'0'}
  `(
    'displays %label on $index position',
    ({ index, label }: { index: number; label: string }) => {
      const { container } = render();

      const floors = container.querySelectorAll('.floor');

      expect(floors[index]).toHaveTextContent(label);
    }
  );
});
