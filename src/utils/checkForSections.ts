import * as core from '@actions/core';

export const checkForSections = (readmeLines: string[]) => {
  const startIdx = readmeLines.findIndex(
    (content) => content.trim() === '<!--START_SECTION:learn-->'
  );

  if (startIdx === -1) {
    core.setFailed(
      `Couldn't find the <!--START_SECTION:learn--> comment. Exiting!`
    );
  }

  const endIdx = readmeLines.findIndex(
    (content) => content.trim() === '<!--END_SECTION:learn-->'
  );

  if (endIdx === -1) {
    core.setFailed(
      `Couldn't find the <!--END_SECTION:learn--> comment. Exiting!`
    );
  }

  return [startIdx, endIdx] as const;
};
