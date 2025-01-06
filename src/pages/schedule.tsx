"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useApiUrl } from "@/contexts/ApiContext";
import { Event } from "@/types/Event";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";

export default function Schedule() {
  const { userData, loading } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    start_time: "",
    end_time: "",
  });
  const toast = useToast();
  const apiUrl = useApiUrl();

// イベントをAPIから取得
const fetchEvents = async () => {
  if (!userData || loading) return;

  try {
    const response = await fetch(`${apiUrl}/users/${userData.id}/events`);
    if (!response.ok) {
      // ステータスコードによる詳細なエラー処理
      if (response.status === 404) {
        // イベントが存在しない場合は空配列に初期化
        setEvents([]);
        return;
      }
      throw new Error("イベントの取得に失敗しました");
    }

    const data = await response.json();

    // レスポンスが空かつJSON形式である場合の処理
    if (!data || data.length === 0) {
      setEvents([]); // 初期化
    } else {
      setEvents(data); // イベントをセット
    }
  } catch (error) {
    console.error("イベント取得エラー:", error);

    // エラーメッセージを自動消去するトースト表示
    toast({
      title: "エラー",
      description: "イベントの取得に失敗しました。",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  }
};



  // イベントを追加または更新
  const saveEvent = async () => {
    const { title, date, start_time, end_time } = newEvent;
    if (!title || !date || !start_time || !end_time) {
      toast({
        title: "エラー",
        description: "すべての必須項目を入力してください。",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const method = currentEvent ? "PUT" : "POST";
    const url = currentEvent
      ? `${apiUrl}/users/${userData?.id}/events/${currentEvent.id}`
      : `${apiUrl}/users/${userData?.id}/events`;

    const event = {
      title,
      start_time: `${date}T${start_time}`,
      end_time: `${date}T${end_time}`,
      user_id: userData?.id,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!response.ok) throw new Error("イベントの保存に失敗しました");

      await fetchEvents();
      toast({
        title: "成功",
        description: currentEvent ? "イベントを更新しました。" : "イベントを追加しました。",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("イベント保存エラー:", error);
      toast({
        title: "エラー",
        description: "イベントの保存に失敗しました。",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setNewEvent({ title: "", date: "", start_time: "", end_time: "" });
      setCurrentEvent(null);
    }
  };

  // イベントを削除
  const deleteEvent = async (id: string | undefined) => {
    if (!id) {
      toast({
        title: "エラー",
        description: "削除するイベントが見つかりません。",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/users/${userData?.id}/events/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("イベントの削除に失敗しました");

      await fetchEvents();
      toast({
        title: "成功",
        description: "イベントを削除しました。",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("イベント削除エラー:", error);
      toast({
        title: "エラー",
        description: "イベントの削除に失敗しました。",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userData]);

  return (
    <Container maxW="6xl" py={6}>
      <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={4} mb={8}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          initialView="dayGridMonth"
          height="auto"
          events={events.map((event) => ({
            id: event.id,
            title: event.title, // イベント名のみを表示
            start: event.start_time,
            end: event.end_time,
            allDay: true,
          }))}
        />
      </Box>

      <Heading as="h2" size="md" textAlign="left" mb={4}>
        イベント一覧
      </Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>イベント名</Th>
            <Th>開始日時</Th>
            <Th>終了日時</Th>
            <Th>操作</Th>
          </Tr>
        </Thead>
        <Tbody>
          {events.map((event) => (
            <Tr key={event.id}>
              <Td>{event.title}</Td>
              <Td>{event.start_time}</Td>
              <Td>{event.end_time}</Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={() => {
                    setCurrentEvent(event);
                    setNewEvent({
                      title: event.title,
                      date: event.start_time.split("T")[0],
                      start_time: event.start_time.split("T")[1],
                      end_time: event.end_time.split("T")[1],
                    });
                  }}
                >
                  編集
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  ml={2}
                  onClick={() => deleteEvent(event.id)}
                >
                  削除
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* イベント入力フォーム */}
      <VStack spacing={4} mt={8}>
        <FormControl>
          <FormLabel>イベント名</FormLabel>
          <Input
            placeholder="イベント名を入力"
            value={newEvent.title}
            maxLength={255}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>日付</FormLabel>
          <Input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>開始時刻</FormLabel>
          <Input
            type="time"
            value={newEvent.start_time}
            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>終了時刻</FormLabel>
          <Input
            type="time"
            value={newEvent.end_time}
            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
          />
        </FormControl>
        <Button colorScheme="green" onClick={saveEvent}>
          {currentEvent ? "更新" : "追加"}
        </Button>
      </VStack>
    </Container>
  );
}
