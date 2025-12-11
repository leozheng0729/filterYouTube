import { useEffect, useState } from "react"
import { type FilterSettings, DEFAULT_SETTINGS } from "./types"

function IndexPopup() {
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [inputValue, setInputValue] = useState('');

  // 1. 初始化加载设置
  useEffect(() => {
    chrome.storage.sync.get(['filterSettings'], (result) => {
      if (result.filterSettings) {
        setSettings(result.filterSettings);
      }
    });
  }, []);

  // 2. 保存设置并通知 Content Script
  const saveSettings = (newSettings: FilterSettings) => {
    setSettings(newSettings);
    chrome.storage.sync.set({ filterSettings: newSettings }, () => {
      // 通知当前标签页刷新
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', settings: newSettings });
        }
      });
    });
  };

  const addKeyword = () => {
    if (inputValue && !settings.keywords.includes(inputValue)) {
      const newKeywords = [...settings.keywords, inputValue];
      saveSettings({ ...settings, keywords: newKeywords });
      setInputValue('');
    }
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = settings.keywords.filter((k) => k !== keyword);
    saveSettings({ ...settings, keywords: newKeywords });
  };

  const toggleEnabled = () => {
    saveSettings({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div style={{ width: '300px', padding: '16px' }}>
      <h2>TubeFiltr Lite</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label>
          <input 
            type="checkbox" 
            checked={settings.enabled} 
            onChange={toggleEnabled} 
          /> 
          启用过滤
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="输入关键词..."
        />
        <button onClick={addKeyword}>添加</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {settings.keywords.map((kw) => (
          <li key={kw} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>{kw}</span>
            <button onClick={() => removeKeyword(kw)} style={{ color: 'red' }}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IndexPopup
