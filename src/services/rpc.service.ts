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

    const normalizedPublicId = (publicId || "").toUpperCase().trim();
    const normalizedIssuer = QXMR_ISSUER.toUpperCase().trim();

    const res = await fetch(`${RPC_URL}/v1/assets/${normalizedPublicId}/owned`);
    if (!res.ok) {
      console.warn("fetchBalance: HTTP error", res.status);
      return {};
    }
    const payload = await res.json();

    const ownedAssets = Array.isArray(payload?.ownedAssets)
      ? payload.ownedAssets
      : Array.isArray(payload?.data?.ownedAssets)
        ? payload.data.ownedAssets
        : [];

    const qxmr = ownedAssets.find((asset: any) => {
      const issued = asset?.data?.issuedAsset;
      const name = String(issued?.name ?? "").toUpperCase().trim();
      const issuerIdentity = String(issued?.issuerIdentity ?? "").toUpperCase().trim();
      return name === "QXMR" && issuerIdentity === normalizedIssuer;
    });

    const qxmrByNameOnly = qxmr
      ? null
      : ownedAssets.filter((asset: any) => {
          const issued = asset?.data?.issuedAsset;
          const name = String(issued?.name ?? "").toUpperCase().trim();
          return name === "QXMR";
        });

    const selectedAsset = qxmr || (qxmrByNameOnly && qxmrByNameOnly.length === 1 ? qxmrByNameOnly[0] : null);

    if (!qxmr && selectedAsset && qxmrByNameOnly) {
      const issued = selectedAsset?.data?.issuedAsset;
      console.warn("fetchBalance: Using QXMR match by name only (issuer mismatch)", {
        expectedIssuer: normalizedIssuer,
        foundIssuer: issued?.issuerIdentity,
      });
    }

    const unitsRaw = selectedAsset?.data?.numberOfUnits;
    const unitsNum = unitsRaw === undefined || unitsRaw === null ? NaN : Number(unitsRaw);

    if (!selectedAsset || Number.isNaN(unitsNum)) {
      const assetSummary = ownedAssets.slice(0, 20).map((a: any) => {
        const issued = a?.data?.issuedAsset;
        return {
          name: issued?.name,
          issuerIdentity: issued?.issuerIdentity,
          type: a?.data?.type,
          numberOfUnits: a?.data?.numberOfUnits,
        };
      });
      console.warn("fetchBalance: QXMR asset not found for publicId", normalizedPublicId, {
        ownedAssetsCount: ownedAssets.length,
        ownedAssetsSample: assetSummary,
      });
      return {};
    }
    return {
      balance: {
        numberOfUnits: unitsNum,
        type: Number(selectedAsset.data?.type),
        issuerIdentity: String(selectedAsset.data?.issuedAsset?.issuerIdentity),
        assetName: String(selectedAsset.data?.issuedAsset?.name),
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

