import axios from "axios";
import { useEffect, useState } from "react";

export default function Hello() {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function getMessage() {
      try {
        const url = "https://vercel.com/new/skz0407s-projects/success?developer-id=&external-id=&redirect-url=&branch=main&deploymentUrl=fastapi-dds7p5umf-skz0407s-projects.vercel.app&projectName=fastapi&s=https%3A%2F%2Fgithub.com%2Fskz0407%2Ffastapi&gitOrgLimit=&hasTrialAvailable=1&totalProjects=1";
        const res = await axios.get(url);
        setMessage(res.data.message);
      } catch (err) {
        console.error(err);
      }
    }
    getMessage();
  }, []);

  return (
    <>
      <h1>{message}</h1>
    </>
  );
}