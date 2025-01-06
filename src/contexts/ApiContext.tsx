import { createContext, useContext } from "react";

const ApiContext = createContext<string | undefined>(undefined);

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables.");
  }

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiUrl = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApiUrl must be used within an ApiProvider.");
  }
  return context;
};
