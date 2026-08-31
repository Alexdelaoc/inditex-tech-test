import { resultsLabel } from './ResultsCount';

describe('resultsLabel', () => {
  it('keeps the singular in agreement when there is a single result', () => {
    expect(resultsLabel(1)).toBe('1 result');
  });

  it('uses the plural for anything else', () => {
    expect(resultsLabel(0)).toBe('0 results');
    expect(resultsLabel(19)).toBe('19 results');
  });
});
