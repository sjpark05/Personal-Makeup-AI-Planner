import { seasonProfiles } from "../data/personalColors.js";

export function getSkinColor(skinTone) {
  return seasonProfiles[skinTone.season].skinColors[skinTone.toneDetail];
}
