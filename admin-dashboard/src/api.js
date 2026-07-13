import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

export function onRestaurantsSnapshot(uid, callback) {
  const q = query(collection(db, 'restaurants'), where('ownerUid', '==', uid))
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(list)
  })
}

export async function createRestaurant(name, uid) {
  const ref = await addDoc(collection(db, 'restaurants'), {
    name,
    ownerUid: uid,
    availableLayouts: ['classic', 'bistro', 'moroccan', 'pro', 'natureBistro'],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export function onMenusSnapshot(restaurantId, callback) {
  const menusRef = collection(db, 'restaurants', restaurantId, 'menus')
  const q = query(menusRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const menus = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(menus)
  })
}

export async function getMenu(restaurantId, id) {
  const snap = await getDoc(doc(db, 'restaurants', restaurantId, 'menus', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export function onMenuSnapshot(restaurantId, id, callback) {
  return onSnapshot(doc(db, 'restaurants', restaurantId, 'menus', id), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

export async function createMenu(restaurantId, name) {
  const menusRef = collection(db, 'restaurants', restaurantId, 'menus')
  const ref = await addDoc(menusRef, {
    name,
    categories: [],
    selectedLayout: 'classic',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMenu(restaurantId, id, data) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'menus', id), data)
}

export async function deleteMenu(restaurantId, id) {
  await deleteDoc(doc(db, 'restaurants', restaurantId, 'menus', id))
}

export function onDisplayConfigSnapshot(restaurantId, callback) {
  return onSnapshot(doc(db, 'restaurants', restaurantId, 'config', 'display'), (snap) => {
    if (snap.exists()) callback(snap.data())
    else callback({ activeMenuId: null })
  })
}

export async function setActiveMenu(restaurantId, menuId) {
  await setDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    activeMenuId: menuId,
    updatedAt: serverTimestamp(),
  })
}

export function onAllRestaurantsSnapshot(callback) {
  return onSnapshot(collection(db, 'restaurants'), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function onRestaurantDoc(restaurantId, callback) {
  return onSnapshot(doc(db, 'restaurants', restaurantId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

export async function updateRestaurant(restaurantId, data) {
  await updateDoc(doc(db, 'restaurants', restaurantId), data)
}

export async function seedDefaultMenu(restaurantId) {
  const menusRef = collection(db, 'restaurants', restaurantId, 'menus')
  const ref = await addDoc(menusRef, {
    name: "Sandwich N'delda",
    categories: [
      {
        name: 'Sandwiches',
        items: [
          { name: 'Poulet Haché', price: 400 },
          { name: 'Escalope', price: 450 },
          { name: 'Merguez', price: 500 },
          { name: 'Kebda', price: 500 },
          { name: 'Melange', price: 550 },
        ],
        addons: [{ name: 'Barquette de Frites', price: 150 }],
      },
    ],
    selectedLayout: 'classic',
    createdAt: serverTimestamp(),
  })
  return ref.id
}
