import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { projectCategories, projects } from '../../data/projects';

export default function ProjectsSection() {
    const [activeFilter, setActiveFilter] = useState('Tous');

    const filtered = activeFilter === 'Tous'
        ? projects
        : projects.filter((p) => p.category === activeFilter);

    return (
        <section id="projects" className="relative py-32">
            <div className="mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center"
                >
                    <span className="font-inter text-xs uppercase tracking-widest text-primary">Portfolio</span>
                    <h2 className="mt-4 font-playfair text-4xl font-bold md:text-5xl">
                        Projets <span className="text-primary">selectionnes</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-inter text-muted-foreground">
                        Une selection de mes realisations les plus recentes et les plus abouties.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-12 flex flex-wrap items-center justify-center gap-3"
                >
                    {projectCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveFilter(cat)}
                            className={`rounded-full border px-5 py-2 font-inter text-sm font-medium transition-all duration-300 ${
                                activeFilter === cat
                                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2">
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
