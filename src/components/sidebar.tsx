import { Box, Flex, Icon, Link, Button, Text } from "@chakra-ui/react";
import { FaHome, FaCalendarAlt, FaUser, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import NextLink from "next/link";
import supabase from "@/libs/supabase";
import { Session } from "@supabase/supabase-js";
import { useState } from "react";

export default function Sidebar(){
  const [sessionInfo, setSessionInfo] = useState<Session | null>(null);

  const SidebarLink = ({ href, icon, label }: { href: string; icon: any; label: string }) => (
    <NextLink href={href} passHref>
      <Link
        display="flex"
        alignItems="center"
        p={3}
        borderRadius="md"
        _hover={{ bg: "gray.700" }}
        _activeLink={{ bg: "teal.500" }}
      >
        <Icon as={icon} boxSize={5} mr={3} />
        <Text>{label}</Text>
      </Link>
    </NextLink>
  );
  
  const Signout = async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSessionInfo(null); // セッション情報をクリア
        location.reload();
      } catch (err) {
        console.error("ログアウトエラー:", err);
      }
    };

  return (
    <Flex
      direction="column"
      bg="gray.800"
      color="white"
      w="240px"
      h="100vh"
      position="fixed"
      top="0"
      left="0"
      py={4}
      px={3}
      justify="space-between"
    >
      {/* 上部ナビゲーション */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={8}>
          MyApp
        </Text>
        <Flex direction="column" as="ul" gap={4}>
          <SidebarLink href="/home" icon={FaHome} label="Home" />
          <SidebarLink href="/schedule" icon={FaCalendarAlt} label="Schedule" />
          <SidebarLink href="/profile" icon={FaUser} label="Profile" />
          <SidebarLink href="/board" icon={FaClipboardList} label="Board" />
        </Flex>
      </Box>

      {/* ログアウトボタン */}
      <Button
        leftIcon={<FaSignOutAlt />}
        colorScheme="red"
        variant="solid"
        w="100%"
        onClick={() => Signout()}
      >
        Logout
      </Button>
    </Flex>
  );
};