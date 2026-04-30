'use client';
import React from 'react';
import { AuthRole } from './AuthShell';

interface RoleTabBarProps {
  role: AuthRole;
  onRoleChange: (r: AuthRole) => void;
  roleConfig: Record<AuthRole, { label: string; icon: React.ElementType; color: string; description: string; canRegister: boolean }>;
}

const roles: AuthRole[] = ['user', 'vendor', 'employee', 'admin'];

export default function RoleTabBar({ role, onRoleChange, roleConfig }: RoleTabBarProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 mb-6">
      {roles.map((r) => {
        const cfg = roleConfig[r];
        const isActive = role === r;
        return (
          <button
            key={`role-tab-${r}`}
            onClick={() => onRoleChange(r)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all duration-150
              ${isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary'
              }`}
          >
            <cfg.icon size={16} />
            <span className="leading-none text-center">{cfg.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}