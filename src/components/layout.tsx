import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "./sidebar";

export default function Layout({ children, showSidebar }: { children: React.ReactNode; showSidebar: boolean }) {
  return (
    <Flex>
      {/* サイドバー */}
      {showSidebar && <Sidebar />}
      {/* メインコンテンツ */}
      <Box flex="1" ml={showSidebar ? "240px" : "0"} p={4}>
        {children}
      </Box>
    </Flex>
  );
};
