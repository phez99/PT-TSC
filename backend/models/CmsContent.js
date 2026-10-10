import mongoose from 'mongoose'

const cmsContentSchema = new mongoose.Schema(
  {
    hero: {
      badgeText: { type: String, default: 'Security System, MEP & Advertising Solutions' },
      titlePrefix: { type: String, default: 'Solusi Terintegrasi' },
      titleHighlight: { type: String, default: 'Security System & MEP Terpercaya' },
      description: { type: String, default: '' },
      ctaPrimaryLabel: { type: String, default: 'Lihat Layanan Kami' },
      ctaSecondaryLabel: { type: String, default: 'Hubungi Kami' },
      backgroundImage: { type: String, default: '/01.jpg' },
      highlights: [
        {
          label: String,
          value: String,
          icon: String
        }
      ]
    },
    about: {
      title: { type: String, default: 'PT. Trimitra Solusindo Cemerlang' },
      paragraphs: [String]
    },
    visionMission: {
      vision: { type: String, default: '' },
      missions: [String]
    },
    contact: {
      title: { type: String, default: "Let's Work Together With TSC" },
      description: { type: String, default: '' },
      phone: { type: String, default: '+62 812 1050 1150' },
      email: { type: String, default: 'trimitrasolusindocemerlang@gmail.com' },
      address: { type: String, default: 'Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor' },
      officeHours: { type: String, default: 'Senin - Jumat: 08:30 - 17:00 WIB' }
    }
  },
  {
    timestamps: true
  }
)

const CmsContent = mongoose.model('CmsContent', cmsContentSchema)
export default CmsContent
