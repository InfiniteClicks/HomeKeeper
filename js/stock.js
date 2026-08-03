import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  writeBatch
} from "./firebase.js";

const itemsRef = collection(db, "homekeeper", "shared", "items");
const categoriesRef = collection(db, "homekeeper", "shared", "categories");

export function subscribeItems(callback, onError) {
  return onSnapshot(itemsRef, snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rows);
  }, onError);
}

export function subscribeCategories(callback, onError) {
  return onSnapshot(categoriesRef, snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rows);
  }, onError);
}

export async function saveItem(item) {
  const payload = {
    name: item.name.trim(),
    categoryId: item.categoryId,
    qty: Math.max(0, Number(item.qty) || 0),
    min: Math.max(0, Number(item.min) || 0),
    manualShopping: Boolean(item.manualShopping),
    updatedAt: serverTimestamp()
  };
  if (item.id) return updateDoc(doc(itemsRef, item.id), payload);
  return addDoc(itemsRef, { ...payload, createdAt: serverTimestamp() });
}

export async function changeQuantity(item, delta) {
  return updateDoc(doc(itemsRef, item.id), {
    qty: Math.max(0, Number(item.qty || 0) + delta),
    updatedAt: serverTimestamp()
  });
}

export async function setManualShopping(item, value) {
  return updateDoc(doc(itemsRef, item.id), {
    manualShopping: Boolean(value),
    updatedAt: serverTimestamp()
  });
}

export async function removeItem(id) {
  return deleteDoc(doc(itemsRef, id));
}

export async function saveCategory(category) {
  const payload = {
    name: category.name.trim(),
    icon: category.icon.trim() || "📦",
    updatedAt: serverTimestamp()
  };
  if (category.id) return updateDoc(doc(categoriesRef, category.id), payload);
  return addDoc(categoriesRef, { ...payload, createdAt: serverTimestamp() });
}

export async function removeCategory(id) {
  return deleteDoc(doc(categoriesRef, id));
}

const starterCategories = [
  { id: "bathroom", name: "Bathroom", icon: "🧴" },
  { id: "cleaning", name: "Cleaning", icon: "🧹" },
  { id: "pantry", name: "Pantry", icon: "🥫" },
  { id: "medicines", name: "Medicines", icon: "💊" },
  { id: "other", name: "Other", icon: "📦" }
];

const starterItems = [
["Aveno",12],["Baby Wipes",3],["Bathroom Gels",2],["Bloo Acticlean Blocks",2],
["Body Puffs",2],["Conditioner",1],["Cotton Pads",8],["Cotton Wool Balls",1],
["Deodorant (Jake's)",0],["Deodorant (Jess')",2],["Deodorant (Nay's)",1],
["Deodorant (Stu's)",2],["Dry Shampoo",2],["Ear Buds (Tub)",1],
["Face Masks (Jess')",4],["Face Masks (Nay's)",1],["Face Wipes (Jess')",4],
["Face Wipes (Nay's)",4],["Footpacks",4],["Hair Fibre Cream",1],["Hair Spray",2],
["Hand & Nail Cream",1],["Hand Sanitizer",2],["Hand Soap",2],["Lip Masks",5],
["Nail Brushes",3],["Nail Polish Remover",1],["Nivea Face Wash",3],
["Nivea Exfoliator",1],["Nivea Shaving Foam/Gel",3],["Panty Liners",2],
["Pocket Tissues",7],["Post Shave Balm",1],["Razors (Nay's/Jess')",2],
["Razors (Stu's)",4],["Sanex Shower Gel",1],["Sanitary Towels (Jess')",2],
["Shampoo (Jess')",2],["Shampoo (Nay)",2],["Shampoo/T-Gel (Stu & Jake)",23],
["Shaving Gel (Nay's)",2],["Shower Gel",1],["Spot Pads",2],["Sudocrem",1],
["Tissues (Box)",2],["Toilet Wipes",2],["Tooth Floss",1],["Tooth Tepes",2],
["Toothbrush Heads",9],["Toothbrushes",3],["Toothpaste (Stu)",2],
["Toothpaste",1],["Under Eye Pads",9]
];

export async function seedStarterData() {
  const [itemSnap, categorySnap] = await Promise.all([getDocs(itemsRef), getDocs(categoriesRef)]);
  const existingNames = new Set(itemSnap.docs.map(d => String(d.data().name || "").toLowerCase()));
  const existingCategoryIds = new Set(categorySnap.docs.map(d => d.id));
  const batch = writeBatch(db);

  starterCategories.forEach(c => {
    if (!existingCategoryIds.has(c.id)) {
      batch.set(doc(categoriesRef, c.id), { name:c.name, icon:c.icon, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
    }
  });

  starterItems.forEach(([name, qty]) => {
    if (!existingNames.has(name.toLowerCase())) {
      const ref = doc(itemsRef);
      batch.set(ref, {
        name, qty, min:2, categoryId:"bathroom", manualShopping:false,
        createdAt:serverTimestamp(), updatedAt:serverTimestamp()
      });
    }
  });
  await batch.commit();
}

export async function exportData(items, categories) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    items: items.map(({id, ...rest}) => ({id, ...rest})),
    categories: categories.map(({id, ...rest}) => ({id, ...rest}))
  }, null, 2);
}
