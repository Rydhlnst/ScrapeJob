<!doctype html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Notifikasi Lowongan Baru</title>
</head>
<body>
    <h2>Lowongan baru ditemukan</h2>
    <p>Berikut daftar lowongan terbaru:</p>

    <ul>
        @foreach ($jobs as $job)
            <li style="margin-bottom: 12px;">
                <strong>{{ $job->title }}</strong><br>
                {{ $job->company_name }} - {{ $job->location }}<br>
                Sumber: {{ $job->source_name }}<br>
                @if ($job->slug)
                    <a href="{{ url('/jobs/' . $job->slug) }}">Lihat detail</a>
                @endif
            </li>
        @endforeach
    </ul>
</body>
</html>
