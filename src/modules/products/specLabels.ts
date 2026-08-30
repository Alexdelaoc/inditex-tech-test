import type { ProductSpecs } from '@/lib/api/types';

export const SPEC_LABELS: Record<keyof ProductSpecs, string> = {
  screen: 'Screen',
  resolution: 'Resolution',
  processor: 'Processor',
  mainCamera: 'Main camera',
  selfieCamera: 'Selfie camera',
  battery: 'Battery',
  os: 'Operating system',
  screenRefreshRate: 'Screen refresh rate',
};
