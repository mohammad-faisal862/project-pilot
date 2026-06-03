'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { 
  Compass, 
  LayoutDashboard, 
  FolderGit2, 
  Map, 
  MessageSquareCode, 
  GitMerge, 
  Award, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user, logout } = useAppStore();

  const handleSignOut = async () => {
    logout();
    try { await signOut(); } catch(e) {}
    router.push('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Projects', icon: FolderGit2, href: '/dashboard/projects' },
    { name: 'Roadmaps', icon: Map, href: '/dashboard/roadmaps' },
    { name: 'AI Mentor', icon: MessageSquareCode, href: '/dashboard/mentor' },
    { name: 'GitHub Analytics', icon: GitMerge, href: '/dashboard/github' },
    { name: 'Career Score', icon: Award, href: '/dashboard/career' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' }
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 bg-[#060417] border-r border-white/5 transition-all duration-300 z-30',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center space-x-3 group overflow-hidden">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-wider text-white select-none transition-opacity duration-300">
              Pilot<span className="text-indigo-400">AI</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-slate-400 hover:text-white cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive 
                  ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.05)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105', isActive ? 'text-indigo-400' : 'text-slate-400')} />
              {!collapsed && (
                <span className="truncate transition-opacity duration-300">
                  {item.name}
                </span>
              )}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-20 bg-slate-900 border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-xl whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Info & Action */}
      <div className="p-4 border-t border-white/5">
        <div className={cn('flex items-center space-x-3 p-2 rounded-xl mb-3', !collapsed && 'bg-white/2')}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/30 flex items-center justify-center bg-indigo-500/10 shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          {!collapsed && (
            <div className="truncate flex-1">
              <h4 className="text-sm font-semibold text-slate-200 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all duration-200 w-full group cursor-pointer'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
