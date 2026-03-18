"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShieldCheck } from "lucide-react";
import { ODS18TransformedData } from "@/lib/sidra";
import { Badge } from "@/components/ui/badge";

// ─── Config ──────────────────────────────────────────────────────────────────
const chartConfig = {
  branca: { label: "População Branca", color: "hsl(15, 40%, 70%)" },
  preta:  { label: "População Preta",  color: "hsl(15, 77%, 31%)" },
  parda:  { label: "População Parda",  color: "hsl(15, 55%, 50%)" },
} satisfies ChartConfig;

const colorScale = (ratio: number) => {
  if (ratio < 0.5)  return "#ef4444"; // red-500
  if (ratio < 0.65) return "#f97316"; // orange-500
  return "#22c55e";                   // green-500
};

const ratioBadgeClass = (ratio: number) =>
  ratio < 0.5
    ? "bg-red-500/10 text-red-600 border-red-500/20"
    : ratio < 0.65
    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : "bg-green-500/10 text-green-600 border-green-500/20";

// GeoJSON — Brazil States (Served locally for stability)
const GEO_URL = "/brazil-states.geojson";

interface ClientComponentProps {
  data: ODS18TransformedData[];
  avgRatio: number;
  avgIncomeNegra?: number;
}

// ─── Gráfico de Barras ────────────────────────────────────────────────────────
export function AllStatesChart({ data, avgRatio, avgIncomeNegra }: ClientComponentProps) {
  const [hoveredSigla, setHoveredSigla] = React.useState<string | null>(null);
  // 100px por estado
  const chartWidth = Math.max(data.length * 100, 960);
  // Média nacional para linha de referência
  const piorEstado = data.reduce((min, d) => d.ratio < min.ratio ? d : min, data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-3 w-full min-w-0"
    >
      {/* Legenda compacta */}
      <div className="flex items-center gap-5 flex-wrap">
        {Object.entries(chartConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            {cfg.label}
          </div>
        ))}
        <div className="ml-auto text-[10px] text-muted-foreground/60 hidden sm:block">
          ← Role para ver todos os estados →
        </div>
      </div>

      {/* Chart scrollável */}
      <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm max-w-full">
        <div className="overflow-x-auto pb-1 w-full translate-z-0">
          <div style={{ width: chartWidth, minWidth: "100%" }}>
            <ChartContainer config={chartConfig} className="h-[340px] w-full">
              <BarChart
                data={data}
                margin={{ top: 16, right: 12, left: 0, bottom: 56 }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="opacity-[0.06]"
                />
                <XAxis
                  dataKey="sigla"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fontSize: 10.5, fontWeight: 700, fill: "currentColor" }}
                  angle={-40}
                  textAnchor="end"
                  tickMargin={6}
                />
                <ReferenceLine
                  y={avgIncomeNegra}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Média Nacional',
                    position: 'top',
                    fill: '#ef4444',
                    fontSize: 10,
                    fontWeight: 'bold',
                    offset: 10
                  }}
                />
                <YAxis
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  width={56}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                />
                <ChartTooltip
                  cursor={{ fill: "currentColor", opacity: 0.04, radius: 6 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const stateName = data.find((d) => d.sigla === label)?.state ?? label;
                      return (
                        <div className="bg-background border border-border/50 p-3 rounded-xl shadow-xl min-w-[220px]">
                          <p className="font-bold text-sm mb-2 border-b border-border/40 pb-1.5 text-foreground">{stateName}</p>
                          <div className="space-y-1.5 text-foreground">
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs gap-4">
                                <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}/>
                                  {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}
                                </span>
                                <span className="font-bold">
                                  R$ {Number(entry.value).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="branca"
                  fill={chartConfig.branca.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="parda"
                  fill={chartConfig.parda.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
                <Bar
                  dataKey="preta"
                  fill={chartConfig.preta.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
        {/* Gradiente fade nas bordas para indicar scroll */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent" />
      </div>

      {/* Contador por região */}
      <div className="flex flex-wrap gap-2">
        {(["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"] as const).map(
          (r) => {
            const n = data.filter((d) => d.regiao === r).length;
            const avg = data
              .filter((d) => d.regiao === r)
              .reduce((s, d) => s + d.ratio, 0) / n;
            return (
              <div
                key={r}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-muted/40 text-xs"
              >
                <div
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: colorScale(avg) }}
                />
                <span className="font-semibold">{r}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {n} UFs · {(avg * 100).toFixed(0)}%
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Insight Analítico */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex gap-3 items-start">
          <div className="bg-amber-500/10 p-2 rounded-full shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-600"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mb-0.5">Insight ODS 18</p>
            <p className="text-xs text-muted-foreground font-medium">
              Nenhum estado do país hoje alcança a paridade total (100%). O indicador mais alarmante registrado na tabela foi no estado do <strong className="text-amber-600 font-black">{piorEstado.state}</strong>, onde pessoas negras ganham apenas {piorEstado.gapSalarial} do salário de pessoas brancas em média.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mapa do Brasil ───────────────────────────────────────────────────────────
export function BrazilMap({ data, avgRatio }: ClientComponentProps) {
  const [activeState, setActiveState] = React.useState<ODS18TransformedData | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Wrapper do mapa — muito maior */}
      <div className="relative w-full rounded-2xl border border-border/50 bg-muted/10 overflow-hidden shadow-sm flex justify-center items-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 900, center: [-54, -13] }}
          style={{ width: "100%", height: "auto" }}
          viewBox="0 0 800 780"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name || geo.properties.nome;
                const d = data.find((s) => s.state === name);
                const isActive = activeState?.state === name;
                const fill = d ? colorScale(d.ratio) : "#94a3b8";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isActive ? "var(--primary)" : fill}
                    fillOpacity={isActive ? 1 : d ? 0.82 : 0.3}
                    stroke={isActive ? "var(--primary)" : "#fff"}
                    strokeWidth={isActive ? 2 : 0.6}
                    strokeOpacity={isActive ? 1 : 0.6}
                    style={{
                      default: { outline: "none", transition: "all 0.2s ease" },
                      hover: {
                        fill: d ? "var(--primary)" : "#cbd5e1",
                        fillOpacity: 1,
                        outline: "none",
                        cursor: d ? "pointer" : "default",
                        filter: d ? "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" : "none",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={() => d && setActiveState(d)}
                    onMouseLeave={() => setActiveState(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip flutuante no canto do mapa */}
        <AnimatePresence>
          {activeState && (
            <motion.div
              key={activeState.sigla}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[240px] rounded-2xl border border-white/20 bg-background/70 backdrop-blur-xl shadow-2xl p-5 space-y-3 z-50 pointer-events-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{activeState.regiao}</p>
                  <p className="font-bold text-sm leading-tight">{activeState.state}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black border ${ratioBadgeClass(activeState.ratio)}`}
                >
                  {activeState.gapSalarial}
                </span>
              </div>
              <div className="space-y-1.5 border-t border-border/50 pt-2.5">
                {[
                  { label: "População Branca", value: activeState.branca, color: chartConfig.branca.color },
                  { label: "População Parda",  value: activeState.parda,  color: chartConfig.parda.color  },
                  { label: "População Preta",  value: activeState.preta,  color: chartConfig.preta.color  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold">
                      R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              {/* Mini barra de paridade */}
              <div className="space-y-1 border-t border-border/50 pt-2">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Índice de Paridade</span>
                  <span className="font-mono">{activeState.gapSalarial}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${activeState.ratio * 100}%`,
                      backgroundColor: colorScale(activeState.ratio),
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint de interação */}
        {!activeState && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[11px] text-muted-foreground font-medium pointer-events-none">
            Passe o mouse sobre os estados para ver os dados
          </div>
        )}
      </div>

      {/* Legenda do mapa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { color: "#ef4444", label: "Alta Desigualdade",  sub: "Paridade < 50%" },
          { color: "#f97316", label: "Média Desigualdade", sub: "50% — 65%" },
          { color: "#22c55e", label: "Maior Paridade",     sub: "Paridade > 65%" },
          { color: "#94a3b8", label: "Sem Dados",          sub: "Não disponível" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/40"
          >
            <div
              className="size-3 rounded-full mt-0.5 shrink-0 shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-xs font-bold leading-none">{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Analítico Mapa */}
      <div className="mt-4 pt-4 border-t border-border/40">
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 flex gap-3 items-start">
          <div className="bg-green-500/10 p-2 rounded-full shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-600"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5">Insight ODS 18</p>
            <p className="text-xs text-muted-foreground font-medium">
              É possível identificar facilmente uma forte assimetria macro-regional. Quase todo o território do <strong className="text-green-600 font-bold">Norte e Nordeste</strong> apresenta níveis moderados a altos de paridade (tons verdes), enquanto todo o eixo <strong className="text-red-500 font-bold">Sul, Sudeste e Centro-Oeste</strong> (onde se concentra a renda do Brasil) desponta em Vermelho e Laranja, representando concentração intensa de desigualdade salarial da População Negra frente à Branca.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Export padrão (compatibilidade com código antigo) ────────────────────────
export default function ClientComponents({
  type,
  data,
  avgRatio = 0.624,
  avgIncomeNegra = 2400, // Valor padrão aproximado p/ compatibilidade
  geoUrl,
}: {
  type: "chart" | "map";
  data: ODS18TransformedData[];
  avgRatio?: number;
  avgIncomeNegra?: number;
  geoUrl?: string;
}) {
  if (type === "chart") return <AllStatesChart data={data} avgRatio={avgRatio} avgIncomeNegra={avgIncomeNegra} />;
  if (type === "map") return <BrazilMap data={data} avgRatio={avgRatio} />;
  return null;
}

// ─── Helpers Internos ────────────────────────────────────────────────────────
function ratioBadge(ratio: number, label: string) {
  const cls =
    ratio < 0.5
      ? "bg-red-500/10 text-red-600 border border-red-500/20"
      : ratio < 0.65
      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
      : "bg-green-500/10 text-green-600 border border-green-500/20";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Seção de Tabela com Filtros ─────────────────────────────────────────────
export function DataTableSection({ data }: { data: ODS18TransformedData[] }) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("Todas");

  const regions = ["Todas", "Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"];

  const filteredData = data.filter((row) => {
    const matchesSearch =
      row.state.toLowerCase().includes(search.toLowerCase()) ||
      row.sigla.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = selectedRegion === "Todas" || row.regiao === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros (Busca e Região) */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-end">
        {/* Busca */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar estado ou sigla..."
            className="pl-10 h-10 bg-muted/20 border-border/40 focus:bg-background transition-all rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro de Região */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-border/40 bg-muted/30">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`
                px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap
                ${
                  selectedRegion === r
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/20"
                }
              `}
            >
              {r === "Todas" ? "TUDO" : r}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border-border/40 max-w-full">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-bold text-[11px] w-8 pl-4">#</TableHead>
                <TableHead className="font-bold text-[11px]">UF</TableHead>
                <TableHead className="font-bold text-[11px] hidden sm:table-cell">
                  Região
                </TableHead>
                <TableHead className="text-right font-bold text-[11px]">Branca</TableHead>
                <TableHead className="text-right font-bold text-[11px]">Preta</TableHead>
                <TableHead className="text-right font-bold text-[11px] hidden md:table-cell">
                  Parda
                </TableHead>
                <TableHead className="text-right font-bold text-[11px] pr-4">
                  Paridade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <TableRow
                    key={row.state}
                    className="hover:bg-primary/5 transition-colors group cursor-default"
                  >
                    <TableCell className="text-muted-foreground text-[11px] pl-4 w-8">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-primary text-xs group-hover:scale-110 transition-transform origin-left inline-block">
                          {row.state}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {row.sigla}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground hidden sm:table-cell">
                      {row.regiao}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px]">
                      {row.branca.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                      {row.preta.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-muted-foreground hidden md:table-cell">
                      {row.parda.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      {ratioBadge(row.ratio, row.gapSalarial)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum estado encontrado para "{search}" em {selectedRegion}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
