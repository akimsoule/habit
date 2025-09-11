import { User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

type Props = {
  onOpenQuickActions?: () => void;
};

const Header = ({ onOpenQuickActions }: Props) => {
  return (
    <header className="w-full bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-md bg-white dark:bg-white ring-1 ring-border overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Rituo logo"
                className="h-6 w-6 object-contain"
                width={24}
                height={24}
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <h1 className="text-xl font-bold text-foreground">Rituo</h1>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Rituels simples, progrès durables
              </span>
            </div>
          </div>

          {/* Theme Toggle & Profile */}
          <div className="flex items-center space-x-2">
            {onOpenQuickActions && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={onOpenQuickActions}
                title="Actions rapides"
              >
                <Zap className="h-5 w-5" />
              </Button>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
