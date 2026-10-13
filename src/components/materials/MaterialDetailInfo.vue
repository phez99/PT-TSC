<template>
  <div>
    <!-- Kartu Informasi Detail -->
    <q-card class="company-dash-card q-pa-lg q-mb-lg">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="company-info-label">Dibutuhkan Tanggal</div>
          <div class="company-info-value">
            {{ formatDate(request.neededDate) }}
          </div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="company-info-label">Prioritas</div>
          <div class="company-info-value">
            {{ priorityLabel(request.priority) }}
          </div>
        </div>
        <div class="col-12" v-if="request.notes">
          <div class="company-info-label">Catatan</div>
          <div class="company-info-value">{{ request.notes }}</div>
        </div>
      </div>
    </q-card>

    <!-- Kartu Daftar Material -->
    <q-card class="company-dash-card q-pa-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">Daftar Material</div>
      <q-list separator>
        <q-item v-for="item in request.items" :key="item.id" class="q-px-none">
          <q-item-section>{{ item.name }}</q-item-section>
          <q-item-section side> {{ item.qty }} {{ item.unit }} </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  request: { type: Object, required: true },
  formatDate: { type: Function, required: true },
  priorityLabel: { type: Function, required: true },
});
</script>
