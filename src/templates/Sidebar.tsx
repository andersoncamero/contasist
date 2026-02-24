import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  Receipt,
  LogOut,
  Menu,
  Truck,
  CreditCard,
  BookOpen,
  ListTree,
  TrendingUp,
  FileSearch,
  Box,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  HelpCircle,
  Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/useCases/auth";
import { Button } from "@/components/atoms/Button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/molecules/Sheet";
import { useState, useEffect } from "react";

type NavItem = {
  name: string;
  href?: string;
  icon: any;
  subItems?: Omit<NavItem, 'subItems'>[];
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Ventas",
    icon: ShoppingCart,
    subItems: [
      { name: "Clientes", href: "/clients", icon: Users },
      { name: "Cotizaciones", href: "/quotations", icon: FileText },
    ]
  },
  {
    name: "Compras & Gastos",
    icon: Receipt,
    subItems: [
      { name: "Proveedores", href: "/suppliers", icon: Truck },
      { name: "Gastos", href: "/expenses", icon: CreditCard },
    ]
  },
  {
    name: "Inventario",
    icon: Box,
    subItems: [
      { name: "Catálogo", href: "/products", icon: Package },
      { name: "Control de Stock", href: "/inventory", icon: Boxes },
    ]
  },
  {
    name: "Contabilidad",
    icon: BookOpen,
    subItems: [
      { name: "Plan de Cuentas", href: "/accounting/chart", icon: ListTree },
      { name: "Libro Diario", href: "/accounting/journal", icon: BookOpen },
      { name: "Balance General", href: "/reports/balance", icon: FileText },
      { name: "Estado de Resultados", href: "/reports/income-statement", icon: TrendingUp },
      { name: "Movimientos Auxiliares", href: "/reports/auxiliary", icon: FileSearch },
    ]
  },
  { name: "Configuración", href: "/settings", icon: Settings },
];

function NavGroup({ item, onNavigate, depth = 0 }: { item: NavItem, onNavigate?: () => void, depth?: number }) {
  const location = useLocation();
  const hasActiveChild = item.subItems?.some(child => location.pathname.startsWith(child.href || ''));
  const isActive = item.href ? location.pathname === item.href : false;

  const [isOpen, setIsOpen] = useState(hasActiveChild || false);

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  if (!item.subItems) {
    return (
      <li>
        <Link
          to={item.href!}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg",
            isActive
              ? "bg-accent text-accent-foreground shadow-sm"
              : "bg-transparent text-foreground hover:bg-secondary",
            depth > 0 && "ml-4"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      </li>
    );
  }

  return (
    <li className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg",
          hasActiveChild && !isOpen
            ? "text-primary bg-accent/50"
            : "bg-transparent text-foreground hover:bg-secondary",
          depth > 0 && "ml-4"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          {item.name}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronRight className="h-4 w-4 opacity-50" />
        )}
      </button>

      {isOpen && (
        <ul className="space-y-2 mt-1 border-border ml-2 pl-2">
          {item.subItems.map((subItem) => (
            <NavGroup
              key={subItem.name}
              item={subItem}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-center px-6 gap-3">
        <img src="/logo-sin.png" alt="ContAsist" className="h-14 w-auto object-contain drop-shadow-md" />
        <span className="text-2xl font-bold tracking-tight text-primary">CONTASIST</span>
      </div>

      <nav className="mt-6 px-4 flex-1 overflow-y-auto mb-4 scrollbar-hide">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <NavGroup key={item.name} item={item} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      <div className="p-4 space-y-3 mt-auto shrink-0 bg-transparent">
        {currentUser && (
          <div className="border border-border bg-muted/50 p-3 rounded-lg flex items-center gap-3">
            <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-muted-foreground">USUARIO</p>
              <p className="text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 border-border/50 shadow-sm"
            onClick={() => { }}
          >
            <HelpCircle className="h-4 w-4" />
            Ayuda
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center gap-2 border-border/50 shadow-sm text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
    </>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b-2 border-border bg-background flex items-center px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col bg-background">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center justify-center gap-2 ml-3">
        <img src="/logo.png" alt="ContAsist" className="h-16 w-auto object-contain drop-shadow-md" />
        <span className="text-xl font-bold text-primary">CONTASIST</span>
      </div>
    </header>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-border bg-background hidden md:flex md:flex-col">
      <SidebarContent />
    </aside>
  );
}
