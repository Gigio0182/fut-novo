import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

function isPermissionError(error: unknown) {
  return error instanceof Error && /permission|unauthenticated|permission-denied/i.test(error.message)
}

function stripListPrefix(value: string) {
  return value
    .replace(/^\d+\.\s*/, '')
    .replace(/^\d+\s*-\s*/, '')
    .replace(/^\d+\s+/, '')
    .trim()
}

function normalizeName(name: string) {
  const cleaned = stripListPrefix(name.trim())

  return cleaned
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

    const value = stripListPrefix(trimmed)

    if (!value || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(value)) {
      return
    }

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
    try {
      await addDoc(athletesCollection, {
        name,
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      if (isPermissionError(error)) {
        throw new Error('Firestore permission denied')
      }
      throw error
    }
  }

  return newNames
}
