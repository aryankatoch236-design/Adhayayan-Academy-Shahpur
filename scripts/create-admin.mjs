import {createClient} from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password=process.env.ADMIN_PASSWORD;
if(!url||!key||!email||!password){console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.");process.exit(1)}
if(password.length<12){console.error("Use a unique password with at least 12 characters.");process.exit(1)}
const supabase=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
let user;
const listed=await supabase.auth.admin.listUsers({page:1,perPage:1000});
if(listed.error)throw listed.error;
user=listed.data.users.find(x=>x.email?.toLowerCase()===email);
if(user){const changed=await supabase.auth.admin.updateUserById(user.id,{password,email_confirm:true});if(changed.error)throw changed.error;user=changed.data.user}
else{const created=await supabase.auth.admin.createUser({email,password,email_confirm:true});if(created.error)throw created.error;user=created.data.user}
const {error}=await supabase.from("site_admins").upsert({user_id:user.id},{onConflict:"user_id"});
if(error)throw error;
const allow=await supabase.from("admin_emails").upsert({email,notify:true,added_by:"setup"},{onConflict:"email"});
if(allow.error)console.warn("Run supabase/migration-admins.sql first to enable the admin email list.");
console.log(`Owner access is ready for ${email}. Sign in at /admin.`);
