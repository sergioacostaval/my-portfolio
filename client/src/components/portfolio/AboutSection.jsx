import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Code2, Database, LineChart, Rocket, Users } from 'lucide-react';

const stats = [
    { icon: Code2, value: '1+', label: "Année d'expérience" },
    { icon: Rocket, value: '5+', label: 'Projets réalisés' },
    { icon: Users, value: '30+', label: 'Clients satisfaits' },
];

const strengths = [
    {
        icon: Database,
        title: 'Données utiles',
        text: "Structurer l'information pour comprendre plus vite et mieux agir.",
    },
    {
        icon: BrainCircuit,
        title: 'IA pragmatique',
        text: 'Automatiser ce qui ralentit les équipes sans compliquer leur quotidien.',
    },
    {
        icon: LineChart,
        title: 'Vision produit',
        text: 'Construire des interfaces qui restent simples même quand la logique est riche.',
    },
];

export default function AboutSection() {
    return (
        <section id="about" className="relative overflow-hidden py-28">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--secondary)/0.42),transparent_45%,hsl(var(--secondary)/0.24))]" />

            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.7 }}
                        className="lg:sticky lg:top-28"
                    >
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary">À propos</span>
                        <h2 className="mt-4 font-playfair text-4xl font-bold leading-tight text-foreground md:text-5xl">
                            Je crée des solutions où la technique sert une décision claire.
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                            Développeur Full Stack récemment diplômé d'un DEC en informatique,
                            je relie analyse de données, intelligence artificielle et trading pour
                            livrer des outils concrets, lisibles et utiles.
                        </p>

                        <div className="mt-8 grid grid-cols-3 gap-3">
                            {stats.map(({ icon: Icon, value, label }) => (
                                <div key={label} className="rounded-2xl border border-border bg-card/75 p-4 backdrop-blur">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <p className="mt-3 font-playfair text-2xl font-bold text-foreground">{value}</p>
                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 32 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="space-y-5"
                    >
                        <div className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur">
                            <p className="text-sm uppercase tracking-widest text-muted-foreground">Approche</p>
                            <p className="mt-4 text-2xl font-semibold leading-snug text-foreground md:text-3xl">
                                Rigueur pour la logique, créativité pour l'expérience, simplicité
                                pour que le produit soit agréable à utiliser.
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {strengths.map(({ icon: Icon, title, text }) => (
                                    <div key={title} className="rounded-2xl bg-secondary/60 p-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-[1fr_0.8fr]">
                            <div className="rounded-[1.5rem] border border-border bg-background/70 p-6">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    J'aime développer des projets qui apportent de la valeur et
                                    optimisent les processus: dashboards, automatisations, plateformes
                                    métiers et outils de suivi adaptés à chaque contexte.
                                </p>
                            </div>
                            <a
                                href="#contact"
                                className="flex min-h-36 flex-col justify-between rounded-[1.5rem] bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 hover:-translate-y-1"
                            >
                                <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Disponible</span>
                                <span className="font-playfair text-3xl font-bold leading-none">Travaillons ensemble</span>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
