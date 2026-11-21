import { createBrowserClient } from "@supabase/ssr";
export function createClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error("Admin storage is not configured yet. Add Supabase environment variables and reload.");return createBrowserClient(url,key)}
