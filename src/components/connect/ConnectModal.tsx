import { useContext, useEffect, useRef, useState } from "react";
import { MetaMaskContext } from "./MetamaskContext";
import { useQubicConnect } from "./QubicConnectContext";
import { useWalletConnect } from "./WalletConnectContext";
import { Account } from "./types";
import { generateQRCode } from "../../utils/wallet.utils";
import { MetaMaskLogo } from "./MetaMaskLogo";
import { MetaMaskFlaskLogo } from "./MetaMaskFlaskLogo";
import walletConnectLogo from "../../assets/wallet-connect.svg";
import qubicConnectLogo from "../../assets/qubic-connect.svg";

const ConnectModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [state, _dispatch] = useContext(MetaMaskContext);
  const [selectedMode, setSelectedMode] = useState("none");
  const { connect, disconnect, connected, mmSnapConnect } = useQubicConnect();
  const [qrCode, setQrCode] = useState<string>("");
  const [connectionURI, setConnectionURI] = useState<string>("");
  const { connect: walletConnectConnect, isConnected, requestAccounts } = useWalletConnect();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const deepLinkFallbackTimeoutRef = useRef<number | null>(null);
  const didBackgroundAfterDeepLinkRef = useRef<boolean>(false);

  const generateURI = async () => {
    const { uri, approve } = await walletConnectConnect();
    setConnectionURI(uri);
    const result = await generateQRCode(uri);
    setQrCode(result);
    await approve();
  };

  useEffect(() => {
    if (!open) return;
    try {
      const resumeMode = localStorage.getItem("connectModalResumeMode");
      if (resumeMode === "walletconnect") {
        setSelectedMode("walletconnect");
      }
    } catch {
      // ignore
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        didBackgroundAfterDeepLinkRef.current = true;
        if (deepLinkFallbackTimeoutRef.current) {
          window.clearTimeout(deepLinkFallbackTimeoutRef.current);
          deepLinkFallbackTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (deepLinkFallbackTimeoutRef.current) {
        window.clearTimeout(deepLinkFallbackTimeoutRef.current);
        deepLinkFallbackTimeoutRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (isConnected) {
      const fetchAccounts = async () => {
        const accounts = await requestAccounts();
        setAccounts(
          accounts.map((account) => ({
            publicId: account.address,
            alias: account.name,
          })),
        );
        setSelectedMode("account-select");
      };
      fetchAccounts();
    }
  }, [isConnected]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => {
        setSelectedMode("none");
        onClose();
      }}
    >
      <div
        className="relative bg-[#050914] rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-8 border border-[#7CF8FF33] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <img
              src={qubicConnectLogo}
              alt="qubic connect"
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
            aria-label="Close connect modal"
          >
            ✕
          </button>
        </div>

        {selectedMode === "none" && (
          <div className="space-y-4">
            {/* MetaMask button */}
            <button
              onClick={() => setSelectedMode("metamask")}
              className="w-full h-12 px-6 rounded-2xl bg-[#7CF8FF] hover:bg-[#9CFCFF] text-slate-900 font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <MetaMaskLogo />
              <span>MetaMask</span>
            </button>

            {/* WalletConnect button */}
            <button
              onClick={() => {
                generateURI();
                setSelectedMode("walletconnect");
              }}
              className="w-full h-12 px-6 rounded-2xl bg-[#7CF8FF] hover:bg-[#9CFCFF] text-slate-900 font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <img
                src={walletConnectLogo}
                alt="WalletConnect logo"
                className="h-6 w-6"
              />
              <span>Wallet Connect</span>
            </button>

            {connected && (
              <button
                onClick={() => disconnect()}
                className="w-full py-2 px-4 mt-2 rounded-xl border border-red-500/60 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        )}

        {selectedMode === "metamask" && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              Connect your MetaMask wallet. You need to have MetaMask installed and unlocked.
            </p>
            <div className="space-y-2">
              {!state.snapsDetected && !state.installedSnap ? (
                <button
                  onClick={() => (window.location.href = "https://metamask.io/")}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
                >
                  <MetaMaskLogo />
                  Install MetaMask
                </button>
              ) : !state.installedSnap ? (
                <button
                  onClick={() => {
                    mmSnapConnect();
                    setSelectedMode("none");
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-3"
                >
                  {state.isFlask ? <MetaMaskFlaskLogo /> : <MetaMaskLogo />}
                  Connect
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <MetaMaskLogo />
                  Connected
                </button>
              )}
              <button
                onClick={() => setSelectedMode("none")}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedMode === "walletconnect" && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              Connect your Qubic Wallet. You need to have Qubic Wallet installed and unlocked.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4">
              {qrCode ? (
                <img src={qrCode} alt="Wallet Connect QR Code" className="w-64 h-64 mx-auto" />
              ) : (
                <div className="w-64 h-64 mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <button
                onClick={() => {
                  if (!connectionURI) return;

                  didBackgroundAfterDeepLinkRef.current = false;

                  // Persist intent so if the browser reloads when coming back from the wallet app,
                  // we can restore the modal in WalletConnect mode.
                  try {
                    localStorage.setItem("connectModalOpen", "1");
                    localStorage.setItem("connectModalResumeMode", "walletconnect");
                    localStorage.setItem("walletConnectPending", "1");
                  } catch {
                    // ignore
                  }

                  // Try deep link. On mobile this should switch to the wallet app.
                  const deepLink = `qubic-wallet://pairwc/${connectionURI}`;
                  window.location.href = deepLink;

                  // Fallback: if the wallet app is not installed, the page will remain visible.
                  // In that case, after a short delay, we could show a helpful message.
                  // However, on iOS the page can remain "visible" even when the deep link succeeds,
                  // so we intentionally avoid showing a false-positive error.
                  if (deepLinkFallbackTimeoutRef.current) {
                    window.clearTimeout(deepLinkFallbackTimeoutRef.current);
                  }
                  deepLinkFallbackTimeoutRef.current = window.setTimeout(() => {
                    // No-op: see comment above.
                    deepLinkFallbackTimeoutRef.current = null;
                  }, 1200);
                }}
                disabled={!connectionURI}
                className="w-full h-12 px-6 rounded-2xl bg-[#7CF8FF] hover:bg-[#9CFCFF] disabled:bg-gray-400 disabled:text-gray-700 disabled:opacity-70 text-slate-900 font-semibold transition-colors flex items-center justify-center"
              >
                Open in Qubic Wallet
              </button>
              <button
                onClick={() => setSelectedMode("none")}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedMode === "account-select" && (
          <div className="space-y-4">
            <p className="text-gray-300 mb-4">Select an account:</p>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="w-full py-3 px-4 bg-gray-800 border border-gray-700 text-white rounded-lg"
            >
              {accounts.map((account, idx) => (
                <option key={idx} value={idx}>
                  {account.alias || `Account ${idx + 1}`} - {account.publicId.slice(0, 8)}...
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  disconnect();
                  setSelectedMode("none");
                }}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  connect({
                    connectType: "walletconnect",
                    publicKey: accounts[selectedAccount]?.publicId,
                    alias: accounts[selectedAccount]?.alias,
                  });
                  setSelectedMode("none");
                  onClose();
                }}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Select Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectModal;

