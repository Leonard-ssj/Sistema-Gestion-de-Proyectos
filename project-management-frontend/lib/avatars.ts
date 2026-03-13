export const BOTTTs_NEUTRAL_AVATAR_SEEDS = [
  "Astra",
  "Bolt",
  "Cobalt",
  "Delta",
  "Echo",
  "Flux",
  "Glitch",
  "Hex",
]

export function getBotttsNeutralAvatarUrl(seed: string) {
  const encoded = encodeURIComponent(seed)
  return `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encoded}&size=64&radius=12`
}

export const BOTTTs_NEUTRAL_AVATARS = BOTTTs_NEUTRAL_AVATAR_SEEDS.map((seed) => ({
  id: `bottts-${seed.toLowerCase()}`,
  seed,
  src: getBotttsNeutralAvatarUrl(seed),
}))

export function normalizeAvatarUrl(value?: string | null) {
  if (!value) return BOTTTs_NEUTRAL_AVATARS[0].src
  const legacy: Record<string, string> = {
    "/avatars/owners/owner-01.svg": getBotttsNeutralAvatarUrl("Astra"),
    "/avatars/owners/owner-02.svg": getBotttsNeutralAvatarUrl("Bolt"),
    "/avatars/owners/owner-03.svg": getBotttsNeutralAvatarUrl("Cobalt"),
    "/avatars/owners/owner-04.svg": getBotttsNeutralAvatarUrl("Delta"),
    "/avatars/owners/owner-05.svg": getBotttsNeutralAvatarUrl("Echo"),
  }
  return legacy[value] ?? value
}
