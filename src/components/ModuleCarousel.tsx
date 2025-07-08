
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Zap, Play, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { moduleService, type PersistentModule } from '@/services/moduleService';

interface ModuleCarouselProps {
  modules: PersistentModule[];
}

export const ModuleCarousel = ({ modules }: ModuleCarouselProps) => {
  const navigate = useNavigate();

  const handleModuleClick = (module: PersistentModule) => {
    moduleService.updateModuleLastUsed(module.id);
    navigate(`/dynamic-function/${module.id}`);
  };

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          No hay funciones principales creadas aún
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Crea tu primera función principal desde Query Manual
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel className="w-full max-w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {modules.map((module) => (
            <CarouselItem key={module.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20"
                onClick={() => handleModuleClick(module)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg">
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                          {module.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Función Principal
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>{module.usageCount || 0} usos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 text-slate-600 dark:text-slate-400">
                    {module.description || 'Función principal personalizada'}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>Último uso: {new Date(module.lastUsed).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg transition-all duration-200 flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Ejecutar Función</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {modules.length > 3 && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
};
