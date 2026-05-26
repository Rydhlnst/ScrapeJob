<?php

namespace App\Jobs;

use App\Mail\NewJobsNotificationMail;
use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendJobNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 120;

    public function handle(): void
    {
        $emails = (array) config('scraper.notification.emails', []);
        $emails = array_values(array_filter(array_map('trim', $emails)));

        if ($emails === []) {
            return;
        }

        $jobs = Job::query()
            ->select([
                'id',
                'title',
                'slug',
                'company_name',
                'location',
                'job_type',
                'salary_text',
                'source_name',
                'published_at',
                'created_at',
            ])
            ->where('status', 'published')
            ->unnotified()
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        if ($jobs->isEmpty()) {
            return;
        }

        foreach ($emails as $email) {
            Mail::to($email)->send(new NewJobsNotificationMail($jobs));
        }

        Job::query()->whereIn('id', $jobs->pluck('id'))->update(['notified' => true]);
    }
}
