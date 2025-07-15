enum DownloadResourceResult {
    FAIL_UNKNOWN = -1,
    SUCCESS = 0,
    FAIL_RESOURCE_NOT_FOUND = 1,
    FAIL_NO_COMPATIBLE_VERSION = 2,
    FAIL_OPERATION_CANCELLED = 3,
    FAIL_VERSION_ALREADY_INSTALLED = 4,
}
export default DownloadResourceResult;