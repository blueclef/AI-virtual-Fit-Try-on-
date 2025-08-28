import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performVirtualTryOn = async (personImage: ImageFile, clothingImage: ImageFile): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: clothingImage.base64,
              mimeType: clothingImage.mimeType,
            },
          },
          {
            inlineData: {
              data: personImage.base64,
              mimeType: personImage.mimeType,
            },
          },
          {
            text: '이 사람에게 이 옷을 자연스럽게 입혀주세요. 원본 인물 사진의 배경과 포즈는 그대로 유지해주세요.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('AI가 이미지를 생성하지 못했습니다. 다른 이미지를 사용해보세요.');

  } catch (error) {
    console.error('Error during virtual try-on:', error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject('알 수 없는 오류가 발생했습니다.');
  }
};
