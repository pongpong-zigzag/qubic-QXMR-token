import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Raffle from './Raffle';
const raffles = [
    { id: '001', title: '001' },
    { id: '002', title: '002' },
    { id: '003', title: '003' },
    { id: '004', title: '004' },
    { id: '005', title: '005' },
    { id: '006', title: '006' },
    { id: '007', title: '007' },
];
export default function AllRaffles() {
    return (_jsxs("div", { className: "flex flex-col items-center gap-12 mt-24", children: [_jsx("div", { className: "grid grid-cols-2 gap-16 items-start", children: raffles.slice(0, 4).map(r => (_jsx("div", { className: "border-2 border-white rounded-3xl overflow-hidden scale-100", children: _jsx(Raffle, { raffleId: r.id, title: r.title }) }, r.id))) }), _jsx("div", { className: "grid grid-cols-2 gap-16 items-start", children: raffles.slice(4, 6).map(r => (_jsx("div", { className: "border-2 border-white rounded-3xl overflow-hidden scale-100", children: _jsx(Raffle, { raffleId: r.id, title: r.title }) }, r.id))) }), _jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "border-2 border-white rounded-3xl overflow-hidden scale-100", children: _jsx(Raffle, { raffleId: raffles[6].id, title: raffles[6].title }) }) })] }));
}
