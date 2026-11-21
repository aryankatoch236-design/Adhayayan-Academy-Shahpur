"use client";
import type { SiteSettings } from "@/lib/data";
import { phoneLink, waLink } from "@/lib/text";
export function FloatingActions({settings}:{settings:SiteSettings}){return <div className="floating-actions"><a className="float-call" href={phoneLink(settings.phone_main)} aria-label="Call Adhyayan Academy">Call</a><a className="float-wa" href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="Message Adhyayan Academy on WhatsApp">WhatsApp</a></div>}
