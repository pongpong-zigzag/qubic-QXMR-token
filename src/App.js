import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { HistoricFirst } from './components/HistoricFirst';
import { WhatIsQXMR } from './components/WhatIsQXMR';
import { Monument } from './components/Monument';
import { BurningMechanics } from './components/BurningMechanics';
import { ClaimSection } from './components/ClaimSection';
import { Footer } from './components/Footer';
import { Suspense, lazy } from 'react';
const GameSection = lazy(() => import('./components/GameSection'));
import RaffleTemp from './components/RaffleTemp';
import AllRaffles from './components/AllRaffles';
const Home = () => (_jsxs(_Fragment, { children: [_jsx(Hero, {}), _jsx(HistoricFirst, {}), _jsx(WhatIsQXMR, {}), _jsx(BurningMechanics, {}), _jsx(Suspense, { fallback: _jsx("div", { children: "Loading game..." }), children: _jsx(GameSection, {}) }), _jsx(Monument, {}), _jsx(ClaimSection, {})] }));
function App() {
    return (_jsx(Router, { children: _jsxs(Layout, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/raffle", element: _jsx(_Fragment, { children: _jsx(RaffleTemp, {}) }) }), _jsx(Route, { path: "/raffles", element: _jsx(AllRaffles, {}) })] }), _jsx(Footer, {})] }) }));
}
export default App;
