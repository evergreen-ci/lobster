// @flow strict
import { EVERGREEN_BASE } from "./config";
export type TestMetadata = $ReadOnly<
  $Exact<{
    base_status?: ?string,
    duration?: number,
    end_time?: string,
    execution?: number,
    exit_code?: number,
    line_num?: number,
    logs: $ReadOnly<
      $Exact<{
        line_num?: string,
        log_id?: string,
        url?: string,
        url_html_display?: string,
        url_raw?: string,
        url_raw_display?: string,
      }>
    >,
    start_time?: string,
    status?: string,
    task_id?: string,
    test_file?: string,
    test_id?: string,
  }>
>;

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
}): Promise<TestMetadata | void> => {
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
