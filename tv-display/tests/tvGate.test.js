import { describe, it, expect } from 'vitest'
import { isTvLikeUserAgent, isTvLikeViewport, isTvClassDevice } from '../src/tvGate'

const TV_UAS = [
  'Mozilla/5.0 (SMART-TV; LINUX; Tizen 9.0) AppleWebKit/537.36 (KHTML, like Gecko) 120.0.6099.5/9.0 TV Safari/537.36',
  'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.1 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; AFTKM) AppleWebKit/537.36 (KHTML, like Gecko) Silk/146.1.122 like Chrome/146.0.7680.165 Safari/537.36',
  'Mozilla/5.0 (Linux; Kepler 1.1; AFTCA002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Chrome/132.0.6834.209 Safari/537.36',
  'Roku/DVP-15.2 (15.2.4.3429-81)',
  'Mozilla/5.0 (Linux; Android 9.0; Build/PI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.57 Safari/537.36 CrKey/1.50.228700',
  'Mozilla/5.0 (Apple TV; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15A372',
  'Mozilla/5.0 (Linux; Android 10; 2020/2021 UHD Android TV Build/QTG3.201102.001; wv)',
  'Mozilla/5.0 (PlayStation; PlayStation 5/4.50) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux armv7l) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 HbbTV/1.2.1 (; JVC; MB211; 3.19.4.2;)',
  'Mozilla/5.0 (SMART-TV; LINUX; Tizen-WASM 6.0) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.2 TV Safari/537.36',
]

const PHONE_UAS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  '',
]

describe('isTvLikeUserAgent', () => {
  TV_UAS.forEach((ua) => {
    it(`flags TV UA: ${ua.slice(0, 45)}...`, () => {
      expect(isTvLikeUserAgent(ua)).toBe(true)
    })
  })

  PHONE_UAS.forEach((ua) => {
    it(`does not flag: ${ua.slice(0, 45) || '(empty)'}...`, () => {
      expect(isTvLikeUserAgent(ua)).toBe(false)
    })
  })

  it('fails open on non-string input', () => {
    expect(isTvLikeUserAgent(null)).toBe(false)
    expect(isTvLikeUserAgent(undefined)).toBe(false)
  })
})

describe('isTvLikeViewport', () => {
  it('flags large landscape screens (TVs, monitors, projectors)', () => {
    expect(isTvLikeViewport(1920, 1080)).toBe(true)
    expect(isTvLikeViewport(3840, 2160)).toBe(true)
    expect(isTvLikeViewport(1366, 768)).toBe(true)
  })

  it('allows phones in portrait and landscape', () => {
    expect(isTvLikeViewport(390, 844)).toBe(false)
    expect(isTvLikeViewport(852, 393)).toBe(false)
  })

  it('allows tall screens of any width', () => {
    expect(isTvLikeViewport(1080, 1920)).toBe(false)
  })

  it('fails open on invalid input', () => {
    expect(isTvLikeViewport(undefined, undefined)).toBe(false)
    expect(isTvLikeViewport(NaN, NaN)).toBe(false)
    expect(isTvLikeViewport('1920', '1080')).toBe(false)
  })
})

describe('isTvClassDevice', () => {
  it('returns false in the default jsdom environment (no TV UA, 1024x768)', () => {
    expect(isTvClassDevice()).toBe(false)
  })
})