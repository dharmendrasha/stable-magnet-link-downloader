/* eslint-disable @typescript-eslint/no-explicit-any */
import FS from "fs";
import PATH from "path";

const constants = {
  DIRECTORY: "directory",
  FILE: "file",
};

export function safeReadDirSync(path: string) {
  let dirData = {};
  try {
    dirData = FS.readdirSync(path);
  } catch (ex) {
    const e = ex as unknown as any;
    if (e.code == "EACCES" || e.code == "EPERM") {
      //User does not have permissions, ignore directory
      return null;
    } else throw ex;
  }
  return dirData;
}

/**
 * Normalizes windows style paths by replacing double backslahes with single forward slahes (unix style).
 * @param  {string} path
 * @return {string}
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Tests if the supplied parameter is of type RegExp
 * @param  {any}  regExp
 * @return {Boolean}
 */
export function isRegExp(regExp: { constructor: RegExpConstructor }): boolean {
  return typeof regExp === "object" && regExp.constructor == RegExp;
}

/**
 * Collects the files and folders for a directory path into an Object, subject
 * to the options supplied, and invoking optional
 * @param  {String} path
 * @param  {Object} options
 * @param  {function} onEachFile
 * @param  {function} onEachDirectory
 * @return {Object}
 */
export function directoryTree(
  path: string,
  readPath?: string,
  rootPath?: string,
  options?: {
    depth?: any;
    attributes?: any;
    normalizePath?: any;
    exclude?: any;
    followSymlinks?: any;
    symlinks?: any;
    extensions?: any;
  },
  onEachFile?: (
    arg0: { path: any; name: string },
    arg1: any,
    arg2: any,
  ) => void,
  onEachDirectory?: (
    arg0: { path: any; name: string },
    arg1: any,
    arg2: any,
  ) => void,
  currentDepth = 0,
): object | null {
  options = options || {};

  if (
    options.depth !== undefined &&
    options.attributes &&
    options.attributes.indexOf("size") !== -1
  ) {
    throw new Error("usage of size attribute with depth option is prohibited");
  }

  const name = PATH.basename(path);
  readPath = options.normalizePath ? normalizePath(path) : path;
  const item: any = { name };
  let stats: FS.Stats;
  let lstat: FS.Stats;

  try {
    stats = FS.statSync(path);
    lstat = FS.lstatSync(path);
  } catch (e) {
    return null;
  }

  // Skip if it matches the exclude regex
  if (options.exclude) {
    const excludes = isRegExp(options.exclude)
      ? [options.exclude]
      : options.exclude;
    if (
      excludes.some((exclusion: { test: (arg0: any) => any }) =>
        exclusion.test(path),
      )
    ) {
      return null;
    }
  }

  if (lstat.isSymbolicLink()) {
    item.isSymbolicLink = true;
    // Skip if symbolic links should not be followed
    if (options.followSymlinks === false) return null;
    // Initialize the symbolic links array to avoid infinite loops
    if (!options.symlinks) options = { ...options, symlinks: [] };
    // Skip if a cyclic symbolic link has been found
    if (options.symlinks.find((ino: any) => ino === lstat.ino)) {
      return null;
    } else {
      options.symlinks.push(lstat.ino);
    }
  }

  if (stats.isFile()) {
    const ext = PATH.extname(path).toLowerCase();

    // Skip if it does not match the extension regex
    if (options.extensions && !options.extensions.test(ext)) return null;

    if (options.attributes) {
      options.attributes.forEach((attribute: string | number) => {
        switch (attribute) {
          case "extension":
            item.extension = ext;
            break;
          case "localpath":
            if (!rootPath) {
              throw new Error(`rootpath is ${rootPath}`);
            }
            item.localpath = path.replace(rootPath, "") || name;
            break;
          case "size":
            item.size = stats["size"];
            break;
          case "type":
            item.type = constants.FILE;
            break;
          default:
            //@ts-ignore
            item[attribute] = stats[attribute];
            break;
        }
      });
    }

    if (onEachFile) {
      onEachFile(item, readPath, stats);
    }
  } else if (stats.isDirectory()) {
    const dirData = safeReadDirSync(readPath);
    if (dirData === null) return null;

    if (options.depth === undefined || options.depth > currentDepth) {
      if (Array.isArray(dirData)) {
        item.children = dirData
          .map((child: string) => {
            if (typeof readPath === "undefined") {
              throw new Error(`read path is not string`);
            }

            return directoryTree(
              PATH.join(readPath, child),
              readPath,
              rootPath,
              options,
              onEachFile,
              onEachDirectory,
              currentDepth + 1,
            );
          })
          .filter((e: any) => !!e);
      }
    }

    if (options.attributes) {
      options.attributes.forEach((attribute: string | number) => {
        switch (attribute) {
          case "size":
            item.size = item.children.reduce(
              (prev: any, cur: { size: any }) => prev + cur.size,
              0,
            );
            break;
          case "type":
            item.type = constants.DIRECTORY;
            break;
          case "extension":
            break;
          default:
            //@ts-ignore
            item[attribute] = stats[attribute];
            break;
        }
      });
    }

    if (onEachDirectory) {
      onEachDirectory(item, readPath, stats);
    }
  } else {
    return null; // Or set item.size = 0 for devices, FIFO and sockets ?
  }
  return item;
}
