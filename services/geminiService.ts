import { GoogleGenAI } from "@google/genai";
import { EraData, FaceDetectionResult } from '../types';
import { MALE_WARDROBE_STYLES, FEMALE_WARDROBE_STYLES, IDENTITY_PRESERVATION_GUIDE, LIGHTING_STYLES } from '../constants';

let lastMaleWardrobeIndex = -1;
let lastFemaleWardrobeIndex = -1;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

const DASHBOARD_API_URL = "https://ai-photobooth-dashboard.vercel.app/api/projects/168f20dc-d717-4f62-902d-db030f95bfd5/generate";

/**
 * Increments the generated images count on the dashboard
 */
const incrementGeneratedCount = async () => {
  try {
    const response = await fetch(DASHBOARD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.warn(`[Dashboard] Failed to increment count: ${response.status} ${response.statusText}`);
    } else {
      console.log('[Dashboard] Successfully incremented generation count');
    }
  } catch (error) {
    console.error('[Dashboard] Error calling increment API:', error);
  }
};

export interface GenerationResult {
  image: string;
  prompt: string;
}

export const generateHistoricalImage = async (
  base64Image: string,
  era: EraData,
  faceData: FaceDetectionResult
): Promise<GenerationResult> => {
  const ai = getAiClient();
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  // 1. Calculate Detailed Subject & Gender Reflection
  let subjectDescription = "";
  const parts = [];
  if (faceData.maleCount > 0) parts.push(`${faceData.maleCount} ${faceData.maleCount > 1 ? 'men' : 'man'}`);
  if (faceData.femaleCount > 0) parts.push(`${faceData.femaleCount} ${faceData.femaleCount > 1 ? 'women' : 'woman'}`);
  if (faceData.childCount > 0) parts.push(`${faceData.childCount} ${faceData.childCount > 1 ? 'children' : 'child'}`);

  if (parts.length === 0) {
    subjectDescription = faceData.totalPeople > 1 ? `a group of ${faceData.totalPeople} people` : "a person";
  } else if (faceData.totalPeople === 1) {
    subjectDescription = parts[0];
  } else {
    subjectDescription = "a group of " + parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
  }

  // 2. Select Wardrobe per subject type for variety with anti-consecutive repetition
  const clothingParts: string[] = [];

  if (faceData.maleCount > 0) {
    let maleIndex;
    do {
      maleIndex = Math.floor(Math.random() * MALE_WARDROBE_STYLES.length);
    } while (maleIndex === lastMaleWardrobeIndex && MALE_WARDROBE_STYLES.length > 1);
    lastMaleWardrobeIndex = maleIndex;
    clothingParts.push(`the ${faceData.maleCount > 1 ? 'men' : 'man'} MUST ONLY wear ${MALE_WARDROBE_STYLES[maleIndex]}`);
  }

  if (faceData.femaleCount > 0) {
    let femaleIndex;
    do {
      femaleIndex = Math.floor(Math.random() * FEMALE_WARDROBE_STYLES.length);
    } while (femaleIndex === lastFemaleWardrobeIndex && FEMALE_WARDROBE_STYLES.length > 1);
    lastFemaleWardrobeIndex = femaleIndex;
    clothingParts.push(`the ${faceData.femaleCount > 1 ? 'women' : 'woman'} MUST ONLY wear ${FEMALE_WARDROBE_STYLES[femaleIndex]}`);
  }

  if (faceData.childCount > 0) {
    clothingParts.push(`the ${faceData.childCount > 1 ? 'children' : 'child'} MUST ONLY wear traditional Japanese-style robes with subtle glowing accents`);
  }
  const clothingDescription = clothingParts.join(", ");

  // 3. Select Lighting Variant
  const randomLighting = LIGHTING_STYLES[Math.floor(Math.random() * LIGHTING_STYLES.length)];

  // 4. Construct Unified Prompt
  const prompt = `Reimagine ${subjectDescription} as heroic mystical warriors in a cinematic Japanese Dojo at night.
  
  CORE VISUAL THEME: 
  - ${era.name}. 
  - ${era.promptInstructions}.
  
  STYLE & ATMOSPHERE: 
  - Dark, moody, and atmospheric setting. 
  - Authentic Dojo elements: Tatami flooring, shoji screen windows, and subtle wooden textures.
  - LIGHTING: ${randomLighting}
 
  SUBJECT DETAILS:
  - CLOTHING (MANDATORY TRANSFORMATION): You MUST ABSOLUTELY ERASE and DISCARD all original clothing and accessories from the source image. COMPLETELY REPLACE the subject's outfit. The subject MUST ONLY wear: ${clothingDescription}. Ensure NO TRACE of the original garment/style remains visible.
  - Maintain the subject’s physical likeness, bone structure, and original pose exactly, but render them entirely in the new specified wardrobe.
  - Each warrior MUST be holding their unique weapon: the mystical cyan feather blade with its glowing electric blue spine.
  
  ENVIRONMENT:
  - ${era.description}. 
  - Ensure the environment feels clean and grounded, focusing on the architectural beauty and atmospheric lighting of the traditional Dojo.
  - Ethereal glowing particles and soft blue light wisps should be visible in the air around the mystical weapon.

  ${IDENTITY_PRESERVATION_GUIDE}`;

  console.log("------------------- GENERATED PROMPT -------------------");
  console.log(prompt);
  console.log("--------------------------------------------------------");

  // Using raw object structure to bypass potential TS mismatches with the SDK
  const safetySettings: any[] = [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
  ];

  const requestConfig: any = {
    temperature: 0.2,
    // @ts-ignore
    imageConfig: {
      aspectRatio: "2:3",
      // imageSize: "1K"
    },
    safetySettings: safetySettings
  };

  try {
    // 4. Send to Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      config: requestConfig,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            },
            { text: prompt }
          ]
        }
      ]
    });

    // Extract image from response
    const candidate = response.candidates?.[0];
    if (candidate) {
      if (candidate.finishReason !== 'STOP') {
        console.warn('Gemini Generation Warning: Finish Reason:', candidate.finishReason);
      }

      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          // Increment dashboard count after successful generation
          incrementGeneratedCount();

          return {
            image: `data:image/jpeg;base64,${part.inlineData.data}`,
            prompt: prompt
          };
        }
      }
    }

    console.error('Gemini No Image Generated. Response:', JSON.stringify(response, null, 2));
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
