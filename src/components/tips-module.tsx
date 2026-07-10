import { Button, Flex } from "antd";
import type { User } from "@supabase/supabase-js";

import GoogleAuthLogin from "./google-auth-login";
import { buildUpgradeUrl } from "../types";

interface TipsModuleProps {
  user?: User | null;
  /** Google 登录成功后回调，父组件可据此刷新数据 */
  onLoginSuccess?: (user: User) => void;
}

const TipsModule = ({ user, onLoginSuccess }: TipsModuleProps) => {
  const email = user?.email;

  // 打开 Stripe 支付链接（带 client_reference_id 与 prefilled_email）
  const handleUpgradeClick = () => {
    window.open(buildUpgradeUrl(user), "_blank");
  };

  return (
    <Flex justify="center" style={{ minHeight: 271 }} vertical gap={8}>
      {email ? (
        <>
          <Button
            type="primary"
            danger
            size="large"
            style={{ cursor: "pointer", borderRadius: 2 }}
            onClick={handleUpgradeClick}
          >
            Get Started ($6)
          </Button>
          <Button type="text" disabled>
            One-time payment. Lifetime access. No subscription
          </Button>
        </>
      ) : (
        <GoogleAuthLogin onLoginSuccess={onLoginSuccess} />
      )}
    </Flex>
  );
};

export default TipsModule;