<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    persistent
  >
    <q-card style="width: 680px; max-width: 95vw; border-radius: 16px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">Formulir Permintaan Material (MR)</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('close')" />
      </q-card-section>

      <q-form @submit.prevent="$emit('save')">
        <q-card-section class="q-gutter-y-md q-pt-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.projectId"
                :options="projectOptions"
                emit-value
                map-options
                dense
                outlined
                label="Pilih Proyek"
                :rules="[(v) => !!v || 'Proyek wajib dipilih']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.neededDate"
                type="date"
                dense
                outlined
                label="Tanggal Dibutuhkan di Lokasi"
                :rules="[(v) => !!v || 'Tanggal wajib diisi']"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.priority"
                :options="materialPriorities"
                emit-value
                map-options
                dense
                outlined
                label="Tingkat Prioritas"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-input
                :model-value="userName"
                dense
                outlined
                readonly
                label="Nama Pemohon"
                hint="Otomatis terhubung dengan akun Anda"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.notes"
                dense
                outlined
                label="Keterangan / Lokasi Pemasangan"
                placeholder="Contoh: Untuk instalasi kamera IP CCTV lantai 3 gedung timur"
              />
            </div>
          </div>

          <!-- Daftar Item -->
          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">
              Rincian Barang / Material yang Dibutuhkan:
            </div>

            <div
              v-for="(item, i) in form.items"
              :key="i"
              class="row q-col-gutter-xs items-start q-mb-xs"
            >
              <div class="col-6">
                <q-input
                  v-model="item.name"
                  dense
                  outlined
                  placeholder="Nama material (mis. Kabel UTP Cat6)"
                  :rules="[(v) => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-2">
                <q-input
                  v-model.number="item.qty"
                  type="number"
                  min="1"
                  dense
                  outlined
                  placeholder="Jumlah"
                  :rules="[(v) => v > 0 || '> 0']"
                />
              </div>
              <div class="col-3">
                <q-select
                  v-model="item.unit"
                  :options="materialUnits"
                  dense
                  outlined
                  placeholder="Satuan"
                  :rules="[(v) => !!v || 'Wajib']"
                />
              </div>
              <div class="col-1 text-center">
                <q-btn
                  v-if="form.items.length > 1"
                  flat
                  round
                  dense
                  icon="remove_circle_outline"
                  color="negative"
                  class="q-mt-xs"
                  @click="$emit('remove-item', i)"
                />
              </div>
            </div>

            <q-btn
              flat
              dense
              no-caps
              icon="add"
              label="Tambah Baris Material"
              color="amber-9"
              @click="$emit('add-item')"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Batal" @click="$emit('close')" />
          <q-btn
            type="submit"
            class="btn-gold"
            no-caps
            icon="send"
            label="Kirim Permintaan"
            :loading="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  form: { type: Object, required: true },
  projectOptions: { type: Array, default: () => [] },
  materialPriorities: { type: Array, required: true },
  materialUnits: { type: Array, required: true },
  userName: { type: String, default: '' },
  saving: { type: Boolean, default: false },
});

defineEmits(['update:modelValue', 'close', 'save', 'add-item', 'remove-item']);
</script>
