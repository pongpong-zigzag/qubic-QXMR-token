import React, { useState } from 'react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { useWalletConnect } from './connect/WalletConnectContext';
import { fetchBalance } from '../services/rpc.service';
import { saveTransaction } from '../services/backend.service';
import { toast } from 'react-hot-toast';

interface BuyGamesTransactionProps {
  onPurchaseComplete: () => void;
}

const LEADERBOARD_PRICE = 25000; // 25,000 QXMR for leaderboard access
const GAME_PRICE = 10000; // 10,000 QXMR per game (must match BuyGamesModal)
const RECIPIENT_ADDRESS = 'QXMRTKTZXQPNZDZFNYQZBYCRMOGDZPNMBIBOHHOMBHSDJYQAMPVKVEIESLAL'; // QXMR recipient address
const QXMR_ISSUER = "QXMRTKAIIGLUREPIQPCMHCKWSIPDTUYFCFNYXQLTECSUJVYEMMDELBMDOEYB";
const QXMR_ASSET_NAME = "QXMR";

const BuyGamesTransaction: React.FC<BuyGamesTransactionProps> = ({ onPurchaseComplete }) => {
  const { connected, wallet } = useQubicConnect();
  const { sendAsset } = useWalletConnect();
  const [, setIsProcessing] = useState(false);

  // This component listens for buy games requests and leaderboard payment requests
  React.useEffect(() => {
    const handleBuyGamesRequest = async (event: Event) => {
      const customEvent = event as CustomEvent<{ games: number }>;
      const { games } = customEvent.detail || { games: 0 };
      if (!connected || !wallet || !games) {
        toast.error('Please connect your wallet first');
        return;
      }

      await handlePurchase(games);
    };

    const handleLeaderboardPaymentRequest = async () => {
      if (!connected || !wallet) {
        toast.error('Please connect your wallet first');
        return;
      }

      await handleLeaderboardPayment();
    };

    window.addEventListener('buyGames', handleBuyGamesRequest as EventListener);
    window.addEventListener('payLeaderboard', handleLeaderboardPaymentRequest as EventListener);
    return () => {
      window.removeEventListener('buyGames', handleBuyGamesRequest as EventListener);
      window.removeEventListener('payLeaderboard', handleLeaderboardPaymentRequest as EventListener);
    };
  }, [connected, wallet]);

  const handleLeaderboardPayment = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (wallet.connectType !== 'walletconnect') {
      toast.error('QXMR payments currently require WalletConnect');
      return;
    }

    setIsProcessing(true);
    const totalAmount = LEADERBOARD_PRICE;

    try {
      // Check balance before sending transaction
      toast.loading('Checking balance...', { id: 'balance-check' });
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = balance?.numberOfUnits || 0;
      
      toast.dismiss('balance-check');
      
      if (availableBalance < totalAmount) {
        toast.error(`Insufficient balance. You have ${availableBalance} QXMR, but need ${totalAmount} QXMR for leaderboard access.`);
        setIsProcessing(false);
        return;
      }
      
      toast.success(`Balance: ${availableBalance} QXMR`, { duration: 2000 });

      const sourceAddress = wallet.publicKey?.toUpperCase().trim();
      const destAddress = RECIPIENT_ADDRESS.toUpperCase().trim();

      toast.loading('Confirm QXMR transfer in your wallet...', { id: 'signing' });
      const sendAssetResult = await sendAsset({
        from: sourceAddress,
        to: destAddress,
        assetName: QXMR_ASSET_NAME,
        issuer: QXMR_ISSUER,
        amount: totalAmount,
      });

      toast.dismiss('signing');

      if (sendAssetResult && sendAssetResult.transactionId) {
        const txId = sendAssetResult.transactionId;

        // Save transaction to backend with leaderboard_payment type
        try {
          const result = await saveTransaction({
            walletid: wallet.publicKey,
            hash: txId,
            paid: totalAmount,
            col1: 'leaderboard_payment',
            col2: '1',
          });
          
          toast.dismiss('pay-leaderboard');
          if (result.leaderboard_access_granted) {
            toast.success('Leaderboard access granted! Your scores will now appear on the leaderboard.');
          } else {
            toast.success('Transaction successful! Leaderboard access will be granted shortly.');
          }
          onPurchaseComplete();
        } catch (error) {
          console.error('Error saving transaction:', error);
          toast.dismiss('pay-leaderboard');
          toast.error('Transaction sent but failed to grant access. Please contact support.');
        }
      } else {
        toast.error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error processing leaderboard payment:', error);
      toast.error(`Transaction failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = async (games: number = 1) => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (wallet.connectType !== 'walletconnect') {
      toast.error('QXMR payments currently require WalletConnect');
      return;
    }

    setIsProcessing(true);
    const totalAmount = GAME_PRICE * games;

    try {
      toast.loading('Checking balance...', { id: 'balance-check' });
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = balance?.numberOfUnits || 0;

      toast.dismiss('balance-check');

      if (availableBalance < totalAmount) {
        toast.error(`Insufficient balance. You have ${availableBalance} QXMR, but need ${totalAmount} QXMR.`);
        setIsProcessing(false);
        return;
      }

      toast.success(`Balance: ${availableBalance} QXMR`, { duration: 2000 });

      const sourceAddress = wallet.publicKey?.toUpperCase().trim();
      const destAddress = RECIPIENT_ADDRESS.toUpperCase().trim();

      toast.loading('Confirm QXMR transfer in your wallet...', { id: 'signing' });
      const sendAssetResult = await sendAsset({
        from: sourceAddress,
        to: destAddress,
        assetName: QXMR_ASSET_NAME,
        issuer: QXMR_ISSUER,
        amount: totalAmount,
      });

      toast.dismiss('signing');

      if (sendAssetResult && sendAssetResult.transactionId) {
        const txId = sendAssetResult.transactionId;

        // Save transaction to backend (this will automatically add games)
        try {
          const result = await saveTransaction({
            walletid: wallet.publicKey,
            hash: txId,
            paid: totalAmount,
            col1: 'game_purchase',
            col2: games.toString(),
          });
          
          toast.dismiss('buy-games');
          if (result.games_added && result.games_added > 0) {
            toast.success(`Transaction successful! ${result.games_added} game(s) added to your account.`);
          } else {
            toast.success('Transaction successful! Games will be added shortly.');
          }
          onPurchaseComplete();
        } catch (error) {
          console.error('Error saving transaction:', error);
          toast.dismiss('buy-games');
          toast.error('Transaction sent but failed to update games. Please contact support.');
        }
      } else {
        toast.error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error processing purchase:', error);
      toast.error(`Transaction failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // This component doesn't render anything, it just handles transactions
  return null;
};

export default BuyGamesTransaction;

