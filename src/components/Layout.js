import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Header } from './Header.tsx';
export const Layout = ({ children }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (_jsxs("div", { className: "min-h-screen bg-space text-white/80", children: [_jsx("div", { className: "fixed top-0 left-0 w-full h-full starfield opacity-20 pointer-events-none z-[-1]" }), _jsx("div", { className: "fixed top-0 left-0 w-full h-full space-gradient pointer-events-none z-[-2]" }), _jsx(Header, { scrolled: scrolled }), _jsx("main", { children: children })] }));
};
