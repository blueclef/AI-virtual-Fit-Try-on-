import React from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageUpload: (imageFile: ImageFile | null) => void;
  imagePreviewUrl: string | null;
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
}

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(',');
      if (!header || !base64) {
        reject(new Error("Invalid file format"));
        return;
      }
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      resolve({ base64, mimeType, name: file.name });
    };
    reader.onerror = (error) => reject(error);
  });
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageUpload, imagePreviewUrl, icon }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onImageUpload(imageFile);
      } catch (error) {
        console.error("Error processing file:", error);
        onImageUpload(null);
      }
    }
  };
  
  return (
    <div className="w-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-6 text-center transition-all hover:border-indigo-500 hover:bg-gray-700/50">
      <label htmlFor={id} className="cursor-pointer flex flex-col items-center justify-center h-full">
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="max-h-64 rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              {icon}
            </div>
            <p className="text-lg font-semibold text-gray-300">{title}</p>
            <p className="text-sm text-gray-500">클릭하여 이미지 업로드</p>
          </div>
        )}
      </label>
      <input
        id={id}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImageUploader;