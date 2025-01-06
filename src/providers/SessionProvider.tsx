import { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useApiUrl } from "@/contexts/ApiContext";
import { sessionState } from "@/libs/states";
import supabase from "@/libs/supabase";

type SessionProviderProps = {
  children: React.ReactNode;
};

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const [isDataSent, setIsDataSent] = useState(false); // データ送信状態を追跡
  const [, setSession] = useRecoilState<Session | null>(sessionState);
  const apiUrl = useApiUrl();

  useEffect(() => {
    const sessionUpdate = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        setIsReady(false);
        return;
      }

      setSession(session);

      if (session) {
        // FastAPIにデータを送信
        if (!isDataSent) {
          try {
            const user = session.user;
            const response = await fetch(`${apiUrl}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                google_id: user.id,
                email: user.email,
                username: user.user_metadata.full_name || "No Name",
                avatar_url: user.user_metadata.picture || "",
              }),
            });

            if (!response.ok) {
              throw new Error(`Failed to save user: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("FastAPIに保存されたデータ:", result);
            setIsDataSent(true); // データ送信完了
          } catch (error) {
            console.error("データ送信エラー:", error);
          }
        }

        // `/home` に遷移
        if (pathname === "/" && isDataSent) {
          router.replace("/home");
          return;
        }

        setIsReady(true);
        return;
      }

      // セッションがない場合、ログイン画面にリダイレクト
      if (pathname !== "/") {
        router.replace("/");
        return;
      }

      setIsReady(true);
      return;
    };

    sessionUpdate();
  }, [router, pathname, setIsReady, setSession, isDataSent]);

  if (!isReady) {
    return <></>; // ローディング中は何も表示しない
  }

  return <>{children}</>;
};
