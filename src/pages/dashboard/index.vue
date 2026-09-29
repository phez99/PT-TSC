<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ============================================================== -->
    <!-- KONDISI A: PORTAL LAYANAN MANDIRI KARYAWAN (ROLE: STAFF / TEKNISI) -->
    <!-- ============================================================== -->
    <template v-if="user?.role === 'staff'">
      <!-- Banner Profil & Presensi Karyawan -->
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
          <div class="col-12 col-md-8">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <span
                class="company-badge q-px-sm q-py-xs"
                style="font-size: 0.72rem"
              >
                PORTAL MANDIRI KARYAWAN (ESS)
              </span>
              <q-badge
                color="amber-8"
                text-color="dark"
                class="text-weight-bold"
              >
                {{ user?.position || 'Teknisi Lapangan' }}
              </q-badge>
            </div>
            <h1
              class="text-h4 text-weight-bold text-white q-my-xs"
              style="line-height: 1.25"
            >
              Halo, {{ user?.name }} 👋
            </h1>
            <p
              class="text-grey-4 text-body2 q-mb-none"
              style="max-width: 580px"
            >
              Selamat bertugas. Pastikan selalu mematuhi protokol K3 keselamatan
              kerja dan melakukan presensi kehadiran sebelum memulai penugasan
              di proyek.
            </p>
            <div class="text-caption text-grey-5 q-mt-sm">
              <q-icon name="today" size="14px" class="q-mr-xs text-amber-5" />
              {{ currentDate }}
            </div>
          </div>

          <div class="col-12 col-md-4 text-left text-md-right">
            <div class="row q-gutter-sm justify-start justify-md-end">
              <q-btn
                class="btn-gold"
                no-caps
                icon="fingerprint"
                label="Presensi Lapangan"
                to="/dashboard/attendance"
              />
              <q-btn
                class="btn-ghost-navy"
                no-caps
                icon="event_busy"
                label="Ajukan Izin / Cuti"
                to="/dashboard/leaves"
              />
            </div>
          </div>
        </div>
      </q-card>

      <!-- 4 Kartu Status Mandiri Karyawan -->
      <div class="row q-col-gutter-md q-mb-lg">
        <!-- Status Presensi Hari Ini -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold"
                >PRESENSI HARI INI</div
              >
              <q-icon name="schedule" size="20px" color="primary" />
            </div>
            <div
              v-if="myAttendanceToday"
              class="text-h5 text-weight-bold text-positive q-my-xs"
            >
              {{ myAttendanceToday.clockIn }} WIB
            </div>
            <div v-else class="text-h5 text-weight-bold text-amber-8 q-my-xs">
              Belum Hadir
            </div>
            <div class="text-caption text-grey-6">
              {{
                myAttendanceToday
                  ? myAttendanceToday.location
                  : 'Silakan Clock In di lokasi'
              }}
            </div>
            <q-btn
              flat
              dense
              no-caps
              size="xs"
              color="primary"
              label="Buka Presensi →"
              to="/dashboard/attendance"
              class="q-mt-sm"
            />
          </q-card>
        </div>

        <!-- Sisa Cuti Tahunan -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold"
                >SISA CUTI TAHUNAN</div
              >
              <q-icon name="event_available" size="20px" color="positive" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ 12 - myApprovedLeavesDays }} Hari
            </div>
            <div class="text-caption text-grey-6">
              Dari kuota 12 hari (Terpakai: {{ myApprovedLeavesDays }} hari)
            </div>
            <q-btn
              flat
              dense
              no-caps
              size="xs"
              color="amber-9"
              label="Ajukan Cuti Baru →"
              to="/dashboard/leaves"
              class="q-mt-sm"
            />
          </q-card>
        </div>

        <!-- Jam Lembur Bulan Ini -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold"
                >LEMBUR (OVERTIME)</div
              >
              <q-icon name="more_time" size="20px" color="amber-8" />
            </div>
            <div class="text-h4 text-weight-bold text-primary q-my-xs">
              {{ myOvertimeHours }} Jam
            </div>
            <div class="text-caption text-grey-6">
              Telah disetujui untuk kompensasi
            </div>
            <q-btn
              flat
              dense
              no-caps
              size="xs"
              color="primary"
              label="Ajukan Lembur (SPKL) →"
              to="/dashboard/overtime"
              class="q-mt-sm"
            />
          </q-card>
        </div>

        <!-- Material Requests Lapangan -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-caption text-grey-7 text-weight-bold"
                >PERMINTAAN MATERIAL</div
              >
              <q-icon name="inventory_2" size="20px" color="teal-8" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ myRequests.length }}
            </div>
            <div class="text-caption text-grey-6">
              Pengajuan kebutuhan suku cadang/alat
            </div>
            <q-btn
              flat
              dense
              no-caps
              size="xs"
              color="primary"
              label="Ajukan Material Lapangan →"
              to="/dashboard/material-requests"
              class="q-mt-sm"
            />
          </q-card>
        </div>
      </div>

      <!-- FEED INFORMASI & DISKUSI LAPANGAN (ALA FB / SOCIAL WALL) -->
      <div class="q-mb-xl">
        <CompanyFeedWall />
      </div>

      <!-- Dua Kolom Karyawan: Status Pengajuan Mandiri & Panduan Keselamatan K3 -->
      <div class="row q-col-gutter-lg">
        <!-- Kolom Kiri: Riwayat Permohonan Terkini (Cuti & Lembur) -->
        <div class="col-12 col-md-7">
          <q-card class="company-dash-card full-height">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div>
                <div
                  class="text-subtitle1 text-weight-bold"
                  style="color: #0f172a"
                >
                  Status Pengajuan Izin &amp; Lembur Terkini
                </div>
                <div class="text-caption text-grey-6">
                  Pantau verifikasi persetujuan dari atasan / pimpinan
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <q-list separator>
                <!-- Item Cuti Saya -->
                <q-item
                  v-for="l in myRecentLeaves"
                  :key="'l-' + l.id"
                  class="q-py-md"
                >
                  <q-item-section avatar>
                    <q-avatar
                      color="blue-1"
                      text-color="primary"
                      icon="event_busy"
                    />
                  </q-item-section>
                  <q-item-section>
                    <div class="row items-center q-gutter-xs">
                      <span class="text-caption text-weight-bold text-primary"
                        >IZIN / CUTI</span
                      >
                      <q-badge
                        dense
                        :color="
                          l.status === 'approved'
                            ? 'positive'
                            : l.status === 'rejected'
                              ? 'negative'
                              : 'amber-8'
                        "
                        :label="
                          l.status === 'approved'
                            ? 'DISETUJUI'
                            : l.status === 'rejected'
                              ? 'DITOLAK'
                              : 'MENUNGGU APPROVAL'
                        "
                      />
                    </div>
                    <div class="text-subtitle2 text-weight-bold q-mt-xs">{{
                      l.reason
                    }}</div>
                    <div class="text-caption text-grey-6">
                      {{ formatDate(l.startDate) }} &ndash;
                      {{ formatDate(l.endDate) }} ({{ l.daysCount }} hari)
                    </div>
                  </q-item-section>
                </q-item>

                <!-- Item Lembur Saya -->
                <q-item
                  v-for="o in myRecentOvertimes"
                  :key="'o-' + o.id"
                  class="q-py-md"
                >
                  <q-item-section avatar>
                    <q-avatar
                      color="amber-1"
                      text-color="amber-9"
                      icon="more_time"
                    />
                  </q-item-section>
                  <q-item-section>
                    <div class="row items-center q-gutter-xs">
                      <span class="text-caption text-weight-bold text-amber-9"
                        >LEMBUR (SPKL)</span
                      >
                      <q-badge
                        dense
                        :color="
                          o.status === 'approved'
                            ? 'positive'
                            : o.status === 'rejected'
                              ? 'negative'
                              : 'amber-8'
                        "
                        :label="
                          o.status === 'approved'
                            ? 'DISETUJUI'
                            : o.status === 'rejected'
                              ? 'DITOLAK'
                              : 'MENUNGGU APPROVAL'
                        "
                      />
                    </div>
                    <div class="text-subtitle2 text-weight-bold q-mt-xs">{{
                      o.activity
                    }}</div>
                    <div class="text-caption text-grey-6">
                      {{ o.projectName }} &bull; {{ o.hours }} Jam ({{
                        o.startTime
                      }}
                      - {{ o.endTime }} WIB)
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div
                v-if="!myRecentLeaves.length && !myRecentOvertimes.length"
                class="text-center q-py-xl text-grey-6"
              >
                <q-icon
                  name="task_alt"
                  size="48px"
                  color="grey-4"
                  class="q-mb-xs"
                />
                <div>Belum ada pengajuan izin atau lembur yang tercatat.</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Kolom Kanan: Panduan K3 & Penugasan Lapangan -->
        <div class="col-12 col-md-5">
          <!-- Standar K3 Proyek -->
          <q-card class="company-dash-card q-pa-lg q-mb-md">
            <div class="row items-center q-gutter-xs q-mb-sm">
              <q-icon name="health_and_safety" color="positive" size="24px" />
              <div class="text-subtitle1 text-weight-bold text-navy-950">
                Standar K3 &amp; Keselamatan Kerja
              </div>
            </div>
            <p class="text-body2 text-grey-8" style="line-height: 1.7">
              Seluruh teknisi wajib mematuhi standar keselamatan kerja PT.
              Trimitra Solusindo Cemerlang:
            </p>
            <ul class="text-caption text-grey-7 q-pl-md q-gutter-y-xs q-mb-md">
              <li
                >Wajib mengenakan Helm Keselamatan (Safety Helmet) dan Rompi
                Reflektor di area proyek.</li
              >
              <li
                >Wajib mengenakan Sepatu Safety saat pekerjaan mekanikal dan
                elektrikal.</li
              >
              <li
                >Gunakan Full Body Harness saat pekerjaan di ketinggian di atas
                1,8 meter.</li
              >
              <li
                >Pastikan kabel listrik dalam kondisi terisolasi sempurna dan
                bebas tegangan saat terminasi.</li
              >
            </ul>
            <div
              class="bg-amber-1 q-pa-sm rounded-borders text-caption text-amber-9 text-weight-bold"
            >
              Emergency Contact HSE: +62 812 1050 1150 (Ext. Lapangan 108)
            </div>
          </q-card>

          <!-- Penugasan Proyek Aktif -->
          <q-card class="company-dash-card q-pa-lg">
            <div
              class="text-subtitle1 text-weight-bold q-mb-sm"
              style="color: #0f172a"
            >
              Penugasan Proyek Berjalan
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Proyek yang sedang ditangani oleh divisi teknis saat ini
            </div>
            <div
              v-for="p in projects.slice(0, 2)"
              :key="p.id"
              class="q-mb-sm q-pa-sm bg-grey-1 rounded-borders"
            >
              <div class="text-weight-bold text-navy-950">{{ p.name }}</div>
              <div class="text-caption text-grey-7"
                >{{ p.client }} &bull; {{ p.location }}</div
              >
              <div
                class="row items-center justify-between text-caption text-primary text-weight-bold q-mt-xs"
              >
                <span>Progres Fisik</span>
                <span>{{ p.progress }}%</span>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </template>

    <!-- ============================================================== -->
    <!-- KONDISI B: EXECUTIVE DASHBOARD (ROLE: ADMIN / MANAGER / PM / FINANCE) -->
    <!-- ============================================================== -->
    <template v-else>
      <!-- Welcome Banner Manajemen -->
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
          <div class="col-12 col-md-8">
            <div class="row items-center q-gutter-sm q-mb-xs">
              <span
                class="company-badge q-px-sm q-py-xs"
                style="font-size: 0.75rem"
              >
                PORTAL MANAJEMEN OPERASIONAL
              </span>
              <q-chip
                dense
                color="amber-8"
                text-color="dark"
                class="text-weight-bold"
                style="font-size: 0.72rem"
              >
                {{ user?.position || 'Manajemen' }}
              </q-chip>
            </div>
            <h1
              class="text-h4 text-weight-bold q-my-xs text-white"
              style="line-height: 1.2"
            >
              Selamat Datang, {{ user?.name }} 👋
            </h1>
            <p
              class="text-grey-4 text-body2 q-mb-none"
              style="max-width: 620px"
            >
              Pusat kendali proyek, verifikasi persetujuan permohonan material,
              izin cuti, serta penagihan invoice PT. Trimitra Solusindo
              Cemerlang.
            </p>
            <div class="text-caption text-grey-5 q-mt-sm">
              <q-icon name="today" size="14px" class="q-mr-xs text-amber-5" />
              {{ currentDate }}
            </div>
          </div>

          <div class="col-12 col-md-4 text-left text-md-right">
            <div class="row q-gutter-sm justify-start justify-md-end">
              <q-btn
                class="btn-gold"
                no-caps
                icon="add"
                label="Ajukan Material"
                to="/dashboard/material-requests"
              />
              <q-btn
                v-if="canManageProjects"
                class="btn-ghost-navy"
                no-caps
                icon="engineering"
                label="Daftar Proyek"
                to="/dashboard/projects"
              />
            </div>
          </div>
        </div>
      </q-card>

      <!-- 4 KPI Eksekutif -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                >Proyek Aktif</div
              >
              <q-icon name="engineering" size="20px" color="primary" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ activeProjectsCount }}
            </div>
            <div
              class="text-caption text-grey-6 row items-center justify-between"
            >
              <span>Dari total {{ projects.length }} proyek</span>
              <span class="text-positive text-weight-medium"
                >{{ finishedProjectsCount }} Selesai</span
              >
            </div>
            <q-linear-progress
              :value="
                projects.length ? finishedProjectsCount / projects.length : 0
              "
              color="primary"
              track-color="blue-1"
              class="q-mt-sm"
              style="height: 6px; border-radius: 3px"
            />
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                >Material Request</div
              >
              <q-icon name="inventory_2" size="20px" color="amber-8" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ materialRequests.length }}
            </div>
            <div
              class="text-caption text-grey-6 row items-center justify-between"
            >
              <span>Permintaan Lapangan</span>
              <span class="text-amber-8 text-weight-bold"
                >{{ pendingRequestsCount }} Menunggu</span
              >
            </div>
            <q-linear-progress
              :value="
                materialRequests.length
                  ? (materialRequests.length - pendingRequestsCount) /
                    materialRequests.length
                  : 0
              "
              color="amber-8"
              track-color="amber-1"
              class="q-mt-sm"
              style="height: 6px; border-radius: 3px"
            />
          </q-card>
        </div>

        <!-- Approval Karyawan (Cuti & Lembur Menunggu Persetujuan) -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            class="company-dash-card q-pa-md full-height"
            :style="
              totalPendingApprovals > 0 ? 'border: 1px solid #f59e0b;' : ''
            "
          >
            <div class="row items-center justify-between q-mb-sm">
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                >Approval Karyawan</div
              >
              <q-icon name="approval" size="20px" color="warning" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ totalPendingApprovals }}
            </div>
            <div class="text-caption text-amber-9 text-weight-bold">
              {{ pendingLeavesCount }} Cuti &bull;
              {{ pendingOvertimeCount }} Lembur
            </div>
            <q-linear-progress
              :value="totalPendingApprovals > 0 ? 0.7 : 0"
              color="warning"
              track-color="orange-1"
              class="q-mt-sm"
              style="height: 6px; border-radius: 3px"
            />
          </q-card>
        </div>

        <!-- Rata-rata Progres Proyek -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="company-dash-card q-pa-md full-height">
            <div class="row items-center justify-between q-mb-sm">
              <div
                class="text-caption text-grey-7 text-uppercase text-weight-bold"
                >Rerata Progres</div
              >
              <q-icon name="trending_up" size="20px" color="positive" />
            </div>
            <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
              {{ averageProgress }}%
            </div>
            <div
              class="text-caption text-grey-6 row items-center justify-between"
            >
              <span>Realisasi Lapangan</span>
              <span class="text-positive text-weight-medium"
                >Sesuai Jadwal</span
              >
            </div>
            <q-linear-progress
              :value="averageProgress / 100"
              color="positive"
              track-color="green-1"
              class="q-mt-sm"
              style="height: 6px; border-radius: 3px"
            />
          </q-card>
        </div>
      </div>

      <!-- Action Panel: Pintasan Approval Cuti, Lembur & Material -->
      <div v-if="totalPendingApprovals > 0" class="q-mb-lg">
        <q-banner
          rounded
          class="bg-amber-1 text-dark"
          style="border: 1px solid #f59e0b; border-radius: 12px"
        >
          <template #avatar>
            <q-icon name="notifications_active" color="amber-9" size="32px" />
          </template>
          <div class="text-subtitle2 text-weight-bold">
            Terdapat {{ totalPendingApprovals }} permohonan karyawan yang
            membutuhkan persetujuan Anda:
          </div>
          <div class="text-caption text-grey-8 q-mt-xs">
            {{ pendingLeavesCount }} pengajuan izin/cuti karyawan dan
            {{ pendingOvertimeCount }} permohonan lembur (SPKL) lapangan
            menunggu review.
          </div>
          <template #action>
            <q-btn
              flat
              no-caps
              color="primary"
              label="Review Cuti →"
              to="/dashboard/leaves"
              class="q-mr-xs"
            />
            <q-btn
              flat
              no-caps
              color="amber-9"
              label="Review Lembur →"
              to="/dashboard/overtime"
            />
          </template>
        </q-banner>
      </div>

      <!-- Tabel Permintaan Material Terbaru & Proyek Berjalan -->
      <div class="row q-col-gutter-lg">
        <!-- Kolom Kiri: Permintaan Material Terbaru -->
        <div class="col-12 col-lg-7">
          <q-card class="company-dash-card full-height">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div>
                <div
                  class="text-subtitle1 text-weight-bold"
                  style="color: #0f172a"
                >
                  Permintaan Material Terbaru
                </div>
                <div class="text-caption text-grey-6">
                  5 pengajuan kebutuhan material terakhir dari tim lapangan
                </div>
              </div>
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                label="Lihat Semua →"
                to="/dashboard/material-requests"
              />
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <q-table
                flat
                dense
                :rows="recentRequests"
                :columns="requestColumns"
                row-key="id"
                :pagination="{ rowsPerPage: 5 }"
                hide-pagination
                no-data-label="Belum ada permintaan material tercatat"
                class="company-dash-table"
              >
                <template #body-cell-code="props">
                  <q-td :props="props" class="text-weight-bold text-primary">{{
                    props.row.code
                  }}</q-td>
                </template>
                <template #body-cell-project="props">
                  <q-td :props="props">
                    <div
                      class="text-weight-medium"
                      style="
                        max-width: 170px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      "
                    >
                      {{ getProjectName(props.row.projectId) }}
                    </div>
                  </q-td>
                </template>
                <template #body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      dense
                      size="sm"
                      :color="approvalStatusOf(props.row.status).color"
                      text-color="white"
                      class="text-weight-bold"
                    >
                      {{ approvalStatusOf(props.row.status).label }}
                    </q-chip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Kolom Kanan: Progres Proyek Berjalan -->
        <div class="col-12 col-lg-5">
          <q-card class="company-dash-card full-height">
            <q-card-section class="row items-center justify-between q-pb-none">
              <div>
                <div
                  class="text-subtitle1 text-weight-bold"
                  style="color: #0f172a"
                >
                  Progres Proyek Lapangan
                </div>
                <div class="text-caption text-grey-6">
                  Realisasi fisik proyek konstruksi dan MEP
                </div>
              </div>
              <q-btn
                v-if="canManageProjects"
                flat
                dense
                no-caps
                color="primary"
                label="Kelola Proyek →"
                to="/dashboard/projects"
              />
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <q-list separator>
                <q-item v-for="p in projects" :key="p.id" class="q-py-md">
                  <q-item-section>
                    <div class="row items-center justify-between q-mb-xs">
                      <span class="text-caption text-grey-6 text-weight-bold"
                        >{{ p.code }} &bull; {{ p.location }}</span
                      >
                      <q-badge
                        :color="p.status === 'ongoing' ? 'primary' : 'positive'"
                        :label="p.status === 'ongoing' ? 'Berjalan' : 'Selesai'"
                      />
                    </div>
                    <div class="text-weight-bold text-navy-950 q-mb-xs">{{
                      p.name
                    }}</div>
                    <div class="text-caption text-grey-7 q-mb-xs"
                      >Klien: {{ p.client }}</div
                    >
                    <div
                      class="row items-center justify-between q-mt-xs text-caption"
                    >
                      <span class="text-grey-6">Progres Fisik</span>
                      <span class="text-weight-bold text-primary"
                        >{{ p.progress }}%</span
                      >
                    </div>
                    <q-linear-progress
                      :value="p.progress / 100"
                      color="primary"
                      track-color="blue-1"
                      style="height: 6px; border-radius: 3px"
                      class="q-mt-xs"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- PAPAN PENGUMUMAN & DISKUSI KARYAWAN LAPANGAN (ADMIN & MANAJEMEN) -->
      <div class="q-mt-xl">
        <CompanyFeedWall />
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '/src/composables/useAuth.js'
import CompanyFeedWall from '/src/components/feed/CompanyFeedWall.vue'
import { getProjects } from '/src/services/projects.service.js'
import { getMaterialRequests } from '/src/services/material-requests.service.js'
import { getLeaves } from '/src/services/leaves.service.js'
import { getOvertimes } from '/src/services/overtime.service.js'
import { getAttendanceList } from '/src/services/attendance.service.js'
import { approvalStatusOf } from '/src/config/approval.js'
import { formatDate } from '/src/config/projects.js'

const router = useRouter()
const { user } = useAuth()

const projects = ref([])
const materialRequests = ref([])
const leaves = ref([])
const overtimes = ref([])
const attendanceList = ref([])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const canManageProjects = computed(() => {
  return ['admin', 'manager', 'pm'].includes(user.value?.role)
})

// KPI Manajemen
const activeProjectsCount = computed(
  () =>
    projects.value.filter(
      p => p.status === 'ongoing' || p.status === 'planning'
    ).length
)
const finishedProjectsCount = computed(
  () => projects.value.filter(p => p.status === 'done').length
)
const averageProgress = computed(() => {
  if (!projects.value.length) return 0
  const sum = projects.value.reduce(
    (acc, p) => acc + (Number(p.progress) || 0),
    0
  )
  return Math.round(sum / projects.value.length)
})

const pendingRequestsCount = computed(
  () => materialRequests.value.filter(r => r.status === 'submitted').length
)
const pendingLeavesCount = computed(
  () => leaves.value.filter(l => l.status === 'pending').length
)
const pendingOvertimeCount = computed(
  () => overtimes.value.filter(o => o.status === 'pending').length
)
const totalPendingApprovals = computed(
  () => pendingLeavesCount.value + pendingOvertimeCount.value
)

const recentRequests = computed(() => materialRequests.value.slice(0, 5))

// Data Khusus Karyawan
const myAttendanceToday = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  return attendanceList.value.find(
    a => a.userId === user.value?.id && a.date === todayStr
  )
})

const myApprovedLeavesDays = computed(() => {
  return leaves.value
    .filter(
      l =>
        l.userId === user.value?.id &&
        l.status === 'approved' &&
        l.leaveType === 'annual'
    )
    .reduce((sum, l) => sum + (Number(l.daysCount) || 0), 0)
})

const myOvertimeHours = computed(() => {
  return overtimes.value
    .filter(o => o.userId === user.value?.id && o.status === 'approved')
    .reduce((sum, o) => sum + (Number(o.hours) || 0), 0)
})

const myRequests = computed(() => {
  return materialRequests.value.filter(
    r =>
      r.requesterId === user.value?.id || r.requesterName === user.value?.name
  )
})

const myRecentLeaves = computed(() => {
  return leaves.value.filter(l => l.userId === user.value?.id).slice(0, 3)
})

const myRecentOvertimes = computed(() => {
  return overtimes.value.filter(o => o.userId === user.value?.id).slice(0, 3)
})

const requestColumns = [
  { name: 'code', label: 'Kode MR', field: 'code', align: 'left' },
  { name: 'project', label: 'Proyek', field: 'projectId', align: 'left' },
  {
    name: 'neededDate',
    label: 'Dibutuhkan',
    field: 'neededDate',
    align: 'left'
  },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

function getProjectName(projectId) {
  const p = projects.value.find(pr => pr.id === projectId)
  return p ? p.name : `Proyek #${projectId}`
}

async function loadData() {
  try {
    const [pList, mrList, lList, otList, aList] = await Promise.all([
      getProjects(),
      getMaterialRequests(),
      getLeaves(),
      getOvertimes(),
      getAttendanceList()
    ])
    projects.value = pList || []
    materialRequests.value = mrList || []
    leaves.value = lList || []
    overtimes.value = otList || []
    attendanceList.value = aList || []
  } catch (err) {
    console.error('Gagal memuat data dashboard:', err)
  }
}

onMounted(() => {
  loadData()
})
</script>
