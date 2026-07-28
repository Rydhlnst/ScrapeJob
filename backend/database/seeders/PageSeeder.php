<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            ['title' => 'Tentang Lowonganku', 'status' => 'published', 'summary' => 'Kenali visi & misi platform Lowonganku dalam menghubungkan talenta dengan perusahaan.'],
            ['title' => 'Kebijakan Privasi', 'status' => 'published', 'summary' => 'Bagaimana kami memproses & melindungi data personal pengguna.'],
            ['title' => 'Syarat & Ketentuan', 'status' => 'published', 'summary' => 'Aturan penggunaan platform Lowonganku bagi pencari kerja dan perusahaan.'],
            ['title' => 'FAQ Pencari Kerja', 'status' => 'published', 'summary' => 'Pertanyaan paling sering diajukan oleh pencari kerja.'],
            ['title' => 'FAQ Perusahaan', 'status' => 'published', 'summary' => 'Panduan lengkap untuk perusahaan yang ingin memasang lowongan.'],
            ['title' => 'Panduan Melamar Kerja', 'status' => 'published', 'summary' => 'Tips efektif melamar melalui Lowonganku.'],
            ['title' => 'Karier di Lowonganku', 'status' => 'draft', 'summary' => 'Bergabunglah bersama tim yang membangun masa depan rekrutmen di Indonesia.'],
            ['title' => 'Media Kit', 'status' => 'draft', 'summary' => 'Aset resmi Lowonganku untuk keperluan media & pers.'],
            ['title' => 'Kontak', 'status' => 'published', 'summary' => 'Hubungi tim Lowonganku untuk pertanyaan atau kemitraan.'],
            // Blog Articles
            [
                'title' => '10 Tips Sukses Wawancara Kerja Online di Era Digital',
                'status' => 'published',
                'summary' => 'Wawancara kerja online kini menjadi standar baru. Pelajari tips dan trik agar performa terbaikmu terpancar saat interview via video call.',
                'content' => '<p>Wawancara kerja online semakin menjadi standar dalam proses rekrutmen. Dengan persiapan yang tepat, kamu bisa tampil percaya diri dan meninggalkan kesan positif pada rekruter.</p><h3>1. Persiapan Teknis</h3><p>Pastikan koneksi internet stabil, kamera berfungsi dengan baik, dan ruangan memiliki pencahayaan yang cukup. Uji perangkatmu sehari sebelum wawancara.</p><h3>2. Pahami Perusahaan</h3><p>Riset visi, misi, dan projek terkini perusahaan. Tunjukkan bahwa kamu benar-benar tertarik dengan posisi yang dilamar.</p><h3>3. Berpakaian Profesional</h3><p>Meskipun dari rumah, berpakaian rapi menunjukkan keseriusanmu terhadap proses wawancara.</p><h3>4. Perhatikan Bahasa Tubuh</h3><p>Tatap kamera saat berbicara, duduk tegak, dan tunjukkan antusiasme melalui ekspresi wajah.</p><h3>5. Siapkan Pertanyaan</h3><p>Ajukan pertanyaan tentang budaya perusahaan atau tantangan di posisi tersebut untuk menunjukkan ketertarikanmu.</p>',
            ],
            [
                'title' => 'Membangun Personal Branding untuk Pencari Kerja',
                'status' => 'published',
                'summary' => 'Personal branding yang kuat bisa menjadi pembeda di pasar kerja yang kompetitif. Kenali cara membangun citra profesional yang menarik bagi recruiter.',
                'content' => '<p>Di era digital, personal branding bukan lagiopsional — melainkan kebutuhan. Personal branding yang kuat membantumu menonjol di antara ribuan pelamar lain.</p><h3>Optimasi Profil LinkedIn</h3><p>Gunakan foto profesional, tulis headline yang compelling, dan jelaskan pengalamanmu dengan achievement-oriented.</p><h3>Bangun Portofolio Online</h3><p>Tunjukkan hasil kerja terbaikmu melalui website pribadi atau platform portofolio seperti GitHub, Behance, atau Dribbble.</p><h3>Konsisten di Media Sosial</h3><p>Bagikan insight dan konten relevan di bidangmu. Tunjukkan thought leadership melalui tulisan atau diskusi profesional.</p>',
            ],
            [
                'title' => 'Memahami Gaji dan Benefits: Panduan Lengkap untuk Job Seeker',
                'status' => 'published',
                'summary' => 'Jangan hanya fokus pada gaji pokok. Pelajari komponen benefits lainnya yang bisa meningkatkan kualitas hidupmu secara keseluruhan.',
                'content' => '<p>Saat menerima tawaran kerja, banyak job seeker yang hanya fokus pada angka gaji pokok. Padahal, ada banyak komponen benefits lain yang perlu diperhatikan.</p><h3>1. Gaji Pokok vs Total Compensation</h3><p>Total compensation mencakup gaji pokok, bonus, tunjangan, asuransi, dan hak saham. Perbandingan ini memberikan gambaran lebih akurat tentang nilai kompensasimu.</p><h2>2. Tunjangan Kesehatan</h2><p>Asuransi kesehatan, rawat inap, dan benefit kesehatan mental adalah komponen penting yang sering terlewatkan.</p><h3>3. Work-Life Balance</h3><p>Fleksibilitas kerja, remote work option, dan jumlah cuti tahunan adalah faktor yang sangat mempengaruhi kualitas hidup.</p>',
            ],
            [
                'title' => 'Fresh Graduate? Ini Cara Efektif Mencari Pekerjaan Pertama',
                'status' => 'published',
                'summary' => 'Mencari pekerjaan pertama sebagai fresh graduate bisa menjadi tantangan. Simak strategi efektif untuk memulai kariermu.',
                'content' => '<p>Lulus dari universitas adalah pencapaian besar, namun mencari pekerjaan pertama bisa terasa menakutkan. Berikut strategi yang bisa membantumu mendapatkan pekerjaan pertama.</p><h3>1. Manfaatkan Program Magang</h3><p>Banyak perusahaan menawarkan program magang yang bisa menjadi jalan masuk ke posisi full-time. Jangan remehkan pengalaman magang.</p><h3>2. Bangun Portofolio</h3><p>Meskipun belum punya pengalaman kerja formal, portofolio proyek pribadi atau volunteer work bisa menunjukkan kemampuanmu.</p><h3>3. Jaringan, Jaringan, Jaringan</h3><p>Hadiri job fair, seminar industri, dan event networking. Banyak lowongan yang tidak dipublikasikan secara terbuka.</p><h3>4. Sesuaikan Resume</h3><p>Tailor resume untuk setiap posisi yang dilamar. Highlight skill dan pengalaman yang relevan dengan job description.</p>',
            ],
            [
                'title' => 'Work from Home: Tips Produktif Bekerja dari Rumah',
                'status' => 'published',
                'summary' => 'Bekerja dari rumah membutuhkan disiplin khusus. Pelajari cara tetap produktif dan menjaga work-life balance saat WFH.',
                'content' => '<p>Work from Home (WFH) menjadi tren yang semakin populer. Namun, bekerja dari rumah membutuhkan disiplin dan strategi khusus agar tetap produktif.</p><h3>1. Buat Ruang Kerja Khusus</h3><p>Siapkan sudut khusus yang nyaman dan minim gangguan untuk bekerja. Pisahkan area kerja dari area istirahat.</p><h3>2. Tetapkan Jadwal Konsisten</h3><p>Bangun pada jam yang sama setiap hari, mandi, dan berpakaian seolah akan pergi ke kantor. Ini membantu otak beralih ke mode kerja.</p><h3>3. Gunakan Teknologi yang Tepat</h3><p>Manfaatkan tools kolaborasi seperti Slack, Zoom, atau Trello untuk tetap terhubung dengan tim.</p>',
            ],
            [
                'title' => 'Mengenal Berbagai Jenis Kontrak Kerja di Indonesia',
                'status' => 'draft',
                'summary' => 'Pahami perbedaan PKWT, PKWTT, dan jenis kontrak lainnya agar kamu tahu hak dan kewajibanmu sebagai pekerja.',
                'content' => '<p>Memahami jenis kontrak kerja sangat penting untuk melindungi hak-hakmu sebagai pekerja. Berikut penjelasan lengkap tentang berbagai jenis kontrak kerja di Indonesia.</p><h3>PKWTT (Perjanjian Kerja Waktu Tidak Tertentu)</h3><p>Kontrak permanen dengan masa kerja tidak ditentukan. Pekerja mendapat perlindungan penuh sesuai UU Ketenagakerjaan.</p><h3>PKWT (Perjanjian Kerja Waktu Tertentu)</h3><p>Kontrak dengan jangka waktu tertentu, maksimal 5 tahun. Haru diperbarui atau dikonversi menjadi PKWTT setelah masa berakhir.</p>',
            ],
        ];

        foreach ($pages as $item) {
            $slug = Str::slug($item['title']);
            Page::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $item['title'],
                    'status' => $item['status'],
                    'summary' => $item['summary'],
                    'content' => "<p>{$item['summary']}</p><p>Konten halaman ini akan segera dilengkapi oleh tim editorial Lowonganku.</p>",
                    'seo_title' => $item['title'].' | Lowonganku',
                    'seo_description' => $item['summary'],
                    'published_at' => $item['status'] === 'published' ? now() : null,
                ],
            );
        }
    }
}
