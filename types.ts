export interface Lesion {
  id: string;
  location: string;
  type: string;
  severity: number; // 0-100
  suggestion: string;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface AnalysisResult {
  overallScore: number; // 0-100 (0 = clear, 100 = severe)
  summary: string;
  lesions: Lesion[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}