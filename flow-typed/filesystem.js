declare type FileError = Error;
declare type FileSystemFlags = $Exact<{
  create?: boolean,
  exclusive?: boolean
}>;
declare class Metadata {
  modificationTime: Date,
  size: number
};
declare type DOMFileSystem$errorHandler = ((err: FileError) => void);
declare type DOMFileSystem$getFile = (path: string, options: FileSystemFlags, successCallback: (FileSystemFileEntry) => void, errorCallback?: DOMFileSystem$errorHandler) => void;

declare type DOMFileSystem$getDirectory = (path: string, options: FileSystemFlags, successCallback: ((FileSystemDirectoryEntry) => void), errorCallback?: DOMFileSystem$errorHandler) => void;

declare var window: any & {
  TEMPORARY: 0,
  PERSISTENT: 1
};

declare type FileSystemEntry = FileSystemFileEntry
  | FileSystemDirectoryEntry

declare class DOMFileSystem$FileSystemEntryBase {
  filesystem: DOMFileSystem;
  fullPath: string;
  name: string;

  copyTo: (newParent: FileSystemEntry, newName?: string, successCallback?: (FileSystemEntry) => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  getMetadata: (successCallback: (Metadata) => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  getParent: (successCallback: (FileSystemEntry) => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  moveTo: (newParent: FileSystemEntry, newName?: string, successCallback?: (FileSystemEntry) => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  remove: (successCallback: () => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  toURL: (mimeType: MimeType) => void
};

declare class FileWriter {
  write: (Blob) => void,
  onerror?: (FileError) => void,
  onwriteend?: (FileError) => void
};

declare class FileSystemFileEntry extends DOMFileSystem$FileSystemEntryBase {
  filesystem: DOMFileSystem,
  fullPath: string,
  name: string,
  isFile: true,
  isDirectory: false,
  file: ((File) => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  createWriter: ((FileWriter) => void, errorCallback?: DOMFileSystem$errorHandler) => void
};

declare class FileSystemDirectoryEntry extends DOMFileSystem$FileSystemEntryBase {
  filesystem: DOMFileSystem,
  fullPath: string,
  name: string,
  isFile: false,
  isDirectory: true,

  removeRecursively: (successCallback: () => void, errorCallback?: DOMFileSystem$errorHandler) => void,
  getFile: DOMFileSystem$getFile,
  getDirectory: DOMFileSystem$getDirectory
};

declare class DOMFileSystem {
  name: string,
  root: FileSystemDirectoryEntry
};

declare type DOMFileSystem$grantQuota = (granted: number) => void;
declare type DOMFileSystem$queryQuota = (type?: DOMFileSystem$type, used: number, quota: number) => void;
declare type DOMFileSystem$type = window.TEMPORARY | window.PERSISTENT;

declare class DOMFileSystem$WebkitPersistentStorage {
  requestQuota: (size: number, DOMFileSystem$grantQuota, errorCallback?: DOMFileSystem$errorHandler) => void,
  queryUsageAndQuota: (DOMFileSystem$queryQuota, errorCallback?: DOMFileSystem$errorHandler) => void
};

declare type DOMFileSystem$resolveLocalFileSystemURL = (file: string, (FileSystemEntry) => void, errorCallback?: DOMFileSystem$errorHandler) => void;
declare type DOMFileSystem$requestFileSystem = (DOMFileSystem$type, size: number, (DOMFileSystem) => void, errorCallback?: DOMFileSystem$errorHandler) => void;

declare var requestFileSystem: ?DOMFileSystem$requestFileSystem;
declare var webkitRequestFileSystem: ?DOMFileSystem$requestFileSystem;
declare var resolveLocalFileSystemURL: ?DOMFileSystem$resolveLocalFileSystemURL;
declare var webkitResolveLocalFileSystemURL: ?DOMFileSystem$resolveLocalFileSystemURL;

declare type FileSystemNavigator = {
  webkitPersistentStorage?: DOMFileSystem$WebkitPersistentStorage
}
declare var navigator: Navigator & FileSystemNavigator
