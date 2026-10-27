export function maxErrorsForLevel(level) {
  if (level <= 3) {
    return 4
  }

  if (level <= 6) {
    return 5
  }

  return 6
}
