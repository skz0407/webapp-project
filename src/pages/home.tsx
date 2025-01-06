import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { Box, Heading, VStack, Text, Button, Spinner, Link as ChakraLink } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Event } from "@/types/Event";
import { Thread } from "@/types/Thread";
import { useApiUrl } from "@/contexts/ApiContext";
import NextLink from "next/link";

export default function Home() {
  const { userData, loading } = useUser();
  const [events, setEvents] = useState<Event[]>([]); // 今後のスケジュール
  const [threads, setThreads] = useState<Thread[]>([]); // 参加中のスレッド
  const [loadingThreads, setLoadingThreads] = useState(true); // スレッド読み込み状態
  const [loadingEvents, setLoadingEvents] = useState(true); // スケジュール読み込み状態
  const router = useRouter();
  const apiUrl = useApiUrl();

  // スケジュールを取得
  const fetchEvents = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`${apiUrl}/users/${userData.id}/events`);
      if (!response.ok) throw new Error("スケジュールの取得に失敗しました");
      const data: Event[] = await response.json();

      // 今日以降のスケジュールをフィルタリング
      const upcomingEvents = data.filter((event) => new Date(event.start_time) > new Date());
      setEvents(upcomingEvents);
    } catch (error) {
      console.error("スケジュール取得エラー:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // 参加中のスレッドを取得
  const fetchThreads = async () => {
    if (!userData) return;

    try {
      const response = await fetch(`${apiUrl}/users/${userData.id}/threads`);
      if (!response.ok) throw new Error("スレッドの取得に失敗しました");
      const data: Thread[] = await response.json();

      // 投稿日時の降順で表示
      const sortedThreads = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setThreads(sortedThreads.slice(0, 3)); // 最新3件のみ表示
    } catch (error) {
      console.error("スレッド取得エラー:", error);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchThreads();
  }, [userData]);

  if (loading || loadingEvents || loadingThreads) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="xl" />
        <Text mt={4}>データを読み込んでいます...</Text>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box textAlign="center" mt={8}>
        <Text>ユーザーデータを取得できませんでした。</Text>
      </Box>
    );
  }

  return (
    <VStack align="start" spacing={6} p={4}>
      {/* ユーザー概要 */}
      <Box w="100%" p={4} bg="gray.50" borderRadius="md" shadow="md">
        <Heading size="md">ようこそ、{userData.username}さん</Heading>
        <Text fontSize="sm" color="gray.600">
          メールアドレス: {userData.email}
        </Text>
      </Box>

      {/* スケジュール */}
      <Box w="100%" p={4} bg="gray.50" borderRadius="md" shadow="md">
        <Heading size="md">スケジュール</Heading>
        <VStack align="start" mt={2}>
          {events.length > 0 ? (
            events.map((event) => (
              <Text key={event.id}>
                ・{new Date(event.start_time).toLocaleString()} - {event.title}
              </Text>
            ))
          ) : (
            <Text>今後のスケジュールはありません。</Text>
          )}
          <Button
            size="sm"
            colorScheme="teal"
            mt={2}
            onClick={() => router.push("/schedule")}
          >
            スケジュールを見る
          </Button>
        </VStack>
      </Box>

      {/* 参加中のスレッド */}
      <Box w="100%" p={4} bg="gray.50" borderRadius="md" shadow="md">
        <Heading size="md">参加中のスレッド</Heading>
        <VStack align="start" mt={2}>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Box key={thread.id} w="100%">
                <NextLink href={`/threads/${thread.id}`} passHref>
                  <ChakraLink>
                    <Text fontWeight="bold">{thread.title}</Text>
                  </ChakraLink>
                </NextLink>
                <Text fontSize="sm" color="gray.500">
                  作成者: {thread.username} | 投稿日: {new Date(thread.created_at).toLocaleString()}
                </Text>
              </Box>
            ))
          ) : (
            <Text>参加中のスレッドはまだありません。</Text>
          )}
          <Button
            size="sm"
            colorScheme="teal"
            mt={2}
            onClick={() => router.push("/threads")}
          >
            スレッド一覧へ
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
