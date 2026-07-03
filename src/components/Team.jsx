import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import aryaImg from '../assets/arya_img.png';
import arnavImg from '../assets/arnav_img.jpeg';
import './Team.css';

const team = [
    {
        name: 'Arya Sharma',
        title: 'Founder',
        specialty: 'Full Stack Development',
        color: '#0099C8',
        photo: aryaImg,
        photoStyle: { transform: 'scale(1.9)', objectPosition: 'top center' },
        linkedin: 'https://www.linkedin.com/in/arya-sharma-1963b030a',
        github: 'https://github.com/arya-5990',
    },
    {
        name: 'Arnav Gehlot',
        title: 'Co-Founder',
        specialty: 'AI Researcher',
        color: '#7B61FF',
        photo: arnavImg,
        photoStyle: {},
        linkedin: 'https://www.linkedin.com/in/arnavgehlot/',
        github: 'https://github.com/arnavgehlot-bitspilani',
    },
];

const LinkedInIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);
const GithubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
);

export default function Team() {
    const { ref, visible } = useScrollReveal();

    return (
        <section id="team" className="team section-py">
            <div className="container" ref={ref}>
                <div className={`team__header ${visible ? 'animate-fade-up' : ''}`}>
                    <span className="section-eyebrow">Our People</span>
                    <h2 className="section-title">
                        The Minds Behind <span className="gradient-text">AntiLabs</span>
                    </h2>
                    <p className="section-sub team__sub">
                        Builders and problem-solvers who care deeply about the work they ship.
                    </p>
                </div>

                <div className="team__grid team__grid--two">
                    {team.map((member, i) => (
                        <div
                            key={member.name}
                            className={`team__card glass-card ${visible ? 'animate-fade-up' : ''}`}
                            style={{ animationDelay: `${0.1 + i * 0.15}s`, '--m-color': member.color }}
                        >
                            <div className="team__avatar-wrap">
                                <div
                                    className="team__avatar team__avatar--photo"
                                    style={{ borderColor: member.color }}
                                >
                                    <img
                                        src={member.photo}
                                        alt={member.name}
                                        className="team__avatar-img"
                                        style={member.photoStyle}
                                    />
                                </div>
                                <div className="team__avatar-ring" style={{ borderColor: member.color }} />
                            </div>
                            <div className="team__info">
                                <div className="team__name">{member.name}</div>
                                <div className="team__title">{member.title}</div>
                                <div className="team__specialty">{member.specialty}</div>
                            </div>
                            <div className="team__socials">
                                <a
                                    href={member.linkedin}
                                    className="team__social"
                                    aria-label="LinkedIn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <LinkedInIcon />
                                </a>
                                <a
                                    href={member.github}
                                    className="team__social"
                                    aria-label="GitHub"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GithubIcon />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

