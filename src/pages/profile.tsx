import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useApiUrl } from "@/contexts/ApiContext";

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
}

export default function Profile() {
  const { userData, setUserData, loading } = useUser(); // Contextからデータを取得
  const [editingUserData, setEditingUserData] = useState<UserData>({
    id: "",
    username: "",
    email: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false); // 保存中状態
  const apiUrl = useApiUrl();

  useEffect(() => {
    if (userData) {
      setEditingUserData(userData); // Contextから取得したデータを編集用に設定
    }
  }, [userData]);

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="xl" />
        <Text mt={4}>ユーザー情報を読み込んでいます...</Text>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box textAlign="center" mt={8}>
        <Text>ユーザー情報を取得できませんでした。</Text>
      </Box>
    );
  }

  const updateUserData = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/users/${userData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUserData),
      });
      if (!response.ok) {
        throw new Error("ユーザー情報の更新に失敗しました");
      }
      const updatedData = await response.json();
      setUserData(updatedData); // Context内のデータを更新
      alert("ユーザー情報を更新しました！");
    } catch (error) {
      console.error("更新エラー:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={8} maxWidth="600px" mx="auto">
      <VStack spacing={4}>
        {/* プロフィール画像 */}
        <Image
          src={editingUserData.avatar_url}
          alt="プロフィール画像"
          borderRadius="full"
          boxSize="150px"
          objectFit="cover"
          mb={6}
        />
        <Heading mb={6}>プロフィール</Heading>
        <FormControl>
          <FormLabel>ユーザー名</FormLabel>
          <Input
            value={editingUserData.username}
            onChange={(e) =>
              setEditingUserData({ ...editingUserData, username: e.target.value })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>メールアドレス</FormLabel>
          <Input
            value={editingUserData.email}
            onChange={(e) =>
              setEditingUserData({ ...editingUserData, email: e.target.value })
            }
          />
        </FormControl>
        <FormControl>
          <FormLabel>プロフィール画像URL</FormLabel>
          <Input
            value={editingUserData.avatar_url}
            onChange={(e) =>
              setEditingUserData({ ...editingUserData, avatar_url: e.target.value })
            }
          />
        </FormControl>
        <Button
          colorScheme="teal"
          width="full"
          onClick={updateUserData}
          isLoading={saving}
        >
          更新する
        </Button>
      </VStack>
    </Box>
  );
}


