/**
 * Module resolver utility for safely loading native Node.js modules
 * in a Next.js environment without causing bundling issues.
 */

type GenericModule = any;

/**
 * Safely loads a native module
 * @param moduleName Name of the module to load
 * @returns The loaded module or null if it couldn't be loaded
 */
export function loadNativeModule(moduleName: string): GenericModule | null {
  if (typeof window !== 'undefined') {
    // Never try to load native modules on the client
    return null;
  }

  try {
    // Use eval to prevent webpack from statically analyzing this
    // This approach allows us to dynamically load modules at runtime
    // without webpack trying to bundle them
    // eslint-disable-next-line no-eval
    const dynamicRequire = eval('require');
    return dynamicRequire(moduleName);
  } catch (error) {
    console.warn(`Failed to load native module "${moduleName}":`, error);
    return null;
  }
}

/**
 * Safely loads the sqlite3 module
 * @returns The sqlite3 module or null if it couldn't be loaded
 */
export function loadSqlite3(): GenericModule | null {
  return loadNativeModule('sqlite3');
}

/**
 * Checks if we're running in a server environment
 * @returns True if running on server, false for client
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
} 