import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import supabase from '~core/supabase';

import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Input, Card, Form, Divider, Flex } from 'antd';

import GoogleAuthLogin from '~components/google-auth-login';
import CustomFullScreenLoading from "~components/custom-loading";

import './login.css';

const IndexOptions = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
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

  return (
    <main className="login-wrapper">
      <div className="login-inner">
        {/** Loading */}
        <CustomFullScreenLoading visible={pageLoading} />

        {/** 已登录 */}
        {user && !pageLoading && (
          <Flex justify="space-between" align="left" vertical={true} style={{ width: '80%' }}>
            <h1 className="module-title">Account Information</h1>
            <Card>
              <Flex justify="space-between" align="center">
                <div>
                  <span>Username</span>
                  <p>{user.email}</p>
                </div>
                <Button
                  variant="solid"
                  color="default"
                  onClick={() => {
                    supabase.auth.signOut()
                    setUser(null)
                  }}
                  icon={<LogoutOutlined />}
                >Logout</Button>
              </Flex>
            </Card>
            <h1>订阅</h1>
            <Card>
              <Button onClick={subscription}>$6/year</Button>
            </Card>
          </Flex>
        )}
        {/** 登录中 */} 
        {!user && !pageLoading && (
          <Card style={{ width: 360, borderRadius: 2 }}>
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
                  style={{ borderRadius: 2 }}
                  placeholder='email format is incorrect'
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password
                  style={{ borderRadius: 2 }}
                  placeholder='Please enter password'
                  iconRender={(visible) => 
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{ borderRadius: 2 }}
                  icon={loginLoading ? <LoadingOutlined /> : ''}
                  block
                >
                  Login
                </Button>
                <Flex justify="space-between" align="center" style={{ height: 40 }}>
                  <p style={{ color: '#666', opacity: .5 }}>New users will be automatically registered.</p>
                  <p style={{ color: 'red' }}>{errorInfo}</p>
                </Flex>
              </Form.Item>
        
              <Divider style={{ color: '#666', fontSize: 14 }}>or</Divider>

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
                style={{ marginTop: 16 }}
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