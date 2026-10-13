<script setup>
// Pembungkus pratinjau dokumen cetak. Di layar sempit dokumen
// (lebar desain tetap, mis. 820px) di-zoom mengecil proporsional
// agar tampil utuh tanpa scroll horizontal. Saat @media print
// zoom di-reset ke 1 lewat CSS (.print-doc { zoom: 1 !important }).
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // Lebar desain dokumen dalam px (basis skala A4)
  width: { type: Number, default: 820 },
  // Tinggi minimum kertas saat pratinjau
  minHeight: { type: Number, default: 1000 }
})

const outerRef = ref(null)
const availWidth = ref(0)
let ro = null

function updateAvail() {
  if (outerRef.value) availWidth.value = outerRef.value.clientWidth
}

const scale = computed(() => {
  if (!availWidth.value) return 1
  return Math.min(1, Math.max(0.25, (availWidth.value - 4) / props.width))
})

const docStyle = computed(() => ({
  width: props.width + 'px',
  minHeight: props.minHeight + 'px',
  zoom: scale.value
}))

onMounted(() => {
  updateAvail()
  if (typeof ResizeObserver !== 'undefined' && outerRef.value) {
    ro = new ResizeObserver(updateAvail)
    ro.observe(outerRef.value)
  }
  window.addEventListener('resize', updateAvail)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  window.removeEventListener('resize', updateAvail)
})
</script>

<template>
  <div
    ref="outerRef"
    class="print-scale-outer row justify-center"
    style="width: 100%"
  >
    <div class="print-doc" :style="docStyle"><slot /></div>
  </div>
</template>
