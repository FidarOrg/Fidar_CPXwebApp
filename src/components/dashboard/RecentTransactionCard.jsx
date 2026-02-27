import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function RecentTransactionsCard({ items = [] }) {
  const [filter, setFilter] = useState("credit");
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((t) => t.type === filter); // 'credit' | 'debit' provided by normalization
  }, [items, filter]);

  return (
    <Card className="overflow-hidden border border-gray-300 dark:border-border">
      <CardHeader className="pb-2 sm:pb-3 sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FontAwesomeIcon icon={faCreditCard} className="h-4 w-4" />
            <span>{t("dashboard.recentTransactions")}</span>
          </CardTitle>

          <div className="flex flex-wrap gap-1.5 justify-end">
            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border border-gray-300 dark:border-border font-medium ${
                filter === "all" ? "bg-accent" : "hover:bg-accent/50"
              }`}
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              {t("dashboard.all")}
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-gray-300 dark:border-border ${
                filter === "credit"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => setFilter("credit")}
              aria-pressed={filter === "credit"}
            >
              {t("dashboard.in")}
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-gray-300 dark:border-border ${
                filter === "debit"
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => setFilter("debit")}
              aria-pressed={filter === "debit"}
            >
              {t("dashboard.out")}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[16rem] xs:h-[18rem] sm:h-[20rem] md:h-[22rem] lg:h-[19rem] rounded-md border border-gray-300 dark:border-border">
          <ul className="divide-y divide-border">
            {filtered.map(({ id, type, amount, description, time, status }) => {
              const isCredit = type === "credit";
              return (
                <li
                  key={id}
                  className="group px-3 py-3 sm:py-3.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-md ring-1 ring-border ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isCredit ? faArrowUp : faArrowDown}
                        className="h-4 w-4"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {description}
                        </p>
                        <span
                          className={`hidden sm:inline text-sm font-semibold ${
                            isCredit ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {amount}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground">
                          {time}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`sm:hidden text-sm font-semibold ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {amount}
                          </span>
                          <Badge
                            variant={status === "completed" ? "default" : "secondary"}
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              status === "pending"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                                : ""
                            }`}
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-sm text-muted-foreground">
                {t("dashboard.noTransactions")}
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
