/**
 * Stops media that plays on its own. CSS can shorten animations but it cannot
 * pause a video, so anyone who has asked for reduced motion still gets a moving
 * hero background unless it is paused directly.
 *
 * Only elements present when this runs are affected. Media added later by the
 * host site keeps playing, which is a deliberate limit rather than an oversight:
 * a permanent observer on every page for every visitor is a poor trade for a
 * case the visitor can resolve by toggling the setting again.
 */
const pauseAutoplayingMedia = (): void => {
  try {
    const players = document.querySelectorAll<HTMLMediaElement>(
      'video[autoplay], audio[autoplay]',
    )

    players.forEach(player => {
      player.autoplay = false
      player.pause()
    })
  } catch (error) {
    console.warn('[QC Accessibility] Could not pause autoplaying media.', error)
  }
}

export { pauseAutoplayingMedia }
