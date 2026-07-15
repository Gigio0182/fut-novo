import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function parseAthleteList(raw: string): string[] {
  const names = new Set<string>()

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return

    const match = trimmed.match(/^(\d+)[.-]\s*(.+)$/)
    const value = match?.[2] ?? trimmed
    const normalized = normalizeName(value)

    if (normalized) {
      names.add(normalized)
    }
  })

  return Array.from(names)
}

export async function checkDuplicates(names: string[]) {
  const normalizedNames = names.map((name) => normalizeName(name)).filter(Boolean)
  const snapshot = await getDocs(collection(db, 'athletes'))
  const existingNames = snapshot.docs
    .map((doc) => normalizeName(String(doc.data().name ?? '')))
    .filter(Boolean)

  const existingSet = new Set(existingNames)

  return {
    existing: normalizedNames.filter((name) => existingSet.has(name)),
    newNames: normalizedNames.filter((name) => !existingSet.has(name)),
  }
}

export async function saveAthletes(names: string[]) {
  const normalizedNames = names.map((name) => normalizeName(name)).filter(Boolean)
  const { newNames } = await checkDuplicates(normalizedNames)

  if (!newNames.length) {
    return []
  }

  const athletesCollection = collection(db, 'athletes')

  for (const name of newNames) {
    await addDoc(athletesCollection, {
      name,
      createdAt: new Date().toISOString(),
    })
  }

  return newNames
}
