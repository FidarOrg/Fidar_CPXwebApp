import { faListCheck, faGear, faHouse, faBook, faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const dir = document.documentElement.dir;

  const items = [
    { label: t("dashboard.overview"), icon: faHouse,         path: "/dashboard" },
    { label: "Tasks",                 icon: faListCheck,     path: "/analytics" },
    { label: "Policies",              icon: faBook,          path: "/policies" },
    { label: "Audit",                 icon: faClipboardList, path: "/audit" },
    { label: t("dashboard.settings"), icon: faGear,          path: "/settings" },
  ];

  return (
    <aside
      className={`w-full lg:w-60 shrink-0 text-sidebar-foreground
      lg:sticky lg:top-14 lg:h-[calc(100vh-56px)]
      ${dir === "rtl" ? "lg:right-0" : "lg:left-0"}
      transition-all duration-300`}
      style={{
        background: "#fff",
        boxShadow: dir === "rtl" ? "-4px 0 16px rgba(0,0,0,0.08)" : "4px 0 16px rgba(0,0,0,0.08)",
      }}
    >
      <nav className="p-3 space-y-1.5">
        {items.map((it) => {
          const isActive = location.pathname === it.path;

          return (
            <Button
              key={it.label}
              variant="ghost"
              className={`h-14 w-full justify-start gap-3 px-3 text-base font-medium tracking-tight
                hover:bg-sidebar-accent
                ${dir === "rtl" ? "flex-row-reverse" : ""}
                ${isActive ? "bg-sidebar-accent text-gray-950 dark:text-gray-300" : ""}
              `}
              onClick={() => navigate(it.path)}
            >
              <FontAwesomeIcon icon={it.icon} className="h-6 w-6" />
              <span>{it.label}</span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
