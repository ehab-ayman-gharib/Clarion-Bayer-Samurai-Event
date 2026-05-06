import { EraData, EraId } from './types';

/**
 * IDENTITY_PRESERVATION_GUIDE:
 * These instructions ensure Gemini 3 Flash Image maintains the user's likeness 
 * while accurately rendering the mystical Samurai aesthetic.
 */
export const IDENTITY_PRESERVATION_GUIDE = `STRICT VISUAL REQUIREMENTS:
- CRITICAL: Maintain exact facial features, bone structure, and skin tone. No facial morphing.
- THE FEATHER BLADE: The weapon is a single, large, magnificent CYAN FEATHER (not metal). It has a vibrant electric blue glowing spine (rachis) that emits intense mystical light. A realistic Japanese Katana hilt (tsuka) with traditional wrap (ito) is attached to the base of the feather.
- WARDROBE: ABSOLUTE MANDATORY COMPLETE REPLACEMENT. The subject must wear high-quality, weighted, traditional black or dark indigo samurai robes (kimono and hakama). NO TRACE of the original garment should remain.
- LIGHTING: Extremely dynamic and high-contrast. The PRIMARY light source is the glowing feather blade, casting strong cyan/blue light and rim lighting onto the character's face, hands, and the folds of their robes.
- STYLE: High-fidelity cinematic photography, photorealistic execution, epic heroic scale, 8k resolution, masterful composition.`;

/**
 * LIGHTING_STYLES:
 * Variations of the Dojo atmosphere.
 */
export const LIGHTING_STYLES = [
  "Primary cyan light from the blade, with sharp high-contrast shadows. Subtle warm amber glow from distant lanterns behind shoji screens.",
  "Ethereal blue aura from the feather blade illuminating a misty night dojo. Soft volumetric cyan light rays.",
  "Deep indigo night shadows, with intense electric blue rim lighting tracing the subject's silhouette from the glowing weapon.",
  "Cinematic moonlight filtered through shoji screens, mixing with the dominant neon cyan glow of the mystical feather.",
  "A dark, atmospheric dojo where the only light is the pulsing electric blue spine of the feather blade reflecting on the tatami."
];

/**
 * MALE_WARDROBE_STYLES:
 * Traditional Samurai attire for men.
 */
export const MALE_WARDROBE_STYLES = [
  "traditional weighted black samurai kimono and hakama with a silver-threaded obi belt.",
  "dark indigo formal samurai robes with subtle textured embroidery on the shoulders.",
  "a charcoal-grey Ronin-style kimono with tattered edges and weighted hakama pants.",
  "deep black samurai armor-layered kimono with a focus on heavy fabric folds.",
  "midnight blue traditional martial arts gi with weighted hakama and silk wraps."
];

/**
 * FEMALE_WARDROBE_STYLES:
 * Traditional Samurai attire for women.
 */
export const FEMALE_WARDROBE_STYLES = [
  "an elegant weighted black silk kimono with indigo hakama and a decorative obi.",
  "dark indigo traditional female samurai robes, featuring layered sleeves and a high collar.",
  "a midnight black combat-ready kimono with a simple indigo hakama for fluid movement.",
  "deep charcoal female samurai attire with subtle floral patterns etched into the dark fabric.",
  "a sleek, dark navy silk kimono with a contrasting cyan-threaded belt."
];

/**
 * STANCES:
 * Representing different Combat Stances and Dojo Settings.
 */
export const ERAS: EraData[] = [
  {
    id: EraId.GUARDIAN, 
    name: 'The Guardian Stance',
    description: 'A defensive, low-center combat stance.',
    promptInstructions: 'The character is in a low, wide defensive combat stance (kendo style), holding the glowing cyan feather blade horizontally with both hands in front of them. Dark, moody Dojo background with authentic tatami floor.'
  },
  {
    id: EraId.LOTUS,
    name: 'The Striking Lotus',
    description: 'An aggressive overhead striking pose.',
    promptInstructions: 'The character is in a dramatic overhead combat stance (iaido style), holding the glowing feather blade high with both hands. Intense cyan light illuminates the subject from above. Shoji screen windows in the deep background.'
  },
  {
    id: EraId.SHADOW,
    name: 'The Shadow Dualist',
    description: 'A side-profile focused combat pose.',
    promptInstructions: 'A dramatic side-profile view of the warrior in a mid-combat lunge. The glowing cyan feather blade points forward, casting a strong blue glow on the subject\'s profile. Ethereal glowing particles drift around the blade.'
  },
  {
    id: EraId.SILENT,
    name: 'The Silent Blade',
    description: 'A calm, focused ready stance.',
    promptInstructions: 'The character is standing in a calm, focused Chudan-no-kamae stance, holding the feather blade centered. Soft blue light wisps drift around the weapon. Subtle warm amber glow from lanterns behind shoji screens.'
  },
  {
    id: EraId.ASCENDANT,
    name: 'The Heroic Ascendance',
    description: 'A triumphant, epic combat pose.',
    promptInstructions: 'An epic low-angle shot of the warrior standing tall in a heroic combat pose. The glowing feather blade is held diagonally. The electric blue spine of the feather emits intense mystical light, creating a majestic rim lighting.'
  }
];