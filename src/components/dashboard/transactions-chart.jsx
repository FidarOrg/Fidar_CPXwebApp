import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";

export default function TransactionsChart({
  data,
  heightClass = "h-80",
  currency = "USD",
  locale = undefined,
}) {
  const { theme } = useTheme(); // <-- detect theme (light/dark)

  // Using CSS variables *after* theme changes
  const creditColor = useMemo(() => `hsl(var(--chart-2))`, [theme]);
  const debitColor = useMemo(() => `hsl(var(--chart-1))`, [theme]);
  const gridColor = useMemo(() => `hsl(var(--border))`, [theme]);
  const axisColor = useMemo(() => `hsl(var(--muted-foreground))`, [theme]);



  


  const { t } = useTranslation();

  const hasData = Array.isArray(data) && data.length > 0;

  const fmt = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      });
    } catch {
      return { format: (n) => `$${Math.round(n)}` };
    }
  }, [currency, locale]);

  return (
    <div className={`relative w-full ${heightClass} min-h-[12rem] sm:min-h-[16rem]`}>
      {!hasData && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          {t("dashboard.nodata")}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={hasData ? data : []}
          margin={{ top: 6, right: 8, left: 0, bottom: 2 }}
          key={theme} // <-- CRITICAL: re-render chart on theme change!
        >
          <defs>
            <linearGradient id="creditFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={creditColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={creditColor} stopOpacity={0.02} />
            </linearGradient>

            <linearGradient id="debitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={debitColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={debitColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
            stroke={axisColor}
          />


          <YAxis
            width={48}
            stroke={axisColor}
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => fmt.format(v)}
          />




          <ReTooltip
            formatter={(value, name) => [fmt.format(value), name]}
            labelFormatter={(label) => `${label}`}
            cursor={{ stroke: gridColor }}
            contentStyle={{
              background: theme === "dark"
                ? "hsl(var(--background))"
                : "hsl(var(--card))",

              border: theme === "dark"
                ? "1px solid hsl(var(--border))"
                : "1px solid hsl(var(--border))",

              borderRadius: "8px",
              padding: "10px",

              color: theme === "dark"
                ? "hsl(var(--foreground))"
                : "hsl(var(--foreground))",

              boxShadow:
                theme === "dark"
                  ? "0 4px 16px rgba(0,0,0,0.6)"
                  : "0 4px 12px rgba(0,0,0,0.1)",
            }}
            labelStyle={{
              color: theme === "dark"
                ? "hsl(var(--foreground))"
                : "hsl(var(--foreground))",
              fontWeight: 600,
              marginBottom: 4,
            }}
            itemStyle={{
              color: theme === "dark"
                ? "hsl(var(--foreground))"
                : "hsl(var(--foreground))",
              fontSize: 12,
            }}
          />

          <g className="hidden sm:block">
            <Legend verticalAlign="top" height={24} />
          </g>

          <Area
            type="monotone"
            dataKey="credit"
            name="Credit"
            stroke={creditColor}
            fill="url(#creditFill)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />

          <Area
            type="monotone"
            dataKey="debit"
            name="Debit"
            stroke={debitColor}
            fill="url(#debitFill)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
