import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const socialLinks = [
    { icon: Github, href: 'https://github.com/sergioacostaval/', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/sergio-acosta-80ba3277/', label: 'LinkedIn' },
    { icon: Mail, href: '#contact', label: 'Email' },
];

export default function Footer() {
    return (
        <footer className="border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
                        <span>© {new Date().getFullYear()} Portfolio Pensé pour être utile, </span>
                        <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span>construit pour rester simple.</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {socialLinks.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                                aria-label={label}
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}