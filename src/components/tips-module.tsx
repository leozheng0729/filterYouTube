import { Button, Flex } from "antd";


const TipsModule = () => {
  const a = 1;

  return (
    <Flex justify="center" style={{ minHeight: 271 }} vertical>
      {/* <Button type="primary" danger size="large" style={{ cursor: 'pointer', borderRadius: 2 }}>
        Sign In
      </Button> */}

      <Button type="primary" danger size="large" style={{ cursor: 'pointer', borderRadius: 2 }}>
        Get Started ($6)
      </Button>
      <Button type="text" disabled>One-time payment. Lifetime access. No subscription</Button>

    </Flex>
  )
}

export default TipsModule;