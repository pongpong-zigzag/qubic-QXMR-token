import React, { useState, useCallback } from 'react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import { QubicTransferAssetPayload } from '@qubic-lib/qubic-ts-library/dist/qubic-types/transacion-payloads/QubicTransferAssetPayload';
import { QubicDefinitions } from "@qubic-lib/qubic-ts-library/dist/QubicDefinitions";
import { Long } from '@qubic-lib/qubic-ts-library/dist/qubic-types/Long';
import { fetchTickInfo, broadcastTx, fetchBalance } from '../services/rpc.service';
import { saveTransaction } from '../services/backend.service';
import { toast } from 'react-hot-toast';

interface BuyGamesTransactionProps {
  onPurchaseComplete: () => void;
}

const GAME_PRICE = 50000; // 500,000 QXMR per paid game
const LEADERBOARD_PRICE = 10000; // 10,000 QXMR for leaderboard access
const RECIPIENT_ADDRESS = 'QXMRTKTZXQPNZDZFNYQZBYCRMOGDZPNMBIBOHHOMBHSDJYQAMPVKVEIESLAL'; // QXMR recipient address
const BUY_EVENT = 'buyGames';
const PAY_EVENT = 'payLeaderboard';

const glassToastStyle = {
  style: {
    background: 'rgba(4, 7, 18, 0.92)',
    color: '#ecfeff',
    border: '1px solid rgba(78, 224, 252, 0.35)',
    backdropFilter: 'blur(10px)',
    fontSize: '0.85rem',
    letterSpacing: '0.02em',
  },
};

const withLoadingToast = (id: string, message: string) =>
  toast.loading(message, { id, ...glassToastStyle });

const withSuccessToast = (message: string) =>
  toast.success(message, glassToastStyle);

const withErrorToast = (message: string) =>
  toast.error(message, glassToastStyle);

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unknown error';

const BuyGamesTransaction: React.FC<BuyGamesTransactionProps> = ({ onPurchaseComplete }) => {
  const { connected, wallet, getSignedTx } = useQubicConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLeaderboardPayment = useCallback(async () => {
    if (!connected || !wallet) {
      withErrorToast('Please connect your wallet first.');
      return;
    }

    if (isProcessing) {
      withErrorToast('Another transaction is in flight. Please wait.');
      return;
    }

    setIsProcessing(true);
    const totalAmount = LEADERBOARD_PRICE;

    try {
      // Check balance before sending transaction
      withLoadingToast('balance-check', 'Checking balance…');
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = Number(balance?.numberOfUnits ?? 0);
      
      toast.dismiss('balance-check');
      
      if (availableBalance < totalAmount) {
        withErrorToast(`You need ${totalAmount.toLocaleString()} QXMR but only have ${availableBalance.toLocaleString()}.`);
        setIsProcessing(false);
        return;
      }
      
      withSuccessToast(`Balance verified • ${availableBalance.toLocaleString()} QXMR`);

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

      const payloadBuilder = new QubicTransferAssetPayload()
        .setIssuer(balance?.issuerIdentity ?? '')
        .setNewOwnerAndPossessor(destAddress)
        .setAssetName(balance?.assetName ?? '')
        .setNumberOfUnits(amountLong);
      const payload = payloadBuilder.getTransactionPayload();

      const tx = new QubicTransaction()
        .setSourcePublicKey(sourceAddress)
        .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS)
        .setAmount(amountLong)
        .setTick(targetTick)
        .setInputType(QubicDefinitions.QX_TRANSFER_ASSET_INPUT_TYPE)
        .setInputSize(payload.getPackageSize())
        .setAmount(QubicDefinitions.QX_TRANSFER_ASSET_FEE)
        .setPayload(payload);

      // Sign the transaction
      withLoadingToast('signing', 'Awaiting signature…');
      const signedTxResult = await getSignedTx(tx);
      const signedTx = signedTxResult.tx;

      // Broadcast the transaction
      withLoadingToast('broadcasting', 'Broadcasting to Qubic network…');
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
          
          if (result.leaderboard_access_granted) {
          withSuccessToast('Leaderboard access granted. Welcome to the hall-of-fame.');
          } else {
            withSuccessToast('Transaction received. Access will unlock shortly.');
          }
          onPurchaseComplete();
        } catch (error) {
          console.error('Error saving transaction:', error);
          withErrorToast('Tx saved but access failed. Ping support with your hash.');
        }
      } else {
        withErrorToast('Broadcast failed — please retry once the network settles.');
      }
    } catch (error: unknown) {
      console.error('Error processing leaderboard payment:', error);
      withErrorToast(`Transaction failed: ${getErrorMessage(error)}`);
    } finally {
      setIsProcessing(false);
      toast.dismiss('pay-leaderboard');
    }
  }, [connected, wallet, getSignedTx, isProcessing, onPurchaseComplete]);

  const handlePurchase = useCallback(async (games: number = 1) => {
    if (!connected || !wallet) {
      withErrorToast('Please connect your wallet first.');
      return;
    }

    if (isProcessing) {
      withErrorToast('Another transaction is in flight. Please wait.');
      return;
    }

    setIsProcessing(true);
    const totalAmount = GAME_PRICE * games;

    try {
      withLoadingToast('balance-check', 'Checking balance…');
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = Number(balance?.numberOfUnits ?? 0);
      
      toast.dismiss('balance-check');
      
      if (availableBalance < totalAmount) {
        withErrorToast(`You need ${totalAmount.toLocaleString()} QXMR but only have ${availableBalance.toLocaleString()}.`);
        setIsProcessing(false);
        return;
      }
      
      withSuccessToast(`Balance verified • ${availableBalance.toLocaleString()} QXMR`);
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

      const payloadBuilder = new QubicTransferAssetPayload()
        .setIssuer(balance?.issuerIdentity ?? '')
        .setNewOwnerAndPossessor(destAddress)
        .setAssetName(balance?.assetName ?? '')
        .setNumberOfUnits(amountLong);
      const payload = payloadBuilder.getTransactionPayload();

      const tx = new QubicTransaction()
        .setSourcePublicKey(sourceAddress)
        .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS)
        .setAmount(amountLong)
        .setTick(targetTick)
        .setInputType(QubicDefinitions.QX_TRANSFER_ASSET_INPUT_TYPE)
        .setInputSize(payload.getPackageSize())
        .setAmount(QubicDefinitions.QX_TRANSFER_ASSET_FEE)
        .setPayload(payload);

      // Sign the transaction
      withLoadingToast('signing', 'Awaiting signature…');
      const signedTxResult = await getSignedTx(tx);
      const signedTx = signedTxResult.tx;

      // Broadcast the transaction
      withLoadingToast('broadcasting', 'Broadcasting to Qubic network…');
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
          
      if (result.games_added && result.games_added > 0) {
        withSuccessToast(`${result.games_added} game(s) now live in your account.`);
          } else {
            withSuccessToast('Transaction confirmed. Games will populate shortly.');
          }
          onPurchaseComplete();
        } catch (error) {
          console.error('Error saving transaction:', error);
          withErrorToast('Tx sent but account update failed. Please contact support.');
        }
      } else {
        withErrorToast('Broadcast failed — try again once the network stabilizes.');
      }
    } catch (error: unknown) {
      console.error('Error processing purchase:', error);
      withErrorToast(`Transaction failed: ${getErrorMessage(error)}`);
    } finally {
      setIsProcessing(false);
      toast.dismiss('buy-games');
    }
  }, [connected, wallet, getSignedTx, isProcessing, onPurchaseComplete]);

  // This component listens for buy games requests and leaderboard payment requests
  React.useEffect(() => {
    const buyListener: EventListener = (event) => {
      const customEvent = event as CustomEvent<{ games?: number }>;
      if (!connected || !wallet) {
        withErrorToast('Please connect your wallet first.');
        return;
      }
      const gamesToBuy = customEvent.detail?.games ?? 1;
      void handlePurchase(gamesToBuy);
    };

    const leaderboardListener: EventListener = () => {
      if (!connected || !wallet) {
        withErrorToast('Please connect your wallet first.');
        return;
      }
      void handleLeaderboardPayment();
    };

    window.addEventListener(BUY_EVENT, buyListener);
    window.addEventListener(PAY_EVENT, leaderboardListener);
    return () => {
      window.removeEventListener(BUY_EVENT, buyListener);
      window.removeEventListener(PAY_EVENT, leaderboardListener);
    };
  }, [connected, wallet, handlePurchase, handleLeaderboardPayment]);

  // This component doesn't render anything, it just handles transactions
  return null;
};

export default BuyGamesTransaction;

