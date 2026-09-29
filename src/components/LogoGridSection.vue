<template>
  <section class="company-section-slate q-py-xl">
    <div class="q-px-lg" style="max-width: 1280px; margin: 0 auto">
      <div class="text-center q-mb-xl">
        <span
          class="company-eyebrow"
          style="color: #d97706; background: rgba(245, 158, 11, 0.1)"
          >{{ eyebrow }}</span
        >
        <h2 class="text-h4 text-weight-bold text-white q-mt-md">{{
          title
        }}</h2>
      </div>

      <div class="row q-col-gutter-md justify-center">
        <div
          class="col-6 col-sm-4 col-md-3"
          v-for="logo in logos"
          :key="logo.name"
        >
          <div class="company-logo-item column items-center justify-center">
            <img
              v-if="!failedLogos.has(logo.name)"
              :src="logo.image"
              :alt="logo.name"
              referrerpolicy="no-referrer"
              @error="failedLogos.add(logo.name)"
            />
            <div v-else class="company-logo-fallback">
              <q-icon name="business" size="28px" class="q-mb-xs text-grey-6" />
              <div>{{ logo.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const failedLogos = reactive(new Set())

defineProps({
  eyebrow: { type: String, default: 'Klien Kami' },
  title: { type: String, default: 'Referensi' },
  logos: {
    type: Array,
    default: () => []
  }
})
</script>
