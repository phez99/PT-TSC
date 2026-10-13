<template>
  <q-card class="company-dash-card q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
          Penagihan & Termin Pembayaran
        </div>
        <div class="text-caption text-grey-6">Daftar faktur / invoice tagihan kepada klien</div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Buat Invoice Baru"
        to="/dashboard/invoices"
      />
    </div>

    <q-list v-if="projectInvoices.length" separator>
      <q-item v-for="inv in projectInvoices" :key="inv.id" class="q-py-md">
        <q-item-section avatar>
          <q-avatar
            :color="inv.status === 'paid' ? 'green-1' : 'amber-1'"
            :text-color="inv.status === 'paid' ? 'green-8' : 'amber-9'"
            icon="receipt"
          />
        </q-item-section>
        <q-item-section>
          <div class="row items-center q-gutter-xs">
            <span class="text-caption text-weight-bold text-primary">{{ inv.invoiceNumber }}</span>
            <q-badge
              dense
              :color="inv.status === 'paid' ? 'positive' : 'amber-8'"
              :label="inv.status === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'"
            />
          </div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ inv.notes }}</div>
          <div class="text-caption text-grey-6">Jatuh Tempo: {{ formatDate(inv.dueDate) }}</div>
        </q-item-section>
        <q-item-section side class="text-right">
          <div class="text-h6 text-weight-bold text-navy-950">
            Rp {{ Number(inv.total).toLocaleString('id-ID') }}
          </div>
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            color="primary"
            label="Lihat Invoice →"
            to="/dashboard/invoices"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else class="text-center q-py-xl text-grey-6">
      <q-icon name="receipt_long" size="48px" color="grey-4" class="q-mb-xs" />
      <div>Belum ada invoice penagihan untuk proyek ini.</div>
      <q-btn
        flat
        color="primary"
        no-caps
        label="Buat Faktur / Invoice Baru →"
        to="/dashboard/invoices"
        class="q-mt-sm"
      />
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  projectInvoices: { type: Array, default: () => [] },
  formatDate: { type: Function, required: true },
});
</script>
