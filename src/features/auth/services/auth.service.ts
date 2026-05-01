import { createClient } from "@/lib/supabase/client";

export async function register(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (error) throw error;

    const user = data.user;

    if (user) {
      await supabase.from('stores').insert({
        user_id: user.id,
        name: 'Toko Saya',
      });
    }

  return data;
}

export async function login(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}
