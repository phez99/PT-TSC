<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    persistent
  >
    <q-card style="width: 520px; max-width: 95vw">
      <q-card-section class="row items-center">
        <div class="text-h6">Tambah Proyek</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="$emit('close')" />
      </q-card-section>

      <q-form @submit.prevent="$emit('save')">
        <q-card-section class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Nama proyek"
            outlined
            lazy-rules
            :rules="[(v) => !!v || 'Nama proyek wajib diisi']"
          />
          <q-input
            v-model="form.client"
            label="Klien"
            outlined
            lazy-rules
            :rules="[(v) => !!v || 'Klien wajib diisi']"
          />
          <q-input
            v-model="form.location"
            label="Lokasi"
            outlined
            lazy-rules
            :rules="[(v) => !!v || 'Lokasi wajib diisi']"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.category"
                :options="projectCategories"
                emit-value
                map-options
                label="Kategori"
                outlined
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.status"
                :options="projectStatuses"
                emit-value
                map-options
                label="Status"
                outlined
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.startDate"
                type="date"
                label="Tanggal mulai"
                stack-label
                outlined
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.endDate"
                type="date"
                label="Target selesai"
                stack-label
                outlined
                lazy-rules
                :rules="[
                  (v) =>
                    !v ||
                    !form.startDate ||
                    v >= form.startDate ||
                    'Tidak boleh sebelum tanggal mulai',
                ]"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps label="Batal" @click="$emit('close')" />
          <q-btn type="submit" class="btn-gold" no-caps label="Simpan" :loading="saving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  form: { type: Object, required: true },
  projectCategories: { type: Array, required: true },
  projectStatuses: { type: Array, required: true },
  saving: { type: Boolean, default: false },
});

defineEmits(['update:modelValue', 'close', 'save']);
</script>
