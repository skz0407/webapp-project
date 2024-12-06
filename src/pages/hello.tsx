import { Button } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import supabase from "@/libs/supabase";

export default function Hello() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function getMessage() {
      try {
        const url = "https://fastapi-lake.vercel.app";
        const res = await axios.get(url);
        setMessage(res.data.message);
      } catch (err) {
        console.error(err);
      }
    }
    getMessage();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("ログアウトエラー:", err);
    }
  };

  return (
    <>
      <Button onClick={signOut}>signOut</Button>
      <h1>{message}</h1>
    </>
  );
}