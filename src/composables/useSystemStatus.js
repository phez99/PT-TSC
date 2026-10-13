// /src/composables/useSystemStatus.js
// Status global untuk layout monitoring (header, banner, menu).
// Singleton reactive, tanpa Pinia. Saat ini berisi data contoh;
// nanti diisi dari WebSocket/API backend.
import { reactive } from 'vue';

const status = reactive({
  backendOnline: true,
  plcOnline: 7,
  plcTotal: 7,
  openCount: 0, // pintu terbuka
  waitingReset: 0, // sudah tertutup, menunggu reset
  sirenFloors: [], // lantai yang sirinenya sedang bunyi
  muted: false, // suara alarm di PC
  user: { name: 'operator1', role: 'operator' }, // operator | teknisi | admin
});

let demoTimer = null;

export function useSystemStatus() {
  function toggleMute() {
    status.muted = !status.muted;
  }

  // Data contoh untuk melihat layout. Hapus saat backend sudah terhubung.
  function startDemo() {
    if (demoTimer) return;
    const steps = [
      { openCount: 0, waitingReset: 0, sirenFloors: [], backendOnline: true, plcOnline: 7 },
      { openCount: 1, waitingReset: 0, sirenFloors: [12], backendOnline: true, plcOnline: 7 },
      { openCount: 2, waitingReset: 0, sirenFloors: [12, 44], backendOnline: true, plcOnline: 7 },
      { openCount: 0, waitingReset: 2, sirenFloors: [12], backendOnline: true, plcOnline: 7 },
      { openCount: 0, waitingReset: 0, sirenFloors: [], backendOnline: true, plcOnline: 6 },
      { openCount: 0, waitingReset: 0, sirenFloors: [], backendOnline: false, plcOnline: 0 },
    ];
    let i = 0;
    demoTimer = setInterval(() => {
      Object.assign(status, steps[i++ % steps.length]);
    }, 4000);
  }
  function stopDemo() {
    clearInterval(demoTimer);
    demoTimer = null;
  }

  return { status, toggleMute, startDemo, stopDemo };
}
