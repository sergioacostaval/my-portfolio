import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowUpRight,
    BarChart3,
    Bot,
    Github,
    Linkedin,
    Mail,
    Sparkles,
    TrendingUp,
} from 'lucide-react';

const focusAreas = [
    { icon: BarChart3, label: 'Solutions sur mesure', detail: 'Aplications métiers performantes' },
    { icon: Bot, label: 'IA', detail: 'Automatisation intelligente' },
    { icon: TrendingUp, label: 'Trading', detail: 'Outils de décision' },
];

const metrics = [
    { value: '5+', label: 'Projets livrés' },
    { value: '100%', label: 'Qualité garantie' },
    { value: '24h', label: 'Réponse rapide' },
];

export default function HeroSection() {
    return (
        <section id="hero" className="relative min-h-screen overflow-hidden pt-28 lg:pt-32">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.14),transparent_28%),radial-gradient(circle_at_80%_15%,hsl(190_80%_55%/0.12),transparent_24%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--secondary)/0.45))]" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_48%,hsl(var(--primary)/0.06)_48%,hsl(var(--primary)/0.06)_49%,transparent_49%,transparent_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-[calc(100vh-7rem)] grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Développeur Full Stack
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
                        className="mt-8 max-w-4xl font-playfair text-5xl font-bold leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
                    >
                        Des outils web pour transformer les données en décisions.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.24, ease: 'easeOut' }}
                        className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
                    >
                        Je conçois des applications métiers performantes, des expériences claires
                        et des solutions sur mesure autour de l'IA et du trading.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 26 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.36, ease: 'easeOut' }}
                        className="mt-9 flex flex-col gap-4 sm:flex-row"
                    >
                        <a
                            href="#projects"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                        >
                            Voir mes projets
                            <ArrowUpRight className="h-4 w-4" />
                        </a>
                        <a
                            href="#contact"
                            className="inline-flex items-center justify-center rounded-xl border border-border bg-card/60 px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                        >
                            Me contacter
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                        className="mt-10 flex items-center gap-4"
                    >
                        {[
                            { icon: Github, href: 'https://github.com/sergioacostaval/', label: 'GitHub' },
                            { icon: Linkedin, href: 'https://www.linkedin.com/in/sergio-acosta-80ba3277/', label: 'LinkedIn' },
                            { icon: Mail, href: '#contact', label: 'Email' },
                        ].map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                                aria-label={label}
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 34 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.9, delay: 0.22, ease: 'easeOut' }}
                    className="relative"
                >
                    <div className="rounded-[2rem] border border-border/70 bg-card/75 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
                        <div className="rounded-[1.5rem] border border-border bg-background/80 p-5">
                            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
                                    <h2 className="mt-1 font-playfair text-2xl font-semibold">Data & IA Lab</h2>
                                </div>
                                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                                    En ligne
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {focusAreas.map(({ icon: Icon, label, detail }, index) => (
                                    <div
                                        key={label}
                                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-foreground">{label}</p>
                                            <p className="text-sm text-muted-foreground">{detail}</p>
                                        </div>
                                        <span className="text-xs font-mono text-muted-foreground">0{index + 1}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3">
                                {metrics.map(({ value, label }) => (
                                    <div key={label} className="rounded-2xl border border-border bg-secondary/60 p-4">
                                        <p className="font-playfair text-2xl font-bold text-primary">{value}</p>
                                        <p className="mt-1 text-xs leading-snug text-muted-foreground">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.a
                href="#about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary md:flex"
            >
                <span className="text-xs uppercase tracking-widest">Scroll</span>
                <ArrowDown className="h-4 w-4 animate-bounce" />
            </motion.a>
        </section>
    );
}
