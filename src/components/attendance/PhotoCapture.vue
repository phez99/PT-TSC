<template>
  <div>
    <div class="row items-center q-gutter-sm">
      <q-btn
        unelevated
        color="navy-950"
        text-color="amber-5"
        icon="photo_camera"
        :label="modelValue ? 'Ganti Foto' : 'Ambil Foto Selfie'"
        no-caps
        :loading="processing"
        @click="fileInput.click()"
      />
      <span class="text-caption text-grey-6">{{ hint }}</span>
    </div>

    <!-- capture="user" → kamera depan di HP; di desktop jadi file picker -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="user"
      class="hidden"
      @change="onFilePicked"
    />

    <div v-if="modelValue" class="q-mt-sm row items-start q-gutter-sm">
      <q-img
        :src="modelValue"
        style="width: 96px; height: 96px; border-radius: 10px"
        fit="cover"
        class="shadow-2"
      />
      <q-btn
        flat
        dense
        color="negative"
        icon="delete"
        label="Hapus"
        no-caps
        @click="emit('update:modelValue', null)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: [String, null], default: null },
  hint: {
    type: String,
    default: 'Foto wajah di depan kamera sebagai bukti kehadiran.'
  }
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const processing = ref(false)

// Foto diperkecil & dikompresi ke JPEG agar hemat penyimpanan localStorage
function fileToResizedDataUrl(file, maxSize = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = err => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })
}

async function onFilePicked(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // agar pilih file yang sama tetap memicu change
  if (!file) return
  processing.value = true
  try {
    const dataUrl = await fileToResizedDataUrl(file)
    emit('update:modelValue', dataUrl)
  } catch {
    // file bukan gambar yang valid → biarkan nilai lama
  } finally {
    processing.value = false
  }
}
</script>
