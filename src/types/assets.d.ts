declare module '*.png' {
  const value: number;
  export default value;
}

declare module '*.webp' {
  const value: number;
  export default value;
}

declare function require(path: string): number;
