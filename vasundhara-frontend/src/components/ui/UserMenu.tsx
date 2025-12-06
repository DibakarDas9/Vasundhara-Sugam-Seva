'use client';

import { User } from 'lucide-react';
import { Button } from './Button';

interface UserMenuProps {
  user: any;
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Button variant="ghost" size="icon" className="relative">
      <User className="h-5 w-5" />
    </Button>
  );
}
