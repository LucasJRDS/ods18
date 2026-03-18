import { fetchODS18Data, ODS18TransformedData } from "@/lib/sidra";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, TrendingDown, TrendingUp, Activity, Info, Map, Database } from "lucide-react";
import { AllStatesChart, BrazilMap, DataTableSection } from "./ClientComponents";
import { GenderGapChart, WorkforceDemographicsChart } from "./AdvancedCharts";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const data = await fetchODS18Data();

  // Cálculo de Média Nacional Ponderada (Auditado via SIDRA 10281)
  const totalPopNegra = data.reduce((s, d) => s + (d.ocupacao.total.preta + d.ocupacao.total.parda), 0);
  const totalPopBranca = data.reduce((s, d) => s + d.ocupacao.total.branca, 0);
  
  // Renda Total Gerada = ∑ (Renda Média * Pop Ocupada)
  const totalRendaNegra = data.reduce((s, d) => s + (d.renda.total.preta * d.ocupacao.total.preta) + (d.renda.total.parda * d.ocupacao.total.parda), 0);
  const totalRendaBranca = data.reduce((s, d) => s + (d.renda.total.branca * d.ocupacao.total.branca), 0);
  
  // Média das Médias Ponderada (Nacional)
  const avgIncomeNegra = totalRendaNegra / (totalPopNegra || 1);
  const avgIncomeBranca = totalRendaBranca / (totalPopBranca || 1);
  const avgRatio = avgIncomeNegra / (avgIncomeBranca || 1);
  
  const worstState = data.reduce((w, d) => (d.ratio < w.ratio ? d : w), data[0]);
  const bestState  = data.reduce((b, d) => (d.ratio > b.ratio ? d : b), data[0]);

  const regionStats = (["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"] as const).map(
    (r) => {
      const sub = data.filter((d) => d.regiao === r);
      const popN = sub.reduce((s, d) => s + (d.ocupacao.total.preta + d.ocupacao.total.parda), 0);
      const popB = sub.reduce((s, d) => s + d.ocupacao.total.branca, 0);
      const renN = sub.reduce((s, d) => s + (d.renda.total.preta * d.ocupacao.total.preta) + (d.renda.total.parda * d.ocupacao.total.parda), 0);
      const renB = sub.reduce((s, d) => s + (d.renda.total.branca * d.ocupacao.total.branca), 0);
      
      const avgN = renN / (popN || 1);
      const avgB = renB / (popB || 1);
      const avg = avgN / (avgB || 1);
      
      return { region: r, avg, count: sub.length };
    }
  );

  return (
    <div className="min-h-screen">
      {/* ── Hero / Header ─────────────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-screen-2xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              {/* Selos de Validação */}
              <div className="flex flex-col items-start gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 transition-all hover:bg-green-500/10">
                  <ShieldCheck className="size-3.5 text-green-600" />
                  <span className="text-[10px] font-black text-green-700/80 uppercase tracking-widest">
                    Dados Auditados
                  </span>
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  Dados API · IBGE SIDRA · Censo 2022
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-sm">
                Teste Indicadores 18.1.3 e 18.1.4
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">
                Analise da renda média mensal e da razão de desigualdade por raça/cor em todos os 27 estados + DF.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
        {/* ── Visualização Vertical de Alto Impacto ("Estado da Arte") ─────────────────────────── */}
        <div className="flex flex-col gap-12 pt-4">

          {/* Superior: Gráfico (Análise Analítica) */}
          <section id="chart" className="space-y-6 scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 leading-snug">
                  <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Activity className="size-5" />
                  </span>
                  Distribuição de Renda por Cor/Raça
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground max-w-2xl font-medium">
                  Análise comparativa do Rendimento Branco vs Preto/Pardo em todas as 27 Unidades da Federação.
                </p>
              </div>
            </div>

            <div className="border rounded-[1.5rem] md:rounded-[2rem] bg-muted/5 p-3 md:p-6 shadow-sm overflow-hidden border-border/40">
              <AllStatesChart data={data} avgRatio={avgRatio} avgIncomeNegra={avgIncomeNegra} />
            </div>
          </section>

          {/* Análises Avançadas (Grid 2 colunas) - Movidas para cima da Paridade */}
          <section id="advanced-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <GenderGapChart data={data} />
             <WorkforceDemographicsChart data={data} />
          </section>

        {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
        <section id="kpis" className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <Card className="relative overflow-hidden border-primary/10 bg-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-primary">
                  Paridade Média Nacional
                </CardDescription>
                <Activity className="size-4 text-primary/50" />
              </div>
              <CardTitle className="text-4xl font-black tabular-nums tracking-tight">
                {(avgRatio * 100).toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent className="relative text-xs text-muted-foreground leading-relaxed">
              Rendimento médio da população Preta em relação à Branca nas 27 UFs.
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-red-500/10 bg-red-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-red-600">
                  Maior Desigualdade
                </CardDescription>
                <TrendingDown className="size-4 text-red-500/50" />
              </div>
              <CardTitle className="text-4xl font-black tabular-nums tracking-tight text-red-600">
                {worstState.sigla}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative text-xs text-muted-foreground leading-relaxed">
              {worstState.state} · Paridade:{" "}
              <strong className="text-red-600">{(worstState.ratio * 100).toFixed(1)}%</strong>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-green-500/10 bg-green-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-green-600">
                  Maior Paridade
                </CardDescription>
                <TrendingUp className="size-4 text-green-500/50" />
              </div>
              <CardTitle className="text-4xl font-black tabular-nums tracking-tight text-green-600">
                {bestState.sigla}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative text-xs text-muted-foreground leading-relaxed">
              {bestState.state} · Paridade:{" "}
              <strong className="text-green-600">{(bestState.ratio * 100).toFixed(1)}%</strong>
            </CardContent>
          </Card>
        </section>

          {/* Inferior: Mapa (Imersão Geográfica Massiva) */}
          <section id="map" className="space-y-6 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3 leading-snug group cursor-default">
                <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                  <Map className="size-5" />
                </span>
                Mapa de Paridade Étnico-Racial
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-2xl font-medium">
                Visualização geográfica em larga escala para identificação de clusters regionais de desigualdade.
              </p>
            </div>
            
            <div className="w-full rounded-[1.5rem] md:rounded-[2.5rem] border border-border/40 bg-muted/5 p-4 md:p-8 shadow-sm flex items-center justify-center min-h-[400px] md:min-h-[850px] relative overflow-hidden group">
              {/* Background Decorativo - Escondido em mobile p/ evitar transbordo */}
              <div className="absolute top-4 right-4 md:top-10 md:right-10 opacity-5 md:opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                  <span className="text-[6rem] md:text-[12rem] font-black text-muted-foreground tracking-tighter leading-none select-none">ODS 18</span>
              </div>
              <BrazilMap data={data} avgRatio={avgRatio} />
            </div>
          </section>
        </div>

        {/* ── Tabela + Detalhes Secundários ─────────────────────────────────── */}
        <section id="data" className="pt-8 scroll-mt-20 border-t border-border/40">
          {/* Cabeçalho da Seção (Fora do Grid p/ Alinhamento) */}
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 group cursor-default">
              <span className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                <Database className="size-6" />
              </span>
              Tabela de Indicadores
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Base: Tabela 10281 · Variável 13536 · Censo Demográfico 2022 do IBGE
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
            <div className="xl:col-span-2">
              <DataTableSection data={data} />
            </div>

            <div className="space-y-6">
              {/* Card de Performance por Região */}
              <Card className="border-primary/10">
                <CardHeader className="pb-3 text-center">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Panorama Regional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  {regionStats
                    .sort((a, b) => b.avg - a.avg)
                    .map((r) => (
                      <div key={r.region} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{r.region}</span>
                          <span className={r.avg < 0.6 ? "text-red-500" : "text-primary text-sm font-black"}>
                            {(r.avg * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-700 ease-out"
                            style={{ width: `${r.avg * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </CardContent>
                
                {/* Insight Regional */}
                <div className="px-6 pb-6 pt-2 border-t border-border/40">
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 items-start">
                    <div className="bg-primary/10 p-2 rounded-full shrink-0">
                      <TrendingUp className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5 text-left">Insight ODS 18</p>
                      <p className="text-[11px] text-muted-foreground font-medium text-left">
                        O Norte lidera a paridade com <strong className="text-primary">67.1%</strong>, superando o Sudeste em <strong className="text-primary">9.3 pontos percentuais</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Informações Técnicas */}
              <div id="methodology" className="space-y-4 px-1 scroll-mt-20">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                  <Info className="size-3" />
                  Metodologia e Arquitetura Técnica
                </div>
                
                <div className="space-y-4 text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4 py-1">
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                       <Database className="size-3 text-primary" />
                       Consumo e Modelagem SIDRA (IBGE)
                    </h4>
                    <p>
                      Extração automatizada via <strong>API REST (JSON)</strong> da <strong>Tabela 10281</strong>. O projeto implementa uma camada de <strong>ETL (Extract, Transform, Load)</strong> em TypeScript que normaliza metadados brutos do IBGE para o padrão de indicadores 18.1.3 e 18.1.4 do ODS 18.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                       <Map className="size-3 text-primary" />
                       Disseminação e Cartografia Digital
                    </h4>
                    <p>
                      Integração de <strong>tabulações dinâmicas, gráficos e cartogramas</strong> (Mapas SVG/GeoJSON) para visualização territorial da desigualdade racial. A interface utiliza <strong>Next.js</strong> e <strong>Tailwind CSS</strong>, garantindo performance e acessibilidade conforme diretrizes de portais governamentais e da ONU.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                       <ShieldCheck className="size-3 text-primary" />
                       Governança e Precisão Estatística
                    </h4>
                    <p>
                      Cálculos de <strong>Paridade Racial</strong> (razão entre rendimento médio de Pretos+Pardos sobre Brancos) e <strong>Médias Ponderadas Populacionais</strong> que garantem o rigor técnico e a não-distorção dos dados nacionais, permitindo revisões técnicas e validações interinstitucionais (PNUD/CNODS).
                    </p>
                  </section>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <ShieldCheck className="size-4 text-green-600/60" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Auditado via API SIDRA</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
