import { useLanguage } from "@/providers/LanguageProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-md">
          <Globe className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8}>

        {/* English */}
        <DropdownMenuItem
          onClick={() => toggleLanguage("en")}
          className={lang === "en" ? "font-bold" : ""}
        >
          English
        </DropdownMenuItem>

        {/* Arabic */}
        <DropdownMenuItem
          onClick={() => toggleLanguage("ar")}
          className={lang === "ar" ? "font-bold" : ""}
        >
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
