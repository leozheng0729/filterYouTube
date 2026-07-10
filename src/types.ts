export interface TagInfo {
  color: string;
  value: string;
}
export interface FilterSettings {
  keywords: TagInfo[];
  channels: TagInfo[];
  disabled: boolean;
  mode: string;
  removeAds: boolean;
  removeShorts: boolean;
}

export const DEFAULT_SETTINGS: FilterSettings = {
  keywords: [],
  channels: [],
  disabled: false,
  mode: "",
  removeAds: false,
  removeShorts: false,
};

/** Popup 中可以切换的功能开关 key */
export type ToggleableKey = "removeAds" | "removeShorts";

/** 未付费时 Remove Ads 的 Tooltip 文案 */
export const UPGRADE_TOOLTIP = "Upgrade to Pro to remove ads on YouTube";

/**
 * 构建 Stripe 支付链接（带用户信息）
 * - 已登录：附加 client_reference_id 与 prefilled_email
 * - 未登录：返回基础 Stripe 链接
 */
export const buildUpgradeUrl = (user?: { id?: string; email?: string } | null): string => {
  const base = process.env.PLASMO_PUBLIC_STRIPE_LINK || "";
  if (user?.id && user?.email) {
    return `${base}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
  }
  return base;
};