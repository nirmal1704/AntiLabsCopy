import React from 'react';
import './TrustedBy.css';

const logos = [
    { name: 'MongoDB', letter: 'M' },
    { name: 'Express', letter: 'Ex' },
    { name: 'React', letter: 'R' },
    { name: 'Node.js', letter: 'No' },
    { name: 'Angular', letter: 'Ng' },
    { name: 'Vue.js', letter: 'V' },
    { name: 'Next.js', letter: 'Nx' },
    { name: 'TypeScript', letter: 'TS' },
    { name: 'Python', letter: 'Py' },
    { name: 'Django', letter: 'Dj' },
    { name: 'PostgreSQL', letter: 'PG' },
    { name: 'MySQL', letter: 'My' },
    { name: 'Redis', letter: 'Re' },
    { name: 'Docker', letter: 'Do' },
    { name: 'Kubernetes', letter: 'K8' },
    { name: 'AWS', letter: 'AW' },
    { name: 'Firebase', letter: 'Fb' },
    { name: 'GraphQL', letter: 'GQ' },
    { name: 'Tailwind', letter: 'TW' },
    { name: 'Flutter', letter: 'Fl' },
    { name: 'React Native', letter: 'RN' },
    { name: 'Linux', letter: 'Li' },
    { name: 'Git', letter: 'Gt' },
];

const LogoItem = ({ name, letter }) => (
    <div className="trusted__logo">
        <div className="trusted__logo-icon">{letter}</div>
        <span className="trusted__logo-name">{name}</span>
    </div>
);

export default function TrustedBy() {
    const doubled = [...logos, ...logos]; // For seamless marquee loop

    return (
        <section className="trusted">
            <div className="trusted__headline">
                <span className="trusted__label">We Have Expertise in </span>
            </div>

            <div className="trusted__marquee-wrap">
                {/* Fade masks */}
                <div className="trusted__fade trusted__fade--left" />
                <div className="trusted__fade trusted__fade--right" />

                {/* Scrolling track */}
                <div className="trusted__track">
                    {doubled.map((logo, i) => (
                        <LogoItem key={`${logo.name}-${i}`} {...logo} />
                    ))}
                </div>
            </div>
        </section>
    );
}
