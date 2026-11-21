import {createClient as createSupabaseClient} from "@supabase/supabase-js";
export function createPublicClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)return null;return createSupabaseClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
