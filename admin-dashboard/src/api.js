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
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

const menusRef = collection(db, 'menus')

export function onMenusSnapshot(callback) {
  const q = query(menusRef, orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const menus = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(menus)
  })
}

export async function getMenu(id) {
  const snap = await getDoc(doc(db, 'menus', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export function onMenuSnapshot(id, callback) {
  return onSnapshot(doc(db, 'menus', id), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() })
  })
}

export async function createMenu(name) {
  const ref = await addDoc(menusRef, {
    name,
    categories: [],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMenu(id, data) {
  await updateDoc(doc(db, 'menus', id), data)
}

export async function deleteMenu(id) {
  await deleteDoc(doc(db, 'menus', id))
}

export function onDisplayConfigSnapshot(callback) {
  return onSnapshot(doc(db, 'config', 'display'), (snap) => {
    if (snap.exists()) callback(snap.data())
    else callback({ activeMenuId: null })
  })
}

export async function setActiveMenu(menuId) {
  await setDoc(doc(db, 'config', 'display'), {
    activeMenuId: menuId,
    updatedAt: serverTimestamp(),
  })
}

export async function seedDefaultMenu() {
  const ref = await addDoc(menusRef, {
    name: "Sandwich N'delda",
    categories: [
      {
        name: 'Sandwiches',
        items: [
          { name: 'Poulet Haché', price: 400 },
          { name: 'Escalope', price: 450 },
          { name: 'Merguez', price: 500 },
          { name: 'Kebab', price: 500 },
          { name: 'Melange', price: 500 },
        ],
        addons: [{ name: 'Barquette de Frites', price: 150 }],
      },
    ],
    createdAt: serverTimestamp(),
  })
  return ref.id
}
