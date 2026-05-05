import { EraData, EraId } from './types';

/**
 * IDENTITY_PRESERVATION_GUIDE:
 * These instructions ensure Gemini 3 Flash Image maintains the user's likeness 
 * while accurately rendering the complex textures of Egyptian heritage materials.
 */
export const IDENTITY_PRESERVATION_GUIDE = `REQUIREMENTS:
- CRITICAL: Maintain exact facial features, bone structure, and skin tone. No facial morphing.
- Wardrobe: ABSOLUTE MANDATORY COMPLETE REPLACEMENT. The AI must ERASE all original clothing from the reference image. The subject must ONLY wear the new high-quality casual attire specified. NO TRACE of the original garment should remain.
- Style: Hyper-realistic commercial photography, 8k resolution, shot on 35mm lens, f/1.8 for slight background bokeh.
- Lighting: Accurate volumetric lighting that wraps realistically around the subject's silhouette according to the environmental time of day.`;

/**
 * LIGHTING_STYLES:
 * Randomized lighting conditions to provide variety across generations.
 */
export const LIGHTING_STYLES = [
  "Bright, clear Egyptian morning. Crisp, natural morning sunlight with high-clarity visibility.",
  "Warm Golden Hour. Rich, amber-toned late afternoon sunlight casting long, dramatic, and warm shadows.",
  "Soft Morning Mist. Diffused, ethereal lighting through a light morning haze, creating a soft and magical feel.",
  "High Noon Clarity. Intense, direct desert sunlight with sharp shadows and high-contrast architectural details.",
  "Vivid Afternoon. Saturated colors and sharp-focus lighting under a bright, cloudless sky.",
  "Cinematic Neo-Cairo Night. Deep indigo and midnight blue sky with vibrant glowing neon and LED illuminates reflecting off the limestone.",
  "Midnight Twilight (Blue Hour). A deep, cooling blue sky with the first city lights flickering to life, adding a high-tech glow."
];



/**
 * MALE_WARDROBE_STYLES:
 * Casual modern menswear utilizing high-quality Egyptian cotton and linen.
 */
export const MALE_WARDROBE_STYLES = [
  "a crisp white Egyptian cotton t-shirt paired with perfectly fitted indigo denim jeans and clean white sneakers.",
  "a casual navy blue premium cotton crew-neck sweater worn over charcoal tailored chinos for a modern, simple look.",
  "a smart-casual textured grey blazer layered over a plain black luxury cotton t-shirt and charcoal trousers.",
  "a relaxed olive green linen button-down shirt, worn unbuttoned over a white tee with classic blue jeans.",
  "a modern navy blue polo shirt made of fine Egyptian cotton, paired with beige linen trousers."
];

/**
 * FEMALE_WARDROBE_STYLES:
 * Simple, elegant feminine attire focused on clean lines and premium fabrics.
 */
export const FEMALE_WARDROBE_STYLES = [
  "a simple and elegant long-sleeved silk-blend blouse in a soft lilac tone, paired with light-coloured cotton pants.",
  "a modern, minimalist solid-colored Egyptian linen dress in a soft neutral tone with simple clean lines.",
  "a stylish white linen tunic with subtle traditional embroidery, paired with slim-fit dark navy trousers.",
  "a casual yet chic terracotta-colored cotton jumpsuit with a cinched waist and wide legs.",
  "a refined emerald green silk shirt tucked into high-waisted beige linen pants for a timeless look."
];

/**
 * ERAS:
 * Expanded landmark prompts with specific architectural depth 
 * and localized Cairene lighting environments.
 */
export const ERAS: EraData[] = [
  {
    id: EraId.KHAN,
    name: 'Khan el-Khalili',
    nameAr: 'خان الخليلي',
    description: 'A labyrinth of light and history.',
    promptInstructions: 'A cinematic view of a narrow, historic Khan el-Khalili alley. Ancient limestone walls and deep stone arches are filled with vibrant textiles and polished brass bazaar shops. The cobblestone street is clean, with subtle glowing blue LED accents tracing the edges.'
  },
  {
    id: EraId.TAHRIR,
    name: 'Tahrir Square',
    nameAr: 'ميدان التحرير',
    description: 'The pulse of Neo-Cairo.',
    promptInstructions: 'A grand cinematic view of Tahrir Square under clear skies. The central Obelisk is a skyscraper-sized pillar of light. The surrounding circular roads are ribbons of glowing neon purple and blue. The red facade of the Egyptian Museum is elegantly illuminated by architectural lighting.'
  },
  {
    id: EraId.NILE,
    name: 'The Nile & Qasr al-Nil',
    nameAr: 'النيل وقصر النيل',
    description: 'Where the river meets the grid.',
    promptInstructions: 'Standing on the Qasr al-Nil bridge under a vast, clear sky. The heavy black steel rivets are traced with glowing teal LED lines. The iconic bronze lions have subtle amber ocular sensors. The Nile river below flows like dark liquid mercury, reflecting the neon skyline.'
  },
  {
    id: EraId.DOWNTOWN,
    name: 'Downtown (Khedivial Cairo)',
    nameAr: 'وسط البلد الخديوية',
    description: 'Belle Époque architecture reimagined.',
    promptInstructions: 'A vibrant street scene at Talaat Harb Square. Ornate 19th-century European-style facades are draped in vertical gardens and subtle glowing architectural highlights. Retro-futuristic hover-taxis glide between the French-style balconies.'
  },
  {
    id: EraId.TOWER,
    name: 'Cairo Tower',
    nameAr: 'برج القاهرة',
    description: 'The Lotus of the Future.',
    promptInstructions: 'A vertical composition looking up at the Cairo Tower. The concrete lotus mesh is filled with translucent smart-glass panels that change color. The base of the tower is surrounded by a dense solarpunk forest on Gezira Island, with glowing tropical flora and white maglev tracks winding through the palm trees.'
  }
];