import { jsx as _jsx } from "react/jsx-runtime";
import { Section } from './Section';
export const ClaimSection = () => {
    return (_jsx(Section, { id: "claim", className: "py-24 bg-midnight", children: _jsx("div", { className: "container mx-auto px-4", children: _jsx("div", { className: "max-w-4xl mx-auto text-center", children: _jsx("div", { className: "mt-24", children: _jsx("div", { className: "inline-flex flex-wrap justify-center gap-4 text-electricDark", children: [
                            "#QXMR",
                            "#QUBIC",
                            "#Epoch161",
                            "#QubicXMR",
                            "#uPoWProven",
                            "#CrossChainPower",
                            "#ForTheBelieversAndBeyond"
                        ].map((tag, index) => (_jsx("span", { className: "px-4 py-2 bg-navy/60 backdrop-blur-sm border border-electric rounded-full hover:text-electricAccent transition-colors cursor-pointer", children: tag }, index))) }) }) }) }) }));
};
