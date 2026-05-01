import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

// ─── Configuration EmailJS ───────────────────────────────────────────────────
// 1. Créez un compte sur https://www.emailjs.com
// 2. Ajoutez un service (Gmail, Outlook…) et notez votre SERVICE_ID
// 3. Créez un template avec les variables : {{from_name}}, {{from_email}}, {{subject}}, {{message}}
// 4. Copiez votre PUBLIC_KEY depuis Account > API Keys
// Remplacez les valeurs ci-dessous par les vôtres :
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// ─────────────────────────────────────────────────────────────────────────────

const contactInfo = [
    { icon: Mail,    label: 'Email',        value: 'sergioalasalle@gmail.com' },
    { icon: Phone,   label: 'Téléphone',    value: '+438 529 6962' },
    { icon: MapPin,  label: 'Localisation', value: 'Montréal, Québec' },
];

function validate(data) {
    const errors = {};
    if (!data.name.trim())                      errors.name    = 'Le nom est requis.';
    if (!data.email.trim())                     errors.email   = "L'email est requis.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        errors.email   = 'Adresse email invalide.';
    if (!data.subject.trim())                   errors.subject = 'Le sujet est requis.';
    if (!data.message.trim())                   errors.message = 'Le message est requis.';
    else if (data.message.trim().length < 10)   errors.message = 'Message trop court (min. 10 caractères).';
    return errors;
}

export default function ContactSection() {
    const formRef = useRef(null);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [errors,   setErrors]   = useState({});
    const [status,   setStatus]   = useState('idle'); // idle | sending | success | error

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate(formData);
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            setStatus('error');
            return;
        }

        setStatus('sending');
        emailjs
            .send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    from_name:  formData.name,
                    from_email: formData.email,
                    subject:    formData.subject,
                    message:    formData.message,
                },
                EMAILJS_PUBLIC_KEY
            )
            .then(() => {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            })
            .catch(() => setStatus('error'));
    };

    return (
        <section id="contact" className="py-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />

            <div className="relative max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary text-xs font-inter tracking-widest uppercase">Contact</span>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold mt-4">
                        Parlons de votre <span className="text-primary">projet</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground font-inter max-w-xl mx-auto">
                        Vous avez un projet en tête ? N'hésitez pas à me contacter pour en discuter.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        {contactInfo.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground font-inter">{label}</div>
                                    <div className="text-foreground font-inter font-medium mt-0.5">{value}</div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 border-t border-border">
                            <p className="text-muted-foreground font-inter text-sm leading-relaxed">
                                Disponible pour des missions freelance, des collaborations créatives et des projets ambitieux.
                                Réponse garantie sous 24h.
                            </p>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {status === 'success' ? (
                            <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center h-full">
                                <CheckCircle className="w-14 h-14 text-primary" />
                                <h3 className="font-playfair text-2xl font-semibold text-foreground">Message envoyé !</h3>
                                <p className="text-muted-foreground font-inter">Merci pour votre message. Je vous répondrai dans les meilleurs délais.</p>
                                <Button
                                    variant="outline"
                                    className="mt-2 rounded-xl"
                                    onClick={() => setStatus('idle')}
                                >
                                    Envoyer un autre message
                                </Button>
                            </div>
                        ) : (
                            <form ref={formRef} onSubmit={handleSubmit} noValidate className="bg-card border border-border rounded-2xl p-8 space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Nom" error={errors.name}>
                                        <Input
                                            placeholder="Votre nom"
                                            value={formData.name}
                                            onChange={handleChange('name')}
                                            className={inputCls(errors.name)}
                                        />
                                    </Field>
                                    <Field label="Email" error={errors.email}>
                                        <Input
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={formData.email}
                                            onChange={handleChange('email')}
                                            className={inputCls(errors.email)}
                                        />
                                    </Field>
                                </div>

                                <Field label="Sujet" error={errors.subject}>
                                    <Input
                                        placeholder="Sujet du message"
                                        value={formData.subject}
                                        onChange={handleChange('subject')}
                                        className={inputCls(errors.subject)}
                                    />
                                </Field>

                                <Field label="Message" error={errors.message}>
                                    <Textarea
                                        placeholder="Décrivez votre demande..."
                                        value={formData.message}
                                        onChange={handleChange('message')}
                                        rows={5}
                                        className={`${inputCls(errors.message)} resize-none`}
                                    />
                                </Field>

                                {status === 'error' && (
                                    <p className="text-sm text-destructive font-inter">
                                        Une erreur est survenue. Vérifiez votre configuration EmailJS et réessayez.
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6 text-sm font-inter font-medium tracking-wide"
                                >
                                    {status === 'sending' ? (
                                        <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Envoi en cours...
                    </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer le message
                    </span>
                                    )}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function inputCls(error) {
    return `bg-secondary border-border focus:border-primary/50 rounded-xl ${error ? 'border-destructive focus:border-destructive' : ''}`;
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-sm font-inter text-muted-foreground mb-2 block">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-destructive font-inter">{error}</p>}
        </div>
    );
}
