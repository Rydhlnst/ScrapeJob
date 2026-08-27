<?php

namespace App\Services\Scraping;

use App\Models\JobSource;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class PythonScraperExecutor
{
    /**
     * @return array{
     *   source:string,
     *   scraped_at:?string,
     *   total:int,
     *   jobs:array<int, array<string, mixed>>,
     *   error:?string
     * }
     */
    public function run(JobSource $source, ?string $keyword = null, ?string $location = null): array
    {
        $root = base_path('..');
        $process = $this->createProcess($root, $source, $keyword, $location);
        $process->setTimeout((int) config('scraper.python.timeout_seconds', 900));
        $process->run();

        if (! $process->isSuccessful()) {
            $errorOutput = trim($process->getErrorOutput());
            Log::error('Python scraper process failed', [
                'source' => $source->name,
                'exit_code' => $process->getExitCode(),
                'error' => $errorOutput,
            ]);

            throw new \RuntimeException($this->summarizeProcessError($errorOutput));
        }

        $payload = json_decode($process->getOutput(), true);

        if (! is_array($payload)) {
            throw new \RuntimeException('Invalid JSON returned by Python scraper.');
        }

        return [
            'source' => (string) ($payload['source'] ?? strtolower($source->name)),
            'scraped_at' => isset($payload['scraped_at']) ? (string) $payload['scraped_at'] : null,
            'total' => (int) ($payload['total'] ?? 0),
            'jobs' => array_values(array_filter((array) ($payload['jobs'] ?? []), static fn ($item): bool => is_array($item))),
            'error' => isset($payload['error']) ? (string) $payload['error'] : null,
        ];
    }

    private function createProcess(string $root, JobSource $source, ?string $keyword, ?string $location): Process
    {
        $mode = strtolower((string) config('scraper.python.mode', 'local'));
        if ($mode === 'docker') {
            return $this->createDockerProcess($root, $source, $keyword, $location);
        }

        return $this->createLocalProcess($root, $source, $keyword, $location);
    }

    private function createLocalProcess(string $root, JobSource $source, ?string $keyword, ?string $location): Process
    {
        $script = $root.DIRECTORY_SEPARATOR.'scraper-service'.DIRECTORY_SEPARATOR.'app'.DIRECTORY_SEPARATOR.'main.py';
        $pythonBin = $this->resolvePythonBinary($root);

        return new Process([$pythonBin, $script], $root, $this->buildEnv($source, $keyword, $location));
    }

    private function createDockerProcess(string $root, JobSource $source, ?string $keyword, ?string $location): Process
    {
        $dockerBin = (string) config('scraper.python.docker_bin', 'docker');
        $dockerImage = (string) config('scraper.python.docker_image', 'scrapejob-scraper:local');
        $dockerEnvFile = (string) config('scraper.python.docker_env_file', $root.DIRECTORY_SEPARATOR.'scraper-service'.DIRECTORY_SEPARATOR.'.env');

        $envVars = $this->buildEnv($source, $keyword, $location);
        $command = [$dockerBin, 'run', '--rm'];

        if (is_file($dockerEnvFile)) {
            $command[] = '--env-file';
            $command[] = $dockerEnvFile;
        }

        foreach ($envVars as $key => $value) {
            $command[] = '-e';
            $command[] = $key.'='.$value;
        }

        $command[] = $dockerImage;
        $command[] = 'python';
        $command[] = 'app/main.py';

        return new Process($command, $root);
    }

    /**
     * @return array<string, string>
     */
    private function buildEnv(JobSource $source, ?string $keyword = null, ?string $location = null): array
    {
        $env = [
            'SOURCE' => strtolower($source->name),
            'SEND_TO_LARAVEL' => 'false',
            'SAVE_JSON' => 'true',
            'JSON_OUTPUT_PATH' => base_path('../scraper-service/output/jobs.json'),
        ];

        if ($keyword !== null && trim($keyword) !== '') {
            $env['ROLES'] = trim($keyword);
        } else {
            $configuredRoles = match (strtolower($source->name)) {
                'glints' => config('scraper.glints.keywords', []),
                'jobstreet' => config('scraper.jobstreet.keywords', []),
                default => [],
            };

            if (is_array($configuredRoles) && $configuredRoles !== []) {
                $env['ROLES'] = implode(',', array_map('strval', $configuredRoles));
            }
        }

        if ($location !== null && trim($location) !== '') {
            $env['LOCATION'] = trim($location);
        }

        return $env;
    }

    private function resolvePythonBinary(string $root): string
    {
        $configured = trim((string) config('scraper.python.bin', ''));
        if ($configured !== '') {
            return $configured;
        }

        $venvPython = $root.DIRECTORY_SEPARATOR.'scraper-service'.DIRECTORY_SEPARATOR.'.venv'.DIRECTORY_SEPARATOR.'Scripts'.DIRECTORY_SEPARATOR.'python.exe';
        if (is_file($venvPython)) {
            return $venvPython;
        }

        return 'python';
    }

    private function summarizeProcessError(string $errorOutput): string
    {
        if ($errorOutput === '') {
            return 'Python scraper process failed without an error message.';
        }

        $lines = array_values(array_filter(
            preg_split('/\\R/', $errorOutput) ?: [],
            static fn (string $line): bool => trim($line) !== '',
        ));

        foreach (array_reverse($lines) as $line) {
            $line = trim($line);
            if (preg_match('/(?:Error|Exception)(?:\\s*:\\s*|$)/i', $line) === 1) {
                return 'Python scraper failed: '.substr($line, 0, 1000);
            }
        }

        return 'Python scraper failed: '.substr((string) end($lines), 0, 1000);
    }
}
