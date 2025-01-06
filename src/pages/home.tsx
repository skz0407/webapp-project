import { useUser } from "@/contexts/UserContext"; // Contextからユーザーデータを取得
import { useEffect, useState } from "react";
import { Box, Heading, VStack, Text, Button, HStack, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Event } from "@/types/Event";
import { useApiUrl } from "@/contexts/ApiContext";

export default function Home() {
  const { userData, loading } = useUser(); // Contextからデータを取得
  const [events, setEvents] = useState<Event[]>([]); // 今後のスケジュール
  const [loadingEvents, setLoadingEvents] = useState(true); // スケジュール読み込み状態
  const router = useRouter(); // useRouterフックを利用
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

  useEffect(() => {
    fetchEvents();
  }, [userData]);

  if (loading || loadingEvents) {
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
            onClick={() => router.push("/schedule")} // スケジュールページに移動
          >
            スケジュールを見る
          </Button>
        </VStack>
      </Box>

      {/* 掲示板の最新トピック */}
      <Box w="100%" p={4} bg="gray.50" borderRadius="md" shadow="md">
        <Heading size="md">掲示板の最新トピック</Heading>
        <VStack align="start" mt={2}>
          <Text>・「新しいプロジェクト案について」</Text>
          <Text>・「ミーティングの日程調整」</Text>
          <Button size="sm" colorScheme="teal" mt={2}>
            掲示板を開く
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
