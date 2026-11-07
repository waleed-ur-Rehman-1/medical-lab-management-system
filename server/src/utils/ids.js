export function mrNumber() {
  const y = new Date().getFullYear();
  return `MR-${y}-${Math.floor(100000 + Math.random() * 900000)}`;
}
export function orderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
export function invoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
