
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Shield } from 'lucide-react';
import { useUser, type UserRole } from '@/contexts/UserContext';

export const UserMenu = () => {
  const { role, setRole } = useUser();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
            {role === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Perfil de Usuario</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleRoleChange('usuario')}>
          <User className="h-4 w-4 mr-2" />
          Cambiar a Usuario
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
          <Shield className="h-4 w-4 mr-2" />
          Cambiar a Admin
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
