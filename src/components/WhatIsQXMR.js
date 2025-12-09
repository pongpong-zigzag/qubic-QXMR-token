import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import QxmrCpuImg from '../assets/qxmr-cpu.png';
import { Section } from './Section';
import { CheckCircle } from 'lucide-react';
export const WhatIsQXMR = () => {
    return (_jsx(Section, { id: "token", className: "py-24 bg-midnight", children: _jsx("div", { className: "container mx-auto px-4", children: _jsx("div", { className: "max-w-5xl mx-auto", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-16 items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-8 text-electric", children: "What Is QXMR?" }), _jsx("p", { className: "text-lg text-electricLight mb-8", children: "QXMR is the commemorative token minted to celebrate this breakthrough in Epoch 161. A symbol of innovation, perseverance, and the pioneering spirit of the Qubic community." }), _jsx("ul", { className: "space-y-6", children: [
                                        {
                                            title: "Tokenomics",
                                            description: (_jsxs(_Fragment, { children: [_jsx("span", { className: "block mb-2 text-electric", children: "161,000,000,000 total supply" }), _jsxs("ul", { className: "list-disc ml-6 text-electricLight", children: [_jsxs("li", { children: [_jsx("b", { children: "50%" }), " airdropped for Qubicans on June 4th"] }), _jsxs("li", { children: [_jsx("b", { children: "20%" }), " to be burned"] }), _jsxs("li", { children: [_jsx("b", { children: "16.1%" }), " allocated for liquidity pools"] }), _jsxs("li", { children: [_jsx("b", { children: "9%" }), " for team"] }), _jsxs("li", { children: [_jsx("b", { children: "4.9%" }), " for rewards/giveaways"] })] })] }))
                                        },
                                        {
                                            title: "Airdrop Details",
                                            description: (_jsx(_Fragment, { children: _jsxs("ul", { className: "list-disc ml-6 text-electricLight", children: [_jsxs("li", { children: [_jsx("b", { children: "35%" }), " for Qearn hodlers locked in Epoch 138 - 161"] }), _jsxs("li", { children: [_jsx("b", { children: "10%" }), " for wallets"] }), _jsxs("li", { children: [_jsx("b", { children: "5%" }), " for Smart Contract Shareholders"] })] }) }))
                                        },
                                        {
                                            title: "Epoch 161 Tribute",
                                            description: "Marks the exact moment when Qubic's uPoW stepped on stage and showed the world what Qubic is all about."
                                        },
                                    ].map((item, index) => (_jsxs("li", { className: "flex", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-electricAccent mr-4 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-electricDark", children: item.title }), _jsx("p", { className: "text-electricLight", children: item.description })] })] }, index))) })] }), _jsx("div", { className: "relative", children: _jsx("div", { className: "flex items-center justify-center aspect-square w-full h-full", children: _jsxs("div", { className: "relative w-full h-full flex items-center justify-center", children: [_jsx("div", { className: "absolute inset-0 rounded-2xl bg-gradient-to-br from-navy/60 via-navy/30 to-transparent blur-sm z-0" }), _jsx("img", { src: QxmrCpuImg, alt: "QXMR CPU", className: "relative z-10 w-full h-full object-contain rounded-2xl shadow-[0_0_60px_20px_rgba(78,224,252,0.40)] border-2 border-cyan-400/40 backdrop-blur-[2px] bg-gradient-to-br from-navy/60 via-navy/10 to-transparent", style: { mixBlendMode: 'screen' } })] }) }) })] }) }) }) }));
};
