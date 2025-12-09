import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Section } from './Section';
import XmrStats from './XmrStats';
export const BurningMechanics = () => {
    return (_jsx(Section, { className: "py-16 bg-navy/50", children: _jsx("div", { className: "container mx-auto px-4", children: _jsxs("div", { className: "grid md:grid-cols-2 gap-8 items-stretch", children: [_jsxs("div", { className: "bg-gradient-to-br from-navy/80 to-navy/60 backdrop-blur-sm border border-electric/30 rounded-xl p-6", children: [_jsx("h3", { className: "text-2xl font-bold text-electric mb-6", children: "Burn Mechanics" }), _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-electricLight", children: "QXMR implements a dynamic burn mechanism that triggers at key network milestones:" }), _jsx("ul", { className: "space-y-3", children: [
                                            { threshold: '100 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '200 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '300 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '400 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '500 Mh/s ✅', burn: '3% 🔥🔥🔥' },
                                            { threshold: '600 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '600 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '700 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '800 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '900 Mh/s ✅', burn: '1% 🔥' },
                                            { threshold: '1 Gh/s ✅', burn: '5% 🔥🔥🔥🔥🔥' },
                                            { threshold: '1.5 Gh/s ✅', burn: '1% 🔥' },
                                            { threshold: '2 Gh/s ✅', burn: '1% 🔥' },
                                            { threshold: '(51%) Gh/s ', burn: '1.9% 🔥' },
                                        ].map((item, index) => (_jsxs("li", { className: "flex justify-between items-center py-2 border-b border-electric/10", children: [_jsx("span", { className: "text-electricLight", children: item.threshold }), _jsx("span", { className: "text-electric font-mono font-medium", children: item.burn })] }, index))) })] })] }), _jsx(XmrStats, {})] }) }) }));
};
