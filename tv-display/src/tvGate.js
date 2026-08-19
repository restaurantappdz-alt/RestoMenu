// tvGate.js
//
// Device-class detection for the phone menu page. Stops TV-class browsers
// (Samsung Tizen, LG webOS, Fire TV, Roku, Chromecast, Apple TV, consoles,
// HbbTV sets) and large-landscape screens from rendering the phone menu,
// closing the "QR link opened on a TV" subscription bypass.
//
// Design constraints (do not regress):
//  - Zero Firebase: no imports, no reads, no writes — the gate must not
//    touch Firestore/RTDB in any way.
//  - Fail-open: every check is defensive; any throw or missing API returns
//    false so the menu always renders normally on legitimate devices.

const TV_UA_PATTERN =
  /(SMART-TV|SmartTV|SmartHub|Tizen|Web0S|webOS|Linux\/SmartTV|AFT[A-Z0-9]{2,}|AmazonWebAppPlatform|Silk\/.+like Chrome|Kepler\/|CrKey|Google ?TV|Android TV|\(lite\) TV|BRAVIA|AQUOS-TV|VIDAA|HbbTV|OMI\/|Opera TV|NetCast|Maple_2011|CEBrowser|TSBNetTV|Apple ?TV|tvOS|AppleTV|PlayStation|Xbox|Roku(?:OS|Browser)?\/?DVP?-?|Vestel|Odin)/i

const MIN_TV_WIDTH = 1280

export function isTvLikeUserAgent(ua) {
  if (typeof ua !== 'string' || ua.length === 0) return false
  return TV_UA_PATTERN.test(ua)
}

export function isTvLikeViewport(width, height) {
  if (typeof width !== 'number' || typeof height !== 'number') return false
  if (!Number.isFinite(width) || !Number.isFinite(height)) return false
  return width >= MIN_TV_WIDTH && width > height
}

export function isTvClassDevice() {
  try {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
    if (isTvLikeUserAgent(ua)) return true
    if (typeof window !== 'undefined' && isTvLikeViewport(window.innerWidth, window.innerHeight)) {
      return true
    }
  } catch {
    // Any failure keeps the gate open — never block the menu on a bug.
  }
  return false
}