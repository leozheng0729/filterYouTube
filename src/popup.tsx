import { useEffect, useState, useRef } from "react"
import { Button, Flex, Radio, Space, Alert } from 'antd';
import Keywords from "~components/keywords";
import Channels from "~components/channelwords";
import TipsModule from "~components/tips-module";

import { type FilterSettings, DEFAULT_SETTINGS } from "./types"

import './popup.css';

import type { CheckboxGroupProps } from 'antd/es/checkbox';

const options: CheckboxGroupProps<string>['options'] = [
  { label: 'Include', value: 'include' },
  { label: 'Exclude', value: 'exclude' },
];
interface TipMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | '';
}

function IndexPopup() {
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
        mode: newSettings.mode
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

  // 初始化加载设置
  useEffect(() => {
    chrome.storage.sync.get(['filterSettings'], (result) => {
      if (result.filterSettings && result.filterSettings?.mode !== '') {
        setSettings(result.filterSettings);
        return;
      }
      setSettings({ ...DEFAULT_SETTINGS, mode: 'include' });
    });
  }, []);

  return (
    <div className="popup-container">
      {
        showModule !== 'payed' && (
          <TipsModule />
        )
      }
      {
        showModule === 'payed' && (
          <Flex justify="center" vertical>
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
