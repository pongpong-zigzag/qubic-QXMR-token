import React, { useState } from 'react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { useWalletConnect } from './connect/WalletConnectContext';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import { Long } from '@qubic-lib/qubic-ts-library/dist/qubic-types/Long';
import { fetchTickInfo, broadcastTx, fetchBalance } from '../services/rpc.service';
import { saveTransaction } from '../services/backend.service';
import { toast } from 'react-hot-toast';

interface BuyGamesTransactionProps {
  onPurchaseComplete: () => void;
}

const LEADERBOARD_PRICE = 10000; // 10,000 QXMR for leaderboard access
const RECIPIENT_ADDRESS = 'QXMRTKTZXQPNZDZFNYQZBYCRMOGDZPNMBIBOHHOMBHSDJYQAMPVKVEIESLAL'; // QXMR recipient address
const TOKEN_CONTRACT = 'QXMRTKAIIGLUREPIQPCMHCKWSIPDTUYFCFNYXQLTECSUJVYEMMDELBMDOEYB'; // QXMR token contract

const BuyGamesTransaction: React.FC<BuyGamesTransactionProps> = ({ onPurchaseComplete }) => {
  const { connected, wallet, getSignedTx } = useQubicConnect();
  const { sendQubic, isConnected } = useWalletConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  // This component listens for buy games requests and leaderboard payment requests
  React.useEffect(() => {
    const handleBuyGamesRequest = async (event: CustomEvent) => {
      const { games } = event.detail;
      if (!connected || !wallet || !games) {
        toast.error('Please connect your wallet first');
        return;
      }

      await handlePurchase(games);
    };

    const handleLeaderboardPaymentRequest = async (event: CustomEvent) => {
      if (!connected || !wallet) {
        toast.error('Please connect your wallet first');
        return;
      }

      await handleLeaderboardPayment();
    };

    window.addEventListener('buyGames' as any, handleBuyGamesRequest as EventListener);
    window.addEventListener('payLeaderboard' as any, handleLeaderboardPaymentRequest as EventListener);
    return () => {
      window.removeEventListener('buyGames' as any, handleBuyGamesRequest as EventListener);
      window.removeEventListener('payLeaderboard' as any, handleLeaderboardPaymentRequest as EventListener);
    };
  }, [connected, wallet]);

  const handleLeaderboardPayment = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    const totalAmount = LEADERBOARD_PRICE;

    try {
      // Check balance before sending transaction
      toast.loading('Checking balance...', { id: 'balance-check' });
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = (balance?.incomingAmount || 0) - (balance?.outgoingAmount || 0);
      
      toast.dismiss('balance-check');
      
      if (availableBalance < totalAmount) {
        toast.error(`Insufficient balance. You have ${availableBalance} Qubic, but need ${totalAmount} QXMR for leaderboard access.`);
        setIsProcessing(false);
        return;
      }
      
      toast.success(`Balance: ${availableBalance} Qubic`, { duration: 2000 });

      // Get current tick
      const tickInfo = await fetchTickInfo();
      let currentTick = Number(tickInfo.tick);
      if (isNaN(currentTick) || currentTick <= 0) {
        currentTick = Date.now();
      }
      const targetTick = Math.floor(currentTick) + 10;

      // For asset transfer, we need to use WalletConnect's sendAsset if available
      // Otherwise, we'll use a regular Qubic transfer for now
      // Note: In production, you should use proper asset transfer for QXMR tokens
      const sourceAddress = wallet.publicKey?.toUpperCase().trim();
      const destAddress = RECIPIENT_ADDRESS.toUpperCase().trim();
      const amountLong = new Long(totalAmount);

      const tx = new QubicTransaction()
        .setSourcePublicKey(sourceAddress)
        .setDestinationPublicKey(destAddress)
        .setAmount(amountLong)
        .setTick(targetTick)
        .setInputType(0)
        .setInputSize(0);

      // Sign the transaction
      toast.loading('Signing transaction...', { id: 'signing' });
      const signedTxResult = await getSignedTx(tx);
      const signedTx = signedTxResult.tx;

      // Broadcast the transaction
      toast.loading('Broadcasting transaction...', { id: 'broadcasting' });
      const broadcastResult = await broadcastTx(signedTx);

      toast.dismiss('signing');
      toast.dismiss('broadcasting');

      if (broadcastResult && broadcastResult.transactionId) {
        const txId = broadcastResult.transactionId;

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
        toast.error('Transaction failed to broadcast');
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

    setIsProcessing(true);
    const totalAmount = GAME_PRICE * games;

    try {
      // Get current tick
      const tickInfo = await fetchTickInfo();
      let currentTick = Number(tickInfo.tick);
      if (isNaN(currentTick) || currentTick <= 0) {
        currentTick = Date.now();
      }
      const targetTick = Math.floor(currentTick) + 10;

      // Create transaction
      const sourceAddress = wallet.publicKey?.toUpperCase().trim();
      const destAddress = RECIPIENT_ADDRESS.toUpperCase().trim();
      const amountLong = new Long(totalAmount);

      const tx = new QubicTransaction()
        .setSourcePublicKey(sourceAddress)
        .setDestinationPublicKey(destAddress)
        .setAmount(amountLong)
        .setTick(targetTick)
        .setInputType(0)
        .setInputSize(0);

      // Sign the transaction
      toast.loading('Signing transaction...', { id: 'signing' });
      const signedTxResult = await getSignedTx(tx);
      const signedTx = signedTxResult.tx;

      // Broadcast the transaction
      toast.loading('Broadcasting transaction...', { id: 'broadcasting' });
      const broadcastResult = await broadcastTx(signedTx);

      toast.dismiss('signing');
      toast.dismiss('broadcasting');

      if (broadcastResult && broadcastResult.transactionId) {
        const txId = broadcastResult.transactionId;

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
        toast.error('Transaction failed to broadcast');
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

