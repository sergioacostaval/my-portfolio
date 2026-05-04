import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-primary/30"
        >
            <Link to={`/projects/${project.slug}`} className="block h-full">
                <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-7">
                    <div className="mb-4 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-inter text-xs text-primary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h3 className="font-playfair text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                        {project.title}
                    </h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 font-inter text-sm font-medium text-primary">
                        <span>Voir le cas d’étude</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
