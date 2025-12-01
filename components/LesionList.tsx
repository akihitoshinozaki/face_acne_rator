import React from 'react';
import { Lesion } from '../types';

interface LesionListProps {
  lesions: Lesion[];
  activeLesionId: string | null;
  onLesionHover: (id: string | null) => void;
}

export const LesionList: React.FC<LesionListProps> = ({ lesions, activeLesionId, onLesionHover }) => {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 custom-scrollbar">
      {lesions.map((lesion, index) => {
        const isActive = activeLesionId === lesion.id;
        
        return (
          <div
            key={lesion.id}
            onMouseEnter={() => onLesionHover(lesion.id)}
            onMouseLeave={() => onLesionHover(null)}
            className={`
              p-4 rounded-lg border transition-all duration-200 cursor-default
              ${isActive 
                ? 'border-blue-400 bg-blue-50 shadow-md transform scale-[1.01]' 
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`
                  flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                  ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}
                `}>
                  {index + 1}
                </span>
                <h4 className="font-semibold text-slate-800">{lesion.type}</h4>
              </div>
              <div className="flex items-center gap-1">
                 <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className={`h-full ${lesion.severity > 70 ? 'bg-red-500' : lesion.severity > 40 ? 'bg-orange-400' : 'bg-green-500'}`} 
                    style={{ width: `${lesion.severity}%` }}
                   />
                 </div>
                 <span className="text-xs text-slate-500 font-medium">{lesion.severity}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {lesion.location}
            </p>

            <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 leading-relaxed border border-slate-100">
              <strong className="text-slate-700">Treatment:</strong> {lesion.suggestion}
            </div>
          </div>
        );
      })}
    </div>
  );
};