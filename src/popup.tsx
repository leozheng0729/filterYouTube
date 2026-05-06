import { useEffect, useState, useRef } from "react"
import { Button, Flex, Radio, Space, Alert, Typography, Switch } from 'antd';
import { SettingOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import Keywords from "~components/keywords";
import Channels from "~components/channelwords";
import TipsModule from "~components/tips-module";
import CustomFullScreenLoading from "~components/custom-loading";

import { type FilterSettings, DEFAULT_SETTINGS } from "./types"

import './popup.css';

import type { CheckboxGroupProps } from 'antd/es/checkbox';
import { getCurrentUser } from "~core/supabase";
import { getSubscriptionStatus } from "~core/subscribe";

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'Include', value: 'include' },
  { label: 'Exclude', value: 'exclude' },
];
interface TipMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | '';
}

const { Text } = Typography;

function IndexPopup() {
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [tipMessage, setTipMessage] = useState<TipMessage>({ message: '', type: '' });
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const [showModule, setShowModule] = useState('');

  // 2. 保存设置并通知 Content Script
  const saveSettings = (newSettings: FilterSettings) => {
    setSettings(newSettings);
    chrome.storage.sync.set({ filterSettings: newSettings }, () => {
      const extractedData = {
        channels: newSettings.channels.map(item => item.value),
        keywords: newSettings.keywords.map(item => item.value),
        disabled: newSettings.disabled,
        mode: newSettings.mode,
        removeAds: newSettings.removeAds,
        removeShorts: newSettings.removeShorts
      };
      // 通知当前标签页刷新
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'refreshFilter', settings: extractedData });
        }
      });
    });
  };

  // 存储关键词
  const saveKeywords = (props: {}) => {
    const newSettings = { ...settings, ...props };
    saveSettings(newSettings);
  }

  // 提示信息
  const toggleTips = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 2000) => {
    if (!message || !type) return;
    
    setTipMessage({ message, type });
    
    timeRef.current && clearTimeout(timeRef.current);
    timeRef.current = setTimeout(() => {
      setTipMessage({ message: '', type: '' });
    }, duration);
    
    // 返回清理函数，供 useEffect 使用
    return () => clearTimeout(timeRef.current);
  }

  // 4. 设置Disabled状态
  const toggleDisabled = () => {
    const newSettings = { ...settings, disabled: !settings.disabled };
    saveSettings(newSettings);
    const status = newSettings.disabled ? 'disabled' : 'enabled';
    toggleTips(`Filtering has been ${status}`, `${status === 'disabled' ? 'warning' : 'success'}`);
  }

  // 5. 清除所有设置
  const clearAllSettings = () => {
    saveSettings({ ...DEFAULT_SETTINGS, mode: 'include' });
    toggleTips('All settings have been cleared', 'info');
  }

  // 6. 切换Mode
  const modeChange = (e: any) => {
    const newSettings = { ...settings, mode: e.target.value };
    saveSettings(newSettings);
    toggleTips(`Mode changed to ${e.target.value}`, 'info');
  }

  // 7. 切换 Remove Ads
  const toggleRemoveAds = (checked: boolean) => {
    const newSettings = { ...settings, removeAds: checked };
    saveSettings(newSettings);
    toggleTips(`Remove Ads ${checked ? 'enabled' : 'disabled'}`, checked ? 'success' : 'warning');
  }

  // 8. 切换 Remove Shorts
  const toggleRemoveShorts = (checked: boolean) => {
    const newSettings = { ...settings, removeShorts: checked };
    saveSettings(newSettings);
    toggleTips(`Remove Shorts ${checked ? 'enabled' : 'disabled'}`, checked ? 'success' : 'warning');
  }

  // 初始化加载设置
  useEffect(() => {
    chrome.storage.sync.get(['filterSettings'], (result) => {
      if (result.filterSettings && result.filterSettings?.mode !== '') {
        // 合并默认值，保证新增字段（如 removeAds/removeShorts）在老数据上有默认值（false）
        setSettings({ ...DEFAULT_SETTINGS, ...result.filterSettings });
        return;
      }
      setSettings({ ...DEFAULT_SETTINGS, mode: 'include' });
    });

    // 获取当前用户
    const getUserInfo = async () => {
      try {
        const userInfo = await getCurrentUser();
        userInfo && setUser(userInfo);
        const result = await getSubscriptionStatus(userInfo?.email || '');
        // console.log('Subscription status:', result);
        if (result && result.length > 0) {
          setShowModule('payed');
        }
      } catch (error) {
        console.log(error);
      }
      setPageLoading(false);
    }
    getUserInfo();
  }, []);

  return (
    <div className="popup-container">
      <CustomFullScreenLoading visible={pageLoading} />
      {
        showModule !== 'payed' && !pageLoading && (
          <TipsModule user={user} />
        )
      }
      {
        showModule === 'payed' && !pageLoading && (
          <Flex justify="center" vertical>
            <Flex justify="space-between" gap="4px" className="popup-footer">
              <Flex align="center" gap={4} style={{ cursor: 'pointer' }} onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSevEpeN1zjgZLMl5YeCGBOUZLoBTSLJLNzJF6MTExdfFEmZaQ/viewform', '_blank')}>
                <EditOutlined style={{ fontSize: '12px', color: '#707070' }} />
                <Text style={{ fontSize: '12px', color: '#707070' }}>反馈</Text>
              </Flex>
              <Flex align="center" gap={6}>
                <Text style={{ fontSize: '12px', color: '#b3b3b3' }}>Ver1.0.1</Text>
              </Flex>
            </Flex>
            <div
              className={`popup-status ${settings.disabled ? 'popup-status-disabled' : 'popup-status-enabled'}`}
              onClick={settings.disabled ? toggleDisabled : undefined}
              role={settings.disabled ? 'button' : undefined}
            >
              <span className="popup-status-dot" />
              {settings.disabled ? (
                <span className="popup-status-text">
                  Filtering is <b>disabled</b> — click here to enable
                </span>
              ) : (
                <span className="popup-status-text">
                  Filtering is <b>enabled</b>
                </span>
              )}
            </div>
            <Radio.Group
              block
              options={options}
              onChange={modeChange}
              value={settings.mode}
              optionType="button"
              buttonStyle="solid"
              className="popup-radio"
              size="large"
              style={{ width: '100%' }}
            />
            <Flex justify="space-between" align="center" className="popup-switches">
              <Flex align="center" gap={8}>
                <Switch size="small" checked={settings.removeAds} onChange={toggleRemoveAds} />
                <Text style={{ fontSize: '13px' }}>Remove Ads</Text>
              </Flex>
              <Flex align="center" gap={8}>
                <Switch size="small" checked={settings.removeShorts} onChange={toggleRemoveShorts} />
                <Text style={{ fontSize: '13px' }}>Remove Shorts</Text>
              </Flex>
            </Flex>
            <Space direction="vertical" style={{ width: '100%', marginTop: '12px' }} size="large">
              <Keywords toggleTips={toggleTips} keywords={settings.keywords} saveKeywords={saveKeywords} />
              <Channels toggleTips={toggleTips} channels={settings.channels} saveKeywords={saveKeywords} />
                <Space direction="horizontal" size="small" className="popup-actions">
                <Flex align="space-between" gap="small" style={{ width: '100%' }}>
                  <Button style={{ width: '100%' }} color="danger" variant="outlined" size="large" onClick={clearAllSettings}>Clear All</Button>
                  <Button style={{ width: '100%' }} color="danger" variant="solid" size="large" onClick={toggleDisabled}>Toggle Disabled</Button>
                </Flex>
              </Space>
              { tipMessage.message && tipMessage.type && <Alert message={tipMessage.message} type={tipMessage.type} /> }
            </Space>
          </Flex>
        )
      }
    </div>
  );
}

export default IndexPopup
