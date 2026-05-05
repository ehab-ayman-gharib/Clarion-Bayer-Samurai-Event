import React, { useState, useCallback } from 'react';
import { AppScreen, EraData, FaceDetectionResult, EraId } from './types';
import { SplashScreen } from './components/SplashScreen';
import { CameraCapture } from './components/CameraCapture';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultScreen } from './components/ResultScreen';
import { CapturePreview } from './components/CapturePreview';
import { generateHistoricalImage } from './services/geminiService';
import { applyEraStamp } from './services/stampService';
import { ERAS } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [selectedEra, setSelectedEra] = useState<EraData | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [rawGeneratedImage, setRawGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const handleStart = () => {
    setCurrentScreen(AppScreen.ERA_SELECTION);
  };

  const handleEraSelect = (era: EraData) => {
    setSelectedEra(era);
    setCurrentScreen(AppScreen.CAMERA);
  };

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

        // Apply Era Stamp/Frame for PREVIEW (No margins)
        const stampedImage = await applyEraStamp(resultImage, selectedEra, false);
        setGeneratedImage(stampedImage);
        
        setCurrentScreen(AppScreen.RESULT);
        return; 
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
        if (attempts >= maxAttempts) {
          handleRestart();
          setCurrentScreen(AppScreen.SPLASH);
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
    setCurrentScreen(AppScreen.SPLASH);
  };

  const handleUpdateImage = (newImage: string) => {
    setGeneratedImage(newImage);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.SPLASH:
      case AppScreen.ERA_SELECTION:
        return <SplashScreen onStart={handleStart} onSelectEra={handleEraSelect} isMuted={isMuted} setIsMuted={setIsMuted} />;
      
      case AppScreen.CAMERA:
        return <CameraCapture era={selectedEra} onCapture={handleCapture} onBack={() => setCurrentScreen(AppScreen.SPLASH)} />;
      
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
        return <SplashScreen onStart={handleStart} onSelectEra={handleEraSelect} isMuted={isMuted} setIsMuted={setIsMuted} />;
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden">
      <main className="flex-grow relative h-full w-full" key={sessionKey}>
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;