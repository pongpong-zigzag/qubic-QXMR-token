import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Section } from './Section';
export const HistoricFirst = () => {
    return (_jsx(Section, { id: "history", className: "py-24 bg-midnight", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-16 text-center text-electric", children: "A Historic First in Crypto" }), _jsxs("div", { className: "max-w-3xl mx-auto text-lg space-y-6 text-center text-electricLight", children: [_jsx("p", { children: "In Epoch 161, Qubic didn't just make a move \u2014 it made history." }), _jsxs("p", { children: ["Qubic reached beyond itself.", _jsx("br", {}), "Instead of letting excess power sit idle,", _jsx("br", {}), "it unleashed ", _jsx("strong", { children: "half" }), " of its surplus to ", _jsx("strong", { children: "mine Monero" }), "."] }), _jsxs("p", { className: "text-2xl font-medium text-electric py-4", children: ["But this wasn't just about mining.", _jsx("br", {}), "It was about purpose.", _jsx("br", {}), "About vision.", _jsx("br", {}), _jsx("i", { children: "uPoW" }), ". ", _jsx("br", {}), "Proven."] }), _jsxs("p", { children: ["Epoch 161 wasn't a milestone.", _jsx("br", {}), "It was a ", _jsx("strong", { children: "monument" }), " to what's possible when power is used with purpose.", _jsx("br", {}), "And Qubic led the way."] })] }), _jsxs("div", { className: "mt-16 relative", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-electric/20 via-electricAccent/20 to-cyan/20 rounded-xl blur-lg" }), _jsx("div", { className: "relative bg-navy/80 backdrop-blur-sm rounded-xl overflow-hidden border border-electric", children: _jsx("div", { className: "grid md:grid-cols-3 divide-x divide-electric/30", children: [
                                    {
                                        title: "@c___f___b",
                                        description: "There is a point at which mining #Monero via #Qubic is more profitable than mining it directly..."
                                    },
                                    {
                                        title: "@c___f___b",
                                        description: "Somebody told it would be impossible to run XMR mining on #Qubic, we decided to verify the claim."
                                    },
                                    {
                                        title: "@c___f___b",
                                        description: "Hey, #Monero community, what pool would you recommend to an operator of 100'000 CPU cores?"
                                    }
                                ].map((item, index) => (_jsxs("div", { className: "p-8 flex flex-col items-center text-center", children: [_jsx("h3", { className: "text-xl font-bold mb-4 text-electricDark", children: item.title }), _jsx("p", { className: "text-electricLight", children: item.description })] }, index))) }) })] })] }) }));
};
