import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import supabase, { signOut } from '~core/supabase';

import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined, LogoutOutlined, CrownOutlined, RocketOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Button, Input, Card, Form, Divider, Flex, Steps, Space, Typography, Badge } from 'antd';

import { createStyles } from 'antd-style';

import iconBase64FilterFill from "data-base64:~/image/filter-fill.png";
import iconBase64SaveTime from "data-base64:~/image/save-time.png";
import iconBase64PrivacyBan from "data-base64:~/image/privacy-ban.png";
import iconBase64LightFast from "data-base64:~/image/light-fast.png";
import iconBase64Header from "data-base64:~/image/logo.png";
import iconBase64Show from "data-base64:~/image/show.png";

import GoogleAuthLogin from '~components/google-auth-login';
import CustomFullScreenLoading from "~components/custom-loading";

import './login.css';

const { Title, Text } = Typography;

const useStyles = createStyles(({ token }) => ({
  root: {
    border: `2px dashed ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    padding: token.padding,
  },
  premiumButton: {
    background: 'linear-gradient(135deg, #ff6b35, #f7931e, #ff4d4f)',
    border: 'none',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
    '&:hover': {
      background: 'linear-gradient(135deg, #ff4d4f, #ff6b35, #f7931e)',
      boxShadow: '0 6px 20px rgba(255, 107, 53, 0.6)',
      transform: 'translateY(-2px)',
    },
  },
  featureCard: {
    background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(40, 40, 40, 0.8))',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },
}));

const IndexOptions = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const { styles } = useStyles();
  const [current, setCurrent] = useState(0);
  const [user, setUser] = useStorage<User>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })
  const [loginForm] = Form.useForm();

  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        return
      }
      if (!!data.session) {
        setUser(data.session.user)
      }
      setPageLoading(false);
    }
    init();
  }, [])

  // 登录回调
  const handleEmailLogin = async () => {
    const username = loginForm.getFieldValue('email');
    const password = loginForm.getFieldValue('password');
    if (!username || !password) {
      return;
    }
    setLoginLoading(true);
    try {
      const {
        error,
        data: { user }
      } = await supabase.auth.signInWithPassword({ email: username, password });
      if (error) {
        // 01. 登录错误
        if (error.message === 'Invalid login credentials' && !user) {
          const {
            error,
            data: { user }
          } = await supabase.auth.signUp({ email: username, password });
          
          // 注册失败提示
          if (error) {
            console.error(error);
            setErrorInfo('error');
            setLoginLoading(false);
            return;
          }

          // 已注册用户
          if (user && user.identities.length === 0) {
            console.log('密码错误');
            setErrorInfo('error');
            setLoginLoading(false);
            return;
          }
          
          // 注册后登录成功
          console.log(`注册后登录成功：${user}`);
          setUser(user);
        }
      } else {
        console.log(`直接登录成功：${user}`);
        setUser(user);
      }
    } catch (error) {
      console.log(`Login failed: ${error.message}`);
    }
    setLoginLoading(false);
  }

  // 登录成功回调
  const handleGoogleLoginSuccess = (userInfo: User) => {
    setUser(userInfo);
  }

  // 登录失败回调
  const handleGoogleLoginError = (errorMessage: string) => {
    setErrorInfo(errorMessage);
  }

  // 订阅内容
  const subscription = async () => {
    try {
        if (user.id && user.email) {
          window.open(
            `${process.env.PLASMO_PUBLIC_STRIPE_LINK}?client_reference_id=${
              user.id
            }&prefilled_email=${encodeURIComponent(user.email)}`,
            "_blank"
          )
        }
    } catch (error) {
      console.log(error);
    }
  }

  // 跳转视频页
  const handleVideoPage = () => {
    window.open('https://www.youtube.com/watch?v=gElydPOExYU', '_blank')
  }

  return (
    <main className={`login-wrapper ${user ? '' : 'no-login'}`}>
      <div className="login-inner">
        
        {/** Loading */}
        <CustomFullScreenLoading visible={pageLoading} />

        {/** 已登录 */}
        {user && !pageLoading && (<>
          <Card className="card-fix">
            <Flex justify="space-between" align="center">
              <p>{user.email}</p><LogoutOutlined onClick={async () => {
                await signOut();
                setUser(null)
              }} style={{ cursor: 'pointer' }}/>
            </Flex>
          </Card>
          <div className="main-color-pic1"></div>
          <div className="main-color-pic2"></div>
          <Flex justify="space-between" align="left" vertical={true} style={{ width: '80%', paddingTop: 120, zIndex: 1 }} className="main-flex">
            <Flex justify="center" align="center" style={{ marginBottom: 24 }} vertical={true} gap="large">
              <img src={iconBase64Header} style={{ width: 128 }}/>
              <Title level={1} style={{ fontSize: 56, color: '#fff', textAlign: 'center', margin: 0 }}>
                Take Control of Your YouTube Feed
              </Title>
              <Text style={{ fontSize: 18, color: '#ccc', textAlign: 'center', maxWidth: 600 }}>
                Filter out content you don't want to see and regain control of your time. 
                This Chrome extension lets you view the content you want more efficiently.
              </Text>
            </Flex>
            <Flex justify="center" align="center" style={{ marginBottom: 40 }}>
              <Space size="large">
                <div style={{ position: 'relative' }}>
                  <Badge.Ribbon 
                    text="Lifetime Access" 
                    color="#ff4d4f"
                    style={{ 
                      top: '-8px',
                      right: '-8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    <Button
                      className={styles.premiumButton}
                      size="large"
                      onClick={subscription}
                      icon={<CrownOutlined />}
                      style={{ 
                        height: 60,
                        padding: '0 32px',
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginTop: '8px'
                      }}
                    >
                      Upgrade Now - $6
                    </Button>
                  </Badge.Ribbon>
                </div>
                <Button
                  type="default"
                  size="large"
                  variant="outlined"
                  onClick={handleVideoPage}
                  icon={<RocketOutlined />}
                  style={{ 
                    height: 60,
                    padding: '0 32px',
                    fontSize: 16,
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    background: 'rgba(255, 107, 53, 0.1)',
                    fontWeight: 'bold'
                  }}
                >
                  Watch Demo
                </Button>
              </Space>
            </Flex>
            <img src={iconBase64Show} className="show-main-pic" />
            
            <Title level={2} style={{ color: '#fff', marginTop: 60, textAlign: 'center' }}>
              How It Works in 4 Simple Steps
            </Title>
            
            <Flex vertical gap="large" style={{ 
              background: 'linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(30, 30, 30, 0.95))', 
              margin: '30px 0 50px', 
              padding: 40, 
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }} className="process-item">
              <Steps
                type="navigation"
                size="default"
                current={current}
                labelPlacement="vertical"
                className="custom-steps"
                items={[
                  {
                    title: <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Complete Payment</span>,
                    description: <span style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.5' }}>Secure one-time payment for lifetime access</span>,
                    icon: <SafetyCertificateOutlined style={{ color: '#ff6b35', fontSize: '20px' }} />,
                  },
                  {
                    title: <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Install Extension</span>,
                    description: <span style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.5' }}>Quick installation from Chrome Web Store</span>,
                    icon: <RocketOutlined style={{ color: '#f7931e', fontSize: '20px' }} />,
                  },
                  {
                    title: <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Login</span>,
                    description: <span style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.5' }}>Access with your registered email</span>,
                    icon: <ThunderboltOutlined style={{ color: '#7e22ce', fontSize: '20px' }} />,
                  },
                  {
                    title: <span style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>Enjoy Clean Feed</span>,
                    description: <span style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.5' }}>Customize filters and enjoy distraction-free YouTube</span>,
                    icon: <CrownOutlined style={{ color: '#10b981', fontSize: '20px' }} />,
                  },
                ]}
                />
            </Flex>
            
            <Title level={2} style={{ color: '#fff', textAlign: 'center' }}>
              Premium Features You'll Love
            </Title>
            
            <Flex justify="space-between" align="stretch" style={{ margin: '30px 0' }} gap="large">
              <Card className={styles.featureCard} style={{ width: '48%', padding: 24 }}>
                <Flex justify="start" align="start" vertical={true} gap="middle">
                  <Flex align="center" gap="small">
                    <img src={iconBase64FilterFill} width="48"/>
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>Smart Filtering</Title>
                  </Flex>
                  <Text style={{ color: '#ccc', lineHeight: 1.6 }}>
                    Block videos by keywords, channels, or topics automatically with our advanced AI-powered filtering system
                  </Text>
                </Flex>
              </Card>
              <Card className={styles.featureCard} style={{ width: '48%', padding: 24 }}>
                <Flex justify="start" align="start" vertical={true} gap="middle">
                  <Flex align="center" gap="small">
                    <img src={iconBase64SaveTime} width="48"/>
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>Save Time</Title>
                  </Flex>
                  <Text style={{ color: '#ccc', lineHeight: 1.6 }}>
                    Stop wasting time scrolling through irrelevant content. Focus on what truly matters with personalized content curation
                  </Text>
                </Flex>
              </Card>
            </Flex>
            
            <Flex justify="space-between" align="stretch" style={{ marginBottom: 60 }} gap="large">
              <Card className={styles.featureCard} style={{ width: '48%', padding: 24 }}>
                <Flex justify="start" align="start" vertical={true} gap="middle">
                  <Flex align="center" gap="small">
                    <img src={iconBase64PrivacyBan} width="48"/>
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>Privacy First</Title>
                  </Flex>
                  <Text style={{ color: '#ccc', lineHeight: 1.6 }}>
                    All filtering happens locally on your device. Your data never leaves your browser - complete privacy guaranteed
                  </Text>
                </Flex>
              </Card>
              <Card className={styles.featureCard} style={{ width: '48%', padding: 24 }}>
                <Flex justify="start" align="start" vertical={true} gap="middle">
                  <Flex align="center" gap="small">
                    <img src={iconBase64LightFast} width="48"/>
                    <Title level={3} style={{ color: '#fff', margin: 0 }}>Lightning Fast</Title>
                  </Flex>
                  <Text style={{ color: '#ccc', lineHeight: 1.6 }}>
                    Instant filtering with zero impact on YouTube performance. Enjoy seamless browsing without any lag or delays
                  </Text>
                </Flex>
              </Card>
            </Flex>
            
            {/** 限时优惠提示 */}
            <Card style={{ 
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
              border: '1px solid rgba(255, 107, 53, 0.3)',
              borderRadius: 12,
              marginBottom: 40
            }}>
              <Flex justify="center" align="center" vertical>
                <Title level={4} style={{ color: '#ff6b35', margin: 0 }}>
                  🎁 Limited Time Offer
                </Title>
                <Text style={{ color: '#ccc', textAlign: 'center' }}>
                  Get lifetime access for just $6 - a one-time payment with no recurring fees!
                </Text>
              </Flex>
            </Card>
          </Flex></>
        )}
        
        {/** 登录中 */} 
        {!user && !pageLoading && (
          <Card style={{ 
            width: 400, 
            borderRadius: 16,
            background: 'rgba(45, 45, 45, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <Flex justify="center" style={{ marginBottom: 24 }}>
              <img src={iconBase64Header} width={64} />
            </Flex>
            
            <Form
              form={loginForm}
              onFinish={handleEmailLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'email format is incorrect' }
                ]}
              >
                <Input 
                  style={{ borderRadius: 8 }}
                  placeholder='Enter your email'
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password
                  style={{ borderRadius: 8 }}
                  placeholder='Enter your password'
                  iconRender={(visible) => 
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ 
                    borderRadius: 8,
                    height: 48,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                  icon={loginLoading ? <LoadingOutlined /> : ''}
                  block
                >
                  {loginLoading ? 'Signing In...' : 'Sign In / Sign Up'}
                </Button>
                <Flex justify="space-between" align="center" style={{ height: 40, marginTop: 12 }}>
                  <Text style={{ color: '#666', fontSize: 12 }}>New users will be automatically registered</Text>
                  <Text style={{ color: 'red' }}>{errorInfo}</Text>
                </Flex>
              </Form.Item>
        
              <Divider style={{ color: '#666', fontSize: 14 }}>or continue with</Divider>

              {/** Google登录 */}
              <GoogleAuthLogin
                onLoginSuccess={handleGoogleLoginSuccess}
                onLoginError={handleGoogleLoginError}
              />

              <Button 
                type="text"
                block
                size="small"
                disabled={true}
                style={{ marginTop: 16, color: '#666' }}
              >
                Forget Password?
              </Button>
            </Form>
          </Card>
        )}
      </div>
    </main>
  )
}

export default IndexOptions