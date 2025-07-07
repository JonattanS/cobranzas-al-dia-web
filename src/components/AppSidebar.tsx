
import { BarChart3, Users, FileText, Home, CreditCard, Database } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Cuentas por Cobrar',
    url: '/cuentas-por-cobrar',
    icon: CreditCard,
  },
  {
    title: 'Cuentas por Pagar',
    url: '/cuentas-por-pagar',
    icon: FileText,
  },
  {
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
  {
    title: 'Consultas Manuales',
    url: '/query-manual',
    icon: Database,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={`${isCollapsed ? 'w-16' : 'w-72'} border-r border-border/60 bg-card/30 backdrop-blur-xl`} collapsible="icon">
      <SidebarContent className="bg-transparent">
        <div className="p-6">
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <h2 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Nova
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Sistema Financiero</p>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : 'block'} text-primary font-semibold`}>
            Módulos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                            : 'hover:bg-accent/80 text-sidebar-foreground hover:translate-x-1'
                        }`
                      }
                      end
                    >
                      <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
