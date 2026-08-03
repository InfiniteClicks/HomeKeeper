import { watchAuth, login, logout, resetPassword } from "./auth.js?v=3";

import {
  subscribeItems,
  subscribeCategories,
  saveItem,
  changeQuantity,
  setManualShopping,
  removeItem,
  saveCategory,
  removeCategory,
  seedStarterData,
  exportData
} from "./stock.js?v=3";

import {
  isShoppingItem,
  shoppingReason
} from "./shopping.js?v=3";

const $ = (id) => document.getElementById(id);
const state = { user:null, items:[], categories:[], search:"", category:"", lowOnly:false, unsubItems:null, unsubCategories:null };

const authScreen = $("auth-screen");
const appShell = $("app-shell");
const itemDialog = $("item-dialog");
const categoryDialog = $("category-dialog");

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function showError(error) {
  console.error(error);
  showToast(error?.message || "Something went wrong.");
}

function categoryMap() {
  return new Map(state.categories.map(c => [c.id, c]));
}

function renderCategoryOptions() {
  const currentFilter = $("category-filter").value;
  const currentItem = $("item-category").value;
  const ordered = [...state.categories].sort((a,b) => a.name.localeCompare(b.name));
  $("category-filter").innerHTML = `<option value="">All categories</option>` +
    ordered.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.icon || "📦")} ${escapeHtml(c.name)}</option>`).join("");
  $("item-category").innerHTML = ordered.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.icon || "📦")} ${escapeHtml(c.name)}</option>`).join("");
  $("category-filter").value = ordered.some(c => c.id === currentFilter) ? currentFilter : "";
  $("item-category").value = ordered.some(c => c.id === currentItem) ? currentItem : (ordered[0]?.id || "");
}

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function filteredItems() {
  return state.items
    .filter(i => i.name.toLowerCase().includes(state.search.toLowerCase()))
    .filter(i => !state.category || i.categoryId === state.category)
    .filter(i => !state.lowOnly || Number(i.qty) <= Number(i.min))
    .sort((a,b) => a.name.localeCompare(b.name));
}

function renderStock() {
  const items = filteredItems();
  const cats = categoryMap();
  $("stock-list").innerHTML = items.map(item => {
    const cat = cats.get(item.categoryId) || {name:"Uncategorised",icon:"📦"};
    const status = Number(item.qty) === 0 ? "out" : Number(item.qty) <= Number(item.min) ? "low" : "";
    return `<article class="item-card ${status}">
      <div class="item-main">
        <button type="button" data-edit-item="${escapeHtml(item.id)}">
          <div class="item-name">${escapeHtml(item.name)}</div>
          <div class="item-meta">${escapeHtml(cat.icon)} ${escapeHtml(cat.name)} · minimum ${Number(item.min)}</div>
        </button>
      </div>
      <div class="qty-controls">
        <button class="qty-button" type="button" data-delta="-1" data-item-id="${escapeHtml(item.id)}" aria-label="Use one">−</button>
        <span class="qty-number">${Number(item.qty)}</span>
        <button class="qty-button" type="button" data-delta="1" data-item-id="${escapeHtml(item.id)}" aria-label="Add one">+</button>
      </div>
    </article>`;
  }).join("");
  $("stock-empty").hidden = items.length > 0;
  $("total-items").textContent = state.items.length;
  $("low-items").textContent = state.items.filter(i => Number(i.qty) <= Number(i.min)).length;
  $("out-items").textContent = state.items.filter(i => Number(i.qty) === 0).length;
}

function renderShopping() {
  const cats = categoryMap();
  const rows = state.items.filter(isShoppingItem).sort((a,b) => a.name.localeCompare(b.name));
  $("shopping-list").innerHTML = rows.map(item => {
    const cat = cats.get(item.categoryId) || {icon:"📦"};
    return `<article class="item-card shopping-card">
      <div class="shopping-icon">${escapeHtml(cat.icon || "📦")}</div>
      <div>
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-meta">${escapeHtml(shoppingReason(item))} · have ${Number(item.qty)}</div>
      </div>
      <div class="shopping-actions">
        <button class="qty-button" type="button" data-delta="1" data-item-id="${escapeHtml(item.id)}" aria-label="Add one">+</button>
        <button class="icon-button" type="button" data-toggle-manual="${escapeHtml(item.id)}" aria-label="Toggle manual shopping">${item.manualShopping ? "★" : "☆"}</button>
      </div>
    </article>`;
  }).join("");
  $("shopping-count").textContent = rows.length;
  $("shopping-empty").hidden = rows.length > 0;
}

function renderCategories() {
  $("category-list").innerHTML = [...state.categories].sort((a,b) => a.name.localeCompare(b.name)).map(c => {
    const count = state.items.filter(i => i.categoryId === c.id).length;
    return `<button class="settings-row button-row" type="button" data-edit-category="${escapeHtml(c.id)}">
      <div><strong>${escapeHtml(c.icon || "📦")} ${escapeHtml(c.name)}</strong><small>${count} item${count === 1 ? "" : "s"}</small></div>
      <span>›</span>
    </button>`;
  }).join("");
}

function renderAll() {
  renderCategoryOptions();
  renderStock();
  renderShopping();
  renderCategories();
}

function openItem(item=null) {
  $("item-dialog-title").textContent = item ? "Edit item" : "Add item";
  $("item-id").value = item?.id || "";
  $("item-name").value = item?.name || "";
  $("item-category").value = item?.categoryId || state.categories[0]?.id || "";
  $("item-qty").value = item?.qty ?? 0;
  $("item-min").value = item?.min ?? 2;
  $("item-manual-shopping").checked = Boolean(item?.manualShopping);
  $("delete-item-btn").hidden = !item;
  itemDialog.showModal();
}

function openCategory(category=null) {
  $("category-dialog-title").textContent = category ? "Edit category" : "Add category";
  $("category-id").value = category?.id || "";
  $("category-name").value = category?.name || "";
  $("category-icon").value = category?.icon || "";
  $("delete-category-btn").hidden = !category;
  categoryDialog.showModal();
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === viewId));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === viewId));
}

$("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  $("auth-error").hidden = true;
  try {
    await login($("email").value.trim(), $("password").value);
  } catch (error) {
    $("auth-error").textContent = "Sign-in failed. Check the email address and password.";
    $("auth-error").hidden = false;
  }
});

$("reset-password-btn").addEventListener("click", async () => {
  try {
    await resetPassword($("email").value.trim());
    showToast("Password reset email sent.");
  } catch (error) { showError(error); }
});

$("sign-out-btn").addEventListener("click", () => logout().catch(showError));
$("add-item-btn").addEventListener("click", () => openItem());
$("add-category-btn").addEventListener("click", () => openCategory());

$("search-input").addEventListener("input", e => { state.search = e.target.value; renderStock(); });
$("category-filter").addEventListener("change", e => { state.category = e.target.value; renderStock(); });
$("low-filter-btn").addEventListener("click", () => {
  state.lowOnly = !state.lowOnly;
  $("low-filter-btn").textContent = state.lowOnly ? "Show all" : "Low stock";
  renderStock();
});

document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => switchView(tab.dataset.view)));
document.querySelectorAll("[data-close-dialog]").forEach(btn => btn.addEventListener("click", () => $(btn.dataset.closeDialog).close()));

document.addEventListener("click", async e => {
  const deltaBtn = e.target.closest("[data-delta]");
  if (deltaBtn) {
    const item = state.items.find(i => i.id === deltaBtn.dataset.itemId);
    if (item) changeQuantity(item, Number(deltaBtn.dataset.delta)).catch(showError);
    return;
  }
  const editItemBtn = e.target.closest("[data-edit-item]");
  if (editItemBtn) {
    const item = state.items.find(i => i.id === editItemBtn.dataset.editItem);
    if (item) openItem(item);
    return;
  }
  const manualBtn = e.target.closest("[data-toggle-manual]");
  if (manualBtn) {
    const item = state.items.find(i => i.id === manualBtn.dataset.toggleManual);
    if (item) setManualShopping(item, !item.manualShopping).catch(showError);
    return;
  }
  const categoryBtn = e.target.closest("[data-edit-category]");
  if (categoryBtn) {
    const category = state.categories.find(c => c.id === categoryBtn.dataset.editCategory);
    if (category) openCategory(category);
  }
});

$("item-form").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await saveItem({
      id:$("item-id").value,
      name:$("item-name").value,
      categoryId:$("item-category").value,
      qty:$("item-qty").value,
      min:$("item-min").value,
      manualShopping:$("item-manual-shopping").checked
    });
    itemDialog.close();
    showToast("Item saved.");
  } catch (error) { showError(error); }
});

$("delete-item-btn").addEventListener("click", async () => {
  if (!confirm("Delete this item?")) return;
  try { await removeItem($("item-id").value); itemDialog.close(); showToast("Item deleted."); }
  catch (error) { showError(error); }
});

$("category-form").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await saveCategory({id:$("category-id").value, name:$("category-name").value, icon:$("category-icon").value});
    categoryDialog.close();
    showToast("Category saved.");
  } catch (error) { showError(error); }
});

$("delete-category-btn").addEventListener("click", async () => {
  const id = $("category-id").value;
  if (state.items.some(i => i.categoryId === id)) {
    showToast("Move items out of this category first.");
    return;
  }
  if (!confirm("Delete this category?")) return;
  try { await removeCategory(id); categoryDialog.close(); showToast("Category deleted."); }
  catch (error) { showError(error); }
});

$("seed-btn").addEventListener("click", async () => {
  try { await seedStarterData(); showToast("Starter list restored."); }
  catch (error) { showError(error); }
});

$("export-btn").addEventListener("click", async () => {
  const json = await exportData(state.items, state.categories);
  const blob = new Blob([json], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `homekeeper-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

watchAuth(user => {
  state.user = user;
  authScreen.hidden = Boolean(user);
  appShell.hidden = !user;
  if (!user) {
    state.unsubItems?.(); state.unsubCategories?.();
    return;
  }
  $("signed-in-email").textContent = user.email || "";
  state.unsubItems = subscribeItems(items => { state.items = items; renderAll(); }, showError);
  state.unsubCategories = subscribeCategories(categories => {
    state.categories = categories;
    renderAll();
    if (categories.length === 0) seedStarterData().catch(showError);
  }, showError);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(console.warn));
}
