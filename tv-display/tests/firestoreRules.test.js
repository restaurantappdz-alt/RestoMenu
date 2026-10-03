import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rulesPath = resolve(process.cwd(), '../firestore.rules')
const rules = readFileSync(rulesPath, 'utf8')

describe('delivery notification Firestore rules', () => {
  it('allows public reads to the TV notification listener', () => {
    expect(rules).toMatch(/match \/restaurants\/\{restaurantId\}[\s\S]*?match \/delivery_notifications\/\{notificationId\}\s*\{\s*allow read: if true;/)
  })
})
