// @flow strict
import { EVERGREEN_BASE } from "./config";

const getTestMetadataURL = ({
  taskId,
  execution,
  testId,
}: {
  taskId: string,
  execution: number,
  testId: string,
}) =>
  `${EVERGREEN_BASE}/rest/v2/tasks/${taskId}/tests?execution=${execution}&test_id=${testId}`;

export const getTestMetadata = async ({
  taskId,
  testId,
  execution,
}: {
  taskId: string,
  testId: string,
  execution: number,
}) => {
  const testMetadataUrl = getTestMetadataURL({ execution, taskId, testId });
  const testMetadataReq = new Request(testMetadataUrl);
  try {
    const res = await window.fetch(testMetadataReq, {
      credentials: "include",
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      if (data.length > 1) {
        console.error(
          "Multiple results error: multiple results came back from the rest v2 tests endpoint instead of 1. Url:",
          testMetadataUrl
        );
      }
      return data[0];
    }
  } catch (e) {}
  return { logs: {} };
};
