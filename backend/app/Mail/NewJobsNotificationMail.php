<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class NewJobsNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Collection $jobs) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Lowongan baru tersedia',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-jobs-notification',
            with: [
                'jobs' => $this->jobs,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
