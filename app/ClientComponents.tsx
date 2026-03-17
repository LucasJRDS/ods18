"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const chartConfig = {
  branca: {
    label: "População Branca",
    color: "hsl(15, 40%, 70%)", // Antiga Parda
  },
  preta: {
    label: "População Preta",
    color: "hsl(15, 77%, 31%)", // Antiga Branca
  },
  parda: {
    label: "População Parda",
    color: "hsl(15, 50%, 50%)", // Antiga Preta
  },
} satisfies ChartConfig;

export default function ClientComponents({ type, data, geoUrl }: { type: "chart" | "map", data: any[], geoUrl?: string }) {
  
  if (type === "chart") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full mt-4"
      >
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="state"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs font-medium"
            />
            <YAxis 
              tickFormatter={(value) => `R$ ${value}`}
              width={80}
              axisLine={false}
              tickLine={false}
              className="text-xs font-medium"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="branca" fill="var(--color-branca)" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="parda" fill="var(--color-parda)" radius={[6, 6, 0, 0]} barSize={24} />
            <Bar dataKey="preta" fill="var(--color-preta)" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ChartContainer>
      </motion.div>
    );
  }

  if (type === "map" && geoUrl) {
    const colorScale = (ratio: number) => {
      if (ratio < 0.5) return "hsl(0, 84%, 60%)"; // Desigualdade alta
      if (ratio < 0.65) return "hsl(35, 92%, 60%)"; // Média
      return "hsl(142, 70%, 45%)"; // Paridade maior
    };

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full overflow-hidden mt-4"
      >
        <div className="relative aspect-video w-full flex items-center justify-center bg-muted/20 rounded-xl border border-border/50 shadow-sm">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 700, center: [-55, -15] }} className="w-full h-full">
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name || geo.properties.nome;
                  const stateData = data.find((d) => d.state === stateName);
                  const fillColor = stateData ? colorScale(stateData.ratio) : "oklch(0.8 0.01 20)";

                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger render={
                        <Geography
                          geography={geo}
                          fill={fillColor}
                          stroke="oklch(1 0 0 / 0.2)"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none", transition: "all 0.3s" },
                            hover: { fill: stateData ? "oklch(0.6 0.1 33)" : "oklch(0.8 0 0 / 0.2)", outline: "none", cursor: "pointer" },
                            pressed: { outline: "none" },
                          }}
                        />
                      } />
                      <TooltipContent side="top" className="bg-popover text-popover-foreground border shadow-lg px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm border-b pb-1">{stateName}</span>
                          {stateData ? (
                            <>
                              <div className="flex justify-between gap-4 text-xs">
                                <span>Paridade:</span>
                                <span className="font-mono font-bold">{stateData.gapSalarial}</span>
                              </div>
                              <div className="flex justify-between gap-4 text-xs opacity-80">
                                <span>Rend. Médio:</span>
                                <span>R$ {stateData.preta.toLocaleString('pt-BR')}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs italic opacity-70">Dados não consolidados</span>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { color: "hsl(0, 84%, 60%)", label: "Alta Desigualdade", sub: "< 0.50" },
            { color: "hsl(35, 92%, 60%)", label: "Média Desigualdade", sub: "< 0.65" },
            { color: "hsl(142, 70%, 45%)", label: "Maior Paridade", sub: "> 0.65" },
            { color: "oklch(0.8 0.01 20)", label: "Sem Dados", sub: "Disponível em breve" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <div className="size-4 rounded-sm shadow-sm" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-none">{item.label}</span>
                <span className="text-[10px] text-muted-foreground">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return null;
}
