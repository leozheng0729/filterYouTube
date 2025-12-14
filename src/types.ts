export interface TagInfo {
  color: string;
  value: string;
}
export interface FilterSettings {
  keywords: TagInfo[];
  channels: TagInfo[];
  disabled: boolean;
  mode: string;
}

export const DEFAULT_SETTINGS: FilterSettings = {
  keywords: [],
  channels: [],
  disabled: false,
  mode: "",
};