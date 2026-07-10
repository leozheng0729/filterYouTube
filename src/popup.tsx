import { useEffect, useState } from "react";
import { Flex, Switch, Tag, Tooltip, Typography } from "antd";
import { CrownFilled } from "@ant-design/icons";

import TipsModule from "~components/tips-module";
import CustomFullScreenLoading from "~components/custom-loading";
import { getCurrentUser } from "~core/supabase";
import { getSubscriptionStatus } from "~core/subscribe";

import {
  DEFAULT_SETTINGS,
  UPGRADE_TOOLTIP,
  buildUpgradeUrl,
  type FilterSettings,
  type ToggleableKey,
} from "./types";

import "./popup.css";

const { Text } = Typography;

//  产品ID 和 表名
const PRODUCT_PRICE_ID = "prod_Tim4FRzSXsjCWD"
const PRODUCT_TABLE = "product_filtervideo"

/** 单个功能开关行 */
const FeatureSwitch = ({
  label,
  checked,
  disabled = false,
  onChange,
  tooltip,
  proTag = false,
  onProClick,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  proTag?: boolean;
  onProClick?: () => void;
}) => (
  <Flex align="center" gap={8}>
    <Tooltip title={tooltip}>
      <Switch size="small" checked={checked} disabled={disabled} onChange={onChange} />
    </Tooltip>
    <Text className="popup-switch-label">{label}</Text>
    {proTag && (
      <Tag color="#ff4d4f" className="popup-pro-tag" onClick={onProClick}>
        <CrownFilled className="popup-pro-icon" />
        PRO
      </Tag>
    )}
  </Flex>
);

function IndexPopup() {
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [isPaid, setIsPaid] = useState(false);

  /** 保存设置并通知 Content Script */
  const saveSettings = (next: FilterSettings) => {
    setSettings(next);
  };

  /** 打开 Stripe 支付链接（已登录时带 client_reference_id 与 prefilled_email） */
  const openUpgradePage = () => {
    window.open(buildUpgradeUrl(user), "_blank");
  };

  /** 通用切换：Remove Ads 需付费拦截 */
  const toggleFeature = (key: ToggleableKey, checked: boolean) => {
    if (key === "removeAds" && !isPaid) return openUpgradePage();
    saveSettings({ ...settings, [key]: checked });
  };

  /** 拉取当前用户 + 订阅状态（登录成功后可再次调用以刷新页面数据） */
  const loadUser = async () => {
    try {
      const userInfo = await getCurrentUser();
      setUser(userInfo || null);
      if (userInfo) {
        const sub = await getSubscriptionStatus({
          "email": userInfo.email || "",
          "productPriceId": PRODUCT_PRICE_ID,
          "productTable": PRODUCT_TABLE,
        });
        setIsPaid((sub?.length ?? 0) > 0);
      } else {
        setIsPaid(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="popup-container">
      <CustomFullScreenLoading visible={pageLoading} />
      {!pageLoading && (
        <Flex vertical gap={12}>
          <Flex justify="space-between" align="center" className="popup-switches">
            <FeatureSwitch
              label="Remove Ads"
              checked={isPaid && settings.removeAds}
              disabled={!isPaid}
              tooltip={isPaid ? "" : UPGRADE_TOOLTIP}
              proTag={!isPaid}
              onProClick={openUpgradePage}
              onChange={(v) => toggleFeature("removeAds", v)}
            />
            <FeatureSwitch
              label="Remove Shorts"
              checked={settings.removeShorts}
              onChange={(v) => toggleFeature("removeShorts", v)}
            />
          </Flex>

          {!isPaid && <TipsModule user={user} onLoginSuccess={loadUser} />}
        </Flex>
      )}
    </div>
  );
}

export default IndexPopup;
