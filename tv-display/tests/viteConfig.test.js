import { describe, expect, it } from 'vitest'
import { cloudinaryUrlPattern, imageExtensionUrlPattern } from '../src/imageCachePatterns'

describe('offline image caching routes', () => {
  it('matches images with Firebase Storage query parameters', () => {
    expect(imageExtensionUrlPattern.test('https://firebasestorage.googleapis.com/v0/b/menu/o/dish.jpg?alt=media&token=abc')).toBe(true)
  })

  it('matches Cloudinary image URLs with transformation paths and versions', () => {
    expect(cloudinaryUrlPattern.test('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234/dish.jpg')).toBe(true)
    expect(cloudinaryUrlPattern.test('https://res.cloudinary.com/demo/image/upload/dish.webp?width=800')).toBe(true)
  })
})
