import { Brand } from "@/components/brand";
import { AuthMenu } from "@/components/auth-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteSettings } from "@/lib/data";
export function Header({settings}:{settings:SiteSettings}){return <header className="site-header"><div className="container header-inner"><Brand logo={settings.logo_url||"/logo-mark.png"}/><nav className="nav-links"><a href="/#courses">Courses</a><a href="/#about">Why Adhyayan</a><a href="/#contact">Contact</a></nav><div className="header-actions"><ThemeToggle/><AuthMenu/><a className="button button-small" href="/#contact">Enquire <span aria-hidden="true">↗</span></a></div></div></header>}
