interface CookieWrite {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

export function aCookieJar(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const writes: CookieWrite[] = [];

  return {
    get(name: string) {
      const value = values.get(name);

      return value === undefined ? undefined : { name, value };
    },
    set(name: string, value: string, options: Record<string, unknown> = {}) {
      values.set(name, value);
      writes.push({ name, value, options });
    },
    writes,
  };
}

export type CookieJar = ReturnType<typeof aCookieJar>;
