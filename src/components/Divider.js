import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Divider = ({ className = '' }) => {
    return (_jsx("div", { className: `container mx-auto px-4 ${className}`, children: _jsx("div", { className: "max-w-2xl mx-auto", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" }), _jsx("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black rounded-full", children: _jsx("span", { className: "text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text", children: "\u2E3B" }) })] }) }) }));
};
