import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  try {
    const response = await axios.get(`http://localhost:8000/users/${user_id}`); // FastAPIエンドポイント
    res.status(200).json(response.data);
  } catch (error) {
    console.error("エラー:", error);
    res.status(500).json({ error: "ユーザー情報の取得に失敗しました" });
  }
}