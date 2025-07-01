
import { BarChart3, Users, FileText, Home } from 'lucide-react';
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
    title: 'Clientes',
    url: '/clientes',
    icon: Users,
  },
  {
    title: 'Documentos',
    url: '/documentos',
    icon: FileText,
  },
  {
    title: 'Reportes',
    url: '/reportes',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible>
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-lg text-sidebar-foreground ${collapsed ? 'hidden' : 'block'}`}>
            Cuentas por Cobrar
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block'}>
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
                      {!collapsed && <span>{item.title}</span>}
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
