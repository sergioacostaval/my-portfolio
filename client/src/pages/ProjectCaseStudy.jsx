import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Layers, Target, Wrench } from 'lucide-react';
import { getProjectBySlug, projects } from '../data/projects';
import PageNotFound from '../lib/PageNotFound.jsx';

export default function ProjectCaseStudy() {
    const { slug } = useParams();
    const project = getProjectBySlug(slug);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [slug]);

    if (!project) {
        return <PageNotFound />;
    }

    const relatedProjects = projects.filter((item) => item.slug !== project.slug).slice(0, 3);

    return (
        <main className="min-h-screen bg-background font-inter text-foreground">
            <nav className="border-b border-border bg-background/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <Link to="/#projects" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
                        <ArrowLeft className="h-4 w-4" />
                        Retour au portfolio
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">Cas d’étude</span>
                </div>
            </nav>

            <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                    <div className="mb-5 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{project.category}</p>
                    <h1 className="mt-4 font-playfair text-4xl font-bold leading-tight md:text-6xl">{project.title}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{project.subtitle}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href={project.image}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Voir la capture
                        </a>
                        {project.repoUrl && project.repoUrl !== '#' && (
                            <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                            >
                                <Github className="h-4 w-4" />
                                Voir le code
                            </a>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
                    <img src={project.image} alt={`Capture de ${project.title}`} className="h-full max-h-[560px] w-full object-cover" />
                </div>
            </section>

            <section className="border-y border-border bg-card/35">
                <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
                    <InfoBlock icon={Target} title="Problème" text={project.problem} />
                    <InfoBlock icon={Wrench} title="Solution" text={project.solution} />
                    <InfoBlock icon={Layers} title="Rol" text={project.role} />
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-primary">Présentation du projet</p>
                    <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">Fonctionnalités principales</h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                        {project.description}
                    </p>
                    <p className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
                        {project.outcome}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {project.highlights.map((item) => (
                        <div key={item} className="rounded-2xl border border-border bg-card p-5">
                            <div className="mb-4 h-1 w-12 rounded-full bg-primary" />
                            <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-20">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Plus de projets</p>
                        <h2 className="mt-2 font-playfair text-3xl font-bold">Autres cas</h2>
                    </div>
                    <Link to="/#projects" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
                        Voir tous
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {relatedProjects.map((item) => (
                        <Link key={item.slug} to={`/projects/${item.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
                            <img src={item.image} alt={item.title} className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="p-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{item.category}</p>
                                <h3 className="mt-2 font-playfair text-xl font-semibold">{item.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}

function InfoBlock({ icon: Icon, title, text }) {
    return (
        <article className="rounded-2xl border border-border bg-background/55 p-6">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-playfair text-2xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
        </article>
    );
}
