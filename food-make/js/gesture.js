// Small rules about fingers on the screen, kept apart so they can be tested.
// Little fingers smear taps and rest on things, so these are forgiving.

const SMALL_SMEAR = 40; // stage pixels a draggable thing may slide and still count as a tap

// What a finger lifting off a kitchen thing means:
// 'tap', 'drop' (onto the thing under the finger), 'back' (glide home) or 'none'.
export function releaseKind({ moved, canMove, overSelf, hasTarget, distance }) {
  if (!moved) return 'tap';
  if (!canMove) return overSelf ? 'tap' : 'none';
  if (hasTarget) return 'drop';
  return distance <= SMALL_SMEAR ? 'tap' : 'back';
}

// May a new touch take over? Yes, unless a real drag is already under way.
export function canStart(current) {
  return !current || !current.moved;
}

// Taps that arrive just after the screen changes were meant for the old screen.
export function tooSoon(now, lastScreenChange, gap = 350) {
  return lastScreenChange > 0 && now - lastScreenChange < gap;
}
