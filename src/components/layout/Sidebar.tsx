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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/useCase/auth";
import { Button } from "@/components/UI/Button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/UI/Sheet";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Catálogo", href: "/products", icon: Package },
  { name: "Cotizaciones", href: "/quotations", icon: FileText },
  { name: "Configuración", href: "/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <>
      <div className="flex h-16 items-center justify-center border-b-2 border-border px-6 gap-3">
        <img src="/logo-sin.png" alt="ContAsist" className="h-14 w-auto object-contain drop-shadow-md" />
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#1E5A7D' }}>CONTASIST</span>
      </div>

      <nav className="mt-6 px-4 flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-2 rounded-lg",
                    isActive
                      ? "bg-primary text-primary-foreground border-border shadow-sm"
                      : "bg-transparent text-foreground border-transparent hover:bg-accent hover:border-border",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 space-y-3 mt-auto">
        {currentUser && (
          <div className="border-2 border-border bg-muted p-3 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground">USUARIO</p>
            <p className="text-sm font-bold truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b-2 border-border bg-card flex items-center px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center justify-center gap-2 ml-3">
        <img src="/logo.webp" alt="ContAsist" className="h-16 w-auto object-contain drop-shadow-md" />
        <span className="text-xl font-bold" style={{ color: '#1E5A7D' }}>CONTASIST</span>
      </div>
    </header>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-2 border-border bg-card hidden md:flex md:flex-col">
      <SidebarContent />
    </aside>
  );
}
