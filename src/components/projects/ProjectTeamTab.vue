<template>
  <div class="row q-col-gutter-lg">
    <!-- Daftar Anggota -->
    <div class="col-12 col-md-7">
      <q-card class="company-dash-card q-pa-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
          Daftar Personel Proyek
          <span class="text-grey-6 text-body2">({{ members.length }} Orang)</span>
        </div>

        <q-list v-if="members && members.length" separator>
          <q-item v-for="m in members" :key="m.id" class="q-px-none">
            <q-item-section avatar>
              <q-avatar color="navy-900" text-color="amber-5" size="40px" class="text-weight-bold">
                {{ m.name.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ m.name }}</q-item-label>
              <q-item-label caption class="text-primary text-weight-medium">{{
                m.role
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                color="negative"
                @click="$emit('remove', m.id)"
              >
                <q-tooltip>Hapus dari Tim</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-grey-6 text-body2 q-py-lg text-center">
          <q-icon name="person_off" size="40px" color="grey-4" class="q-mb-xs" />
          <div>Belum ada anggota tim terdaftar untuk proyek ini.</div>
        </div>
      </q-card>
    </div>

    <!-- Form Tambah Personel -->
    <div class="col-12 col-md-5">
      <q-card class="company-dash-card q-pa-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
          Tambah Personel ke Tim
        </div>
        <q-form @submit.prevent="$emit('add')" class="q-gutter-md">
          <q-select
            :model-value="selectedEmployee"
            @update:model-value="(val) => $emit('update:selectedEmployee', val)"
            :options="technicianOptions"
            option-label="label"
            option-value="value"
            dense
            outlined
            label="Pilih atau Cari Karyawan"
            lazy-rules
            :rules="[(v) => !!v || 'Karyawan wajib dipilih']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Tidak ada data karyawan</q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            :model-value="newMemberRole"
            @update:model-value="(val) => $emit('update:newMemberRole', val)"
            dense
            outlined
            label="Peran / Tanggung Jawab di Proyek"
            :options="[
              'Project Manager',
              'Site Engineer',
              'Supervisor Lapangan',
              'Safety Officer (HSE)',
              'Lead Drafter',
              'Teknisi Mekanikal',
              'Teknisi Elektrikal',
              'Teknisi Security System',
            ]"
            lazy-rules
            :rules="[(v) => !!v || 'Peran wajib dipilih']"
          />

          <q-btn
            type="submit"
            class="btn-gold full-width"
            no-caps
            icon="person_add"
            label="Tambahkan ke Proyek"
          />
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  members: { type: Array, default: () => [] },
  technicianOptions: { type: Array, default: () => [] },
  selectedEmployee: { type: Object, default: null },
  newMemberRole: { type: String, default: '' },
});

defineEmits(['remove', 'add', 'update:selectedEmployee', 'update:newMemberRole']);
</script>
