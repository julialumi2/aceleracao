import { createClient } from "@supabase/supabase-js";

// Aponta para a instância local do Supabase (supabase start).
// Troque a anon key abaixo pela impressa no `supabase start`/`supabase status`.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SUBSTITUA_PELA_SUA_ANON_KEY_LOCAL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signUpWithEmail({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function saveRestaurantProfile(payload) {
  // Tabela esperada: public.restaurants (ver onboarding form)
  const { data, error } = await supabase.from("restaurants").upsert(payload).select().single();
  if (error) throw error;
  return data;
}
