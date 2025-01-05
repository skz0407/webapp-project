import { User } from "../types/User"

// Contextの型定義
interface UserContextType {
  userData: User | null;
  setUserData: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

export type { UserContextType };