import {
  Link as LinkIcon,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  ShoppingBag,
  Briefcase,
  Mail,
  MessageCircle,
  Camera,
  Music,
  Shirt,
  Star,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  link: LinkIcon,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  twitter: Twitter,
  globe: Globe,
  "shopping-bag": ShoppingBag,
  briefcase: Briefcase,
  mail: Mail,
  "message-circle": MessageCircle,
  camera: Camera,
  music: Music,
  shirt: Shirt,
  star: Star,
};

export function LinkIconGlyph({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? LinkIcon;
  return <Icon className={className} strokeWidth={1.75} />;
}
