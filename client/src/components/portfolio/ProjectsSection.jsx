import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';

const projects = [
    {
        title: 'Trading Bot',
        description: "Un robot de trading basé sur Python, utilisant des stratégies de backtesting, analyse technique et Notifications Telegram.",
        image: '/tradingBot.png',
        tags: ['Python', 'Pandas', 'Trading', 'SQLite'],
        category: 'Trading',
    },
    {
        title: 'Sports Betting Management System',
        description: "Interactive sports betting website developed in Flask, incorporating CRUD operations and a SQLite database.",
        image: '/betSports.png',
        tags: ['Python', 'Flask', 'SQLIte', 'Crud'],
        category: 'Web',
    },
    {
        title: 'Compagnon Urbain App',
        description: "Application mobile développée qui analyse les émotions de l’utilisateur (texte, voix ou vidéo) et recommande des lieux adaptés selon le contexte (émotion, météo, localisation).",
        image: '/compagnonUrbain.png',
        tags: ['C#', '.NET MAUI', 'Hume AI', 'Émotions'],
        category: 'Mobile',
    },
    {
        title: 'Stocks Investhink',
        description: "Application web pour analyser Stocks, à travers des indicateurs financiers et des signaux indicatifs d'achat et vente.\n",
        image: '/stocksInvesthink.png',
        tags: ['C#', 'ASP.NET Core MVC', 'EF Core', 'SQLite'],
        category: 'Web',
    },
];

const categories = ['Tous', 'Trading', 'Mobile', 'Web'];

export default function ProjectsSection() {
    const [activeFilter, setActiveFilter] = useState('Tous');

    const filtered = activeFilter === 'Tous'
        ? projects
        : projects.filter((p) => p.category === activeFilter);

    return (
        <section id="projects" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <span className="text-primary text-xs font-inter tracking-widest uppercase">Portfolio</span>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold mt-4">
                        Projets <span className="text-primary">sélectionnés</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground font-inter max-w-xl mx-auto">
                        Une sélection de mes réalisations les plus récentes et les plus abouties.
                    </p>
                </motion.div>

                {/* Filter bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center justify-center gap-3 mb-12 flex-wrap"
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-inter font-medium border transition-all duration-300 ${
                                activeFilter === cat
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                    : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((project, idx) => (
                            <motion.div
                                key={project.title}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProjectCard project={project} index={idx} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}