import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import { useWalletConnect } from './connect/WalletConnectContext';
import { QubicTransaction } from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction';
import { Long } from '@qubic-lib/qubic-ts-library/dist/qubic-types/Long';
import { QubicHelper } from '@qubic-lib/qubic-ts-library/dist/qubicHelper';
import { fetchTickInfo, broadcastTx, fetchBalance } from '../services/rpc.service';
import { saveTransaction } from '../services/backend.service';
import { RPC_URL } from '../constants';
import toast from 'react-hot-toast';

interface TransactionButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const TransactionButton: React.FC<TransactionButtonProps> = ({
  variant = 'default',
  size = 'md',
}) => {
  const { connected, wallet, getSignedTx } = useQubicConnect();
  const { sendQubic, isConnected } = useWalletConnect();
  const [isProcessing, setIsProcessing] = useState(false);

  const recipientAddress = 'LDDHUWSEZBINQAYYMGXXGDLITHQCEJOVWUGDJGRDGDDHGLLGMFFFCEUDZITM'; // Valid Qubic address
  const amount = 10000; // 10000 QXMR tokens

  const handleTransaction = async () => {
    if (!connected || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate amount first (must be defined before balance check)
      const transactionAmount = Number(amount);
      if (isNaN(transactionAmount) || transactionAmount <= 0) {
        throw new Error('Invalid transaction amount');
      }

      // Check balance before sending
      toast.loading('Checking balance...', { id: 'balance-check' });
      const balanceData = await fetchBalance(wallet.publicKey);
      const balance = balanceData.balance;
      const availableBalance = (balance?.incomingAmount || 0) - (balance?.outgoingAmount || 0);
      
      toast.dismiss('balance-check');
      
      if (availableBalance < transactionAmount) {
        toast.error(`Insufficient balance. You have ${availableBalance} QXMR, but need ${transactionAmount}`);
        setIsProcessing(false);
        return;
      }
      
      toast.success(`Balance: ${availableBalance} QXMR`, { duration: 2000 });
      
      // Get current tick
      const tickInfo = await fetchTickInfo();
      // Ensure tick is a valid number
      let currentTick = Number(tickInfo.tick);
      if (isNaN(currentTick) || currentTick <= 0) {
        console.warn('Invalid tick from RPC, using fallback');
        // Try to get a reasonable tick - fetch latest stats or use a default
        try {
          const statsResponse = await fetch(`${RPC_URL}/v1/latest-stats`);
          const stats = await statsResponse.json();
          currentTick = Number(stats?.data?.currentTick) || Date.now();
        } catch {
          currentTick = Date.now(); // Fallback to current timestamp
        }
      }
      const targetTick = Math.floor(currentTick) + 10; // Add offset for transaction, ensure it's an integer

      // If using WalletConnect and wallet is connected via WalletConnect, use sendQubic directly
      if (wallet.connectType === 'walletconnect' && isConnected) {
        try {
          const result = await sendQubic({
            from: wallet.publicKey,
            to: recipientAddress,
            amount: transactionAmount,
          });
          toast.success('Transaction sent successfully!');
          console.log('Transaction result:', result);
          setIsProcessing(false);
          return;
        } catch (error: any) {
          console.error('Error sending via WalletConnect sendQubic:', error);
          // Fall through to transaction method
        }
      }

      // Create transaction using QubicTransaction
      // Identity strings can be passed directly to setSourcePublicKey and setDestinationPublicKey
      // Create Long with proper value
      const amountLong = new Long(transactionAmount);

      // Validate identity strings are valid (60 characters, uppercase letters only)
      // Qubic addresses must be uppercase
      const sourceAddress = wallet.publicKey?.toUpperCase().trim();
      const destAddress = recipientAddress.toUpperCase().trim();
      
      console.log('Transaction details:', {
        sourceAddress: sourceAddress,
        destAddress: destAddress,
        amount: transactionAmount,
        tick: targetTick,
        walletPublicKey: wallet.publicKey
      });
      
      if (!sourceAddress || sourceAddress.length !== 60 || !/^[A-Z]+$/.test(sourceAddress)) {
        console.error('Source address validation failed:', {
          address: sourceAddress,
          length: sourceAddress?.length,
          isUppercase: sourceAddress ? /^[A-Z]+$/.test(sourceAddress) : false,
          originalWalletKey: wallet.publicKey
        });
        throw new Error(`Invalid source wallet address: ${wallet.publicKey?.substring(0, 10)}... (must be 60 uppercase letters, got ${sourceAddress?.length || 0})`);
      }
      if (!destAddress || destAddress.length !== 60 || !/^[A-Z]+$/.test(destAddress)) {
        console.error('Dest address validation failed:', {
          address: destAddress,
          length: destAddress.length,
          isUppercase: /^[A-Z]+$/.test(destAddress)
        });
        throw new Error(`Invalid recipient address: ${destAddress.substring(0, 10)}... (must be 60 uppercase letters, got ${destAddress.length})`);
      }

      // Create transaction: source = sender (your wallet), destination = recipient
      // IMPORTANT: For WalletConnect, the source must match the wallet's actual address
      // that WalletConnect will use for signing
      const tx = new QubicTransaction()
        .setSourcePublicKey(sourceAddress)  // Your wallet (sender) - must match wallet.publicKey
        .setDestinationPublicKey(destAddress)  // Recipient address
        .setAmount(amountLong)  // Amount to send (10000 Qubic)
        .setTick(targetTick)
        .setInputType(0)
        .setInputSize(0);
      
      console.log('Created transaction:', {
        source: sourceAddress.substring(0, 10) + '...',
        destination: destAddress.substring(0, 10) + '...',
        amount: transactionAmount,
        amountLongValue: amountLong.getNumber ? amountLong.getNumber() : 'N/A',
        tick: targetTick,
        walletPublicKey: wallet.publicKey
      });

      // Sign the transaction
      toast.loading('Signing transaction...', { id: 'signing' });
      
      // Log transaction before signing
      console.log('Transaction before signing:', {
        source: sourceAddress,
        destination: destAddress,
        amount: transactionAmount,
        amountLong: amountLong,
        tick: targetTick
      });
      
      const signedTxResult = await getSignedTx(tx);
      const signedTx = signedTxResult.tx;
      
      // Verify the signed transaction
      console.log('Transaction after signing - length:', signedTx.length);

      // Broadcast the transaction
      toast.loading('Broadcasting transaction...', { id: 'broadcasting' });
      const broadcastResult = await broadcastTx(signedTx);

      toast.dismiss('signing');
      toast.dismiss('broadcasting');

      if (broadcastResult) {
        const txId = broadcastResult.transactionId || 'N/A';
        const peers = broadcastResult.peersBroadcasted || 0;
        
        // Save transaction to backend
        try {
          await saveTransaction({
            walletid: wallet.publicKey,
            hash: txId,
            paid: transactionAmount,
            col1: '',
            col2: '',
          });
          console.log('Transaction saved to backend');
        } catch (error) {
          console.error('Error saving transaction to backend:', error);
          // Don't fail the whole transaction if backend save fails
        }
        
        toast.success(
          `Transaction broadcasted to ${peers} peers!\n` +
          `TX ID: ${txId.substring(0, 12)}...\n` +
          `Note: Transaction will only execute if you have sufficient balance.`,
          { duration: 5000 }
        );
        
        console.log('Transaction broadcast result:', {
          transactionId: txId,
          peersBroadcasted: peers,
          note: 'This is MAINNET. Transaction will fail if balance is insufficient.'
        });
        
        // Show transaction explorer link
        console.log(`View transaction: https://explorer.qubic.org/tx/${txId}`);
      } else {
        toast.error('Transaction failed to broadcast');
      }
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      toast.error(`Transaction failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!connected || !wallet) {
    return null; // Don't show button if wallet is not connected
  }

  return (
    <button
      onClick={handleTransaction}
      disabled={isProcessing}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === 'outline'
          ? 'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-400 hover:to-pink-500 shadow-lg hover:shadow-purple-500/50'
      } ${size === 'sm' ? 'text-sm py-1.5 px-3' : size === 'lg' ? 'text-base py-2.5 px-5' : 'text-sm'}`}
    >
      <Send size={16} className="flex-shrink-0" />
      <span className="hidden sm:inline">
        {isProcessing ? 'Processing...' : 'Send 10000 Qubic'}
      </span>
      <span className="sm:hidden">
        {isProcessing ? '...' : 'Send'}
      </span>
    </button>
  );
};

export default TransactionButton;

