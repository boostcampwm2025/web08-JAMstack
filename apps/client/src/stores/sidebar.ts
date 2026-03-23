import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type SidebarTab } from '@/widgets/room-sidebar/lib/types';
import { useThemeStore } from '@/shared/lib/hooks/useDarkMode';

interface SidebarState {
  activeSidebarTab: SidebarTab | null;
  isPinned: boolean;
  setActiveSidebarTab: (tab: SidebarTab | null) => void;
  toggleSidebarTab: (tab: SidebarTab) => void;
  togglePin: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      activeSidebarTab: null,
      isPinned: false,
      setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
      toggleSidebarTab: (tab) => {
        // 이스터 에그 카운터 증가
        useThemeStore.getState().incrementSidebarToggle();

        set((state) => ({
          activeSidebarTab:
            state.activeSidebarTab === tab && !state.isPinned ? null : tab,
        }));
      },
      togglePin: () =>
        set((state) => ({
          isPinned: !state.isPinned,
          // 고정 해제 시 현재 탭을 activeSidebarTab로 잡아두어 즉시 닫히지 않도록
          activeSidebarTab:
            state.isPinned && !state.activeSidebarTab
              ? 'FILES'
              : state.activeSidebarTab,
        })),
    }),
    {
      name: 'sidebar-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isPinned: state.isPinned }),
    },
  ),
);
