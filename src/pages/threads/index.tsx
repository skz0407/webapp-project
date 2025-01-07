import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  LinkBox,
  LinkOverlay,
  Divider,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useApiUrl } from "@/contexts/ApiContext";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import supabase from "@/libs/supabase";
import { Thread } from "@/types/Thread";

export default function Threads() {
  const { userData } = useUser();
  const apiUrl = useApiUrl();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [error, setError] = useState<string | null>(null);

  // ユーザー名を取得する関数
  const fetchUsername = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/users/${userId}`);
      if (!response.ok) throw new Error("ユーザー名の取得に失敗しました");
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error("ユーザー名取得エラー:", error);
      return "Unknown"; // 取得失敗時のデフォルト値
    }
  };

  // スレッド一覧を取得
  const fetchThreads = async () => {
    try {
      const response = await fetch(`${apiUrl}/threads`);
      if (!response.ok) throw new Error("スレッド一覧の取得に失敗しました");
      const data = await response.json();
      setThreads(
        data.sort(
          (a: Thread, b: Thread) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("スレッド取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // 参加中のスレッドを取得
  const fetchUserThreads = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/${userData?.id}/threads`);
      if (!response.ok) throw new Error("参加中のスレッドの取得に失敗しました");
      const data = await response.json();
      setUserThreads(
        data.sort(
          (a: Thread, b: Thread) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch (error) {
      console.error("参加中スレッド取得エラー:", error);
    }
  };

  // スレッドを作成
  const createThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) {
      setError("タイトルと内容を入力してください。");
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${apiUrl}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newThread,
          user_id: userData?.id,
        }),
      });
      if (!response.ok) throw new Error("スレッド作成に失敗しました");
      const data = await response.json();
      setThreads((prevThreads) =>
        [data, ...prevThreads].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setUserThreads((prevThreads) =>
        [data, ...prevThreads].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setNewThread({ title: "", content: "" });
      setShowForm(false);
    } catch (error) {
      console.error("スレッド作成エラー:", error);
    }
  };

  // Supabase リアルタイム機能の設定
  useEffect(() => {
    const subscription = supabase
      .channel("realtime-threads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "threads" },
        async (payload) => {
          const newThread = payload.new as Thread;

          // ユーザー名を取得して補完
          const username = await fetchUsername(newThread.user_id);
          const completeThread = { ...newThread, username };

          // 重複をチェック
          setThreads((prevThreads) => {
            const isDuplicate = prevThreads.some(
              (thread) => thread.id === newThread.id
            );
            if (isDuplicate) return prevThreads;

            return [completeThread, ...prevThreads].sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });

          if (newThread.user_id === userData?.id) {
            setUserThreads((prevThreads) => {
              const isDuplicate = prevThreads.some(
                (thread) => thread.id === newThread.id
              );
              if (isDuplicate) return prevThreads;

              return [completeThread, ...prevThreads].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userData]);

  // 初回データ取得
  useEffect(() => {
    fetchThreads();
    if (userData) fetchUserThreads();
  }, [userData]);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="xl" />
        <Text mt={4}>スレッドを読み込んでいます...</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxWidth="800px" mx="auto">
      <Heading mb={6}>スレッド一覧</Heading>
      <Divider mb={6} />
      <Heading size="md" mb={4}>
        参加中のスレッド
      </Heading>
      <VStack spacing={4} align="start">
        {userThreads.length > 0 ? (
          userThreads.map((thread) => (
            <Box
              key={thread.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              width="100%"
              _hover={{ bg: "gray.50", cursor: "pointer" }}
              as={LinkBox}
            >
              <Link href={`/threads/${thread.id}`} passHref>
                <LinkOverlay>
                  <Heading size="sm">{thread.title}</Heading>
                  <Text mt={1} fontSize="sm" color="gray.500">
                    作成者: {thread.username} / 投稿日:{" "}
                    {new Date(thread.created_at).toLocaleString()}
                  </Text>
                </LinkOverlay>
              </Link>
            </Box>
          ))
        ) : (
          <Text>参加中のスレッドはありません。</Text>
        )}
      </VStack>
      <Divider my={6} />
      <Heading size="md" mb={4}>
        最新のスレッド
      </Heading>
      <VStack spacing={4} align="start">
        {threads.map((thread) => (
          <Box
            key={thread.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            width="100%"
            _hover={{ bg: "gray.50", cursor: "pointer" }}
            as={LinkBox}
          >
            <Link href={`/threads/${thread.id}`} passHref>
              <LinkOverlay>
                <Heading size="sm">{thread.title}</Heading>
                <Text mt={1} fontSize="sm" color="gray.500">
                  作成者: {thread.username} / 投稿日:{" "}
                  {new Date(thread.created_at).toLocaleString()}
                </Text>
              </LinkOverlay>
            </Link>
          </Box>
        ))}
      </VStack>
      <Divider my={6} />
      <HStack spacing={4} mt={4}>
        <Button colorScheme="teal" onClick={() => setShowForm(true)} width="50%">
          新しいスレッドを作成
        </Button>
      </HStack>
      {showForm && (
        <Box p={4} mt={4} borderWidth="1px" borderRadius="md" width="100%">
          <FormControl mb={4}>
            <FormLabel>タイトル</FormLabel>
            <Input
              value={newThread.title}
              onChange={(e) =>
                setNewThread({ ...newThread, title: e.target.value })
              }
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>内容</FormLabel>
            <Textarea
              value={newThread.content}
              onChange={(e) =>
                setNewThread({ ...newThread, content: e.target.value })
              }
            />
          </FormControl>
          {error && (
            <Text color="red.500" mb={4}>
              {error}
            </Text>
          )}
          <Button colorScheme="teal" onClick={createThread}>
            作成
          </Button>
          <Button ml={4} onClick={() => setShowForm(false)}>
            キャンセル
          </Button>
        </Box>
      )}
    </Box>
  );
}

