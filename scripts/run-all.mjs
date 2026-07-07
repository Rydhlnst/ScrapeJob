import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const composeArgs = ["compose", "up", "--build", "frontend", "backend", "queue", "scheduler", "db", "redis"];
const maxAttempts = 3;
const retryDelayMs = 5000;
const transientErrorPatterns = [
  "tls handshake timeout",
  "failed to do request",
  "failed to resolve source metadata",
  "i/o timeout",
  "context deadline exceeded",
];

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

function wait(ms) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

function runComposeOnce(attempt) {
  return new Promise((resolvePromise) => {
    if (attempt > 1) {
      console.log(`Retrying docker compose (${attempt}/${maxAttempts})...`);
    }

    const child = spawn("docker", composeArgs, {
      cwd: rootDir,
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    let combinedOutput = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      combinedOutput += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      combinedOutput += text;
      process.stderr.write(text);
    });

    child.on("exit", (code) => {
      resolvePromise({ code: code ?? 1, output: combinedOutput });
    });
  });
}

function isTransientRegistryError(output) {
  const normalized = output.toLowerCase();
  return transientErrorPatterns.some((pattern) => normalized.includes(pattern));
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const { code, output } = await runComposeOnce(attempt);

  if (code === 0) {
    process.exit(0);
  }

  if (attempt < maxAttempts && isTransientRegistryError(output)) {
    console.error(`Docker registry/network timeout detected. Waiting ${retryDelayMs / 1000}s before retry...`);
    await wait(retryDelayMs);
    continue;
  }

  process.exit(code);
}
