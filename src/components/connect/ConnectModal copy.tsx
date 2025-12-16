import { useContext, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { MetaMaskContext } from "./MetamaskContext";
import { useQubicConnect } from "./QubicConnectContext";
import { useWalletConnect } from "./WalletConnectContext";
import { Account } from "./types";
import { generateQRCode } from "../../utils/wallet.utils";
import { MetaMaskLogo } from "./MetaMaskLogo";
import { MetaMaskFlaskLogo } from "./MetaMaskFlaskLogo";

type VaultSeed = {
  alias: string;
  publicId: string;
  encryptedSeed: string;
  balance?: number;
  balanceTick?: number;
};

type VaultHandle = {
  getSeeds: () => VaultSeed[];
  revealSeed: (publicId: string) => Promise<string>;
};

const ConnectModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [state] = useContext(MetaMaskContext);
  const [selectedMode, setSelectedMode] = useState("none");
  const { connect, disconnect, connected, mmSnapConnect, privateKeyConnect, vaultFileConnect } = useQubicConnect();
  const [qrCode, setQrCode] = useState<string>("");
  const [connectionURI, setConnectionURI] = useState<string>("");
  const { connect: walletConnectConnect, isConnected, requestAccounts } = useWalletConnect();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [walletConnectLoading, setWalletConnectLoading] = useState(false);
  const [seedInput, setSeedInput] = useState("");
  const [seedError, setSeedError] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultFile, setVaultFile] = useState<File | null>(null);
  const [vaultError, setVaultError] = useState("");
  const [vaultUnlocking, setVaultUnlocking] = useState(false);
  const [vaultConnecting, setVaultConnecting] = useState(false);
  const [vaultSeeds, setVaultSeeds] = useState<VaultSeed[]>([]);
  const [selectedVaultSeed, setSelectedVaultSeed] = useState("");
  const [vaultHandle, setVaultHandle] = useState<VaultHandle | null>(null);
  const [seedVisible, setSeedVisible] = useState(false);

  const generateURI = async () => {
    const { uri, approve } = await walletConnectConnect();
    setConnectionURI(uri);
    const result = await generateQRCode(uri);
    setQrCode(result);
    await approve();
  };

  const resetSeedFlow = () => {
    setSeedInput("");
    setSeedError("");
    setSeedLoading(false);
    setSeedVisible(false);
  };

  const resetVaultFlow = () => {
    setVaultPassword("");
    setVaultFile(null);
    setVaultError("");
    setVaultUnlocking(false);
    setVaultConnecting(false);
    setVaultSeeds([]);
    setSelectedVaultSeed("");
    setVaultHandle(null);
  };

  const handleWalletConnectClick = async () => {
    setSelectedMode("walletconnect");
    setQrCode("");
    setConnectionURI("");
    setWalletConnectLoading(true);
    try {
      await generateURI();
    } catch (error) {
      console.error("Failed to generate WalletConnect URI:", error);
    } finally {
      setWalletConnectLoading(false);
    }
  };

  const handleSeedConnect = async () => {
    const trimmedSeed = seedInput.trim();
    if (trimmedSeed.length < 55) {
      setSeedError("Seed phrase must be at least 55 characters.");
      return;
    }

    try {
      setSeedLoading(true);
      setSeedError("");
      await privateKeyConnect(trimmedSeed);
      handleClose();
    } catch (error) {
      console.error("Seed connect error:", error);
      setSeedError("Unable to connect with that seed. Please double-check and try again.");
    } finally {
      setSeedLoading(false);
    }
  };

  const handleVaultFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setVaultFile(file);
    setVaultError("");
    setVaultSeeds([]);
    setSelectedVaultSeed("");
    setVaultHandle(null);
  };

  const handleVaultUnlock = async () => {
    if (!vaultFile || !vaultPassword) {
      setVaultError("Select a vault file and enter the password.");
      return;
    }

    try {
      setVaultUnlocking(true);
      setVaultError("");
      const unlockedVault = await vaultFileConnect(vaultFile, vaultPassword);
      const seeds = unlockedVault?.getSeeds?.() ?? [];
      if (!seeds.length) {
        setVaultError("No identities were found inside this vault.");
        return;
      }
      setVaultHandle(unlockedVault as VaultHandle);
      setVaultSeeds(seeds);
      setSelectedVaultSeed(seeds[0].publicId);
    } catch (error) {
      console.error("Vault unlock error:", error);
      setVaultError(error instanceof Error ? error.message : "Unable to unlock the vault file.");
    } finally {
      setVaultUnlocking(false);
    }
  };

  const handleVaultSeedConnect = async () => {
    if (!vaultHandle || !selectedVaultSeed) {
      setVaultError("Select a seed to continue.");
      return;
    }

    try {
      setVaultConnecting(true);
      setVaultError("");
      const decodedSeed = await vaultHandle.revealSeed(selectedVaultSeed);
      await privateKeyConnect(decodedSeed);
      handleClose();
    } catch (error) {
      console.error("Vault seed connect error:", error);
      setVaultError("Unable to decrypt that seed. Please try another identity.");
    } finally {
      setVaultConnecting(false);
    }
  };

  const goBackToOptions = (mode?: string) => {
    if (mode === "seed") resetSeedFlow();
    if (mode === "vault") resetVaultFlow();
    if (mode === "walletconnect") {
      setQrCode("");
      setConnectionURI("");
    }
    setSelectedMode("none");
  };

  const handleClose = () => {
    resetSeedFlow();
    resetVaultFlow();
    setSelectedMode("none");
    setQrCode("");
    setConnectionURI("");
    setWalletConnectLoading(false);
    onClose();
  };

  const renderModeContent = () => {
    if (selectedMode === "metamask") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-300/80">MetaMask Snap</p>
            <h3 className="text-2xl font-semibold text-white">Connect to Qubic</h3>
            <p className="mt-2 text-sm text-slate-300">
              Enable the Qubic Snap inside MetaMask Flask or MetaMask to unlock full wallet features without
              leaving the browser.
            </p>
          </div>
          <div className="space-y-3">
            {!state.snapsDetected && !state.installedSnap ? (
              <button
                onClick={() => (window.location.href = "https://metamask.io/")}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-orange-500/30"
              >
                Install MetaMask
              </button>
            ) : !state.installedSnap ? (
              <button
                onClick={() => {
                  mmSnapConnect();
                  setSelectedMode("none");
                  onClose();
                }}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-orange-500/30"
              >
                Enable Qubic Snap
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                MetaMask Snap is connected and ready to use.
              </div>
            )}
            <button
              onClick={() => goBackToOptions("metamask")}
              className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Back to options
            </button>
          </div>
        </div>
      );
    }

    if (selectedMode === "walletconnect") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-300/80">WalletConnect</p>
            <h3 className="text-2xl font-semibold text-white">Scan & approve</h3>
            <p className="mt-2 text-sm text-slate-300">Use the Qubic mobile wallet to scan the QR code below.</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            {qrCode ? (
              <img src={qrCode} alt="Wallet Connect QR Code" className="h-52 w-52 rounded-xl border border-white/10" />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center rounded-xl border border-dashed border-white/20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
              </div>
            )}
            <button
              onClick={() => {
                const deepLink = `qubic-wallet://pairwc/${connectionURI}`;
                const frontendUrl = `${window.location.origin}${window.location.pathname}`;
                window.open(deepLink, "_blank");
                setTimeout(() => {
                  window.location.href = frontendUrl;
                }, 1000);
              }}
              disabled={!connectionURI}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Open in Qubic Wallet
            </button>
            <button
              onClick={() => goBackToOptions("walletconnect")}
              className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Back to options
            </button>
          </div>
        </div>
      );
    }

    if (selectedMode === "account-select") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-300/80">WalletConnect</p>
            <h3 className="text-2xl font-semibold text-white">Pick an account</h3>
            <p className="mt-2 text-sm text-slate-300">Choose which account you want to link to this session.</p>
          </div>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-white/40"
          >
            {accounts.map((account, idx) => (
              <option key={idx} value={idx} className="bg-slate-900">
                {account.alias || `Account ${idx + 1}`} - {account.publicId.slice(0, 8)}...
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                disconnect();
                setSelectedMode("none");
              }}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
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
              className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-blue-500/30"
            >
              Select account
            </button>
          </div>
        </div>
      );
    }

    if (selectedMode === "seed") {
      return (
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-amber-200/80">Private seed</p>
            <h3 className="text-2xl font-semibold text-white">Direct connect</h3>
            <p className="mt-2 text-sm text-slate-300">
              Paste a 55-character Qubic seed (A-Z only). It never leaves your browser.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="seed-input" className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Seed phrase
            </label>
            <div className="relative">
              <input
                id="seed-input"
                type={seedVisible ? "text" : "password"}
                value={seedInput}
                onChange={(event) => {
                  setSeedInput(event.target.value.toLowerCase());
                  setSeedError("");
                }}
                placeholder="•••••••••••••••••••••••••••••••••••••••••••••••••"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-5 pr-12 text-sm text-white outline-none transition focus:border-white/40"
              />
              <button
                type="button"
                onClick={() => setSeedVisible((prev) => !prev)}
                aria-label={seedVisible ? "Hide seed" : "Show seed"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {seedVisible ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1.5 12s3.5-7.5 10.5-7.5S22.5 12 22.5 12 19 19.5 12 19.5 1.5 12 1.5 12z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1.5 12s3.5-7.5 10.5-7.5c1.94 0 3.62.53 5.04 1.31M22.5 12s-3.5 7.5-10.5 7.5c-1.94 0-3.62-.53-5.04-1.31"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.5 4.5l15 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>{seedInput.trim().length} / 55</span>
              <span>Only lowercase letters a-z are allowed.</span>
            </div>
            {seedError && <p className="text-sm text-rose-300">{seedError}</p>}
          </div>

          <button
            onClick={handleSeedConnect}
            disabled={seedLoading || seedInput.trim().length < 55}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {seedLoading ? "Connecting…" : "Connect with seed"}
          </button>

          <button
            onClick={() => goBackToOptions("seed")}
            className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
          >
            Back to options
          </button>
        </div>
      );
    }

    if (selectedMode === "vault") {
      const hasSeeds = vaultSeeds.length > 0;

      return (
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-200/80">Vault importer</p>
            <h3 className="text-2xl font-semibold text-white">Bring your encrypted vault</h3>
            <p className="mt-2 text-sm text-slate-300">
              Drop a `.qubic-vault` export plus the password. We decrypt locally and let you pick the identity to use.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="vault-file-input" className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Vault file
            </label>
            <input
              id="vault-file-input"
              type="file"
              accept=".qubic-vault"
              className="sr-only"
              onChange={handleVaultFileChange}
            />
            <label
              htmlFor="vault-file-input"
              className="flex cursor-pointer flex-col items-start gap-2 rounded-2xl border border-dashed border-white/20 bg-slate-900/40 px-4 py-5 text-sm text-white/70 transition hover:border-cyan-400/50"
            >
              {vaultFile ? (
                <>
                  <span className="text-base font-semibold text-white">{vaultFile.name}</span>
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    {(vaultFile.size / 1024).toFixed(1)} KB
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold text-white">Drag & drop or browse</span>
                  <span className="text-xs uppercase tracking-wide text-white/50">Accepted: .qubic-vault</span>
                </>
              )}
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="vault-password" className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Vault password
            </label>
            <input
              id="vault-password"
              type="password"
              value={vaultPassword}
              onChange={(event) => {
                setVaultPassword(event.target.value);
                setVaultError("");
              }}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none transition focus:border-white/40"
            />
          </div>

          {vaultError && <p className="text-sm text-rose-300">{vaultError}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleVaultUnlock}
              disabled={vaultUnlocking || !vaultFile || !vaultPassword}
              className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {vaultUnlocking ? "Unlocking…" : "Unlock vault"}
            </button>
            <button
              onClick={() => goBackToOptions("vault")}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Back to options
            </button>
          </div>

          {hasSeeds && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
              <div>
                <p className="text-sm font-semibold text-white">Select an identity</p>
                <p className="text-xs text-white/60">We found {vaultSeeds.length} seed(s) inside the vault.</p>
              </div>
              <select
                value={selectedVaultSeed}
                onChange={(event) => setSelectedVaultSeed(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-white outline-none focus:border-white/40"
              >
                {vaultSeeds.map((seed) => (
                  <option key={seed.publicId} value={seed.publicId} className="bg-slate-900">
                    {(seed.alias || "Unnamed seed") + " · " + seed.publicId.slice(0, 8) + "..."}
                  </option>
                ))}
              </select>
              <button
                onClick={handleVaultSeedConnect}
                disabled={vaultConnecting || !selectedVaultSeed}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {vaultConnecting ? "Decrypting…" : "Connect selected seed"}
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="rounded-full bg-white/5 p-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="16" fill="#6366F1" />
            <path d="M12 16H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 12V20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">Choose a wallet</h3>
        <p className="mt-2 text-sm text-slate-300">
          Pick MetaMask Snap, WalletConnect, a direct seed, or import a vault to start a secure session.
        </p>
      </div>
    );
  };

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
  }, [isConnected, requestAccounts]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/70 px-4 py-6 backdrop-blur"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Wallet connection</p>
              <h2 className="text-2xl font-bold text-white">Secure session</h2>
            </div>
            <button onClick={handleClose} className="text-white/60 transition hover:text-white">
              ✕
            </button>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <p className="text-sm text-white/70">
                Choose your preferred wallet to authenticate. All methods are secured with cryptographic signatures
                and never expose your private keys.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMode("metamask")}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none ${
                    selectedMode === "metamask"
                      ? "border-orange-400/80 bg-orange-500/10"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <div>
                    <p className="text-base font-semibold text-white">MetaMask Snap</p>
                    <span className="text-sm text-white/70">Browser extension · recommended</span>
                  </div>
                  <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                    {state.isFlask ? <MetaMaskFlaskLogo /> : <MetaMaskLogo />}
                  </div>
                </button>
                <button
                  onClick={handleWalletConnectClick}
                  disabled={walletConnectLoading}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none ${
                    selectedMode === "walletconnect"
                      ? "border-cyan-400/80 bg-cyan-500/10"
                      : "border-white/10 hover:border-white/40"
                  } ${walletConnectLoading ? "cursor-wait opacity-70" : ""}`}
                >
                  <div>
                    <p className="text-base font-semibold text-white">WalletConnect</p>
                    <span className="text-sm text-white/70">
                      {walletConnectLoading ? "Generating pairing code…" : "Mobile wallet · QR handshake"}
                    </span>
                  </div>
                  <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <rect width="32" height="32" rx="16" fill="#3B99FC" />
                      <path
                        d="M9.5 16C9.5 12.41 12.41 9.5 16 9.5C19.59 9.5 22.5 12.41 22.5 16C22.5 19.59 19.59 22.5 16 22.5C12.41 22.5 9.5 19.59 9.5 16Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedMode("seed");
                    resetVaultFlow();
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none ${
                    selectedMode === "seed"
                      ? "border-amber-400/80 bg-amber-500/10"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <div>
                    <p className="text-base font-semibold text-white">Seed phrase</p>
                    <span className="text-sm text-white/70">Paste a raw Qubic seed securely</span>
                  </div>
                  <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                    <span role="img" aria-hidden="true">
                      🔐
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedMode("vault");
                    resetSeedFlow();
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition focus-visible:outline-none ${
                    selectedMode === "vault"
                      ? "border-emerald-400/80 bg-emerald-500/10"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <div>
                    <p className="text-base font-semibold text-white">Vault file</p>
                    <span className="text-sm text-white/70">Import .qubic-vault bundles</span>
                  </div>
                  <div className="ml-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                    <span role="img" aria-hidden="true">
                      📁
                    </span>
                  </div>
                </button>
              </div>

              {connected ? (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  Wallet connected. Need to switch accounts?
                  <button
                    onClick={() => disconnect()}
                    className="ml-3 rounded-lg border border-emerald-300/60 px-3 py-1 text-xs font-semibold text-emerald-50 transition hover:border-emerald-100"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Not connected</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
              {renderModeContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;

