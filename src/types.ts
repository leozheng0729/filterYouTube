export interface FilterSettings {
  keywords: string[];
  enabled: boolean;
}

export const DEFAULT_SETTINGS: FilterSettings = {
  keywords: [],
  enabled: true,
};