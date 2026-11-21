import type {MetadataRoute} from "next";
import {getPublicData} from "@/lib/data";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";const {courses}=await getPublicData();return [{url:base,lastModified:new Date(),changeFrequency:"weekly",priority:1},...courses.map(c=>({url:`${base}/courses/${c.slug}`,lastModified:new Date(),changeFrequency:"monthly" as const,priority:.8}))]}
