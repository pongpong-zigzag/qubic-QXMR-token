import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletConnectProvider } from './components/connect/WalletConnectContext';
import { QubicConnectProvider } from './components/connect/QubicConnectContext';
import { UserProvider } from './contexts/UserContext';
import QRaffles from './components/QRaffles';

import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { HistoricFirst } from './components/HistoricFirst';
import { WhatIsQXMR } from './components/WhatIsQXMR';
import { Monument } from './components/Monument';
import { BurningMechanics } from './components/BurningMechanics';
import { ClaimSection } from './components/ClaimSection';
import { Footer } from './components/Footer';
import StatsPage from './pages/stats';
import RaffleTemp from './components/RaffleTemp';
import PowerPlayersPage from './pages/power-players';
import GamePage from './pages/gamepage';

const Home = () => (
  <>
    <Hero />
    <HistoricFirst />
    <WhatIsQXMR />
    <BurningMechanics />
    <Monument />
    <ClaimSection />
  </>
);

function App() {
  return (
    <WalletConnectProvider>
      <QubicConnectProvider>
        <UserProvider>
          <Router>
          <Routes>
            <Route path="/qraffles" element={<QRaffles />} />
            <Route path="/raffle" element={<RaffleTemp />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/game" element={<GamePage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/power-players" element={<PowerPlayersPage />} />
                </Routes>
                <Footer />
              </Layout>
            } />
          </Routes>
        </Router>
        <Toaster position="top-right" />
        </UserProvider>
      </QubicConnectProvider>
    </WalletConnectProvider>
  );
}

export default App;