import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");

const requiredFiles = [
  [".env.local", ".env.example"],
  ["backend/.env.docker", "backend/.env.example"],
  ["scraper-service/.env", "scraper-service/.env.example"],
];

for (const [target, source] of requiredFiles) {
  const targetPath = resolve(rootDir, target);
  const sourcePath = resolve(rootDir, source);

  if (existsSync(targetPath)) {
    continue;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
  console.log(`Created ${target} from ${source}`);
}

const child = spawn(
  "docker",
  ["compose", "up", "--build", "frontend", "backend", "queue", "scheduler", "db", "redis"],
  {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
