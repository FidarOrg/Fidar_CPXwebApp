// src/store/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fidar } from "@/lib/fidar";

/**
 * Configuration
 * - TTL: how long we treat the cache as valid (ms)
 *   Adjust as needed. Default 60 seconds.
 */
const CACHE_TTL = 60_000; // 60 seconds

/**
 * Thunk: fetchDashboardData
 * - If cache exists and is fresh, returns fromCache:true with cached data
 * - Otherwise performs API calls, normalizes transactions, and returns fresh data
 */
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().dashboard;

      // If we have cached data and it's still valid, return it
      if (state.lastUpdated && Date.now() - state.lastUpdated < CACHE_TTL) {
        return {
          fromCache: true,
          wallet: state.wallet,
          transactions: state.transactions,
        };
      }

      // Otherwise call the APIs
      const [walletData, txRaw] = await Promise.all([
        fidar.getWallets(),
        fidar.getTransactions(),
      ]);

      // Normalize wallet
      const normalizedWallet = walletData?.amount != null ? walletData : null;

      // Normalize transactions to same shape your UI expects
      const txItems = Array.isArray(txRaw) ? txRaw : [];

      const normalized = txItems.map((t) => {
        const isCredit = t.category === "DEPOSIT";
        const amountNumber = Number(t?.amount?.amount ?? 0);

        return {
          id: t.id,
          type: isCredit ? "credit" : "debit",
          amount: `USD ${amountNumber.toFixed(2)}`,
          description:
            t.category === "DEPOSIT"
              ? "Deposit"
              : t.category === "TRANSFER"
              ? "Transfer"
              : t.category || "Transaction",
          time: t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
          status: t.active ? "completed" : "pending",
          _raw: t,
        };
      });

      return {
        fromCache: false,
        wallet: normalizedWallet,
        transactions: normalized,
      };
    } catch (err) {
      // Let the component handle centralized errors (we propagate the error)
      return rejectWithValue(err);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    wallet: null,
    transactions: [],
    lastUpdated: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDashboardCache(state) {
      state.wallet = null;
      state.transactions = [];
      state.lastUpdated = null;
      state.error = null;
    },
    // optional: allow manual set of lastUpdated if you want external invalidation
    setDashboardLastUpdated(state, action) {
      state.lastUpdated = action.payload;
    },
    applyDemoTransfer(state, action) {
  const { amount, toAccount } = action.payload;

  if (!state.wallet || !state.wallet.amount) return;

  const numericAmount = Number(amount);

  // 1️⃣ Decrease wallet balance
  state.wallet.amount = Math.max(
    0,
    Number(state.wallet.amount) - numericAmount
  );

  // 2️⃣ Prepend a fake transaction
  state.transactions.unshift({
    id: `demo-${Date.now()}`,
    type: "debit",
    amount: `USD ${numericAmount.toFixed(2)}`,
    description: `Transfer to ${toAccount}`,
    time: new Date().toLocaleString(),
    status: "completed",
    _demo: true,
  });

  // 3️⃣ Update timestamp so cache looks fresh
  state.lastUpdated = Date.now();
}

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;

        // If payload came from cache -> do nothing (keep lastUpdated as-is)
        if (action.payload?.fromCache) {
          // ensure state has values (it should)
          state.wallet = action.payload.wallet ?? state.wallet;
          state.transactions = action.payload.transactions ?? state.transactions;
          // lastUpdated remains unchanged
          return;
        }

        // Fresh data -> update store and reset lastUpdated
        state.wallet = action.payload.wallet ?? null;
        state.transactions = action.payload.transactions ?? [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error;
      });
  },
});

export const { clearDashboardCache, setDashboardLastUpdated, applyDemoTransfer } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
