import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import { SessionProvider } from "@/providers/SessionProvider";
import { UserProvider } from "@/contexts/UserContext";
import { ApiProvider } from "@/contexts/ApiContext";
import Layout from "../components/layout";



export default function App({ Component, pageProps, router }: AppProps) {
  const noSidebarRoutes = ["/"];
  const showSidebar = !noSidebarRoutes.includes(router.pathname);

  return (
    <RecoilRoot>
     <ApiProvider>
      <SessionProvider>
        <ChakraProvider>
          <UserProvider>
           <Layout showSidebar={showSidebar}>
            <Component {...pageProps} />
           </Layout>
          </UserProvider>
        </ChakraProvider>
      </SessionProvider>
     </ApiProvider>
    </RecoilRoot>
  );
}
