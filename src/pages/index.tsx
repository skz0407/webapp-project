import { Inter } from "next/font/google";
import { Button, VStack, Heading, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import supabase from "@/libs/supabase";
import { Session } from "@supabase/supabase-js";
import { useApiUrl } from "@/contexts/ApiContext";

const inter = Inter({ subsets: ["latin"] });

export default function Auth() {
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const apiUrl = useApiUrl();

  // Googleログイン
  const GoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`, // 現在のページにリダイレクト
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("ログインエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSessionInfo(null); // セッション情報をクリア
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時にセッション情報を取得
  useEffect(() => {
    const fetchSessionAndSendData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionInfo(session);

        // FastAPIにデータを送信
        const user = session.user;
        try {
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
        } catch (error) {
          console.error("データ送信エラー:", error);
        }
      }
    };

    fetchSessionAndSendData();
  }, []);

  return (
    <VStack
      spacing={4}
      align="center"
      justify="center"
      height="100vh"
      className={inter.className}
    >
      <Heading>Googleでログイン</Heading>
        <Button colorScheme="teal" size="lg" onClick={GoogleSignIn} isLoading={loading}>
          Googleでログイン
        </Button>
    </VStack>
  );
}
