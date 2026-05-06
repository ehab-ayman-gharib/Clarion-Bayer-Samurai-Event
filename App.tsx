import React, { useState, useCallback } from 'react';
import { AppScreen, EraData, FaceDetectionResult, EraId } from './types';
import { CameraCapture } from './components/CameraCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultScreen } from './components/ResultScreen';
import { CapturePreview } from './components/CapturePreview';
import { generateHistoricalImage } from './services/geminiService';
import { ScreenSaver } from './components/ScreenSaver';
import { ERAS } from './constants';

const { ipcRenderer } = window.require('electron');
const CLOUDINARY_CLOUD_NAME = "dniredeim";
const IDLE_TIMEOUT = 30000; // 30 seconds

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SCREEN_SAVER);
  const [selectedEra, setSelectedEra] = useState<EraData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [rawGeneratedImage, setRawGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCapture = (imageSrc: string, faceData: FaceDetectionResult) => {
    setCapturedImage(imageSrc);
    setFaceDetectionResult(faceData);
    setCurrentScreen(AppScreen.PREVIEW);
  };

  const startAIProcessing = useCallback(async () => {
    if (!selectedEra || !capturedImage || !faceDetectionResult) return;

    setCurrentScreen(AppScreen.PROCESSING);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`[Processing] Attempt ${attempts} / ${maxAttempts}...`);

        let resultImage: string;

        // Perform AI generation
        const result = await generateHistoricalImage(capturedImage, selectedEra, faceDetectionResult);
        resultImage = result.image;
        setGeneratedPrompt(result.prompt);

        setRawGeneratedImage(resultImage);
        setGeneratedImage(resultImage);

        setCurrentScreen(AppScreen.RESULT);
        return;
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
        if (attempts >= maxAttempts) {
          handleRestart();
          setCurrentScreen(AppScreen.SCREEN_SAVER);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
  }, [selectedEra, capturedImage, faceDetectionResult]);

  const handleRestart = () => {
    setCapturedImage(null);
    setGeneratedImage(null);
    setGeneratedPrompt('');
    setSelectedEra(null);
    setFaceDetectionResult(null);

    setSessionKey(prev => prev + 1);
    setCurrentScreen(AppScreen.SCREEN_SAVER);
  };

  const handleUpdateImage = (newImage: string) => {
    setGeneratedImage(newImage);
  };

  /**
   * SCREEN SAVER & IDLE LOGIC
   */
  const resetIdleTimer = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  React.useEffect(() => {
    const checkIdle = () => {
      // Only count down for screensaver if NOT already on the ScreenSaver
      if (currentScreen === AppScreen.SCREEN_SAVER) {
        localStorage.setItem('last_activity', Date.now().toString());
        return;
      }

      const lastActivity = parseInt(localStorage.getItem('last_activity') || '0');
      const now = Date.now();

      if (now - lastActivity > IDLE_TIMEOUT) {
        console.log('[Idle] Timeout reached. Starting Screen Saver...');
        handleRestart(); // Reset state and go to ScreenSaver
      }
    };

    const interval = setInterval(checkIdle, 1000);
    return () => clearInterval(interval);
  }, [currentScreen]);

  // Cloudinary Sync (Featured Images) - Runs on app start and every time we return to ScreenSaver
  React.useEffect(() => {
    const syncFeaturedImages = async () => {
      try {
        console.log('[Cloudinary Sync] Initializing sync...');
        const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/Featured.json`);

        if (response.status === 404) {
          console.log('[Cloudinary Sync] No featured images found on cloud. Clearing local cache...');
          await ipcRenderer.invoke('sync-featured-images', []);
          return;
        }

        if (!response.ok) {
          console.warn(`[Cloudinary Sync] API returned error: ${response.status}`);
          return;
        }

        const data = await response.json();
        const cloudinaryImages = data.resources || [];
        console.log(`[Cloudinary Sync] Found ${cloudinaryImages.length} images on cloud.`);

        setIsSyncing(true);
        const imageData = cloudinaryImages.map((img: any) => ({
          id: img.public_id,
          url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v${img.version}/${img.public_id}.${img.format}`
        }));

        const result = await ipcRenderer.invoke('sync-featured-images', imageData);
        console.log('[Cloudinary Sync] Process complete:', result);
        setIsSyncing(false);
      } catch (err: any) {
        console.warn('[Cloudinary Sync] Failed:', err.message);
        setIsSyncing(false);
      }
    };

    // Trigger sync if we are on ScreenSaver OR if it's the initial load
    syncFeaturedImages();
  }, [currentScreen]);

  // Monitor interactions
  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handler = () => resetIdleTimer();
    events.forEach(event => window.addEventListener(event, handler));
    return () => events.forEach(event => window.removeEventListener(event, handler));
  }, [resetIdleTimer]);

  const handleGlobalClick = () => {
    resetIdleTimer();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SCREEN_SAVER:
        return (
          <ScreenSaver
            onDismiss={(era) => {
              setSelectedEra(era);
              setCurrentScreen(AppScreen.CAMERA);
            }}
          />
        );

      case AppScreen.CAMERA:
        return <CameraCapture era={selectedEra} onCapture={handleCapture} onBack={() => setCurrentScreen(AppScreen.SCREEN_SAVER)} />;

      case AppScreen.PREVIEW:
        return capturedImage ? (
          <CapturePreview
            imageSrc={capturedImage}
            era={selectedEra}
            onRetake={() => setCurrentScreen(AppScreen.CAMERA)}
            onProceed={startAIProcessing}
          />
        ) : null;

      case AppScreen.PROCESSING:
        return <LoadingScreen />;

      case AppScreen.RESULT:
        return (
          selectedEra && generatedImage ? (
            <ResultScreen
              imageSrc={generatedImage}
              rawImage={rawGeneratedImage || ''}
              prompt={generatedPrompt}
              era={selectedEra}
              faceData={faceDetectionResult}
              onRestart={handleRestart}
              onUpdateImage={handleUpdateImage}
            />
          ) : <LoadingScreen />
        );

      default:
        return (
          <ScreenSaver
            onDismiss={(era) => {
              setSelectedEra(era);
              setCurrentScreen(AppScreen.CAMERA);
            }}
          />
        );
    }
  };

  return (
    <div
      className="h-[100dvh] w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden"
      onClick={handleGlobalClick}
    >
      <main className="flex-grow relative h-full w-full" key={sessionKey}>
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;