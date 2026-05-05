export enum AppScreen {
  SPLASH = 'SPLASH',
  ERA_SELECTION = 'ERA_SELECTION',
  CAMERA = 'CAMERA',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export enum EraId {
  TAHRIR = 'tahrir',
  NILE = 'nile',
  DOWNTOWN = 'downtown',
  TOWER = 'tower',
  KHAN = 'khan',
}

export interface EraData {
  id: EraId;
  name: string;
  nameAr: string;
  description: string;
  promptInstructions: string;
}


export interface FaceDetectionResult {
  maleCount: number;
  femaleCount: number;
  childCount: number;
  totalPeople: number;
}