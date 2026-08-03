export function isShoppingItem(item) {
  return Boolean(item.manualShopping) || Number(item.qty || 0) <= Number(item.min || 0);
}

export function shoppingReason(item) {
  if (item.manualShopping && Number(item.qty || 0) > Number(item.min || 0)) return "Added manually";
  if (Number(item.qty || 0) === 0) return "Out of stock";
  return `Low stock · minimum ${item.min}`;
}
