import type { TagInfo } from "~types"

;(function () {
  "use strict"

  // 配置选择器
  const SELECTORS = {
    videoContainers: "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-reel-item-renderer, ytd-search-pyv-renderer, ytd-ad-slot-renderer",
    videoTitles: "#video-title, .ytd-video-meta-block #video-title, h3 a, #video-title-link",
    channelNames: '#channel-name, .ytd-channel-name a, #byline a, ytd-channel-name a, .ytd-video-meta-block #channel-name, #channel-info #channel-name, [class*="channel"] a',
    shortsShelf: 'ytd-rich-shelf-renderer:has(#title-text #title:contains("Shorts"))',
    shortsShelfFallback: "ytd-rich-shelf-renderer",
    shortsTitle: "#title-text"
  }

  // Enhanced state variables
  let filterSettings = {
    keywords: [],
    channels: [],
    mode: "include",
    disabled: false,
    matchType: "contains", // "contains", "exact", "whole-word" / 固定值
    channelFilterType: "include", // "include" or "exclude" / 固定值
  }
  let filterEnabled = !filterSettings.disabled // 是否启动
  let observer = null
  let filterTimeout = null

  // 初始化
  async function init() {
    try {
      await loadSettings()
      addHighlightStyles()

      setTimeout(() => {
        applyFilter()
        setupObserver()
      }, 500)
    } catch (error) {}
  }

  // Load enhanced settings from storage
  async function loadSettings() {
    try {
      const data = await chrome.storage.sync.get([
        "filterSettings",
        // "keywords", // 关键字列表
        // "channels", // 频道列表
        // "filterMode", // 过滤模式
        // "matchType", // 匹配模式
        // "filterEnabled", // 过滤启用状态
        // "durationFilters",
        // "scheduleSettings"
      ]);
      const newSettings = data.filterSettings;
      const extractedData = {
        channels: newSettings.channels.map((item: TagInfo) => item.value),
        keywords: newSettings.keywords.map((item: TagInfo) => item.value),
        disabled: newSettings.disabled,
        mode: newSettings.mode
      };
      
      filterSettings = { ...filterSettings, ...extractedData };
      filterEnabled = filterSettings.disabled === false;

      // 清除所有高亮文本
      if (extractedData.keywords.length === 0 && extractedData.channels.length === 0 || filterSettings.disabled) {
        removeHighlights();
      }
    } catch (error) {}
  }

  // Enhanced apply filter function
  function applyFilter() {
    requestAnimationFrame(() => {
      try {
        if (!filterEnabled) {
          showAllVideos()
          showAllSections()
          return
        }

        const videoContainers = document.querySelectorAll(
          SELECTORS.videoContainers
        )
        let hiddenCount = 0
        let shownCount = 0

        // Process in batches for better performance
        const batchSize = 10
        let currentIndex = 0

        const processBatch = () => {
          const endIndex = Math.min(
            currentIndex + batchSize,
            videoContainers.length
          )

          for (let i = currentIndex; i < endIndex; i++) {
            const container = videoContainers[i] as HTMLElement
            const videoData = extractVideoData(container)
            if (shouldShowVideo(videoData)) {
              showVideo(container)
              highlightMatches(videoData)
              shownCount++
            } else {
              hideVideo(container)
              hiddenCount++
            }
          }

          currentIndex = endIndex

          if (currentIndex < videoContainers.length) {
            requestAnimationFrame(processBatch)
          } else {
            hideEmptyShortsSections()
          }
        }

        processBatch()
      } catch (error) {
        console.error("Error applying filter:", error)
      }
    })
  }

  // 视频数据（标题/频道）提取
  function extractVideoData(container: Element) {
    try {
      // 获取标题
      const titleElement = container.querySelector(SELECTORS.videoTitles)
      const title = titleElement ? titleElement.textContent || "" : ""

      // 获取频道 - 尝试多种选择器和方法
      let channel = ""
      let channelElement = container.querySelector(SELECTORS.channelNames)

      if (channelElement) {
        channel = channelElement.textContent || ""
      } else {
        const altSelectors = [
          "ytd-channel-name yt-formatted-string",
          '[class*="channel-name"]',
          '[aria-label*="channel"]',
          'a[href*="/@"]',
          'a[href*="/channel/"]',
          'a[href*="/c/"]',
          'a[href*="/user/"]'
        ]

        for (const selector of altSelectors) {
          const element = container.querySelector(selector)
          if (element) {
            channel = element.textContent || ""
            channelElement = element
            if (channel.trim()) break
          }
        }
      }

      // Debug logging
      return {
        title: title.trim(),
        channel: channel.trim(),
        titleElement: titleElement,
        channelElement: channelElement
      }
    } catch (error) {
      return { title: "", channel: "", titleElement: null, channelElement: null }
    }
  }

  // 判断视频是否显示
  function shouldShowVideo(videoData: { title: string; channel: string }) {
    try {
      const keywordMatch = checkKeywordMatch(videoData.title, videoData.channel)
      const channelMatch = checkChannelMatch(videoData.channel)

      // 没有设置过滤条件时，显示所有视频
      if (
        filterSettings.keywords.length === 0 &&
        filterSettings.channels.length === 0
      ) {
        return true
      }

      // 综合关键字和频道匹配结果
      const hasMatch = keywordMatch || channelMatch

      if (filterSettings.mode === "exclude") {
        if (
          filterSettings.keywords.length > 0 ||
          filterSettings.channels.length > 0
        ) {
          const shouldShow = !hasMatch
          return shouldShow
        } else {
          return true
        }
      } else {
        const shouldShow = hasMatch
        return shouldShow
      }
    } catch (error) {
      return true
    }
  }

  // 判断关键字匹配
  function checkKeywordMatch(title: string, channel: string) {
    if (filterSettings.keywords.length === 0) return false
  
    const searchText = `${title} ${channel}`.toLowerCase()

    return filterSettings.keywords.some((keyword) => {
      const keywordLower = keyword.toLowerCase()

      switch (filterSettings.matchType) {
        case "exact":
          return searchText === keywordLower

        case "whole-word":
          const regex = new RegExp(
            `\\\\b${escapeRegex(keywordLower)}\\\\b`,
            "i"
          )
          return regex.test(searchText)

        case "contains":
        default:
          return searchText.includes(keywordLower)
      }
    })
  }

  // 判断频道匹配
  function checkChannelMatch(channel: string) {
    if (filterSettings.channels.length === 0) return false

    const channelLower = channel.toLowerCase()

    const hasMatch = filterSettings.channels.some((c: string) => {
      const filterLower = c.toLowerCase()
      const match = channelLower.includes(filterLower)
      return match
    })

    // 处理包括/排除逻辑
    if (filterSettings.channelFilterType === "exclude") {
      return !hasMatch
    } else {
      return hasMatch
    }
  }

  // 在标题和频道中高亮匹配的关键字
  function highlightMatches(videoData: { title: string; channel: string; titleElement: Element; channelElement: Element }) {
    if (filterSettings.mode === "exclude") return

    const { titleElement, channelElement, title, channel } = videoData

    if (titleElement && title && checkKeywordMatch(title, "")) {
      highlightKeywords(titleElement, title)
    }

    if (channelElement && channel && checkKeywordMatch("", channel)) {
      highlightKeywords(channelElement, channel)
    }
  }

  // 高亮关键字
  function highlightKeywords(element: Element, text: string) {
    if (!text || filterSettings.keywords.length === 0) return

    let highlightedText = text
    filterSettings.keywords.forEach((keyword) => {
      if (keyword.trim()) {
        const regex = new RegExp(`(${escapeRegex(keyword)})`, "gi")
        highlightedText = highlightedText.replace(
          regex,
          '<span class="tubefiltr-highlight">$1</span>'
        )
      }
    })

    if (highlightedText !== text) {
      element.innerHTML = highlightedText
    }
  }

  // 去除所有高亮关键字
  function removeHighlights() {
    const highlightedElements = document.querySelectorAll('.tubefiltr-highlight')
    
    highlightedElements.forEach((highlightElement) => {
      const parent = highlightElement.parentElement
      if (parent) {
        // 获取高亮文本内容
        const highlightText = highlightElement.textContent || ''
        
        // 创建文本节点替换高亮元素
        const textNode = document.createTextNode(highlightText)
        parent.replaceChild(textNode, highlightElement)
        
        // 如果父元素只剩下文本节点，恢复原始文本内容
        if (parent.childNodes.length === 1 && parent.childNodes[0].nodeType === Node.TEXT_NODE) {
          parent.textContent = parent.textContent
        }
      }
    })
  }

  // 隐藏视频
  function hideVideo(container: HTMLElement) {
    container.style.display = "none"
    container.setAttribute("data-tubefiltr-hidden", "true")
  }

  // 移除隐藏
  function showVideo(container: HTMLElement) {
    container.style.display = ""
    container.removeAttribute("data-tubefiltr-hidden")
  }

  // 显示所有视频
  function showAllVideos() {
    const hiddenContainers = document.querySelectorAll(
      '[data-tubefiltr-hidden="true"]'
    )
    hiddenContainers.forEach((container: HTMLElement) => {
      showVideo(container)
    })
  }

  // 查找所有Shorts货架
  function hideEmptyShortsSections() {
    const allShelves = document.querySelectorAll(SELECTORS.shortsShelfFallback)

    allShelves.forEach((shelf: HTMLElement) => {
      const titleElement = shelf.querySelector(SELECTORS.shortsTitle)

      if (titleElement) {
        const titleText = titleElement.textContent || ""

        if (titleText.toLowerCase().includes("shorts")) {
          const visibleVideos = shelf.querySelectorAll(
            `${SELECTORS.videoContainers}:not([data-tubefiltr-hidden=\"true\"])`
          )

          if (visibleVideos.length === 0) {
            shelf.style.display = "none"
            shelf.setAttribute("data-tubefiltr-section-hidden", "true")
          } else {
            shelf.style.display = ""
            shelf.removeAttribute("data-tubefiltr-section-hidden")
          }
        }
      }
    })
  }

  function showAllSections() {
    const hiddenSections = document.querySelectorAll(
      '[data-tubefiltr-section-hidden="true"]'
    )
    hiddenSections.forEach((section: HTMLElement) => {
      section.style.display = ""
      section.removeAttribute("data-tubefiltr-section-hidden")
    })
  }

  // 添加高亮样式
  function addHighlightStyles() {
    if (!document.getElementById("tubefiltr-styles")) {
      const style = document.createElement("style")
      style.id = "tubefiltr-styles"
      style.textContent = `
                .tubefiltr-highlight {
                    background: linear-gradient(120deg, #fff3cd 0%, #ffeaa7 100%);
                    color: #856404;
                    padding: 1px 3px;
                    border-radius: 3px;
                    font-weight: 600;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
            `
      document.head.appendChild(style)
    }
  }

  function escapeRegex(string: string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")
  }

  // 设置 MutationObserver
  // 监听网页DOM结构的变化, 触发延迟执行的过滤函数
  function setupObserver() {
    if (observer) {
      observer.disconnect() // 先断开旧的观察者
    }

    observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some((mutation) => {
        // 有子节点被添加或移除
        if (mutation.type === "childList") {
          return Array.from(mutation.addedNodes).some((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              return (
                element.matches(SELECTORS.videoContainers) ||
                element.querySelector(SELECTORS.videoContainers)
              )
            }
            return false
          })
        }
        return false
      })

      if (hasRelevantChanges) {
        clearTimeout(filterTimeout)
        filterTimeout = setTimeout(() => {
          applyFilter()
        }, 300)
      }
    })

    observer.observe(document.body, {
      childList: true, // 观察目标节点的子节点变化（添加、删除）
      subtree: true // 观察目标节点所有后代节点
    })
  }

  // 监听来自popup的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "refreshFilter") {
      if (message.settings) {
        filterSettings = { ...filterSettings, ...message.settings }
      }
      loadSettings()
        .then(() => {
          applyFilter()
          sendResponse({ success: true })
        })
        .catch((error) => {
          console.error("Failed to refresh filter settings:", error)
          sendResponse({ success: false })
        })
      return true
    }
  })

  // 监听存储变化
  // chrome.storage.onChanged.addListener((changes, namespace) => {
  //   if (namespace === "sync") {
  //     if (changes.filterSettings) {
  //       filterSettings = {
  //         ...filterSettings,
  //         ...changes.filterSettings.newValue
  //       }
  //       // 开关
  //       filterEnabled = changes.filterSettings.newValue.disabled === false
  //     }

  //     // Legacy compatibility
  //     if (changes.keywords) {
  //       filterSettings.keywords = changes.keywords.newValue || []
  //     }

  //     // 过滤内容
  //     applyFilter()
  //   }
  // })

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
