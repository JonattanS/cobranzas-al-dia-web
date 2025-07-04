
import { BarChart3, Users, FileText, Home, CreditCard } from 'lucide-react';
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
    title: 'Inicio',
    url: '/',
    icon: Home,
  },
  {
    title: 'Cuentas por Cobrar',
    url: '/cuentas-por-cobrar',
    icon: Users,
  },
  
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-lg text-sidebar-foreground ${isCollapsed ? 'hidden' : 'block'}`}>
            Modulos
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'hidden' : 'block'}>
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                        }`
                      }
                      end
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
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
