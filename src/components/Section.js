import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Section = ({ children, className = '', id }) => {
    return (_jsxs("section", { id: id, className: `relative ${className}`, children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none overflow-hidden", children: [_jsx("div", { className: "absolute w-[500px] h-[500px] rounded-full bg-purple-600/5 top-1/4 -left-[250px] blur-3xl" }), _jsx("div", { className: "absolute w-[600px] h-[600px] rounded-full bg-blue-600/5 top-1/2 -right-[300px] blur-3xl" })] }), children] }));
};
