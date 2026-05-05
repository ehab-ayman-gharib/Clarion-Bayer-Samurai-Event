import { EraData } from '../types';

/**
 * Applies a branding frame to the generated image.
 * Randomizes between multiple frames in public/Frames
 * Final output is 1200x1800 (2:3 aspect ratio)
 */

let lastFrameIndex = -1;
const AVAILABLE_FRAMES = [
    './Frames/Frame_0.png',
    './Frames/Frame_1.png',
    './Frames/Frame_2.png'
];

/**
 * Helper to load an image with a promise and timeout
 */
const loadImage = (src: string, timeoutMs: number = 10000): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            img.src = ''; // Cancel loading
            reject(new Error(`Timeout loading image: ${src}`));
        }, timeoutMs);

        if (!src.startsWith('data:')) {
            img.crossOrigin = "anonymous";
        }

        img.onload = () => {
            clearTimeout(timeout);
            resolve(img);
        };

        img.onerror = (err) => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load image: ${src}`));
        };

        img.src = src;
    });
};

export const applyEraStamp = async (imageSrc: string, era: EraData, forPrinting: boolean = true): Promise<string> => {
    try {
        console.log(`[Composition] Starting stamp application for era: ${era.name}, printing: ${forPrinting}`);

        // Randomize frame without consecutive repeats
        let frameIndex;
        if (AVAILABLE_FRAMES.length > 1) {
            do {
                frameIndex = Math.floor(Math.random() * AVAILABLE_FRAMES.length);
            } while (frameIndex === lastFrameIndex);
        } else {
            frameIndex = 0;
        }
        lastFrameIndex = frameIndex;
        const framePath = AVAILABLE_FRAMES[frameIndex];
        console.log(`[Composition] Selected frame: ${framePath}`);

        // Load both assets in parallel
        const [mainImage, frameImg] = await Promise.all([
            loadImage(imageSrc),
            loadImage(framePath)
        ]);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error("[Composition] Could not get canvas context");
            return imageSrc;
        }

        // Final Result Size: 1200 x 1800 (2:3 aspect ratio)
        canvas.width = 1200;
        canvas.height = 1800;

        // SELPHY Strategy: 
        const topMargin = forPrinting ? 70 : 0;
        const bottomMargin = forPrinting ? 40 : 0;
        const safeH = 1800 - topMargin - bottomMargin;

        // 0. Fill Background with Black (Margins)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Main Image - Compressed into safe area
        const imgAspect = mainImage.width / mainImage.height;
        const targetAspect = canvas.width / safeH;

        let drawWidth, drawHeight, offsetX, offsetY;
        if (imgAspect > targetAspect) {
            drawHeight = safeH;
            drawWidth = safeH * imgAspect;
            offsetX = -(drawWidth - canvas.width) / 2;
            offsetY = topMargin;
        } else {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetX = 0;
            offsetY = topMargin - (drawHeight - safeH) / 2;
        }

        // Clip drawing to safe area
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, topMargin, canvas.width, safeH);
        ctx.clip();
        ctx.drawImage(mainImage, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();

        // 2. Draw Frame - Over safe area
        ctx.drawImage(frameImg, 0, topMargin, canvas.width, safeH);

        const finalImage = canvas.toDataURL('image/jpeg', 0.95);
        console.log("[Composition] Composition successful");
        return finalImage;

    } catch (error) {
        console.error("[Composition] Error in stamp application:", error);
        // Fallback: return original image so the flow doesn't break
        return imageSrc;
    }
};
