import { Button, Flex } from "antd";


const TipsModule = () => {

  // 登录操作
  const handleLoginClick = () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('/tabs/login.html')
    })
  }

  return (
    <Flex justify="center" style={{ minHeight: 271 }} vertical>
      <Button type="primary" danger size="large" style={{ cursor: 'pointer', borderRadius: 2 }} onClick={handleLoginClick}>
        Sign In
      </Button>

      {/* <Button type="primary" danger size="large" style={{ cursor: 'pointer', borderRadius: 2 }} onClick={handleGetStartedClick}>
        Get Started ($6)
      </Button>
      <Button type="text" disabled>One-time payment. Lifetime access. No subscription</Button> */}

    </Flex>
  )
}

export default TipsModule;