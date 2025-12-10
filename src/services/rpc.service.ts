import { RPC_URL } from "../constants";

export interface TickInfo {
  tick: number;
  epoch: number;
}

export const fetchTickInfo = async (): Promise<TickInfo> => {
  try {
    const tickResult = await fetch(`${RPC_URL}/v1/tick-info`);
    if (!tickResult.ok) {
      console.warn("getTickInfo: HTTP error", tickResult.status);
      return { tick: 0, epoch: 0 };
    }
    const tick = await tickResult.json();
    if (!tick || !tick.tickInfo) {
      console.warn("getTickInfo: Invalid tick response structure");
      return { tick: 0, epoch: 0 };
    }
    
    // Ensure tick is a valid number
    const tickValue = Number(tick.tickInfo.tick);
    const epochValue = Number(tick.tickInfo.epoch);
    
    if (isNaN(tickValue) || isNaN(epochValue)) {
      console.warn("getTickInfo: Tick or epoch is not a valid number", tick.tickInfo);
      return { tick: 0, epoch: 0 };
    }
    
    return { 
      tick: Math.floor(tickValue), 
      epoch: Math.floor(epochValue) 
    };
  } catch (error) {
    console.error("Error fetching tick info:", error);
    return { tick: 0, epoch: 0 };
  }
};

export interface Balance {
  balance?: {
    numberOfUnits?: number;
    type?: number;
    issuerIdentity?: string;
    assetName?: string;
  };
}

export const fetchBalance = async (publicId: string): Promise<Balance> => {
  try {

    const QXMR_ISSUER = "QXMRTKAIIGLUREPIQPCMHCKWSIPDTUYFCFNYXQLTECSUJVYEMMDELBMDOEYB";

    const res = await fetch(`${RPC_URL}/v1/assets/${publicId}/owned`);
    if (!res.ok) {
      console.warn("fetchBalance: HTTP error", res.status);
      return {};
    }
    const payload = await res.json();
    const qxmr = payload.ownedAssets.find(
      (asset: any) => asset?.data?.issuedAsset?.name === 'QXMR' && asset?.data?.issuedAsset?.issuerIdentity === QXMR_ISSUER && asset?.data?.type === 2
    );
    if (!qxmr || !qxmr.data?.numberOfUnits) {
      console.warn("fetchBalance: Invalid balance response structure");
      return {};
    }
    return {
      balance: {
        numberOfUnits: Number(qxmr.data?.numberOfUnits),
        type: Number(qxmr.data?.type),
        issuerIdentity: String(qxmr.data?.issuedAsset?.issuerIdentity),
        assetName: String(qxmr.data?.issuedAsset?.name),
      }
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return {};
  }
};

export const broadcastTx = async (tx: Uint8Array) => {
  const url = `${RPC_URL}/v1/broadcast-transaction`;
  const txEncoded = btoa(String.fromCharCode(...Array.from(tx)));
  const body = { encodedTransaction: txEncoded };
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const broadcastResult = await result.json();
  return broadcastResult;
};

