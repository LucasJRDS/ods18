import { fetchODS18Data, ODS18TransformedData } from "@/lib/sidra";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";

// GeoJSON do Brasil
const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

// Este é um Server Component no App Router (padrão)
export default async function DashboardPage() {
  // Fetch seguro no servidor - evita expor a API IBGE e lida com cache
  const data = await fetchODS18Data();

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Eliminar o racismo e a discriminação étnico-racial, em todas suas formas, contra os povos indígenas e afrodescendentes.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="px-4 py-2 rounded-full border bg-muted/50 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Dados Consolidados IBGE 2022
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Visualizações */}
        <div className="lg:col-span-8 space-y-8">
          <section id="chart" className="scroll-mt-20">
             <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-6">
                <CardTitle className="text-2xl font-bold">Distribuição de Renda</CardTitle>
                <CardDescription>Comparativo por cor/raça nas Unidades da Federação selecionadas.</CardDescription>
              </CardHeader>
              <CardContent className="px-6">
                <ChartWrapper data={data} />
              </CardContent>
            </Card>
          </section>

          <section id="map" className="scroll-mt-20">
             <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-6">
                <CardTitle className="text-2xl font-bold">Mapa de Paridade</CardTitle>
                <CardDescription>Visualização geográfica do Índice de Paridade Étnico-Racial.</CardDescription>
              </CardHeader>
              <CardContent className="px-6 flex justify-center">
                <MapWrapper data={data} geoUrl={geoUrl} />
              </CardContent>
            </Card>
          </section>

          <section id="data" className="scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle>Tabulações Detalhadas</CardTitle>
                <CardDescription>Base processada via SIDRA JSON API.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">UF</TableHead>
                        <TableHead className="text-right font-bold">Branca (R$)</TableHead>
                        <TableHead className="text-right font-bold">Preta/Parda (R$)</TableHead>
                        <TableHead className="text-right font-bold">Paridade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.state} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-bold text-primary">{row.state}</TableCell>
                          <TableCell className="text-right font-mono">R$ {row.branca.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">R$ {Math.max(row.preta, row.parda).toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              row.ratio < 0.5 
                                ? 'bg-red-500/10 text-red-600'
                                : row.ratio < 0.65 
                                  ? 'bg-amber-500/10 text-amber-600' 
                                  : 'bg-green-500/10 text-green-600'
                            }`}>
                              {row.gapSalarial}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Lado Direito: Metadados / Contexto */}
        <div className="lg:col-span-4 space-y-8">
          <section id="methodology">
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Documentação Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold uppercase text-[10px] text-primary tracking-widest">Fonte de Dados</h4>
                  <p className="leading-relaxed">
                    Extraído diretamente da <strong>Tabela 10281 (Censo 2022)</strong> do IBGE. Variável: Rendimento mensal médio por cor ou raça.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold uppercase text-[10px] text-primary tracking-widest">Pipeline ETL</h4>
                  <p className="leading-relaxed opacity-80">
                    O pipeline executa transformações em tempo real no servidor (RSC), calculando a razão de paridade entre as categorias censitárias.
                  </p>
                </div>
                <div className="pt-4 border-t border-primary/10">
                   <div className="flex items-center gap-2 text-xs font-semibold">
                      <ShieldCheck className="size-4 text-green-600" />
                      Dados Validados e Auditáveis
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg italic">Nota Metodológica</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              O Índice de Paridade inferior a 1.00 indica que a população preta recebe rendimento proporcionalmente menor que a branca. Este dashboard visa dar visibilidade a estes hiatos para subsidiar políticas públicas do ODS 18.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// CLIENT COMPONENTS WRAPPERS
// (Isolamos a interatividade e libs pesadas para o Client)
// --------------------------------------------------------------------------

import ClientComponents from "./ClientComponents";

function ChartWrapper({ data }: { data: ODS18TransformedData[] }) {
  return <ClientComponents type="chart" data={data} />;
}

function MapWrapper({ data, geoUrl }: { data: ODS18TransformedData[], geoUrl: string }) {
  return <ClientComponents type="map" data={data} geoUrl={geoUrl} />;
}
