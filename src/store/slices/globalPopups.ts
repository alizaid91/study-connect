import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type showPdfType = {
  pdfId: string | null;
  title: string;
  totalPages: number;
  downloaded?: boolean;
};

interface GlobalPopupsState {
  isPremiumComingSoonOpen: boolean;
  isProfileCompleteOpen: boolean;
  showPdf: showPdfType | null;
  pdfDownloadIsForProOpen?: boolean;
}

const initialState: GlobalPopupsState = {
  isPremiumComingSoonOpen: false,
  isProfileCompleteOpen: false,
  showPdf: null,
  pdfDownloadIsForProOpen: false,
};

const globalPopups = createSlice({
  name: "globalPopups",
  initialState,
  reducers: {
    openPremiumComingSoon: (state) => {
      state.isPremiumComingSoonOpen = true;
    },
    closePremiumComingSoon: (state) => {
      state.isPremiumComingSoonOpen = false;
    },
    openProfileComplete: (state) => {
      state.isProfileCompleteOpen = true;
    },
    closeProfileComplete: (state) => {
      state.isProfileCompleteOpen = false;
    },
    openPdfDownloadIsForPro: (state) => {
      state.pdfDownloadIsForProOpen = true;
    },
    closePdfDownloadIsForPro: (state) => {
      state.pdfDownloadIsForProOpen = false;
    },
    setShowPdf: (state, { payload }: PayloadAction<showPdfType | null>) => {
      state.showPdf = payload;
    },
    clearShowPdf: (state) => {
      state.showPdf = null;
    },
  },
});

export const {
  openPremiumComingSoon,
  closePremiumComingSoon,
  openProfileComplete,
  closeProfileComplete,
  openPdfDownloadIsForPro,
  closePdfDownloadIsForPro,
  setShowPdf,
  clearShowPdf,
} = globalPopups.actions;

export default globalPopups.reducer;
