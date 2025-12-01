import React, { useRef, useEffect, useState } from 'react';
import { Lesion } from '../types';

interface ImageAnalysisOverlayProps {
  imageUrl: string;
  lesions: Lesion[];
  activeLesionId: string | null;
  onLesionSelect: (id: string | null) => void;
}

export const ImageAnalysisOverlay: React.FC<ImageAnalysisOverlayProps> = ({ 
  imageUrl, 
  lesions, 
  activeLesionId,
  onLesionSelect 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Filter lesions that actually have boxes
  const lesionsWithBoxes = lesions.filter(l => l.box_2d && l.box_2d.length === 4);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center group">
      <div className="relative max-w-full max-h-full" ref={containerRef}>
        {/* Main Image */}
        <img 
          src={imageUrl} 
          alt="Analysis Subject" 
          className={`max-w-full max-h-[600px] object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Overlay Layer */}
        {imageLoaded && (
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {lesionsWithBoxes.map((lesion) => {
              // Gemini returns [ymin, xmin, ymax, xmax] on 0-1000 scale
              const [ymin, xmin, ymax, xmax] = lesion.box_2d!;
              
              const top = (ymin / 1000) * 100;
              const left = (xmin / 1000) * 100;
              const height = ((ymax - ymin) / 1000) * 100;
              const width = ((xmax - xmin) / 1000) * 100;

              const isActive = activeLesionId === lesion.id;
              
              return (
                <div
                  key={lesion.id}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent clearing selection
                    // Allow clicking through the overlay div by using pointer-events-auto on the box itself
                    onLesionSelect(lesion.id);
                  }}
                  className={`
                    absolute border-2 transition-all duration-300 cursor-pointer pointer-events-auto
                    ${isActive ? 'border-blue-400 bg-blue-400/20 z-20 shadow-[0_0_15px_rgba(96,165,250,0.6)]' : 'border-red-500/60 hover:border-red-400 hover:bg-red-400/10 z-10'}
                  `}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    borderRadius: '4px'
                  }}
                >
                  {isActive && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none">
                      {lesion.type}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};