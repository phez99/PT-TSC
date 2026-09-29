// ============================================================
// KONSTANTA REQUEST MATERIAL
// ============================================================

export const MATERIAL_UNITS = ['pcs', 'unit', 'set', 'lot', 'box', 'roll', 'meter', 'kg', 'liter'];

export const MATERIAL_PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Mendesak' },
];

export const priorityLabel = (value) =>
  MATERIAL_PRIORITIES.find((p) => p.value === value)?.label ?? value;
