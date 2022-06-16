import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string ?? "placeholderSupabaseUrl";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string ?? "placeholderSupabaseKey";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseUrl(bucket: string, filepath: string) {
	return supabase.storage.from(bucket).getPublicUrl(filepath);
}
