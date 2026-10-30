import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
export function loadLocalEnvironment() {
  if (existsSync('.env.local')) {
    const values = parseEnv(readFileSync('.env.local', 'utf8'));
    for (const [key, value] of Object.entries(values))
      if (process.env[key] === undefined) process.env[key] = value;
  }
}
