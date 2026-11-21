export const phoneLink=(phone:string)=>`tel:${phone.replace(/[^+\d]/g,"")}`;
export const waLink=(phone:string,message="Hello, I would like to enquire about Adhyayan Academy.")=>`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`;
export function youtubeId(url:string){try{const u=new URL(url),candidate=u.hostname.includes("youtu.be")?u.pathname.slice(1):u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop()||"";return /^[a-zA-Z0-9_-]{6,20}$/.test(candidate)?candidate:""}catch{return ""}}
