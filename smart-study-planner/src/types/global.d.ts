// Global type definitions for missing libraries

// This ensures TypeScript understands these modules even without proper type definitions
declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module 'bluebird' {
  const bluebird: any;
  export default bluebird;
}

declare module 'continuation-local-storage' {
  const cls: any;
  export default cls;
}

declare module 'json-schema' {
  const schema: any;
  export default schema;
}

declare module 'ms' {
  function ms(value: string | number): number;
  export default ms;
}

declare module 'semver' {
  function satisfies(version: string, range: string): boolean;
  export { satisfies };
}

// Make sure TypeScript knows about the Node.js environment
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    DATABASE_URL?: string;
  }
} 