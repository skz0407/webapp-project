import { useUser } from "@/contexts/UserContext"; // Contextからユーザーデータを取得
import { Box, Heading, VStack, Text, Button, HStack, Spinner } from "@chakra-ui/react";

export default function Home() {
  const { userData, loading } = useUser(); // Contextからデータを取得

  if (loading) {
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

      {/* 未完了タスク */}
      <Box w="100%" p={4} bg="gray.50" borderRadius="md" shadow="md">
        <Heading size="md">今日のタスク</Heading>
        <VStack align="start" mt={2}>
          <Text>・プロジェクト会議 (10:00 AM)</Text>
          <Text>・レポート提出 (5:00 PM)</Text>
          <Button size="sm" colorScheme="teal" mt={2}>
            タスク一覧を見る
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

      {/* クイックアクション */}
      <HStack spacing={4} w="100%">
        <Button colorScheme="teal" w="100%">
          新しいタスクを作成
        </Button>
        <Button colorScheme="teal" w="100%">
          新しいスレッドを作成
        </Button>
      </HStack>
    </VStack>
  );
}

