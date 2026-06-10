# Lowonganku Design System

Lowonganku adalah website agregator lowongan kerja yang mengambil data pekerjaan dari berbagai sumber. UI harus terasa modern, rapi, premium, cepat dibaca, dan terpercaya. Karena konten utama adalah daftar pekerjaan, desain harus mengutamakan keterbacaan, konsistensi, dan struktur visual yang bersih.

Tujuan utama desain ini adalah mengubah UI menjadi lebih modern tanpa membuat tampilan terlalu ramai, terlalu playful, atau terlihat seperti template generik.

---

## 1. Design Direction

Gunakan gaya visual:

* Modern professional
* Premium but simple
* Clean SaaS/job board interface
* Calm and trustworthy
* High readability
* Minimal decorative elements

Hindari gaya visual:

* Blob background
* Gradient berlebihan
* Warna neon
* Glassmorphism berlebihan
* Shadow terlalu tebal
* Border radius terlalu bulat seperti aplikasi anak-anak
* Ilustrasi dekoratif yang tidak perlu
* Banyak warna aksen dalam satu halaman

UI Lowonganku harus terasa seperti platform pencarian kerja yang serius, nyaman, dan kredibel.

---

## 2. Color System

Gunakan warna netral sebagai dasar, dengan satu warna primary yang kalem dan profesional.

### Recommended Palette

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;

  --card: #ffffff;
  --card-foreground: #0f172a;

  --muted: #f1f5f9;
  --muted-foreground: #64748b;

  --border: #e2e8f0;
  --input: #e2e8f0;

  --primary: #2563eb;
  --primary-foreground: #ffffff;

  --secondary: #0f172a;
  --secondary-foreground: #ffffff;

  --accent: #eef4ff;
  --accent-foreground: #1d4ed8;

  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;

  --radius: 0.875rem;
}
```

### Dark Mode Palette

```css
.dark {
  --background: #020617;
  --foreground: #f8fafc;

  --card: #0f172a;
  --card-foreground: #f8fafc;

  --muted: #1e293b;
  --muted-foreground: #94a3b8;

  --border: #1e293b;
  --input: #334155;

  --primary: #3b82f6;
  --primary-foreground: #ffffff;

  --secondary: #f8fafc;
  --secondary-foreground: #020617;

  --accent: #172554;
  --accent-foreground: #bfdbfe;

  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

### Color Rules

Primary color hanya digunakan untuk:

* CTA utama
* Active navigation
* Link penting
* Highlight filter aktif
* Focus ring
* Badge penting

Jangan gunakan primary color untuk semua elemen. Biarkan sebagian besar UI menggunakan warna netral.

Gunakan background `#f8fafc` agar halaman terasa soft, bukan putih polos yang terlalu terang.

Card tetap putih agar konten lowongan kerja terlihat jelas.

---

## 3. globals.css Rules

Pastikan `globals.css` mengontrol fondasi visual seluruh aplikasi.

Contoh struktur yang disarankan:

```css
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;

  --card: #ffffff;
  --card-foreground: #0f172a;

  --muted: #f1f5f9;
  --muted-foreground: #64748b;

  --border: #e2e8f0;
  --input: #e2e8f0;

  --primary: #2563eb;
  --primary-foreground: #ffffff;

  --secondary: #0f172a;
  --secondary-foreground: #ffffff;

  --accent: #eef4ff;
  --accent-foreground: #1d4ed8;

  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;

  --radius: 0.875rem;
}

.dark {
  --background: #020617;
  --foreground: #f8fafc;

  --card: #0f172a;
  --card-foreground: #f8fafc;

  --muted: #1e293b;
  --muted-foreground: #94a3b8;

  --border: #1e293b;
  --input: #334155;

  --primary: #3b82f6;
  --primary-foreground: #ffffff;

  --secondary: #f8fafc;
  --secondary-foreground: #020617;

  --accent: #172554;
  --accent-foreground: #bfdbfe;

  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}

* {
  border-color: var(--border);
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-feature-settings: "rlig" 1, "calt" 1;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--primary);
  color: var(--primary-foreground);
}

input,
textarea,
select,
button {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## 4. Typography

Gunakan font yang modern dan mudah dibaca.

Rekomendasi:

* Inter
* Geist Sans
* Plus Jakarta Sans

Untuk website job board, typography harus rapi dan tidak terlalu dekoratif.

### Type Scale

```txt
Display / Hero Title:
48px - 64px
font-weight: 700
line-height: 1.05

Page Title:
32px - 40px
font-weight: 700
line-height: 1.15

Section Title:
24px - 28px
font-weight: 650
line-height: 1.25

Card Title:
18px - 20px
font-weight: 600
line-height: 1.3

Body:
15px - 16px
font-weight: 400
line-height: 1.65

Small Text:
13px - 14px
font-weight: 400
line-height: 1.45
```

### Typography Rules

Judul lowongan harus mudah discan.

Nama perusahaan, lokasi, dan tipe kerja harus lebih ringan dari judul.

Jangan gunakan terlalu banyak ukuran font dalam satu card.

Maksimal gunakan 3 level teks dalam satu komponen:

* Title
* Meta text
* Supporting text

---

## 5. Layout System

Gunakan layout yang lapang, bersih, dan konsisten.

### Container

```txt
Max width:
- Main content: 1200px
- Reading content: 760px
- Dashboard/forms: 960px

Horizontal padding:
- Mobile: 16px
- Tablet: 24px
- Desktop: 32px
```

### Spacing Scale

Gunakan spacing berbasis kelipatan 4.

```txt
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px
```

### Layout Rules

Gunakan whitespace sebagai elemen desain utama.

Jangan memadatkan terlalu banyak informasi dalam satu area.

Untuk halaman daftar lowongan, gunakan kombinasi:

* Search bar besar
* Filter sidebar atau horizontal filter
* Job list card
* Empty state yang clean
* Pagination atau load more

---

## 6. Border Radius

Gunakan radius yang modern tapi tidak terlalu bulat.

```txt
Small elements: 8px
Inputs/buttons: 10px - 12px
Cards: 14px - 16px
Large containers: 18px - 20px
```

Jangan gunakan radius besar seperti `rounded-full` kecuali untuk badge kecil, avatar, atau pill filter.

---

## 7. Shadow

Gunakan shadow sangat halus. UI premium biasanya tidak menggunakan shadow tebal.

```css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-md: 0 8px 24px rgba(15, 23, 42, 0.06);
--shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.08);
```

### Shadow Rules

Default card cukup menggunakan border.

Gunakan shadow hanya untuk:

* Dropdown
* Modal
* Floating search
* Sticky header saat scroll
* Card hover ringan

Jangan gunakan shadow berwarna biru atau shadow glow.

---

## 8. Buttons

### Primary Button

Gunakan untuk aksi utama.

Contoh:

* Cari Lowongan
* Apply Sekarang
* Simpan Lowongan
* Buat Alert

Style:

```txt
Background: primary
Text: primary-foreground
Radius: 10px - 12px
Height: 40px - 48px
Font weight: 600
```

### Secondary Button

Gunakan untuk aksi pendukung.

```txt
Background: white/card
Text: foreground
Border: border
Hover: muted
```

### Ghost Button

Gunakan untuk aksi kecil.

```txt
Background: transparent
Hover: muted
Text: muted-foreground atau foreground
```

### Button Rules

Jangan gunakan lebih dari satu primary CTA dalam satu section.

Primary button harus terlihat jelas tapi tidak terlalu mencolok.

Hover state harus halus, bukan berubah ekstrem.

---

## 9. Inputs and Search

Search adalah komponen utama Lowonganku, jadi harus terasa premium.

### Search Bar Rules

Search bar harus:

* Besar dan mudah ditemukan
* Memiliki border halus
* Background putih
* Radius 14px - 16px
* Icon sederhana
* Focus ring primary yang clean

Contoh visual:

```txt
[ Search job title, company, or keyword ] [ Location ] [ Cari Lowongan ]
```

Untuk mobile, search field boleh menjadi stacked vertical.

### Input Style

```txt
Height: 44px - 48px
Padding horizontal: 14px - 16px
Border: 1px solid border
Background: card
Focus: primary ring
Placeholder: muted-foreground
```

---

## 10. Job Card

Job card adalah komponen terpenting.

### Job Card Structure

Setiap job card sebaiknya memiliki:

* Job title
* Company name
* Location
* Work type
* Salary jika ada
* Posted date
* Source platform
* Tags
* CTA detail/apply

### Job Card Style

```txt
Background: card
Border: 1px solid border
Radius: 16px
Padding: 20px - 24px
Hover: subtle shadow + border primary soft
```

### Job Card Rules

Job title harus menjadi visual priority.

Company dan location harus mudah dilihat.

Badge jangan terlalu ramai.

Maksimal tampilkan 3 sampai 5 tag di card.

Jika data hasil scrape tidak lengkap, UI tetap harus terlihat rapi.

Contoh fallback:

* Salary tidak tersedia → jangan tampilkan salary block
* Location kosong → tampilkan “Remote/On-site not specified” hanya jika diperlukan
* Company kosong → tampilkan “Company undisclosed”
* Posted date kosong → tampilkan “Recently found”

---

## 11. Badge System

Badge digunakan untuk membantu user scanning lowongan.

### Badge Types

```txt
Remote
Full-time
Part-time
Internship
Contract
Fresh Graduate
Senior
Urgent
Verified Source
```

### Badge Style

```txt
Background: muted atau accent
Text: muted-foreground atau accent-foreground
Border: subtle border
Radius: full
Font size: 12px - 13px
Font weight: 500
```

### Badge Rules

Jangan semua badge menggunakan warna berbeda.

Gunakan warna netral untuk sebagian besar badge.

Gunakan accent blue hanya untuk badge penting seperti “Remote” atau “Verified”.

Gunakan warning/danger hanya jika memang dibutuhkan.

---

## 12. Navigation

Navbar harus sederhana dan tidak mengganggu.

### Navbar Items

Contoh:

* Lowongan
* Perusahaan
* Blog
* Saved Jobs
* Job Alert

### Navbar Rules

Navbar desktop:

* Logo di kiri
* Menu di tengah atau kiri setelah logo
* CTA di kanan

Navbar mobile:

* Logo
* Menu button
* CTA optional

Header boleh sticky, tapi harus tetap clean.

Sticky header gunakan:

```txt
Background: rgba white atau solid card
Border bottom: border
Backdrop blur ringan jika diperlukan
```

Jangan gunakan navbar dengan gradient.

---

## 13. Hero Section

Hero Lowonganku harus fokus ke fungsi pencarian kerja.

### Hero Content

Gunakan copy yang jelas:

```txt
Temukan lowongan kerja terbaru dari berbagai sumber dalam satu tempat.
```

Subcopy:

```txt
Lowonganku mengumpulkan peluang kerja dari berbagai platform agar kamu bisa mencari, membandingkan, dan menemukan pekerjaan yang cocok lebih cepat.
```

### Hero Rules

Hero tidak perlu terlalu tinggi.

Jangan gunakan blob.

Jangan gunakan ilustrasi besar yang mengganggu.

Gunakan background netral dengan subtle border/card.

Boleh gunakan decorative grid yang sangat halus, tapi jangan ramai.

Contoh hero style:

```txt
Background: background
Content centered atau split layout
Search bar sebagai elemen utama
Small trust indicators di bawah search
```

Trust indicators:

* “Update harian”
* “Banyak sumber”
* “Filter cepat”
* “Gratis digunakan”

---

## 14. Empty State

Empty state harus membantu, bukan hanya menampilkan pesan kosong.

Contoh:

```txt
Belum ada lowongan yang cocok.
Coba gunakan keyword lain, ubah lokasi, atau hapus beberapa filter.
```

Style:

```txt
Centered card
Muted icon
Clear explanation
Secondary action
```

Jangan gunakan ilustrasi berlebihan.

---

## 15. Loading State

Gunakan skeleton loading, bukan spinner besar.

Skeleton cocok untuk:

* Job card
* Search result
* Company card
* Blog card

Rules:

```txt
Skeleton background: muted
Animation: pulse halus
Radius mengikuti komponen asli
```

Jangan gunakan loading spinner di tengah halaman kecuali untuk proses global.

---

## 16. Filter UI

Filter harus membantu user, bukan membuat halaman terasa kompleks.

### Filter Groups

* Keyword
* Location
* Job type
* Experience
* Remote/on-site
* Salary range
* Source
* Posted date

### Filter Rules

Desktop:

* Sidebar filter atau top filter
* Job list tetap menjadi fokus utama

Mobile:

* Filter masuk ke drawer/bottom sheet
* Tampilkan jumlah filter aktif

Filter aktif harus mudah dihapus.

Contoh active filter:

```txt
Remote ×
Full-time ×
Jakarta ×
```

---

## 17. Source Attribution

Karena Lowonganku mengambil data dari berbagai sumber, tampilkan source secara rapi.

Contoh:

```txt
Source: LinkedIn
Source: Glints
Source: JobStreet
Source: Company Career Page
```

Rules:

* Source jangan lebih dominan dari company name
* Gunakan small muted text
* Jika source terpercaya, boleh tampilkan badge “Verified Source”
* Hindari logo source jika membuat UI terlalu ramai

---

## 18. Premium UI Rules

Agar UI terlihat premium:

* Banyak gunakan whitespace
* Gunakan border halus
* Gunakan warna netral
* Gunakan typography rapi
* Gunakan hover state subtle
* Gunakan icon outline sederhana
* Gunakan card dengan struktur jelas
* Jangan menaruh terlalu banyak warna dalam satu screen
* Jangan terlalu banyak animasi

Premium bukan berarti penuh efek. Premium berarti rapi, konsisten, dan terasa matang.

---

## 19. Animation and Interaction

Gunakan animasi kecil dan fungsional.

Recommended:

```txt
transition duration: 150ms - 220ms
easing: ease-out
```

Gunakan animasi untuk:

* Button hover
* Card hover
* Dropdown open
* Drawer open
* Modal open
* Filter selected state

Hindari:

* Animasi bouncing
* Parallax berlebihan
* Gradient bergerak
* Blob bergerak
* Hover scale terlalu besar

Card hover cukup:

```txt
translateY(-1px)
border-color sedikit lebih jelas
shadow subtle
```

---

## 20. Icons

Gunakan icon outline yang konsisten.

Rekomendasi:

* Lucide React
* Heroicons
* Phosphor Icons

Rules:

```txt
Icon size default: 16px - 20px
Stroke width konsisten
Warna mengikuti text muted atau foreground
```

Jangan campur banyak style icon.

---

## 21. Page-Specific Rules

### Homepage

Homepage harus langsung menjelaskan value Lowonganku.

Struktur:

1. Navbar
2. Hero + search
3. Popular searches
4. Latest jobs
5. Job categories
6. Why Lowonganku
7. Footer

### Job Listing Page

Fokus pada pencarian dan hasil.

Struktur:

1. Header/search section
2. Filter
3. Result count
4. Sort
5. Job list
6. Pagination/load more

### Job Detail Page

Harus mudah dibaca.

Struktur:

1. Job title
2. Company info
3. Key job info
4. Apply CTA
5. Job description
6. Requirements
7. Source attribution
8. Similar jobs

CTA apply boleh sticky di desktop sidebar atau bawah layar mobile.

### Company Page

Fokus pada kredibilitas.

Struktur:

1. Company header
2. Company description
3. Active jobs
4. Source/history info jika ada

### Blog Page

Blog mendukung SEO, jadi layout harus clean dan readable.

Struktur:

1. Blog title
2. Excerpt
3. Metadata
4. Content
5. Related articles
6. CTA cari lowongan

---

## 22. Component Consistency

Semua komponen harus mengikuti token dari `globals.css`.

Jangan hardcode warna seperti:

```tsx
className="bg-blue-600 text-white"
```

Lebih baik gunakan token/theme class seperti:

```tsx
className="bg-primary text-primary-foreground"
```

Jangan hardcode border seperti:

```tsx
className="border-gray-200"
```

Gunakan:

```tsx
className="border-border"
```

Jangan hardcode background seperti:

```tsx
className="bg-white"
```

Gunakan:

```tsx
className="bg-card"
```

---

## 23. Tailwind Class Guidelines

Gunakan class yang konsisten.

### Card

```tsx
className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
```

### Button Primary

```tsx
className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
```

### Input

```tsx
className="h-11 rounded-xl border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
```

### Badge

```tsx
className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
```

### Section Container

```tsx
className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
```

---

## 24. Things to Avoid

Jangan gunakan:

* Blob
* Mesh gradient
* Rainbow gradient
* Neon color
* Glassmorphism berat
* Shadow glow
* Border warna-warni
* Banyak font berbeda
* Terlalu banyak badge
* Terlalu banyak card nested
* Background pattern yang ramai
* Button dengan warna berbeda-beda
* Layout yang terlalu padat

---

## 25. Final Visual Standard

Setiap halaman Lowonganku harus terasa:

* Bersih
* Cepat dipahami
* Profesional
* Modern
* Konsisten
* Tidak ramai
* Tidak template murahan
* Cocok untuk job board yang serius

Jika ada keputusan desain yang membingungkan, pilih opsi yang lebih sederhana, lebih netral, dan lebih mudah dibaca.

Prinsip utama:

```txt
Clarity over decoration.
Consistency over creativity.
Premium through restraint.
```
## 26. ShadCN/UI Component Rules

Lowonganku harus menggunakan **ShadCN/UI sebagai satu-satunya fondasi komponen UI**.

Tujuannya agar seluruh tampilan konsisten, mudah dirawat, modern, dan tidak dipenuhi komponen custom yang berbeda-beda style.

---

### Core Rule

Gunakan komponen dari ShadCN/UI terlebih dahulu untuk semua kebutuhan UI.

Jangan membuat komponen custom baru jika ShadCN sudah menyediakan pola komponennya.

Komponen custom hanya boleh dibuat sebagai wrapper atau composition dari ShadCN component, bukan membuat style system baru dari nol.

Contoh benar:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

Contoh salah:

```tsx
function CustomFancyButton() {
  return (
    <button className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl rounded-full">
      Click me
    </button>
  );
}
```

---

### Allowed ShadCN Components

Gunakan komponen berikut sebagai default:

```txt
Button
Card
Input
Textarea
Select
Checkbox
Radio Group
Switch
Badge
Separator
Skeleton
Dialog
Sheet
Dropdown Menu
Popover
Command
Tabs
Accordion
Table
Pagination
Breadcrumb
Avatar
Tooltip
Alert
Toast / Sonner
Form
Label
Scroll Area
Calendar
```

Untuk Lowonganku, komponen yang paling sering digunakan:

```txt
Button
Card
Input
Select
Badge
Sheet
Dialog
Dropdown Menu
Skeleton
Separator
Tabs
Pagination
Breadcrumb
Tooltip
Form
```

---

### Component Mapping

Gunakan mapping berikut saat membangun UI.

#### Buttons

Gunakan:

```tsx
<Button />
```

Untuk:

```txt
CTA utama
Apply button
Search button
Save job button
Filter action
Pagination action
```

Variants:

```txt
default: CTA utama
secondary: aksi pendukung
outline: filter, secondary action
ghost: navbar item, icon button
destructive: delete/reset berbahaya
link: inline text link
```

Jangan membuat button custom kecuali berupa wrapper dari `<Button />`.

---

#### Cards

Gunakan:

```tsx
<Card />
<CardHeader />
<CardTitle />
<CardDescription />
<CardContent />
<CardFooter />
```

Untuk:

```txt
Job card
Company card
Blog card
Stats card
Filter card
Empty state card
Dashboard card
```

Job card harus berbasis `<Card />`, bukan `div` custom dengan style sendiri.

---

#### Forms and Inputs

Gunakan:

```tsx
<Input />
<Textarea />
<Select />
<Checkbox />
<RadioGroup />
<Switch />
<Form />
<Label />
```

Untuk:

```txt
Search bar
Location input
Filter form
Job alert form
Newsletter form
Admin/dashboard form
```

Jangan membuat input custom manual kecuali benar-benar perlu, dan tetap harus menggunakan token dari ShadCN.

---

#### Filter Drawer on Mobile

Gunakan:

```tsx
<Sheet />
```

Untuk mobile filter.

Desktop boleh menggunakan `<Card />` sebagai container filter.

Mobile filter tidak boleh dibuat sebagai modal custom sendiri.

---

#### Dialog and Confirmation

Gunakan:

```tsx
<Dialog />
<AlertDialog />
```

Untuk:

```txt
Confirm delete
Confirm reset filter
Job alert modal
Auth prompt
```

---

#### Dropdown and Menus

Gunakan:

```tsx
<DropdownMenu />
<Popover />
<Command />
```

Untuk:

```txt
Sort menu
User menu
Search suggestion
Location suggestion
Company suggestion
Quick action menu
```

---

#### Loading State

Gunakan:

```tsx
<Skeleton />
```

Untuk:

```txt
Job card loading
Company card loading
Blog card loading
Search result loading
```

Jangan gunakan spinner besar untuk daftar lowongan.

---

#### Table

Gunakan:

```tsx
<Table />
```

Untuk dashboard/admin seperti:

```txt
Scraped jobs table
Source management
Blog management
User alert management
```

Untuk public job listing, tetap gunakan card list, bukan table.

---

#### Toast

Gunakan:

```tsx
sonner
```

Untuk:

```txt
Job saved
Filter applied
Alert created
Apply link copied
Error fetching jobs
```

Toast harus singkat dan tidak mengganggu.

---

## 27. ShadCN Styling Rules

ShadCN harus mengikuti token dari `globals.css`.

Jangan override style ShadCN secara liar.

Boleh custom:

```txt
spacing
layout
composition
responsive behavior
small variant adjustment
```

Jangan custom:

```txt
warna random
border random
shadow random
radius random
font random
hover effect random
gradient random
```

Semua perubahan visual harus tetap memakai token:

```tsx
bg-background
bg-card
bg-muted
bg-primary
text-foreground
text-muted-foreground
text-primary-foreground
border-border
ring-primary
```

---

## 28. No Random Components Rule

Jangan menggunakan component library lain untuk UI utama.

Tidak boleh menggunakan:

```txt
Material UI
Ant Design
Chakra UI
Mantine
NextUI
DaisyUI
Flowbite
Preline
Headless UI untuk komponen yang sudah ada di ShadCN
custom component library tanpa alasan kuat
```

Pengecualian hanya untuk kebutuhan khusus yang tidak disediakan ShadCN, misalnya:

```txt
Chart library
Rich text editor
Map
Code editor
Advanced data table logic
```

Walaupun menggunakan library tambahan, tampilannya tetap harus dibungkus agar mengikuti ShadCN style.

---

## 29. Custom Component Rules

Custom component diperbolehkan hanya sebagai composition.

Contoh benar:

```tsx
export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription>{job.company}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.type}</Badge>
          <Badge variant="outline">{job.location}</Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button>View Detail</Button>
      </CardFooter>
    </Card>
  );
}
```

Contoh salah:

```tsx
export function JobCard({ job }: { job: Job }) {
  return (
    <div className="rounded-[32px] bg-gradient-to-br from-cyan-400 to-purple-500 p-8 shadow-2xl">
      <h3 className="text-pink-100">{job.title}</h3>
      <button className="rounded-full bg-yellow-300 px-8 py-4">
        View Detail
      </button>
    </div>
  );
}
```

---

## 30. ShadCN Installation Rule

Jika komponen belum tersedia di project, tambahkan menggunakan CLI ShadCN.

Contoh:

```bash
npx shadcn@latest add button card input badge select sheet dialog dropdown-menu skeleton separator tabs pagination breadcrumb tooltip form label
```

Jangan copy-paste komponen random dari internet.

Jangan membuat ulang komponen yang sudah tersedia di ShadCN.

---

## 31. UI Refactor Priority

Saat melakukan refactor UI Lowonganku, ikuti prioritas ini:

```txt
1. Cek globals.css dan theme token terlebih dahulu
2. Cek komponen ShadCN yang sudah tersedia
3. Tambahkan komponen ShadCN yang belum ada
4. Ganti komponen custom aneh dengan ShadCN composition
5. Rapikan layout, spacing, typography
6. Hilangkan blob, gradient aneh, shadow berlebihan
7. Pastikan semua halaman konsisten
```

Jangan langsung rewrite semua UI tanpa audit.

Audit dulu komponen yang sudah ada, lalu ubah secara bertahap.

---

## 32. Final ShadCN Principle

Lowonganku harus terlihat seperti satu produk yang utuh, bukan kumpulan komponen dari berbagai tempat.

Prinsip utama:

```txt
Use ShadCN as the UI foundation.
Use globals.css as the design source of truth.
Use composition, not random custom UI.
Keep everything consistent, premium, and restrained.
```
