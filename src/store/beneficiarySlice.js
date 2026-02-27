import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fidar } from "@/lib/fidar";
import { handleFidarError } from "@/lib/handleFidarError";

const CACHE_TTL = 60_000; // 60s

export const fetchBeneficiaries = createAsyncThunk(
  "beneficiaries/fetchBeneficiaries",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().beneficiaries;

      if (state.lastUpdated && Date.now() - state.lastUpdated < CACHE_TTL) {
        return { fromCache: true, list: state.list };
      }

      const list = await fidar.getBeneficiaries();

      return {
        fromCache: false,
        list,
      };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addBeneficiaryThunk = createAsyncThunk(
  "beneficiaries/addBeneficiary",
  async (payload, { rejectWithValue }) => {
    try {
      const profile = await fidar.getMyProfile();
      const userId = profile["user-id"];

      const newBen = await fidar.addBeneficiaryWithSigning({
        userId,
        name: payload.name,
        iban: payload.iban,
        nickname: payload.nickname,
        accountNumber: payload.accountNumber,
      });

      return newBen;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const beneficiarySlice = createSlice({
  name: "beneficiaries",
  initialState: {
    list: [],
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    clearBeneficiaryCache(state) {
      state.list = [];
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.loading = false;

        // If read from cache
        if (action.payload.fromCache) {
          state.list = action.payload.list;
          return;
        }

        // Fresh data
        state.list = action.payload.list;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error;
      })

      // When beneficiary is added
      .addCase(addBeneficiaryThunk.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.lastUpdated = Date.now();
      });
  },
});

export const { clearBeneficiaryCache } = beneficiarySlice.actions;
export default beneficiarySlice.reducer;
