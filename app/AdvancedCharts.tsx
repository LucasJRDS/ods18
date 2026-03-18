"use client";

import * as React from "react";
import { ODS18TransformedData } from "@/lib/sidra";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { motion } from "framer-motion";

const chartConfig = {
  homens: { label: "Homens", color: "hsl(15, 77%, 31%)" }, // Tom escuro do projeto (Terracota forte)
  mulheres: { label: "Mulheres", color: "hsl(15, 80%, 60%)" }, // Tom vibrante do projeto (Laranja coral)
} satisfies ChartConfig;

export function GenderGapChart({ data }: { data: ODS18TransformedData[] }) {
  // Cálculos matemáticos auditados (Média Ponderada)
  // Renda média nacional real = Σ(Renda_UF * Pop_Ocupada_UF) / Σ(Pop_Ocupada_UF)
  const agg = data.reduce(
    (acc, curr) => {
      // Branca
      acc.hb_pop += curr.ocupacao.homens.branca;
      acc.hb_inc += curr.renda.homens.branca * curr.ocupacao.homens.branca;
      acc.mb_pop += curr.ocupacao.mulheres.branca;
      acc.mb_inc += curr.renda.mulheres.branca * curr.ocupacao.mulheres.branca;

      // Preta
      acc.hp_pop += curr.ocupacao.homens.preta;
      acc.hp_inc += curr.renda.homens.preta * curr.ocupacao.homens.preta;
      acc.mp_pop += curr.ocupacao.mulheres.preta;
      acc.mp_inc += curr.renda.mulheres.preta * curr.ocupacao.mulheres.preta;

      // Parda
      acc.hpa_pop += curr.ocupacao.homens.parda;
      acc.hpa_inc += curr.renda.homens.parda * curr.ocupacao.homens.parda;
      acc.mpa_pop += curr.ocupacao.mulheres.parda;
      acc.mpa_inc += curr.renda.mulheres.parda * curr.ocupacao.mulheres.parda;

      return acc;
    },
    { 
      hb_pop: 0, hb_inc: 0, mb_pop: 0, mb_inc: 0, 
      hp_pop: 0, hp_inc: 0, mp_pop: 0, mp_inc: 0, 
      hpa_pop: 0, hpa_inc: 0, mpa_pop: 0, mpa_inc: 0 
    }
  );
  
  const chartData = [
    { 
      raca: "Branca", 
      homens: agg.hb_inc / (agg.hb_pop || 1), 
      mulheres: agg.mb_inc / (agg.mb_pop || 1) 
    },
    { 
      raca: "Parda", 
      homens: agg.hpa_inc / (agg.hpa_pop || 1), 
      mulheres: agg.mpa_inc / (agg.mpa_pop || 1) 
    },
    { 
      raca: "Preta", 
      homens: agg.hp_inc / (agg.hp_pop || 1), 
      mulheres: agg.mp_inc / (agg.mp_pop || 1) 
    },
  ];

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] w-full bg-card rounded-2xl animate-pulse" />;
  }

  const htBranco = chartData.find(d => d.raca === "Branca")?.homens || 1;
  const mtPreta = chartData.find(d => d.raca === "Preta")?.mulheres || 0;
  const abismoGeral = ((1 - (mtPreta / htBranco)) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm flex flex-col"
    >
      <div className="mb-6 space-y-1">
        <h3 className="text-lg font-bold">Gender Pay Gap Étnico-Racial</h3>
        <p className="text-sm text-muted-foreground">
          Rendimento Nominal Médio Mensal (Brasil) cruzado por Sexo e Cor/Raça.
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[250px] w-full mb-4">
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-10" />
          <XAxis dataKey="raca" tickLine={false} axisLine={false} className="font-semibold text-sm" />
          <YAxis
            tickFormatter={(v) => `R$ ${(v / 1000).toFixed(1)}k`}
            axisLine={false}
            tickLine={false}
            className="text-xs opacity-50"
          />
          <ChartTooltip 
            cursor={{ fill: "currentColor", opacity: 0.05 }} 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const h = payload.find(p => p.dataKey === "homens")?.value as number || 1;
                const m = payload.find(p => p.dataKey === "mulheres")?.value as number || 0;
                const diferenca = ((1 - (m / h)) * 100).toFixed(1);
                
                return (
                  <div className="bg-background border border-border/50 p-3 rounded-xl shadow-xl min-w-[220px]">
                    <p className="font-bold text-sm mb-2 text-foreground">{label}</p>
                    <div className="space-y-1.5 text-xs text-foreground">
                      <div className="flex justify-between items-center text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartConfig.homens.color }}/>
                          Homens
                        </span>
                        <span>R$ {h.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartConfig.mulheres.color }}/>
                          Mulheres
                        </span>
                        <span>R$ {m.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">
                        Disparidade de Gênero
                      </p>
                      <p className="text-sm font-bold text-red-500">
                        Mulheres recebem {diferenca}% a menos
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }} 
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, opacity: 0.8 }} />
          <Bar dataKey="homens" name="Homens" fill={chartConfig.homens.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="mulheres" name="Mulheres" fill={chartConfig.mulheres.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ChartContainer>

      {/* Insight Analítico Fundo do Card */}
      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex gap-3 items-start">
          <div className="bg-red-500/10 p-2 rounded-full shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-0.5">Insight ODS 18</p>
            <p className="text-xs text-muted-foreground font-medium">
              O abismo sistêmico: As mulheres Negras ganham em média <strong className="text-red-600">{abismoGeral}% a menos</strong> que homens Brancos.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function WorkforceDemographicsChart({ data }: { data: ODS18TransformedData[] }) {
  // Aggregate total population strictly taking the sum of state data
  const agg = data.reduce(
    (acc, curr) => {
      acc.branca += curr.ocupacao.total.branca;
      acc.preta += curr.ocupacao.total.preta;
      acc.parda += curr.ocupacao.total.parda;
      return acc;
    },
    { branca: 0, preta: 0, parda: 0 }
  );

  const pieData = [
    { name: "População Branca", value: agg.branca, color: "hsl(15, 40%, 70%)" },
    { name: "População Parda", value: agg.parda, color: "hsl(15, 55%, 50%)" },
    { name: "População Preta", value: agg.preta, color: "hsl(15, 77%, 31%)" },
  ];

  const totalPop = agg.branca + agg.parda + agg.preta;
  const percPretaParda = (((agg.preta + agg.parda) / (totalPop || 1)) * 100).toFixed(1);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] w-full bg-card rounded-2xl animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="p-6 bg-card border border-border/60 rounded-2xl shadow-sm flex flex-col"
    >
      <div className="mb-2 space-y-1">
        <h3 className="text-lg font-bold">Composição da Força de Trabalho</h3>
        <p className="text-sm text-muted-foreground">
          Pessoas (14+ anos) ocupadas na semana de referência.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        <PieChart width={350} height={300}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const value = data.value;
                const percentage = ((value / totalPop) * 100).toFixed(1);
                return (
                  <div className="bg-background/95 backdrop-blur-sm border border-border/50 p-3 rounded-xl shadow-xl min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                       <p className="font-bold text-sm tracking-tight">{data.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-foreground">
                        {percentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {new Intl.NumberFormat("pt-BR").format(value)} PESSOAS
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, opacity: 0.8 }} />
        </PieChart>
      </div>

      {/* Insight Analítico Fundo do Card */}
      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 items-start">
          <div className="bg-primary/10 p-2 rounded-full shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">Insight ODS 18</p>
            <p className="text-xs text-muted-foreground font-medium">
              A população Negra (Preta e Parda) representa <strong className="text-primary">{percPretaParda}%</strong> da força de trabalho formal ocupada no Brasil.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
