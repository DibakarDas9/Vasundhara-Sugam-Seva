'use client';

import React, { useEffect } from 'react';

export default function ClickEffects() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const x = e.clientX;
      const y = e.clientY;

      // ripple element
      const ripple = document.createElement('div');
      ripple.className = 'global-click-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      document.body.appendChild(ripple);

      // remove after animation
      setTimeout(() => ripple.remove(), 600);

      // add pressed class to clickable element (button, a, input, .clickable)
      let clickable: HTMLElement | null = null;
      let el = target;
      for (let i = 0; i < 6 && el; i++) {
        if (!el) break;
        if (el.matches && (el.matches('button,a,input,textarea,select') || el.classList.contains('clickable') || el.getAttribute('role') === 'button')) {
          clickable = el;
          break;
        }
        el = el.parentElement;
      }

      if (clickable) {
        clickable.classList.add('pressed-on-click');
        setTimeout(() => clickable && clickable.classList.remove('pressed-on-click'), 160);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
