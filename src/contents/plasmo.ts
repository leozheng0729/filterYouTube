import type { PlasmoCSConfig } from "plasmo"
import { type FilterSettings, DEFAULT_SETTINGS } from "../types"

export const config: PlasmoCSConfig = {
  matches: ["https://www.youtube.com/*"]
}

window.addEventListener("load", () => {
  console.log("content script loaded")

  document.body.style.background = "pink"
})


// YouTube 视频容器选择器
const VIDEO_SELECTOR = 'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer';
const TITLE_SELECTOR = '#video-title';

let currentSettings: FilterSettings = DEFAULT_SETTINGS;
let observer: MutationObserver | null = null;
let filterTimeout: number | null = null;

// 初始化
const init = async () => {
  const result = await chrome.storage.sync.get(['filterSettings']);
  if (result.filterSettings) {
    currentSettings = result.filterSettings;
  }
  
  setupObserver();
  applyFilter();
};

// 应用过滤逻辑
const applyFilter = () => {
  if (!currentSettings.enabled) {
    showAllVideos();
    return;
  }

  const videos = document.querySelectorAll(VIDEO_SELECTOR);
  
  videos.forEach((video) => {
    const titleElement = video.querySelector(TITLE_SELECTOR);
    const title = titleElement?.textContent?.toLowerCase() || '';
    console.log('title============================', title);
    
    // 检查是否包含关键词
    const shouldHide = currentSettings.keywords.some((keyword) => 
      title.includes(keyword.toLowerCase())
    );

    const htmlVideo = video as HTMLElement;
    if (shouldHide) {
      htmlVideo.style.display = 'none';
    } else {
      htmlVideo.style.display = '';
    }
  });
};

// 显示所有视频（当插件禁用时）
const showAllVideos = () => {
  const videos = document.querySelectorAll(VIDEO_SELECTOR);
  videos.forEach((video) => {
    (video as HTMLElement).style.display = '';
  });
};

// 设置 MutationObserver 监听 DOM 变化
const setupObserver = () => {
  if (observer) observer.disconnect();
  console.log('setupObserver============================');

  observer = new MutationObserver((mutations) => {
    // 简单的防抖，避免频繁触发
    if (filterTimeout) window.clearTimeout(filterTimeout);
    
    filterTimeout = window.setTimeout(() => {
      applyFilter();
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// 监听来自 Popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    currentSettings = message.settings;
    applyFilter();
  }
});

// 启动
init();