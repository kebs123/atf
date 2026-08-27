import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/lib/categories";
import { CATEGORY_COLORS, categoryTotals } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Row = { day: string; values: Record<CategoryId, number> };

export function AnalyticsBoard({
  series,
  title,
}: {
  series: Row[];
  title: string;
}) {
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [hover, setHover] = useState<number | null>(null);

  const keys = useMemo(
    () => (active === "all" ? CATEGORIES.map((c) => c.id) : [active]),
    [active],
  );

  const max = useMemo(() => {
    let m = 1;
    for (const row of series) {
      const sum = keys.reduce((acc, k) => acc + row.values[k], 0);
      if (sum > m) m = sum;
    }
    return m;
  }, [series, keys]);

  const totals = categoryTotals(series);
  const grand = Object.values(totals).reduce((a, b) => a + b, 0);
  const hoverRow = hover !== null ? series[hover] : series[series.length - 1];
  const hoverSum = keys.reduce((acc, k) => acc + hoverRow.values[k], 0);

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-primary">Live mix</p>
          <h2 className="text-xl font-light tracking-tight mt-1">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap a category to isolate it. Hover a day for the exact count.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-colors",
              active === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary",
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-colors",
                active === c.id ? "text-primary-foreground border-transparent" : "border-border hover:bg-secondary",
              )}
              style={active === c.id ? { background: CATEGORY_COLORS[c.id] } : undefined}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-4">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-soft overflow-hidden">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-sm text-muted-foreground">{hoverRow.day}</p>
            <p className="text-2xl font-light tabular-nums">{hoverSum.toLocaleString()}</p>
          </div>
          <div
            className="flex items-end gap-1.5 h-48"
            onMouseLeave={() => setHover(null)}
          >
            {series.map((row, i) => {
              const sum = keys.reduce((acc, k) => acc + row.values[k], 0);
              const h = Math.max(6, (sum / max) * 100);
              return (
                <button
                  key={row.day}
                  type="button"
                  className="flex-1 h-full flex flex-col justify-end group"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  aria-label={`${row.day}: ${sum} checks`}
                >
                  <div className="w-full rounded-t-md overflow-hidden flex flex-col-reverse" style={{ height: `${h}%` }}>
                    {keys.map((k) => {
                      const part = row.values[k];
                      const pct = sum === 0 ? 0 : (part / sum) * 100;
                      return (
                        <motion.div
                          key={k}
                          layout
                          className="w-full origin-bottom"
                          style={{ height: `${pct}%`, background: CATEGORY_COLORS[k], opacity: hover === null || hover === i ? 1 : 0.35 }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.45, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                        />
                      );
                    })}
                  </div>
                  <span className="mt-2 text-[9px] uppercase tracking-wider text-muted-foreground hidden sm:block truncate">
                    {row.day.replace(" Aug", "")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {CATEGORIES.map((c) => {
            const n = totals[c.id];
            const pct = grand ? Math.round((n / grand) * 100) : 0;
            const on = active === "all" || active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(active === c.id ? "all" : c.id)}
                className={cn(
                  "w-full text-left rounded-2xl border border-border bg-card p-4 transition-all",
                  on ? "shadow-soft" : "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{categoryLabel(c.id)}</span>
                  <span className="text-sm tabular-nums">{pct}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: CATEGORY_COLORS[c.id] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 tabular-nums">{n.toLocaleString()} checks</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
