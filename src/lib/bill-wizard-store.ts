import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BillItem = { id: string; name: string; quantity: number; price: number };
export type BillParticipant = { id: string; name: string; memberId?: string };

type BillWizardState = {
  merchant: string;
  date: string;
  items: BillItem[];
  taxAndCharges: number;
  groupId: string | null;
  participants: BillParticipant[];
  assignments: Record<string, string[]>;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setBillInfo: (info: { merchant: string; date: string; items: BillItem[]; taxAndCharges: number; groupId: string | null }) => void;
  setParticipants: (participants: BillParticipant[]) => void;
  setGroupId: (groupId: string | null) => void;
  toggleAssignment: (itemId: string, participantId: string) => void;
  assignAllToItem: (itemId: string) => void;
  reset: () => void;
};

const initialState = {
  merchant: "",
  date: new Date().toISOString().slice(0, 10),
  items: [] as BillItem[],
  taxAndCharges: 0,
  groupId: null as string | null,
  participants: [] as BillParticipant[],
  assignments: {} as Record<string, string[]>,
};

export const useBillWizard = create<BillWizardState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setBillInfo: (info) => set({ ...info, assignments: {} }),
      setParticipants: (participants) => set({ participants }),
      setGroupId: (groupId) => set({ groupId }),
      toggleAssignment: (itemId, participantId) =>
        set((state) => {
          const current = state.assignments[itemId] ?? [];
          const next = current.includes(participantId)
            ? current.filter((id) => id !== participantId)
            : [...current, participantId];
          return { assignments: { ...state.assignments, [itemId]: next } };
        }),
      assignAllToItem: (itemId) =>
        set((state) => ({
          assignments: { ...state.assignments, [itemId]: state.participants.map((p) => p.id) },
        })),
      reset: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "cosfy-bill-wizard",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        merchant: state.merchant,
        date: state.date,
        items: state.items,
        taxAndCharges: state.taxAndCharges,
        groupId: state.groupId,
        participants: state.participants,
        assignments: state.assignments,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
