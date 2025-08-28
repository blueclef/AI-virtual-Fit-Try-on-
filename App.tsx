import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { performVirtualTryOn } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ClothingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" transform="scale(0.8) translate(3, 2)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0" />
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3.5l-1 5.5s-1 1.5 2 1.5 2-1.5 2-1.5l-1-5.5" transform="translate(1.5, -0.5)"/>
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 3.5l1 5.5s1 1.5-2 1.5-2-1.5-2-1.5l1-5.5" transform="translate(-1.5, -0.5)"/>
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9h8l1 10H7l1-10z"/>
  </svg>
);


function App() {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageFile | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [clothingPreview, setClothingPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonUpload = (image: ImageFile | null) => {
    setPersonImage(image);
    setPersonPreview(image ? `data:${image.mimeType};base64,${image.base64}` : null);
  };

  const handleClothingUpload = (image: ImageFile | null) => {
    setClothingImage(image);
    setClothingPreview(image ? `data:${image.mimeType};base64,${image.base64}` : null);
  };

  const handleVirtualTryOn = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError('인물과 의류 사진을 모두 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await performVirtualTryOn(personImage, clothingImage);
      setResultImage(generatedImage);
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage]);
  
  const canSubmit = personImage && clothingImage && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-600 text-transparent bg-clip-text">
            AI 가상 피팅
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            '나노 바나나' 모델을 사용하여 가상으로 옷을 입어보세요. 인물 사진과 의류 사진을 업로드하면 AI가 합성 이미지를 생성합니다.
          </p>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageUploader 
              id="person-uploader" 
              title="인물 사진" 
              onImageUpload={handlePersonUpload} 
              imagePreviewUrl={personPreview}
              icon={<PersonIcon />}
            />
            <ImageUploader 
              id="clothing-uploader" 
              title="의류 사진" 
              onImageUpload={handleClothingUpload} 
              imagePreviewUrl={clothingPreview}
              icon={<ClothingIcon />}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleVirtualTryOn}
              disabled={!canSubmit}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-indigo-600 border border-transparent rounded-full shadow-lg transition-all duration-300 ease-in-out enabled:hover:bg-indigo-700 enabled:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? '생성 중...' : '가상 피팅 시작'}
            </button>
          </div>

          {(isLoading || error || resultImage) && (
            <div className="mt-10 bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-center mb-6">피팅 결과</h2>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center text-gray-400 h-64">
                        <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-semibold">AI가 옷을 입히고 있습니다...</p>
                        <p className="text-sm mt-1">잠시만 기다려주세요.</p>
                    </div>
                )}
                {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
                {resultImage && (
                    <div className="flex justify-center">
                        <img src={resultImage} alt="Virtual try-on result" className="max-w-full max-h-[60vh] rounded-lg shadow-2xl" />
                    </div>
                )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
