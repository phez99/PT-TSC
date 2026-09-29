<template>
  <section class="company-section-dark q-py-xl">
    <div class="q-px-md q-px-sm-lg" style="max-width: 960px; margin: 0 auto">
      <div class="text-center q-mb-xl">
        <span class="company-eyebrow q-mb-sm">Hubungi Kami</span>
        <h2 class="text-h4 text-white text-weight-bold q-my-md">{{ title }}</h2>
        <p
          class="text-grey-4 text-body1"
          style="line-height: 1.8; max-width: 720px; margin: 0 auto"
        >
          {{ description }}
        </p>
      </div>

      <div class="company-contact-banner">
        <div class="row q-col-gutter-lg items-stretch justify-center">
          <!-- Item Telepon & WhatsApp -->
          <div class="col-12 col-md-6">
            <div class="company-contact-card column justify-between full-height">
              <div>
                <div class="row items-center no-wrap q-gutter-md q-mb-md">
                  <div class="company-contact-icon">
                    <q-icon name="call" size="22px" />
                  </div>
                  <div class="contact-info-col">
                    <div
                      class="text-caption text-grey-4 text-uppercase text-weight-bold"
                    >
                      Telepon & WhatsApp
                    </div>
                    <a
                      :href="`tel:${cleanPhone}`"
                      class="contact-link text-weight-bold"
                    >
                      {{ phone }}
                    </a>
                  </div>
                </div>
                <p class="text-caption text-grey-4 q-mb-md">
                  Tersedia untuk konsultasi proyek, survey lokasi, dan diskusi
                  kebutuhan teknis.
                </p>
              </div>

              <div class="row q-gutter-sm q-mt-sm">
                <q-btn
                  class="btn-ghost-navy col"
                  no-caps
                  icon="call"
                  label="Panggil"
                  @click="makeCall"
                />
                <q-btn
                  class="btn-gold col"
                  no-caps
                  icon="chat"
                  label="WhatsApp"
                  @click="openWhatsApp"
                />
              </div>
            </div>
          </div>

          <!-- Item Email -->
          <div class="col-12 col-md-6">
            <div class="company-contact-card column justify-between full-height">
              <div>
                <div class="row items-center no-wrap q-gutter-md q-mb-md">
                  <div class="company-contact-icon">
                    <q-icon name="mail" size="22px" />
                  </div>
                  <div class="contact-info-col">
                    <div
                      class="text-caption text-grey-4 text-uppercase text-weight-bold"
                    >
                      Email Resmi Perusahaan
                    </div>
                    <a
                      :href="`mailto:${email}`"
                      class="contact-link contact-email-text text-weight-bold"
                    >
                      {{ email }}
                    </a>
                  </div>
                </div>
                <p class="text-caption text-grey-4 q-mb-md">
                  Kirimkan penawaran, dokumen tender, atau inquiry kerjasama
                  bisnis ke email kami.
                </p>
              </div>

              <div class="row q-gutter-sm q-mt-sm">
                <q-btn
                  class="btn-ghost-navy col"
                  no-caps
                  icon="content_copy"
                  label="Salin Email"
                  @click="copyEmail"
                />
                <q-btn
                  class="btn-gold col"
                  no-caps
                  icon="send"
                  label="Kirim Email"
                  @click="sendEmail"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  title: { type: String, default: "Let's Work Together With TSC" },
  description: {
    type: String,
    default:
      'Kami terbuka untuk menjalin kerja sama sebagai partner, subkontraktor, maupun joint operation dalam pelaksanaan proyek gedung, komersial, dan fasilitas industri. Dengan komitmen pada kualitas, keselamatan kerja, dan kepatuhan standar, kami siap menjadi mitra yang andal dan profesional.'
  },
  phone: { type: String, default: '+62 812 1050 1150' },
  email: { type: String, default: 'trimitrasolusindocemerlang@gmail.com' }
})

const cleanPhone = computed(() => props.phone.replace(/[^0-9+]/g, ''))

function makeCall() {
  window.location.href = `tel:${cleanPhone.value}`
}

function openWhatsApp() {
  const number = props.phone.replace(/[^0-9]/g, '')
  const msg = encodeURIComponent(
    'Halo PT. Trimitra Solusindo Cemerlang, saya ingin berdiskusi mengenai proyek/layanan.'
  )
  window.location.href = `https://wa.me/${number}?text=${msg}`
}

function sendEmail() {
  const subject = encodeURIComponent(
    'Inquiry Proyek - PT. Trimitra Solusindo Cemerlang'
  )
  window.location.href = `mailto:${props.email}?subject=${subject}`
}

async function copyEmail() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.email)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = props.email
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Alamat email berhasil disalin!',
      position: 'top',
      timeout: 2000
    })
  } catch (err) {
    $q.notify({
      type: 'warning',
      message: props.email,
      caption: 'Silakan salin manual',
      position: 'top',
      timeout: 3000
    })
  }
}
</script>
