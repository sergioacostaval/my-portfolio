import React from 'react';
import Navbar from '../components/portfolio/Navbar';
import HeroSection from '../components/portfolio/HeroSection';
import AboutSection from '../components/portfolio/AboutSection';
import SkillsSection from '../components/portfolio/SkillsSection';
import ProjectsSection from '../components/portfolio/ProjectsSection';
import ContactSection from '../components/portfolio/ContactSection';
import Footer from '../components/portfolio/Footer';
import LiveChat from '../components/portfolio/LiveChat';
import VideoChat from '../components/portfolio/VideoChat';

export default function Home() {
    return (
        <div className="min-h-screen bg-background font-inter">
            <Navbar />
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <ContactSection />
            <Footer />
            <VideoChat />
            <LiveChat />
        </div>
    );
}
