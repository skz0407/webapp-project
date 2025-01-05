import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/libs/supabase';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
        },
      });

      if (error) {
        throw error; // エラーをスロー
      }

      res.redirect(data.url); // 認証ページにリダイレクト
    } catch (error) {
      // `error`の型を特定
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;

