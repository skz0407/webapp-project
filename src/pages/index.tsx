import { Inter } from "next/font/google";
import { Button, VStack, Heading, Text } from "@chakra-ui/react";
import { useState } from "react";
import supabase from "@/libs/supabase";
import { Session } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"] });

export default function Auth() {
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);

  // GitHubでログインする関数
  const GitHubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) throw error;
    } catch (error) {
      console.error("GitHubログインエラー:", error);
    }
  };

  // ログアウト処理
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSessionInfo(null); // セッション情報をクリア
    } catch (err) {
      console.error("ログアウトエラー:", err);
    }
  };

  return (
    <VStack
      spacing={4}
      align="center"
      justify="center"
      height="100vh"
      className={inter.className}
    >
      <Heading>GitHubでログイン</Heading>
      {sessionInfo ? (
        <>
          <Text>ログイン済み: {sessionInfo.user.email}</Text>
          <Button colorScheme="red" onClick={signOut}>
            ログアウト
          </Button>
        </>
      ) : (
        <Button colorScheme="teal" size="lg" onClick={GitHubSignIn}>
          GitHubでログイン
        </Button>
      )}
    </VStack>
  );
}