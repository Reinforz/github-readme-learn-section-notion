import * as core from '@actions/core';
import { checkForSections } from '../../src/utils/checkForSections';

afterEach(() => {
  jest.restoreAllMocks();
});

it(`Should return correct start and end index`, () => {
  const [startIdx, endIdx] = checkForSections([
    '1',
    '<!--START_SECTION:learn-->',
    '2',
    '<!--END_SECTION:learn-->',
    '3'
  ]);
  expect(startIdx).toBe(1);
  expect(endIdx).toBe(3);
});

it(`Should return correct start and end index`, () => {
  const setFailedMock = jest.spyOn(core, 'setFailed');

  const [startIdx, endIdx] = checkForSections(['1', '2', '3']);
  expect(setFailedMock).toHaveBeenNthCalledWith(
    1,
    `Couldn't find the <!--START_SECTION:learn--> comment. Exiting!`
  );
  expect(setFailedMock).toHaveBeenNthCalledWith(
    2,
    `Couldn't find the <!--END_SECTION:learn--> comment. Exiting!`
  );
  expect(startIdx).toBe(-1);
  expect(endIdx).toBe(-1);
});
