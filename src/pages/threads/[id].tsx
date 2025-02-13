import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  FormControl,
  FormLabel,
  Textarea,
  Button,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApiUrl } from "@/contexts/ApiContext";
import { useUser } from "@/contexts/UserContext";
import supabase from "@/libs/supabase";
import { Thread } from "@/types/Thread";
import { Comment } from "@/types/Comment";

export default function ThreadDetail() {
  const router = useRouter();
  const { id } = router.query; // URLからスレッドIDを取得
  const apiUrl = useApiUrl();
  const { userData } = useUser();

  const [thread, setThread] = useState<Thread | null>(null); // スレッドデータ
  const [comments, setComments] = useState<Comment[]>([]); // コメントデータ
  const [loading, setLoading] = useState(true); // 読み込み中状態
  const [newComment, setNewComment] = useState<string>(""); // 新しいコメント
  const [posting, setPosting] = useState(false); // 投稿中状態

  // スレッド詳細を取得
  const fetchThreadDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/threads/${id}`);
      if (!response.ok) throw new Error("スレッド詳細の取得に失敗しました");
      const data = await response.json();
      setThread(data.thread);
      setComments(data.comments);
    } catch (error) {
      console.error("スレッド詳細取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // コメントを投稿
  const postComment = async () => {
    if (!newComment.trim()) return;
  
    setPosting(true);
    try {
      await fetch(`${apiUrl}/threads/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          thread_id: id,
          user_id: userData?.id,
        }),
      });
      setNewComment(""); // フォームをリセット
    } catch (error) {
      console.error("コメント投稿エラー:", error);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchThreadDetails();
  
      const subscription = supabase
        .channel("realtime-comments")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "comments", filter: `thread_id=eq.${id}` },
          async (payload) => {
            const newComment = payload.new;
  
            // 投稿者の username を取得
            const { data: userData, error } = await supabase
              .from("users")
              .select("username")
              .eq("id", newComment.user_id)
              .single();
  
            if (error) {
              console.error("ユーザー情報の取得に失敗:", error);
              return;
            }
  
            // コメントに username を補完して Comment 型を満たす
            const completeComment: Comment = {
              id: newComment.id,
              content: newComment.content,
              created_at: newComment.created_at,
              username: userData?.username || "Unknown",
            };
  
            // 重複チェックを行い、リストに存在しない場合のみ追加
            setComments((prevComments) => {
              const isDuplicate = prevComments.some(
                (comment) => comment.id === completeComment.id
              );
              if (isDuplicate) {
                return prevComments; // 重複している場合は何もしない
              }
              return [...prevComments, completeComment].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        )
        .subscribe();
  
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [id]);
  

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <Spinner size="xl" />
        <Text mt={4}>スレッドを読み込んでいます...</Text>
      </Box>
    );
  }

  if (!thread) {
    return (
      <Box textAlign="center" mt={8}>
        <Text>スレッドが見つかりませんでした。</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxWidth="800px" mx="auto">
      {/* スレッドの詳細 */}
      <Box p={4} borderWidth="1px" borderRadius="md" mb={6}>
        <Heading size="md" mb={2}>
          {thread.title}
        </Heading>
        <Text mb={4} whiteSpace="pre-line">{thread.content}</Text>
        <Flex justify="space-between" fontSize="sm" color="gray.500">
          <Text>作成者: {thread.username}</Text>
          <Text>投稿日: {new Date(thread.created_at).toLocaleString()}</Text>
        </Flex>
      </Box>

      <Divider mb={6} />

      {/* コメント一覧 */}
      <VStack align="start" spacing={4}>
        <Heading size="sm">コメント</Heading>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Box key={comment.id} p={4} borderWidth="1px" borderRadius="md" width="100%">
              <Text whiteSpace="pre-line">{comment.content}</Text>
              <Flex justify="space-between" fontSize="sm" color="gray.500">
                <Text>投稿者: {comment.username}</Text>
                <Text>
                  投稿日時: {new Date(comment.created_at).toLocaleString()}
                </Text>
              </Flex>
            </Box>
          ))
        ) : (
          <Text>コメントはまだありません。</Text>
        )}
      </VStack>

      <Divider my={6} />

      {/* コメント投稿フォーム */}
      <Box p={4} borderWidth="1px" borderRadius="md">
        <FormControl mb={4}>
          <FormLabel>コメント</FormLabel>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力してください"
          />
        </FormControl>
        <Button
          colorScheme="teal"
          onClick={postComment}
          isLoading={posting}
          isDisabled={!newComment.trim()}
        >
          投稿する
        </Button>
      </Box>
    </Box>
  );
}
  