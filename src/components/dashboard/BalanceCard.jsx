import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

export default function BalanceCard({ name, balanceLabel, balanceValue }) {
  const safeValue = balanceValue ?? ""; // prevent undefined crash

  // Expected format: "USD 81130.00"
  const [label = "", rawAmount = "0"] = safeValue.split(" ");

  // Split integer + decimals safely
  const [intPart = "0", decimalPart] = rawAmount.split(".");

  // Format integer with commas
  const formattedInt = Number(intPart).toLocaleString("en-IN");

  // Reattach decimals
  const formattedBalance =
    decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;

  const { t } = useTranslation();
  return (
    <Card className="relative overflow-hidden border-0 shadow-xl h-52 lg:h-64 rounded-2xl
                     bg-gradient-to-r from-pink-900 via-purple-900 to-blue-900
                     hover:from-pink-800 hover:via-purple-800 hover:to-blue-800
                     transition-all duration-300
                     hover:shadow-[0_0_20px_rgba(88,28,135,0.6)]">
      
      {/* Optional soft glow behind card */}
      <div className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br
                      from-pink-800/40 via-purple-800/35 to-blue-800/40 blur-sm" 
           aria-hidden="true" />
      
      {/* Light overlay for shine effect */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_35%,transparent_70%)] 
                      mix-blend-soft-light" aria-hidden="true" />

      <CardContent className="relative h-full p-5 lg:p-6 text-white flex items-center">
        <div className="flex w-full justify-between items-start">
          <div className="space-y-1.5">
            <p className="text-blue-100/90 text-sm font-semibold select-none">{t("dashboard.hi")}</p>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight select-text">Mohamed AK</h1>
            <p className="text-blue-100/80 text-xs select-none">{balanceLabel}</p>
            <p className="text-4xl lg:text-5xl font-extrabold mt-0.5 select-text">{label} {formattedBalance}</p>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* <div className="bg-white/15 hover:bg-white/25 rounded-full p-3 cursor-pointer shadow-md ring-1 ring-white/30 transition-all select-none">
                  <FontAwesomeIcon icon={faBuildingColumns} className="h-7 w-7 text-white" />
                </div> */}
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>{t("dashboard.securebank")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
