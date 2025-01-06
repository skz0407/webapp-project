import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "@/libs/supabase";
import { User } from "@/types/User";
import { UserContextType } from "@/types/UserContextType";
import { useApiUrl } from "./ApiContext";

// Contextを初期化
const UserContext = createContext<UserContextType | null>(null);

// Providerコンポーネント
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = useApiUrl();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const googleId = session.user.id;

          // Google IDからユーザー情報を取得
          const idResponse = await fetch(`${apiUrl}/auth/google-id`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ google_id: googleId }),
          });
          const { id } = await idResponse.json();

          const userResponse = await fetch(`${apiUrl}/users/${id}`);
          const user = await userResponse.json();

          setUserData(user);
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Contextを利用するためのカスタムフック
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserはUserProviderの内側で使用する必要があります");
  }
  return context;
};

