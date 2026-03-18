"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Database, 
  FileText, 
  Search,
  ShieldCheck,
  Building2,
  Users
} from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "Resumo Geral",
      url: "#chart",
      icon: LayoutDashboard,
    },
    {
      title: "Análise Espacial",
      url: "#map",
      icon: MapIcon,
    },
    {
      title: "Base de Dados",
      url: "#data",
      icon: Database,
    },
  ],
  secondary: [
    {
      title: "Metodologia",
      url: "#methodology",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50" {...props}>
      <SidebarHeader className="p-0 border-b border-border/50 overflow-hidden">
        <div className={cn(
          "flex items-center justify-center transition-all duration-300",
          state === "collapsed" ? "h-16" : "h-auto"
        )}>
          <div className={cn(
            "flex items-center justify-center transition-all duration-300",
            state === "collapsed" ? "size-10" : "w-full"
          )}>
            <a href="#" className="w-full flex justify-center">
               <Image 
                 src="/brand/logo-ods18.png" 
                 alt="ODS 18 Logo" 
                 width={state === "collapsed" ? 40 : 256} 
                 height={state === "collapsed" ? 40 : 256} 
                 className={cn(
                   "object-contain transition-all",
                   state === "collapsed" ? "size-10" : "w-full h-auto p-2"
                 )}
                 priority
               />
            </a>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Análise</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  render={
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarMenu>
            {data.secondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  render={
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className={cn(
          "flex items-center gap-3 rounded-lg border bg-muted/30 p-2 transition-all",
          state === "collapsed" ? "justify-center" : "justify-start"
        )}>
          <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Status do SIDRA</span>
              <span className="text-[11px] font-medium">Dados Operacionais</span>
            </div>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
