"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Camera, 
  Users,
  ChevronRight
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile on client only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isSidebarOpen) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (!isMobile) return;

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen, isMobile]);

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/admin/scan",
      label: "Scan QR",
      icon: <Camera className="h-5 w-5" />,
    },
    {
      href: "/admin/participants",
      label: "Peserta",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="text-lg font-bold">Event Admin</div>
          
          <div className="w-10"></div>
        </div>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - STICKY di desktop */}
      <aside
        id="sidebar"
        className={`
          fixed md:sticky md:top-0 left-0 h-screen 
          w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isMobile ? "" : "md:translate-x-0"} // Force show on desktop
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Event Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all
                  ${isActive 
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <div className={isActive ? "text-blue-600" : "text-gray-500"}>
                  {item.icon}
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Mobile spacer */}
        <div className="md:hidden h-16"></div>
        
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}