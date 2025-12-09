import { jsx as _jsx } from "react/jsx-runtime";
export const QUBIC = ({ children, className = '' }) => {
    return (_jsx("span", { className: `font-bold bg-gradient-to-r from-electric via-electricAccent to-cyan text-transparent bg-clip-text ${className}`, children: children }));
};
