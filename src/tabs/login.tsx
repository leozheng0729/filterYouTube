import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import supabase, { signOut } from '~core/supabase';

import { EyeInvisibleOutlined, EyeTwoTone, LoadingOutlined, LogoutOutlined, CrownOutlined, RocketOutlined, ChromeOutlined, LoginOutlined, VideoCameraOutlined, DollarOutlined, EyeOutlined, DatabaseOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { Button, Input, Card, Form, Divider, Flex, Space, Typography, Badge } from 'antd';

import { createStyles } from 'antd-style';

import iconBase64FilterFill from "data-base64:~/image/filter-fill.png";
import iconBase64SaveTime from "data-base64:~/image/save-time.png";
import iconBase64PrivacyBan from "data-base64:~/image/privacy-ban.png";
import iconBase64LightFast from "data-base64:~/image/light-fast.png";
import iconBase64Header from "data-base64:~/image/logo.png";
import iconBase64Show from "data-base64:~/image/show.png";
import iconBase64Slow from "data-base64:~/image/slow.png";

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
    background: 'linear-gradient(to right, #ff0000, #cc0022) !important',
    border: 'none',
    fontWeight: 'bold',
    color: '#fff !important',
    boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(to right, #ff0000, #cc0022) !important',
      boxShadow: '0 8px 25px rgba(255, 0, 0, 0.6)',
      transform: 'scale(1.08)',
    },
    '&:active': {
      transform: 'scale(1.04)',
    },
  },
  featuresSection: {
    padding: '60px 20px 40px',
    position: 'relative',
  },
  featuresKicker: {
    color: '#ff0000',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '2px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  featuresTitle: {
    color: '#fff !important',
    fontSize: '48px',
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 16px 0',
    lineHeight: 1.15,
  },
  featuresTitleHighlight: {
    background: 'linear-gradient(to right, #ff0000, #cc0022)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  },
  featuresSubtitle: {
    color: '#999',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '60px',
    maxWidth: '640px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  featureCard: {
    background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.85), rgba(20, 20, 20, 0.85))',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(to right, transparent, #ff0000, transparent)',
      opacity: 0,
      transition: 'opacity 0.4s ease',
    },
    '&:hover': {
      transform: 'translateY(-8px)',
      border: '1px solid rgba(255, 0, 0, 0.25)',
      boxShadow: '0 20px 50px rgba(255, 0, 0, 0.15), 0 0 0 1px rgba(255, 0, 0, 0.1)',
    },
    '&:hover::before': {
      opacity: 1,
    },
  },
  featureIconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.15), rgba(204, 0, 34, 0.05))',
    border: '1px solid rgba(255, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
    boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
    transition: 'all 0.3s ease',
  },
  featureCardTitle: {
    color: '#fff !important',
    fontSize: '22px !important',
    fontWeight: '700 !important',
    margin: '8px 0 0 0 !important',
  },
  featureCardDesc: {
    color: '#a8a8a8',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  privacySection: {
    padding: '60px 20px 80px',
    position: 'relative',
  },
  privacyKicker: {
    color: '#ff0000',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '2px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  privacyTitle: {
    color: '#fff !important',
    fontSize: '56px',
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 20px 0',
    lineHeight: 1.1,
  },
  privacyTitleHighlight: {
    background: 'linear-gradient(to right, #ff0000, #cc0022)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  },
  privacySubtitle: {
    color: '#a0a0a0',
    fontSize: '17px',
    textAlign: 'center',
    marginBottom: '60px',
    maxWidth: '720px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  privacyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  privacyCard: {
    background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.9), rgba(15, 15, 15, 0.9))',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '14px',
    padding: '28px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-4px)',
      border: '1px solid rgba(255, 0, 0, 0.2)',
      boxShadow: '0 16px 40px rgba(255, 0, 0, 0.12)',
    },
  },
  privacyIconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.15), rgba(204, 0, 34, 0.05))',
    border: '1px solid rgba(255, 0, 0, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '& .anticon': {
      fontSize: '26px',
      color: '#ff0000',
    },
  },
  privacyCardTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    lineHeight: 1.3,
  },
  privacyCardDesc: {
    color: '#9a9a9a',
    fontSize: '15px',
    lineHeight: 1.6,
    margin: 0,
  },
  ribbonBadge: {
    display: 'inline-block',
    paddingTop: '8px',
    paddingRight: '4px',
    '& .ant-ribbon': {
      background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 50%, #ff4500 100%) !important',
      boxShadow: '0 3px 10px rgba(255, 140, 0, 0.6), 0 0 15px rgba(255, 215, 0, 0.4)',
      fontSize: '12px !important',
      fontWeight: '700',
      padding: '3px 10px !important',
      height: 'auto !important',
      lineHeight: '1.3 !important',
      border: '1.5px solid #ffd700',
      borderRadius: '14px !important',
      color: '#fff',
      textShadow: '0 1px 2px rgba(139, 69, 0, 0.8)',
      letterSpacing: '0.3px',
      animation: 'ribbonGlow 2s ease-in-out infinite',
      zIndex: 10,
    },
    '& .ant-ribbon-corner': {
      display: 'none !important',
    },
    '@keyframes ribbonGlow': {
      '0%, 100%': {
        boxShadow: '0 3px 10px rgba(255, 140, 0, 0.6), 0 0 15px rgba(255, 215, 0, 0.4)',
        transform: 'scale(1) rotate(-3deg)',
      },
      '50%': {
        boxShadow: '0 5px 15px rgba(255, 140, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.6)',
        transform: 'scale(1.04) rotate(-3deg)',
      },
    },
  },
  stepsSection: {
    padding: '80px 20px',
    position: 'relative',
  },
  stepsKicker: {
    color: '#ff0000',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '2px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  stepsTitle: {
    color: '#fff !important',
    fontSize: '56px',
    fontWeight: 800,
    textAlign: 'center',
    margin: '0 0 16px 0',
    lineHeight: 1.1,
  },
  stepsTitleHighlight: {
    background: 'linear-gradient(to right, #ff0000, #cc0022)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
  },
  stepsSubtitle: {
    color: '#999',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '60px',
  },
  stepsWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '60px',
      left: '16%',
      right: '16%',
      height: '2px',
      background: 'linear-gradient(to right, transparent, #ff0000 20%, #ff0000 80%, transparent)',
      zIndex: 0,
    },
  },
  stepItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  stepIconWrapper: {
    position: 'relative',
    marginBottom: '28px',
  },
  stepIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff0000 0%, #cc0022 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 40px rgba(255, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .anticon': {
      fontSize: '48px',
      color: '#fff',
    },
    '&:hover': {
      transform: 'translateY(-6px) scale(1.03)',
      boxShadow: '0 20px 50px rgba(255, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
  },
  stepBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#1a1a1a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    letterSpacing: '0.5px',
  },
  stepTitle: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 700,
    margin: '0 0 12px 0',
  },
  stepDesc: {
    color: '#999',
    fontSize: '15px',
    lineHeight: 1.6,
    maxWidth: '320px',
    margin: 0,
  },
  metricsSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '48px',
    margin: '40px 0 60px',
    padding: '32px 0',
    position: 'relative',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      gap: '20px',
      margin: '30px 0 40px',
      padding: '20px 0',
    },
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px 24px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minWidth: '140px',
    '@media (max-width: 768px)': {
      minWidth: '120px',
      padding: '16px 20px',
      width: '90%',
      margin: '0 auto',
    },
    '&:hover': {
      transform: 'translateY(-4px)',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 0, 0, 0.2)',
      boxShadow: '0 12px 30px rgba(255, 0, 0, 0.1)',
    },
  },
  metricValue: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '4px',
    background: 'linear-gradient(to right, #ff0000, #cc0022)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    '@media (max-width: 768px)': {
      fontSize: '28px',
    },
  },
  metricLabel: {
    color: '#ccc',
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },
}));

const IndexOptions = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState("");
  const [activeAnchor, setActiveAnchor] = useState<string>("how-it-works");
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

  // 获取真正的滚动容器（login-wrapper 或 window）
  const getScrollContainer = (): HTMLElement | Window => {
    const wrapper = document.querySelector(".login-wrapper") as HTMLElement | null;
    if (wrapper && wrapper.scrollHeight > wrapper.clientHeight) {
      return wrapper;
    }
    return window;
  }

  // 监听滚动，更新当前激活的锚点
  useEffect(() => {
    if (!user) return;
    const sectionIds = ["how-it-works", "features", "privacy"];
    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const viewportHeight = isWindow
        ? window.innerHeight
        : (container as HTMLElement).clientHeight;
      const scrollTop = isWindow
        ? window.scrollY || document.documentElement.scrollTop
        : (container as HTMLElement).scrollTop;
      const scrollHeight = isWindow
        ? document.documentElement.scrollHeight
        : (container as HTMLElement).scrollHeight;

      // 如果已经滚动到接近底部（2px 容差），直接激活最后一个锚点
      if (scrollTop + viewportHeight >= scrollHeight - 2) {
        setActiveAnchor(sectionIds[sectionIds.length - 1]);
        return;
      }

      // 以视口中线为判定基准，选择距离中线最近且顶部已越过中线的 section
      // 若都没越过中线，则取第一个
      const anchorLine = viewportHeight * 0.35; // 视口上方 35% 作为激活线，兼顾顶部 fixed 导航
      let current = sectionIds[0];
      let minDistance = Infinity;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // 已经进入视口顶部激活线以上（含少量容差）
        if (top - anchorLine <= 0) {
          const distance = Math.abs(top - anchorLine);
          if (distance < minDistance) {
            minDistance = distance;
            current = id;
          }
        }
      }
      setActiveAnchor(current);
    };
    // 初次挂载稍作延迟，等布局完成
    const timer = setTimeout(handleScroll, 0);
    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [user])

  // 点击锚点：平滑滚动到对应模块
  const handleAnchorClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const container = getScrollContainer();
    const offset = 80;
    if (container === window) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      const wrapper = container as HTMLElement;
      const top =
        el.getBoundingClientRect().top -
        wrapper.getBoundingClientRect().top +
        wrapper.scrollTop -
        offset;
      wrapper.scrollTo({ top, behavior: "smooth" });
    }
  }

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
      // 记录登录日志
      try {
        const manifest = chrome.runtime.getManifest();
        await supabase.from('login_logs').insert({
          user_id: user.id,
          email: user.email,
          login_time: new Date().toISOString(),
          extension_id: chrome.runtime.id,
          extension_name: manifest.name,
          extension_version: manifest.version,
        });
      } catch (logError) {
        console.log('记录扩展信息失败:', logError);
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
    window.open('https://www.youtube.com/watch?v=P5BHl3LOy7A', '_blank')
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
          <nav className="login-anchor-nav" aria-label="Page sections">
            {[
              { id: "how-it-works", label: "How It Works" },
              { id: "features", label: "Features" },
              { id: "privacy", label: "Privacy" },
            ].map((item) => (
              <a
                key={item.id}
                className={`login-anchor-item ${activeAnchor === item.id ? "is-active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleAnchorClick(item.id);
                }}
                href={`#${item.id}`}
              >
                <span className="login-anchor-dot" />
                <span className="login-anchor-label">{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="main-color-pic1"></div>
          <div className="main-color-pic2"></div>
          <Flex justify="space-between" align="left" vertical={true} style={{ width: '80%', paddingTop: 120, zIndex: 1 }} className="main-flex">
            <Flex justify="center" align="center" style={{ marginBottom: 24 }} vertical={true} gap="large">
              <img src={iconBase64Header} style={{ width: 128 }}/>
              <Title level={1} style={{ fontSize: 72, color: '#fff', textAlign: 'center', margin: 0 }}>
                Take Control of Your <span style={{
                  background: 'linear-gradient(to right, #ff0000, #cc0022)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}>YouTube</span> Feed
              </Title>
              <Text style={{ fontSize: 18, color: '#ccc', textAlign: 'center', maxWidth: 600 }}>
                Filter out content you don't want to see and regain control of your time. 
                This Chrome extension lets you view the content you want more efficiently.
              </Text>
            </Flex>
            <Flex justify="center" align="center" style={{ marginBottom: 40 }}>
              <Space size="large">
                <div className={styles.ribbonBadge}>
                  <Badge.Ribbon 
                    text="🔥 LIFETIME ACCESS"
                    color="#ff4d4f"
                    style={{ 
                      top: '4px',
                      right: '-4px',
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
            
            {/* 关键指标展示 */}
            <div className={styles.metricsSection}>
              {[
                { value: "38+", label: "Active Users" },
                { value: "5.0", label: "Star Rating" },
                { value: "100%", label: "Privacy Safe" },
              ].map((metric, index) => (
                <div key={index} className={styles.metricItem}>
                  <div className={styles.metricValue}>{metric.value}</div>
                  <div className={styles.metricLabel}>{metric.label}</div>
                </div>
              ))}
            </div>
            
            <img src={iconBase64Show} className="show-main-pic" />
            <img src={iconBase64Slow} className="show-slow-pic" />
            <div id="how-it-works" className={styles.stepsSection}>
              <div className={styles.stepsKicker}>HOW IT WORKS</div>
              <h2 className={styles.stepsTitle}>
                Get Started in <span className={styles.stepsTitleHighlight}>4 Simple Steps</span>
              </h2>
              <p className={styles.stepsSubtitle}>
                No complicated setup. No account needed. Just install and start filtering.
              </p>

              <div className={styles.stepsWrapper}>
                {[
                  {
                    num: '01',
                    icon: <DollarOutlined />,
                    title: 'Complete Payment',
                    desc: "Secure one-time payment for lifetime access.",
                  },
                  {
                    num: '02',
                    icon: <ChromeOutlined />,
                    title: 'Install Extension',
                    desc: 'Quick installation from Chrome Web Store.',
                  },
                  {
                    num: '03',
                    icon: <LoginOutlined />,
                    title: 'Login',
                    desc: 'Access with your registered email.',
                  },
                   {
                    num: '04',
                    icon: <VideoCameraOutlined />,
                    title: 'Enjoy Clean Feed',
                    desc: 'Customize filters and enjoy distraction-free YouTube.',
                  },
                ].map((step) => (
                  <div className={styles.stepItem} key={step.num}>
                    <div className={styles.stepIconWrapper}>
                      <div className={styles.stepIcon}>{step.icon}</div>
                      <div className={styles.stepBadge}>{step.num}</div>
                    </div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div id="features" className={styles.featuresSection}>
              <div className={styles.featuresKicker}>WHY CHOOSE US</div>
              <h2 className={styles.featuresTitle}>
                Premium Features <span className={styles.featuresTitleHighlight}>You'll Love</span>
              </h2>
              <p className={styles.featuresSubtitle}>
                Everything you need to take back control of your YouTube experience — powerful, private, and lightning fast.
              </p>

              {[
                [
                  { icon: iconBase64FilterFill, title: 'Smart Filtering', desc: 'Block videos by keywords, channels, or topics automatically with our advanced AI-powered filtering system.' },
                  { icon: iconBase64SaveTime, title: 'Save Time', desc: 'Stop wasting time scrolling through irrelevant content. Focus on what truly matters with personalized content curation.' },
                ],
                [
                  { icon: iconBase64PrivacyBan, title: 'Privacy First', desc: 'All filtering happens locally on your device. Your data never leaves your browser — complete privacy guaranteed.' },
                  { icon: iconBase64LightFast, title: 'Lightning Fast', desc: 'Instant filtering with zero impact on YouTube performance. Enjoy seamless browsing without any lag or delays.' },
                ],
              ].map((row, rowIdx) => (
                <Flex key={rowIdx} justify="space-between" align="stretch" style={{ marginBottom: 24 }} gap="large">
                  {row.map((item) => (
                    <Card key={item.title} className={styles.featureCard} style={{ width: '48%', padding: '8px' }}>
                      <Flex justify="start" align="start" vertical={true} gap="middle">
                        <div className={styles.featureIconWrapper}>
                          <img src={item.icon} width="36" />
                        </div>
                        <Title level={3} className={styles.featureCardTitle}>{item.title}</Title>
                        <Text className={styles.featureCardDesc}>{item.desc}</Text>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              ))}
            </div>

            {/** 隐私模块 */}
            <div id="privacy" className={styles.privacySection}>
              <div className={styles.privacyKicker}>PRIVACY FIRST</div>
              <h2 className={styles.privacyTitle}>
                Your Privacy is <span className={styles.privacyTitleHighlight}>Our Priority</span>
              </h2>
              <p className={styles.privacySubtitle}>
                YT Filters is built with privacy at its core. All filtering happens locally in your browser.
              </p>

              <div className={styles.privacyGrid}>
                {[
                  {
                    icon: <EyeOutlined />,
                    title: 'No Data Collection',
                    desc: "We don't collect personal data, browsing history, or analytics.",
                  },
                  {
                    icon: <DatabaseOutlined />,
                    title: 'Local Storage Only',
                    desc: 'All your preferences are stored locally in your browser.',
                  },
                  {
                    icon: <LockOutlined />,
                    title: 'No Third Party Sharing',
                    desc: 'Your data is never sold or shared with third parties.',
                  },
                  {
                    icon: <SafetyOutlined />,
                    title: 'Minimal Permissions',
                    desc: 'We only request permissions essential for filtering to work.',
                  },
                ].map((item) => (
                  <div className={styles.privacyCard} key={item.title}>
                    <div className={styles.privacyIconBox}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h3 className={styles.privacyCardTitle}>{item.title}</h3>
                      <p className={styles.privacyCardDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
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