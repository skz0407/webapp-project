import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack } from "@chakra-ui/react";

export default function Board() {
  return (
    <Box p={8} maxWidth="800px" mx="auto">
      <VStack spacing={6}>
        {/* 投稿フォーム */}
        <FormControl>
          <FormLabel>新しい投稿</FormLabel>
          <Textarea placeholder="メッセージを入力" />
        </FormControl>
        <Button colorScheme="teal" width="full">
          投稿する
        </Button>

        {/* 投稿の一覧 */}
        <Box width="full">
          <Box p={4} borderWidth="1px" borderRadius="md" mb={4}>
            <strong>ユーザーA</strong>
            <p>これは投稿のサンプルです。</p>
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="md">
            <strong>ユーザーB</strong>
            <p>コメントの例を追加できます。</p>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};