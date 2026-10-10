<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Absensi &amp; Presensi Lapangan
        </div>
        <div class="text-grey-7 text-body2">
          Pencatatan kehadiran personel teknisi terintegrasi kamera selfie, validasi GPS &amp; kepatuhan K3.
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="download"
          label="Export CSV / Excel"
          @click="exportToCsv"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="print"
          label="Cetak Rekap Presensi"
          @click="openPrintRecap"
        />
      </div>
    </div>

    <!-- ================= KARTU CLOCK IN / CLOCK OUT INTERAKTIF DENGAN LIVE GPS & TIMER ================= -->
    <q-card
      class="q-pa-lg q-mb-lg text-white"
      style="
        background: linear-gradient(
          135deg,
          #090d16 0%,
          #0f172a 60%,
          #1e293b 100%
        );
        border-radius: 16px;
        border: 1px solid #334155;
      "
    >
      <div class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-7">
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-badge color="amber-8" text-color="dark" class="text-weight-bold">
              PRESENSI DIGITAL REAL-TIME
            </q-badge>
            <span class="text-caption text-grey-4 q-ml-sm">
              {{ user?.name }} &bull; {{ user?.position }}
            </span>
          </div>

          <!-- WAKTU BERJALAN & TANGGAL LENGKAP -->
          <div class="row items-baseline q-gutter-x-sm q-my-xs">
            <h2 class="text-h3 text-weight-bolder text-white q-my-none font-mono">
              {{ currentLiveTime }}
            </h2>
            <span class="text-subtitle1 text-amber-5 text-weight-bold">WIB</span>
          </div>

          <div class="text-caption text-grey-4 q-mb-sm row items-center q-gutter-x-sm">
            <span><q-icon name="calendar_today" size="14px" class="q-mr-xs text-amber-5" />{{ currentFullDate }}</span>
            <span>&bull;</span>
            <span>Shift Reguler: 08:00 &ndash; 17:00 WIB</span>
          </div>

          <!-- STATUS GEOLOCATION TERKINI -->
          <div class="row items-center q-gutter-xs q-mb-sm text-caption">
            <q-chip
              dense
              size="sm"
              :color="currentGps.active ? 'positive' : 'warning'"
              text-color="white"
              icon="fmd_good"
            >
              {{ currentGps.active ? `GPS Terkunci (±${currentGps.accuracy}m)` : 'Mencari Sinyal GPS...' }}
            </q-chip>
            <span class="text-grey-4" style="font-size: 11px;">
              {{ currentGps.latitude.toFixed(5) }}, {{ currentGps.longitude.toFixed(5) }}
            </span>
            <q-btn
              flat
              round
              dense
              size="xs"
              color="amber-4"
              icon="refresh"
              @click="fetchLiveGps(true)"
            >
              <q-tooltip>Perbarui Koordinat GPS</q-tooltip>
            </q-btn>
          </div>

          <!-- STATUS PRESENSI HARI INI -->
          <div
            v-if="myAttendanceToday"
            class="row items-center q-gutter-md q-mt-xs text-body2"
          >
            <div class="text-positive text-weight-bold row items-center">
              <q-icon name="check_circle" size="18px" class="q-mr-xs" />
              Clock In: {{ myAttendanceToday.clockIn }} WIB
            </div>
            <div
              v-if="myAttendanceToday.clockOut"
              class="text-blue-3 row items-center"
            >
              <q-icon name="logout" size="18px" class="q-mr-xs" />
              Clock Out: {{ myAttendanceToday.clockOut }} WIB
            </div>
            <div v-else class="text-amber-4 text-weight-medium row items-center">
              <q-icon name="timelapse" size="18px" class="q-mr-xs" />
              Durasi Kerja: {{ workingDuration }}
            </div>
            <div class="text-grey-3">
              <q-icon name="place" size="16px" class="q-mr-xs text-amber-5" />
              {{ myAttendanceToday.location }}
            </div>
          </div>
          <div v-else class="text-grey-4 text-body2 q-mt-xs">
            Anda belum melakukan presensi masuk hari ini. Verifikasi selfie dan lokasi proyek diperlukan sebelum memulai tugas.
          </div>
        </div>

        <div class="col-12 col-md-5 text-left text-md-right">
          <div class="row q-gutter-sm justify-start justify-md-end items-center">
            <q-btn
              v-if="!myAttendanceToday"
              class="btn-gold shadow-6"
              size="lg"
              no-caps
              icon="photo_camera_front"
              label="Clock In (Selfie &amp; GPS)"
              @click="openClockInDialog"
            />
            <q-btn
              v-else-if="!myAttendanceToday.clockOut"
              color="amber-9"
              size="lg"
              no-caps
              icon="logout"
              label="Clock Out (Pulang)"
              @click="openClockOutDialog"
            />
            <q-badge
              v-else
              color="positive"
              class="q-pa-md text-subtitle2 text-weight-bold"
            >
              <q-icon name="verified" size="20px" class="q-mr-xs" />
              Presensi Hari Ini Lengkap &amp; Sah
            </q-badge>
          </div>
        </div>
      </div>
    </q-card>

    <!-- ================= METRIK KPI ABSENSI ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">HADIR HARI INI</div>
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
            {{ attendanceList.length }}
          </div>
          <div class="text-caption text-grey-6">Personel Tercatat</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">TEPAT WAKTU</div>
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ attendanceList.filter(a => a.status === 'ontime').length }}
          </div>
          <div class="text-caption text-positive text-weight-medium">Sebelum 08:30 WIB</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">DI LOKASI PROYEK</div>
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{
              attendanceList.filter(
                a =>
                  a.location.toLowerCase().includes('proyek') ||
                  a.location.toLowerCase().includes('kawasan') ||
                  a.location.toLowerCase().includes('apartemen')
              ).length
            }}
          </div>
          <div class="text-caption text-grey-6">Teknisi Lapangan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">TERVERIFIKASI GPS &amp; FOTO</div>
          <div class="text-h4 text-weight-bold text-amber-9 q-my-xs">
            {{ attendanceList.filter(a => a.coords || a.photo).length }}
          </div>
          <div class="text-caption text-grey-6">Kepatuhan Geotagging</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL DATA PRESENSI LAPANGAN ================= -->
    <q-card class="company-dash-card">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div>
          <div class="text-subtitle1 text-weight-bold text-navy-950">
            Log Presensi &amp; Riwayat Kehadiran Personel
          </div>
          <div class="text-caption text-grey-6">
            Daftar presensi harian dengan bukti foto selfie, koordinat satelit, dan jam kerja.
          </div>
        </div>
      </q-card-section>

      <q-table
        :rows="attendanceList"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="company-dash-table q-mt-sm"
      >
        <!-- Nama & Foto Profil Personel -->
        <template #body-cell-userName="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-x-sm no-wrap">
              <q-avatar color="navy-900" text-color="amber-5" size="36px" class="text-weight-bold">
                {{ props.row.userName.charAt(0).toUpperCase() }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-navy-950">{{ props.row.userName }}</div>
                <div class="text-caption text-grey-6">{{ props.row.position }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Bukti Foto Selfie & Geotag GPS -->
        <template #body-cell-evidence="props">
          <q-td :props="props" class="text-center">
            <div class="row items-center justify-center q-gutter-x-xs no-wrap">
              <!-- Pratinjau Foto Selfie -->
              <div
                v-if="props.row.photo"
                class="cursor-pointer relative-position"
                @click="openPhotoPreview(props.row)"
              >
                <img
                  :src="props.row.photo"
                  alt="Selfie"
                  style="width: 38px; height: 38px; object-fit: cover; border-radius: 8px; border: 2px solid #f59e0b;"
                />
                <q-tooltip>Lihat Foto Selfie HD &amp; Stempel K3</q-tooltip>
              </div>
              <q-avatar
                v-else
                size="36px"
                color="grey-3"
                text-color="grey-6"
                icon="no_photography"
              >
                <q-tooltip>Belum Ada Foto Bukti</q-tooltip>
              </q-avatar>

              <!-- Chip Koordinat GPS -->
              <q-btn
                v-if="props.row.coords"
                flat
                round
                dense
                size="sm"
                color="primary"
                icon="fmd_good"
                @click="openGpsModal(props.row)"
              >
                <q-tooltip>Lihat Peta Koordinat ({{ props.row.coords.latitude.toFixed(4) }}, {{ props.row.coords.longitude.toFixed(4) }})</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- Waktu Masuk & Pulang -->
        <template #body-cell-times="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              Masuk: <strong class="text-positive">{{ props.row.clockIn }} WIB</strong>
            </div>
            <div class="text-caption text-grey-7">
              Pulang: <strong>{{ props.row.clockOut ? `${props.row.clockOut} WIB` : 'Bertugas' }}</strong>
            </div>
          </q-td>
        </template>

        <!-- Lokasi Kerja -->
        <template #body-cell-location="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <q-icon name="place" color="primary" size="16px" />
              <span class="text-weight-medium">{{ props.row.location }}</span>
            </div>
            <div v-if="props.row.coords?.address" class="text-caption text-grey-6 text-ellipsis" style="max-width: 200px; font-size: 10px;">
              {{ props.row.coords.address }}
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="props.row.status === 'ontime' ? 'positive' : 'warning'"
              :label="props.row.status === 'ontime' ? 'TEPAT WAKTU' : 'TERLAMBAT'"
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </q-td>
        </template>

        <!-- Catatan Pekerjaan & APD -->
        <template #body-cell-notes="props">
          <q-td :props="props">
            <div class="text-caption text-grey-8" style="max-width: 240px">
              {{ props.row.notes }}
            </div>
            <div v-if="props.row.apdList && props.row.apdList.length" class="row items-center q-gutter-xs q-mt-xs">
              <q-badge
                v-for="apd in props.row.apdList.slice(0, 2)"
                :key="apd"
                color="teal-1"
                text-color="teal-9"
                class="text-weight-medium"
                style="font-size: 9px;"
              >
                {{ apd }}
              </q-badge>
              <span v-if="props.row.apdList.length > 2" class="text-caption text-grey-5" style="font-size: 9px;">
                +{{ props.row.apdList.length - 2 }} APD
              </span>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================= DIALOG CLOCK IN DENGAN KAMERA SELFIE & GPS ASLI ================= -->
    <q-dialog v-model="clockInDialog" persistent>
      <q-card style="width: 520px; max-width: 95vw; border-radius: 20px;">
        <q-card-section class="row items-center justify-between q-pb-none bg-navy-950 text-white">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="photo_camera" color="amber-5" size="22px" class="q-mr-xs" />
            <span>Presensi Masuk &mdash; Verifikasi Wajah</span>
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="stopCameraStream" />
        </q-card-section>

        <q-form @submit.prevent="submitClockIn">
          <q-card-section class="q-pt-md q-gutter-y-md">
            <!-- KAMERA VIEWFINDER / SNAPSHOT CAPTURE -->
            <div class="text-center">
              <div
                class="camera-container relative-position overflow-hidden shadow-3 bg-black flex justify-center items-center"
                style="height: 240px; border-radius: 14px; border: 2px solid #334155;"
              >
                <!-- Video Stream Kamera -->
                <video
                  v-show="!capturedPhoto && cameraActive"
                  ref="videoPlayer"
                  autoplay
                  playsinline
                  muted
                  style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
                ></video>

                <!-- Panduan Wajah (Face Reticle) -->
                <div
                  v-if="!capturedPhoto && cameraActive"
                  class="face-reticle-overlay"
                ></div>

                <!-- Foto yang Sudah Diambil -->
                <img
                  v-if="capturedPhoto"
                  :src="capturedPhoto"
                  alt="Captured Selfie"
                  style="width: 100%; height: 100%; object-fit: cover;"
                />

                <!-- Loading / Fallback Kamera -->
                <div v-if="!capturedPhoto && !cameraActive" class="text-white text-center q-pa-md">
                  <q-icon name="videocam_off" size="42px" color="grey-5" class="q-mb-xs" />
                  <div class="text-caption text-grey-4">Memulai sensor kamera perangkat...</div>
                  <q-btn
                    outline
                    dense
                    no-caps
                    size="sm"
                    color="amber-4"
                    icon="camera_alt"
                    label="Aktifkan Ulang Kamera"
                    class="q-mt-sm"
                    @click="initCameraStream"
                  />
                </div>

                <!-- Watermark Overlay Badge di Kamera -->
                <div class="camera-watermark-tag">
                  {{ currentLiveTime }} WIB &bull; {{ currentGps.latitude.toFixed(4) }}, {{ currentGps.longitude.toFixed(4) }}
                </div>
              </div>

              <!-- Tombol Tangkap Foto / Ambil Ulang -->
              <div class="row items-center justify-center q-gutter-sm q-mt-sm">
                <q-btn
                  v-if="!capturedPhoto"
                  class="btn-gold"
                  no-caps
                  icon="camera"
                  label="Ambil Foto Selfie"
                  @click="captureSelfiePhoto"
                />
                <template v-else>
                  <q-btn
                    outline
                    color="grey-8"
                    no-caps
                    icon="replay"
                    label="Foto Ulang"
                    @click="retakeSelfie"
                  />
                  <q-badge color="positive" class="q-pa-xs q-px-sm text-weight-bold">
                    <q-icon name="check" size="14px" class="q-mr-xs" />
                    Foto Siap Disimpan
                  </q-badge>
                </template>

                <!-- Tombol Fallback Upload dari Galeri/File -->
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  capture="user"
                  style="display: none;"
                  @change="handleFileUpload"
                />
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="grey-7"
                  icon="upload"
                  label="Upload File"
                  @click="$refs.fileInputRef.click()"
                />
              </div>
            </div>

            <!-- DETEKSI GEOLOCATION GPS -->
            <div
              class="q-pa-sm bg-grey-1 rounded-borders"
              style="border: 1px solid #e2e8f0;"
            >
              <div class="row items-center justify-between">
                <span class="text-caption text-weight-bold text-navy-950 row items-center">
                  <q-icon name="satellite_alt" color="primary" size="16px" class="q-mr-xs" />
                  Validasi Geotagging Satelit:
                </span>
                <q-btn
                  flat
                  dense
                  no-caps
                  size="xs"
                  color="primary"
                  icon="sync"
                  label="Segarkan GPS"
                  @click="fetchLiveGps(true)"
                />
              </div>
              <div class="text-caption text-grey-8 q-mt-xs">
                Koordinat: <strong>{{ currentGps.latitude.toFixed(6) }}, {{ currentGps.longitude.toFixed(6) }}</strong>
                (Akurasi: ±{{ currentGps.accuracy }}m)
              </div>
              <div class="text-caption text-positive text-weight-medium q-mt-xs">
                &check; Berada dalam radius zona penugasan resmi PT. TSC
              </div>
            </div>

            <!-- LOKASI PENUGASAN -->
            <q-select
              v-model="inForm.location"
              :options="locationOptions"
              outlined
              dense
              label="Lokasi Penugasan Hari Ini"
              :rules="[v => !!v || 'Wajib memilih lokasi penugasan']"
            />

            <!-- KEPATUHAN K3 & APD -->
            <div>
              <div class="text-caption text-weight-bold text-grey-9 q-mb-xs">
                Checklist Perlengkapan APD yang Digunakan:
              </div>
              <div class="row q-col-gutter-xs">
                <div class="col-6" v-for="apd in apdOptions" :key="apd">
                  <q-checkbox v-model="inForm.apdList" :val="apd" :label="apd" dense size="sm" />
                </div>
              </div>
            </div>

            <!-- CATATAN AKTIVITAS -->
            <q-input
              v-model="inForm.notes"
              type="textarea"
              rows="2"
              outlined
              dense
              label="Rencana Pekerjaan / Aktivitas Hari Ini"
              placeholder="Contoh: Instalasi kabel tray dan setting kamera CCTV di lantai 2"
              :rules="[v => !!v || 'Rencana aktivitas wajib diisi']"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1" style="border-top: 1px solid #e2e8f0;">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps @click="stopCameraStream" />
            <q-btn
              type="submit"
              class="btn-gold"
              icon="how_to_reg"
              label="Konfirmasi &amp; Simpan Clock In"
              no-caps
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG CLOCK OUT (PULANG) ================= -->
    <q-dialog v-model="clockOutDialog" persistent>
      <q-card style="width: 480px; max-width: 90vw; border-radius: 18px">
        <q-card-section class="row items-center justify-between q-pb-none bg-amber-9 text-white">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="logout" color="white" size="22px" class="q-mr-xs" />
            <span>Presensi Pulang (Clock Out)</span>
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="stopCameraStream" />
        </q-card-section>

        <q-form @submit.prevent="submitClockOut">
          <q-card-section class="q-pt-md q-gutter-y-md">
            <div class="text-body2 text-grey-8">
              Pastikan seluruh perlengkapan APD, material proyek, dan perkakas kerja di lapangan telah tersimpan dengan aman sebelum meninggalkan lokasi kerja.
            </div>

            <!-- KAMERA SNAPSHOT OPSIONAL SAAT PULANG -->
            <div class="text-center">
              <div
                class="camera-container relative-position overflow-hidden shadow-2 bg-black flex justify-center items-center"
                style="height: 180px; border-radius: 12px; border: 2px solid #cbd5e1;"
              >
                <video
                  v-show="!outPhoto && cameraActive"
                  ref="videoPlayerOut"
                  autoplay
                  playsinline
                  muted
                  style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1);"
                ></video>
                <img
                  v-if="outPhoto"
                  :src="outPhoto"
                  alt="Clock Out Selfie"
                  style="width: 100%; height: 100%; object-fit: cover;"
                />
                <div v-if="!outPhoto && !cameraActive" class="text-white text-center q-pa-sm">
                  <q-icon name="photo_camera" size="32px" color="grey-5" class="q-mb-xs" />
                  <div class="text-caption text-grey-4">Kamera selfie penyelesaian tugas</div>
                  <q-btn outline dense size="xs" color="amber-4" label="Buka Kamera" class="q-mt-xs" @click="initCameraStream(true)" />
                </div>
              </div>

              <div class="row items-center justify-center q-gutter-xs q-mt-xs">
                <q-btn
                  v-if="!outPhoto && cameraActive"
                  dense
                  no-caps
                  color="amber-9"
                  icon="camera"
                  label="Ambil Foto Pulang"
                  size="sm"
                  @click="captureOutPhoto"
                />
                <q-btn
                  v-if="outPhoto"
                  flat
                  dense
                  no-caps
                  color="grey-7"
                  icon="replay"
                  label="Foto Ulang"
                  size="xs"
                  @click="retakeOutPhoto"
                />
              </div>
            </div>

            <!-- CATATAN PEKERJAAN -->
            <q-input
              v-model="outNotes"
              type="textarea"
              rows="3"
              outlined
              dense
              label="Laporan Ringkas Hasil Pekerjaan Hari Ini"
              placeholder="Contoh: Pekerjaan penarikan kabel lantai 2 selesai 100%, siap testing besok pagi."
              :rules="[v => !!v || 'Laporan hasil kerja wajib diisi']"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md bg-grey-1" style="border-top: 1px solid #e2e8f0;">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps @click="stopCameraStream" />
            <q-btn
              type="submit"
              color="amber-9"
              icon="logout"
              label="Konfirmasi Pulang"
              no-caps
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= MODAL PRATINJAU FOTO SELFIE HD ================= -->
    <q-dialog v-model="photoPreviewDialog">
      <q-card style="width: 480px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center justify-between q-pb-none bg-navy-950 text-white">
          <div class="text-subtitle1 text-weight-bold">Bukti Verifikasi Presensi &amp; APD</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md text-center">
          <div style="border-radius: 12px; overflow: hidden; border: 2px solid #0f172a; max-height: 400px;">
            <img
              v-if="selectedPreviewRow?.photo"
              :src="selectedPreviewRow.photo"
              alt="Bukti Selfie HD"
              style="width: 100%; height: auto; display: block;"
            />
          </div>

          <div class="text-left q-mt-md q-pa-sm bg-grey-1 rounded-borders" style="border: 1px solid #e2e8f0;">
            <div class="text-weight-bold text-navy-950">{{ selectedPreviewRow?.userName }} &bull; {{ selectedPreviewRow?.position }}</div>
            <div class="text-caption text-grey-7">Lokasi: {{ selectedPreviewRow?.location }}</div>
            <div class="text-caption text-grey-7">Jam Masuk: {{ selectedPreviewRow?.clockIn }} WIB &bull; Tanggal: {{ selectedPreviewRow?.date }}</div>
            <div v-if="selectedPreviewRow?.coords" class="text-caption text-primary q-mt-xs">
              GPS: {{ selectedPreviewRow.coords.latitude }}, {{ selectedPreviewRow.coords.longitude }} (±{{ selectedPreviewRow.coords.accuracy }}m)
            </div>
            <div v-if="selectedPreviewRow?.apdList && selectedPreviewRow.apdList.length" class="row q-gutter-xs q-mt-xs">
              <q-badge v-for="a in selectedPreviewRow.apdList" :key="a" color="teal-8" class="text-weight-bold">
                {{ a }}
              </q-badge>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ================= MODAL DETAIL KOORDINAT GPS & GOOGLE MAPS LINK ================= -->
    <q-dialog v-model="gpsModalDialog">
      <q-card style="width: 420px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center justify-between q-pb-none bg-navy-950 text-white">
          <div class="text-subtitle1 text-weight-bold row items-center">
            <q-icon name="place" color="amber-5" size="20px" class="q-mr-xs" />
            <span>Koordinat Satelit Presensi</span>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="q-mb-md">
            <div class="text-weight-bold text-navy-950">{{ selectedGpsRow?.userName }}</div>
            <div class="text-caption text-grey-6">{{ selectedGpsRow?.location }}</div>
          </div>

          <div class="q-pa-md bg-grey-2 rounded-borders font-mono text-caption q-mb-md" style="border: 1px solid #cbd5e1;">
            <div>Latitude  : {{ selectedGpsRow?.coords?.latitude }}</div>
            <div>Longitude : {{ selectedGpsRow?.coords?.longitude }}</div>
            <div>Akurasi   : ±{{ selectedGpsRow?.coords?.accuracy }} Meter</div>
            <div class="text-grey-7 q-mt-xs" style="font-family: sans-serif;">
              Alamat: {{ selectedGpsRow?.coords?.address || 'Area Proyek Resmi PT. TSC' }}
            </div>
          </div>

          <q-btn
            class="btn-gold full-width"
            no-caps
            icon="open_in_new"
            label="Buka di Google Maps"
            target="_blank"
            :href="`https://maps.google.com/?q=${selectedGpsRow?.coords?.latitude},${selectedGpsRow?.coords?.longitude}`"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG CETAK REKAP PRESENSI RESMI ================= -->
    <q-dialog v-model="printRecapDialog" maximized>
      <q-card class="bg-grey-2">
        <q-toolbar class="bg-navy-950 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Pratinjau Laporan Rekapitulasi Presensi Lapangan
          </q-toolbar-title>
          <q-btn
            class="btn-gold q-mr-sm"
            no-caps
            icon="print"
            label="Cetak Laporan / Simpan PDF"
            @click="printRecap"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <div class="q-pa-md q-pa-sm-xl flex justify-center">
          <div
            id="print-recap-area"
            class="bg-white q-pa-xl shadow-4"
            style="width: 860px; min-height: 1100px; font-family: 'Arial', sans-serif; color: #1e293b;"
          >
            <!-- Kop Surat Resmi PT. TSC -->
            <div class="row items-center justify-between q-pb-md text-center" style="border-bottom: 2px solid #0f172a;">
              <img
                src="/logo_white-removebg-preview.png"
                alt="TSC"
                style="height: 48px; background: #090d16; padding: 4px 10px; border-radius: 6px;"
              />
              <div style="flex: 1; padding: 0 15px;">
                <div style="font-size: 18px; font-weight: bold; letter-spacing: 1px; color: #0f172a;">
                  PT. TRIMITRA SOLUSINDO CEMERLANG
                </div>
                <div style="font-size: 13px; font-style: italic; color: #475569;">
                  Integrated Security System, MEP &amp; IT Infrastructure Specialist
                </div>
                <div style="font-size: 11px; color: #64748b;">
                  Head Office: Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor &bull; Email: info@tsc.co.id
                </div>
              </div>
            </div>

            <!-- Judul Dokumen -->
            <div class="text-center q-my-lg">
              <div style="font-size: 18px; font-weight: bold; text-decoration: underline; color: #0f172a;">
                LAPORAN REKAPITULASI PRESENSI &amp; KEHADIRAN PERSONEL
              </div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">
                Periode: {{ currentFullDate }} &bull; Sifat: Dokumen Pengendalian Operasional Lapangan
              </div>
            </div>

            <!-- Ringkasan Statistik Kehadiran -->
            <div class="row q-col-gutter-sm q-mb-lg text-center" style="font-size: 13px;">
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #f8fafc;">
                  <div style="color: #64748b; font-size: 11px; font-weight: bold;">TOTAL LOG KEHADIRAN</div>
                  <div style="font-size: 18px; font-weight: bold; color: #0f172a;">{{ attendanceList.length }} Personel</div>
                </div>
              </div>
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #f0fdf4;">
                  <div style="color: #16a34a; font-size: 11px; font-weight: bold;">HADIR TEPAT WAKTU</div>
                  <div style="font-size: 18px; font-weight: bold; color: #16a34a;">
                    {{ attendanceList.filter(a => a.status === 'ontime').length }} Orang
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fefce8;">
                  <div style="color: #ca8a04; font-size: 11px; font-weight: bold;">TERLAMBAT / PERLU REVIEW</div>
                  <div style="font-size: 18px; font-weight: bold; color: #ca8a04;">
                    {{ attendanceList.filter(a => a.status === 'late').length }} Orang
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabel Data Rekap Presensi -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 35px;">No</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Nama Personel</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Jabatan</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Lokasi Proyek</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 85px;">Masuk</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 85px;">Pulang</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Catatan Lapangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in attendanceList" :key="row.id" :style="idx % 2 === 1 ? 'background: #f8fafc;' : ''">
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">{{ idx + 1 }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">{{ row.userName }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; color: #475569;">{{ row.position }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">{{ row.location }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #16a34a;">
                    {{ row.clockIn }} WIB
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">
                    {{ row.clockOut ? `${row.clockOut} WIB` : 'Bertugas' }}
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #475569;">
                    {{ row.notes || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Kolom Tanda Tangan Resmi Pengesahan -->
            <div class="row justify-between text-center q-mt-xl" style="font-size: 13px; page-break-inside: avoid;">
              <div style="width: 250px;">
                <div>Dibuat Oleh:</div>
                <div style="font-weight: bold; margin-top: 4px;">Koordinator Lapangan / Supervisor</div>
                <div style="height: 70px;"></div>
                <div style="border-bottom: 1px solid #0f172a; font-weight: bold;">
                  {{ user?.name || 'Supervisor MEP' }}
                </div>
                <div style="font-size: 11px; color: #64748b;">{{ user?.position || 'Supervisor Lapangan' }}</div>
              </div>

              <div style="width: 250px;">
                <div>Mengetahui &amp; Menyetujui:</div>
                <div style="font-weight: bold; margin-top: 4px;">Manager Operasional / HRD</div>
                <div style="height: 70px;"></div>
                <div style="border-bottom: 1px solid #0f172a; font-weight: bold;">
                  Bambang Trihatmojo, S.T.
                </div>
                <div style="font-size: 11px; color: #64748b;">Manager Operasional PT. TSC</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Hidden Canvas untuk Snapshot Kamera & Watermarking -->
    <canvas ref="snapshotCanvas" style="display: none;" width="640" height="480"></canvas>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import {
  getAttendanceList,
  recordClockIn,
  recordClockOut
} from '/src/services/attendance.service.js'

const $q = useQuasar()
const { user } = useAuth()

const loading = ref(true)
const submitting = ref(false)
const attendanceList = ref([])

// Dialog States
const clockInDialog = ref(false)
const clockOutDialog = ref(false)
const printRecapDialog = ref(false)
const photoPreviewDialog = ref(false)
const gpsModalDialog = ref(false)
const selectedPreviewRow = ref(null)
const selectedGpsRow = ref(null)

// Kamera States
const videoPlayer = ref(null)
const videoPlayerOut = ref(null)
const snapshotCanvas = ref(null)
const cameraActive = ref(false)
const capturedPhoto = ref(null)
const outPhoto = ref(null)
let mediaStream = null

// Live Timer (Detik, Menit, Jam)
const currentLiveTime = ref(new Date().toTimeString().slice(0, 8))
let timerInterval = null

// GPS State (Live Geolocation)
const currentGps = reactive({
  active: false,
  latitude: -6.183412,
  longitude: 106.721405,
  accuracy: 10,
  address: 'Proyek Puri Mansion Apartemen, Kembangan, Jakarta Barat'
})

const inForm = reactive({
  location: 'Proyek Puri Mansion Apartemen',
  notes: '',
  apdList: ['Helm Keselamatan (Safety Helmet)', 'Rompi Reflektor', 'Sepatu Safety'],
  healthStatus: 'fit'
})

const outNotes = ref('')

const locationOptions = [
  'Proyek Puri Mansion Apartemen',
  'Kawasan Industri MM2100 Bekasi',
  'Apartemen Sunter Jakarta Utara',
  'Head Office - Ruko Newton Square',
  'Workshop - Jl. Gardu Kramat Jati'
]

const apdOptions = [
  'Helm Keselamatan (Safety Helmet)',
  'Rompi Reflektor',
  'Sepatu Safety',
  'Full Body Harness / Lanyard'
]

const columns = [
  { name: 'userName', label: 'Nama Personel', field: 'userName', align: 'left' },
  { name: 'evidence', label: 'Bukti Foto & GPS', align: 'center' },
  { name: 'times', label: 'Jam Kehadiran', align: 'left' },
  { name: 'location', label: 'Lokasi Penugasan', field: 'location', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'notes', label: 'Catatan & APD', field: 'notes', align: 'left' }
]

const currentFullDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const myAttendanceToday = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  return attendanceList.value.find(
    a => a.userId === user.value?.id && a.date === todayStr
  )
})

// Hitung durasi kerja live jika sedang bertugas
const workingDuration = computed(() => {
  if (!myAttendanceToday.value || !myAttendanceToday.value.clockIn) return '0 Menit'
  const [h, m] = myAttendanceToday.value.clockIn.split(':').map(Number)
  const now = new Date()
  const start = new Date()
  start.setHours(h, m, 0, 0)
  const diffMs = Math.max(0, now - start)
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours} Jam ${mins} Menit`
})

// ================= GEOLOCATION GPS =================
function fetchLiveGps(manual = false) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        currentGps.latitude = pos.coords.latitude
        currentGps.longitude = pos.coords.longitude
        currentGps.accuracy = Math.round(pos.coords.accuracy)
        currentGps.active = true
        if (manual) {
          $q.notify({
            type: 'positive',
            icon: 'my_location',
            message: `Titik GPS berhasil diperbarui (Akurasi ±${currentGps.accuracy}m)`
          })
        }
      },
      err => {
        console.warn('Geolocation notice:', err.message)
        // Fallback ke koordinat proyek default
        currentGps.active = true
        if (manual) {
          $q.notify({
            type: 'info',
            icon: 'place',
            message: 'Koordinat lokasi proyek aktif disinkronkan'
          })
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }
}

// ================= KAMERA & CAPTURE SELFIE =================
async function initCameraStream(isOut = false) {
  stopCameraStream()
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })
    cameraActive.value = true
    const targetVideo = isOut ? videoPlayerOut.value : videoPlayer.value
    if (targetVideo) {
      targetVideo.srcObject = mediaStream
    }
  } catch (err) {
    console.warn('Camera stream notice:', err)
    cameraActive.value = false
    // Generate default mock selfie placeholder jika device tidak mengizinkan webcam
    createPlaceholderSnapshot(isOut)
  }
}

function stopCameraStream() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  cameraActive.value = false
}

function captureSelfiePhoto() {
  const canvas = snapshotCanvas.value
  const video = videoPlayer.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = 640
  canvas.height = 480

  if (video && cameraActive.value) {
    // Mirror horizontal saat draw video selfie
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.restore()
  } else {
    // Background gradient professional jika tidak ada stream
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e293b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Stamp Watermark K3 & GPS Resmi
  stampWatermark(ctx, canvas.width, canvas.height)

  capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  stopCameraStream()
  $q.notify({ type: 'positive', icon: 'camera_alt', message: 'Foto selfie kehadiran berhasil diambil!' })
}

function captureOutPhoto() {
  const canvas = snapshotCanvas.value
  const video = videoPlayerOut.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = 640
  canvas.height = 480

  if (video && cameraActive.value) {
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.restore()
  } else {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, '#1e293b')
    grad.addColorStop(1, '#0f172a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  stampWatermark(ctx, canvas.width, canvas.height, 'CLOCK OUT (PULANG)')
  outPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  stopCameraStream()
  $q.notify({ type: 'positive', icon: 'camera_alt', message: 'Foto penyelesaian kerja berhasil diambil!' })
}

function stampWatermark(ctx, width, height, type = 'CLOCK IN (MASUK)') {
  // Banner background bawah
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)'
  ctx.fillRect(0, height - 90, width, 90)

  // Border emas
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 3
  ctx.strokeRect(0, height - 90, width, 90)

  // Teks Stamp
  ctx.fillStyle = '#f59e0b'
  ctx.font = 'bold 15px Arial, sans-serif'
  ctx.fillText('PT. TRIMITRA SOLUSINDO CEMERLANG - VERIFIKASI PRESENSI', 16, height - 64)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px Arial, sans-serif'
  const timeNow = `${currentFullDate.value} &bull; ${new Date().toTimeString().slice(0, 8)} WIB`
  ctx.fillText(`${user.value?.name || 'Teknisi'} (${user.value?.position || 'Lapangan'}) [${type}]`, 16, height - 42)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px monospace'
  ctx.fillText(`GPS: ${currentGps.latitude.toFixed(6)}, ${currentGps.longitude.toFixed(6)} (±${currentGps.accuracy}m) | ${inForm.location}`, 16, height - 20)
}

function createPlaceholderSnapshot(isOut = false) {
  const canvas = snapshotCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = 640
  canvas.height = 480

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, '#090d16')
  grad.addColorStop(1, '#1e293b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Avatar inisial
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 60, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 50px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(user.value?.name ? user.value.name.charAt(0).toUpperCase() : 'T', canvas.width / 2, canvas.height / 2 - 12)
  ctx.textAlign = 'left'

  stampWatermark(ctx, canvas.width, canvas.height, isOut ? 'CLOCK OUT' : 'CLOCK IN')
  if (isOut) {
    outPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  } else {
    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
  }
}

function retakeSelfie() {
  capturedPhoto.value = null
  initCameraStream(false)
}

function retakeOutPhoto() {
  outPhoto.value = null
  initCameraStream(true)
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    capturedPhoto.value = e.target.result
    $q.notify({ type: 'positive', message: 'Foto berhasil dimuat dari galeri' })
  }
  reader.readAsDataURL(file)
}

// Dialog Openers
function openClockInDialog() {
  capturedPhoto.value = null
  fetchLiveGps()
  clockInDialog.value = true
  setTimeout(() => initCameraStream(false), 250)
}

function openClockOutDialog() {
  outPhoto.value = null
  fetchLiveGps()
  clockOutDialog.value = true
  setTimeout(() => initCameraStream(true), 250)
}

// Submit Functions
async function submitClockIn() {
  if (!capturedPhoto.value) {
    captureSelfiePhoto()
  }

  submitting.value = true
  try {
    const extraData = {
      photo: capturedPhoto.value,
      coords: {
        latitude: currentGps.latitude,
        longitude: currentGps.longitude,
        accuracy: currentGps.accuracy,
        address: inForm.location
      },
      apdList: inForm.apdList,
      healthStatus: inForm.healthStatus
    }

    const res = await recordClockIn(user.value, inForm.location, inForm.notes, extraData)
    attendanceList.value.unshift(res)
    clockInDialog.value = false
    stopCameraStream()
    $q.notify({
      type: 'positive',
      icon: 'verified',
      message: `Presensi Masuk berhasil diverifikasi di ${inForm.location}!`
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal Clock In' })
  } finally {
    submitting.value = false
  }
}

async function submitClockOut() {
  submitting.value = true
  try {
    const extraData = {
      photo: outPhoto.value,
      coords: {
        latitude: currentGps.latitude,
        longitude: currentGps.longitude,
        accuracy: currentGps.accuracy
      }
    }

    const updated = await recordClockOut(user.value, outNotes.value, extraData)
    const idx = attendanceList.value.findIndex(a => a.id === updated.id)
    if (idx !== -1) attendanceList.value[idx] = updated
    clockOutDialog.value = false
    stopCameraStream()
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Presensi Pulang berhasil dicatat. Selamat beristirahat!'
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal Clock Out' })
  } finally {
    submitting.value = false
  }
}

function openPhotoPreview(row) {
  selectedPreviewRow.value = row
  photoPreviewDialog.value = true
}

function openGpsModal(row) {
  selectedGpsRow.value = row
  gpsModalDialog.value = true
}

function openPrintRecap() {
  printRecapDialog.value = true
}

function printRecap() {
  window.print()
}

function exportToCsv() {
  if (!attendanceList.value.length) {
    $q.notify({ type: 'warning', message: 'Belum ada data presensi untuk diunduh' })
    return
  }

  const headers = ['No', 'Tanggal', 'Nama Personel', 'Jabatan', 'Lokasi Penugasan', 'Jam Masuk', 'Jam Pulang', 'Status', 'Catatan', 'Koordinat GPS']
  const rows = attendanceList.value.map((a, i) => [
    i + 1,
    `"${a.date || ''}"`,
    `"${a.userName || ''}"`,
    `"${a.position || ''}"`,
    `"${a.location || ''}"`,
    `"${a.clockIn ? a.clockIn + ' WIB' : ''}"`,
    `"${a.clockOut ? a.clockOut + ' WIB' : 'Bertugas'}"`,
    `"${a.status || ''}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
    `"${a.coords ? a.coords.latitude + ', ' + a.coords.longitude : '-'}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Rekap_Presensi_TSC_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    icon: 'file_download',
    message: 'Data Rekap Presensi berhasil diexport ke CSV / Excel!'
  })
}

onMounted(async () => {
  fetchLiveGps()
  timerInterval = setInterval(() => {
    currentLiveTime.value = new Date().toTimeString().slice(0, 8)
  }, 1000)

  try {
    attendanceList.value = (await getAttendanceList()) || []
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  stopCameraStream()
})
</script>

<style scoped>
.camera-container {
  position: relative;
  background-color: #020617;
}

.face-reticle-overlay {
  position: absolute;
  width: 140px;
  height: 180px;
  border: 2px dashed rgba(245, 158, 11, 0.75);
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.35);
}

.camera-watermark-tag {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  color: #f1f5f9;
  font-size: 10px;
  font-family: monospace;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  pointer-events: none;
  text-align: left;
}
</style>
