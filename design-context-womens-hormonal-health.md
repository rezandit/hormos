# Design Context — Foundation Models for Women's Hormonal Health
**Hack-Nation × MIT Club of Northern California × MIT Club of Germany — 6th Global AI Hackathon — Challenge 05**

---

## 1. Ringkasan Challenge

| Aspek | Detail |
|---|---|
| Tema | Membangun infrastruktur AI terbuka untuk kesehatan hormonal wanita |
| Sponsor teknologi | OpenAI (kredit API $50/tim, first-come-first-served) |
| Prinsip inti | **Satu building block yang reusable** (dataset, benchmark, model, atau aplikasi) — bukan mencoba membangun satu foundation model besar dalam waktu singkat |
| Wajib | Open license untuk dataset/benchmark/model/kode bila memungkinkan |
| Anti-pola | Prototipe terisolasi tanpa kontribusi reusable, klaim medis/diagnostik tanpa validasi ilmiah |

Persona acuan: **Sarah (34 tahun)** — fatigue, siklus tidak teratur, migrain, brain fog; hormon berubah dinamis (tidur, stres, nutrisi, usia) tapi hanya tertangkap sebagai snapshot di tiap kunjungan dokter.

---

## 2. Tiga Success Criteria (Fokus Utama Desain)

Semua keputusan desain project **harus bisa dijawab** oleh 3 pertanyaan ini — gunakan sebagai checklist di setiap milestone:

### 🎯 Criteria 1 — Women's Health Impact
> Seberapa signifikan pekerjaan ini bisa meningkatkan kesehatan wanita, dan berapa banyak wanita yang bisa diuntungkan?

- **Reach**: skala potensi pengguna/penerima manfaat (bukan hanya demo untuk 1 kasus)
- **Quality of Life**: dampak nyata ke outcome kesehatan, akses, pemahaman, atau kesejahteraan harian

### 🎯 Criteria 2 — Technical Excellence
> Seberapa inovatif, rigorous, reproducible, dan scalable dataset/benchmark/model/aplikasi yang diusulkan?

- Metodologi transparan (bukan black-box, bukan asumsi tersembunyi)
- Reproducibility: orang lain harus bisa menjalankan ulang dan mendapat hasil yang sama
- Rigor: evaluasi yang terdokumentasi (bukan sekadar demo yang "terlihat bagus")

### 🎯 Criteria 3 — Foundation Value
> Apakah project ini meninggalkan infrastruktur reusable yang mempercepat riset di masa depan?

- Bukan proof-of-concept sekali pakai — harus jadi *scientific asset*
- Published under open license: dataset, benchmark, kode, checkpoint, dokumentasi, pipeline evaluasi

---

## 3. Tiga Layer Kontribusi (Pilih Satu sebagai Fokus)

| Layer | Fokus | Output Minimum | Cocok Jika Tim Punya... |
|---|---|---|---|
| **01 — Data & Benchmark Infrastructure** | Kurasi & integrasi dataset multimodal (wearable, lab, gambar, gejala, sinyal longitudinal) | Dataset/benchmark terbuka dengan train/val/test split + metodologi evaluasi transparan | Kekuatan di data engineering, ETL, schema design |
| **02 — AI Model Infrastructure** | Model fokus (prediksi hormon/menopause/uji klinis) — prioritaskan reproducibility & explainability di atas ukuran model | Model checkpoint + kode training + dokumentasi reproduksi | Kekuatan di ML/data science |
| **03 — Application Infrastructure** ✅ **DIPILIH** | Solusi konkret di atas dataset/model yang ada (symptom tracking, journal AI, digital twin, pathway EHR de-identified) | Prototipe aplikasi + demo + dokumentasi keterhubungan ke dataset/model reusable di baliknya | Kekuatan di product/full-stack, UX |

> **Keputusan final**: Project **HormOS** fokus ke **Layer 03 — Application Infrastructure**, karena paling align dengan studi kasus Sarah di brief — masalah utamanya adalah "each appointment captures only a snapshot, yet hormones shift continuously," yang persis dijawab oleh sub-track *symptom tracking / personalized hormone insight* di Layer 03.
>
> **Wajib tetap dipenuhi (aturan "no isolated application")**: aplikasi ini harus dibangun di atas **fondasi data terintegrasi kecil** (dari mcPHASES + NHANES, mengacu skema standar di §4) — bukan sekadar UI tanpa dataset/model reusable di baliknya. Ini yang membuat submission tetap memenuhi kriteria **Foundation Value**, bukan sekadar Layer 03 murni tanpa akar di Layer 01.
>
> Latar belakang tim di IAM/identity governance (ForgeRock/Ping, Entra ID, AD) relevan sebagai nilai tambah untuk sub-fitur *consent/data governance* pada pathway kontribusi data, tapi bukan fokus utama deliverable.

---

## 4. Dataset yang Tersedia (Starting Point)

| Dataset | Isi | Sumber |
|---|---|---|
| **mcPHASES** (PhysioNet) | Fitbit, continuous glucose monitoring, pengukuran hormon, data siklus menstruasi, tidur, gejala | physionet.org/content/mcphases |
| **NHANES** (CDC) | Kesehatan reproduksi, hormon tiroid, data lab, nutrisi, demografi | wwwn.cdc.gov/nchs/nhanes |

Dataset lain boleh ditambahkan selama sesuai privacy/ethical/licensing requirements.

---

## 5. Deliverables Wajib

1. Working prototype + source code
2. Dokumentasi teknis + deskripsi dataset
3. Metodologi benchmark + video demo singkat

## 6. Checklist "Strong vs Weak Submission"

| ✅ Strong | ❌ Weak |
|---|---|
| Publish dataset/benchmark/checkpoint/pipeline dengan open license | Aplikasi terisolasi tanpa kontribusi reusable |
| Solve satu masalah prediksi/infrastruktur secara mendalam, metode & bukti transparan | Bergantung pada data proprietary tak terdokumentasi, asumsi preprocessing disembunyikan |
| Kode & dokumentasi reproducible agar komunitas riset bisa lanjutkan | Klaim medis/diagnostik tanpa validasi, UI mengkilap tanpa validasi ilmiah |

---

## 7. Rekomendasi Struktur Project (Design Brief Skeleton)

Gunakan struktur ini untuk menulis proposal/README project:

```
1. Problem statement (satu masalah hormonal spesifik — bukan "semua kesehatan wanita")
2. Reusable artifact yang ditinggalkan (dataset / benchmark / model / app-layer + underlying asset)
3. Data sources & preprocessing (jelas, terdokumentasi, reproducible)
4. Metodologi evaluasi (metrik, train/val/test split, baseline pembanding)
5. Dampak (Reach x Quality of Life) — kuantifikasi kalau bisa
6. Open license & rencana publikasi (repo, model card, dataset card)
7. Batasan & disclaimer (bukan alat diagnosis medis)
```

---

## 8. Pertanyaan Kritis Sebelum Mulai Build

- [x] Layer mana yang dipilih: ~~01 (Data)~~, ~~02 (Model)~~, **03 (Application)** ✅ — dengan fondasi data kecil dari mcPHASES + NHANES
- [ ] Satu masalah hormonal spesifik apa yang jadi fokus? (contoh: prediksi fase menstruasi, deteksi onset menopause, symptom-to-hormone correlation) — **masih perlu difinalkan**
- [ ] Dataset mana (mcPHASES/NHANES/lainnya) yang jadi basis?
- [ ] Bagaimana Reach & Quality of Life akan diukur/diklaim dalam demo?
- [ ] Apa bentuk "reusable asset" konkret yang akan di-publish (repo link, dataset card, model card)?
- [ ] Nama project: **HormOS** ✅
- [ ] Tech stack: Next.js (App Router, TS, Tailwind) untuk app + API, deploy ke Vercel; Python terpisah untuk data/ML pipeline (artifact statis dikonsumsi API route)
- [ ] Repo: `https://github.com/rezandit/hormos.git`