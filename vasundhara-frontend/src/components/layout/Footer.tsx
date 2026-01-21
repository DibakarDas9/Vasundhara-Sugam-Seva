import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const footerLinks = {
    product: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Inventory', href: '/inventory' },
        { label: 'Marketplace', href: '/marketplace' },
        { label: 'Scan', href: '/scan' },
        { label: 'Analytics', href: '/analytics' },
    ],
    company: [
        { label: 'Know the Founders', href: '/about' },
        { label: 'Mission', href: '#' },
        { label: 'Contact', href: '#' },
    ],
    legal: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
    ],
    social: [
        {
            label: 'X',
            href: 'https://twitter.com',
            icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            )
        },
        {
            label: 'GitHub',
            href: 'https://github.com/DibakarDas9',
            icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            )
        },
        {
            label: 'LinkedIn',
            href: 'https://www.linkedin.com/in/dibakar-das-453653248/',
            icon: (props: any) => (
                <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
            )
        },

    ]
};

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-8 text-slate-400">
            <div className="mx-auto max-w-7xl px-4 sm:px-8">
                <div className="grid gap-12 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <Logo className="h-8 w-8 text-emerald-400" />
                            <div>
                                <p className="font-semibold tracking-wide">Vasundhara</p>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Sugam Seva</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering communities to reduce food waste and feed more people through smart technology and local action.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-4">
                            {footerLinks.social.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 transition hover:text-emerald-400"
                                    aria-label={item.label}
                                >
                                    <item.icon className="h-5 w-5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h3>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.product.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-sm transition hover:text-emerald-400">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.company.map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-sm transition hover:text-emerald-400">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
                        <ul className="mt-4 space-y-3 text-sm">
                            <li>
                                <a
                                    href="mailto:dibakardas612@gmail.com"
                                    className="flex items-center gap-2 transition hover:text-emerald-400"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    dibakardas612@gmail.com
                                </a>
                            </li>
                            <li>
                                <p className="text-slate-400">Support available 24/7</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 border-t border-white/10 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-xs text-slate-500">
                            &copy; {new Date().getFullYear()} Vasundhara Sugam Seva. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-xs">
                            {footerLinks.legal.map((item) => (
                                <Link key={item.label} href={item.href} className="text-slate-500 transition hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
