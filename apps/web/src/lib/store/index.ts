"use client";

/**
 * Global state management — pure React (no Zustand installed).
 *
 * Three slices, each with its own Context + useReducer:
 *   • UIStore     — in-memory (command palette, sidebar, selected event, theme, fullscreen)
 *   • UserStore   — persisted to localStorage ("aegis:user")
 *   • MapStore    — in-memory (live mode, heatmap, layer, map viewport)
 *
 * Hooks exported:
 *   useUIStore()   → UIState & UIActions
 *   useUserStore() → UserState & UserActions
 *   useMapStore()  → MapState & MapActions
 *
 * Mount <StoreProvider> once at the root (already done in layout.tsx via StoreProvider).
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type Dispatch,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// UI SLICE
// ---------------------------------------------------------------------------

export type Theme = "dark" | "tactical" | "light";

export interface UIState {
  commandPaletteOpen: boolean;
  sidebarCollapsed: boolean;
  selectedEventId: string | null;
  mapFullscreen: boolean;
  theme: Theme;
}

type UIAction =
  | { type: "OPEN_COMMAND_PALETTE" }
  | { type: "CLOSE_COMMAND_PALETTE" }
  | { type: "SELECT_EVENT"; id: string | null }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_MAP_FULLSCREEN" }
  | { type: "SET_THEME"; theme: Theme };

const uiInitial: UIState = {
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  selectedEventId: null,
  mapFullscreen: false,
  theme: "dark",
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "OPEN_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: true };
    case "CLOSE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: false };
    case "SELECT_EVENT":
      return { ...state, selectedEventId: action.id };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "TOGGLE_MAP_FULLSCREEN":
      return { ...state, mapFullscreen: !state.mapFullscreen };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    default:
      return state;
  }
}

interface UIStore extends UIState {
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  selectEvent: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleMapFullscreen: () => void;
  setTheme: (theme: Theme) => void;
}

const UIContext = createContext<UIStore | null>(null);

// ---------------------------------------------------------------------------
// USER SLICE
// ---------------------------------------------------------------------------

export type Plan = "free" | "analyst" | "team" | "enterprise";

export interface UserState {
  userId: string | null;
  displayName: string | null;
  plan: Plan;
  locale: string;
  watchlist: string[];
  pinnedEventIds: string[];
  recentSearches: string[];
}

type UserAction =
  | { type: "SET_USER"; payload: Partial<UserState> }
  | { type: "ADD_WATCHLIST"; id: string }
  | { type: "REMOVE_WATCHLIST"; id: string }
  | { type: "PIN_EVENT"; id: string }
  | { type: "UNPIN_EVENT"; id: string }
  | { type: "ADD_RECENT_SEARCH"; q: string }
  | { type: "HYDRATE"; payload: Partial<UserState> };

const userInitial: UserState = {
  userId: null,
  displayName: null,
  plan: "free",
  locale: "en",
  watchlist: [],
  pinnedEventIds: [],
  recentSearches: [],
};

const MAX_RECENT_SEARCHES = 20;

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "HYDRATE":
    case "SET_USER":
      return { ...state, ...action.payload };
    case "ADD_WATCHLIST":
      if (state.watchlist.includes(action.id)) return state;
      return { ...state, watchlist: [...state.watchlist, action.id] };
    case "REMOVE_WATCHLIST":
      return { ...state, watchlist: state.watchlist.filter((id) => id !== action.id) };
    case "PIN_EVENT":
      if (state.pinnedEventIds.includes(action.id)) return state;
      return { ...state, pinnedEventIds: [...state.pinnedEventIds, action.id] };
    case "UNPIN_EVENT":
      return { ...state, pinnedEventIds: state.pinnedEventIds.filter((id) => id !== action.id) };
    case "ADD_RECENT_SEARCH": {
      const without = state.recentSearches.filter((q) => q !== action.q);
      return {
        ...state,
        recentSearches: [action.q, ...without].slice(0, MAX_RECENT_SEARCHES),
      };
    }
    default:
      return state;
  }
}

interface UserStore extends UserState {
  setUser: (user: Partial<UserState>) => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  pinEvent: (id: string) => void;
  unpinEvent: (id: string) => void;
  addRecentSearch: (q: string) => void;
}

const UserContext = createContext<UserStore | null>(null);

const USER_LS_KEY = "aegis:user";

function loadUserFromStorage(): Partial<UserState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USER_LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<UserState>;
  } catch {
    return {};
  }
}

function persistUser(state: UserState) {
  try {
    localStorage.setItem(USER_LS_KEY, JSON.stringify(state));
  } catch {
    // storage quota or private mode — ignore
  }
}

// ---------------------------------------------------------------------------
// MAP SLICE
// ---------------------------------------------------------------------------

export interface MapState {
  liveMode: boolean;
  heatmapVisible: boolean;
  selectedLayer: string | null;
  mapCenter: [number, number];
  mapZoom: number;
}

type MapAction =
  | { type: "TOGGLE_LIVE_MODE" }
  | { type: "TOGGLE_HEATMAP" }
  | { type: "SET_LAYER"; id: string | null }
  | { type: "SET_MAP_VIEW"; center: [number, number]; zoom: number };

const mapInitial: MapState = {
  liveMode: false,
  heatmapVisible: false,
  selectedLayer: null,
  mapCenter: [31.1656, 48.3794], // Ukraine centroid
  mapZoom: 6,
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case "TOGGLE_LIVE_MODE":
      return { ...state, liveMode: !state.liveMode };
    case "TOGGLE_HEATMAP":
      return { ...state, heatmapVisible: !state.heatmapVisible };
    case "SET_LAYER":
      return { ...state, selectedLayer: action.id };
    case "SET_MAP_VIEW":
      return { ...state, mapCenter: action.center, mapZoom: action.zoom };
    default:
      return state;
  }
}

interface MapStore extends MapState {
  toggleLiveMode: () => void;
  toggleHeatmap: () => void;
  setSelectedLayer: (id: string | null) => void;
  setMapView: (center: [number, number], zoom: number) => void;
}

const MapContext = createContext<MapStore | null>(null);

// ---------------------------------------------------------------------------
// COMBINED PROVIDER
// ---------------------------------------------------------------------------

/** Internal provider that wires all three slices together. */
export function StoreContextProvider({ children }: { children: ReactNode }) {
  // UI
  const [uiState, uiDispatch] = useReducer(uiReducer, uiInitial);
  const uiStore: UIStore = {
    ...uiState,
    openCommandPalette: useCallback(() => uiDispatch({ type: "OPEN_COMMAND_PALETTE" }), []),
    closeCommandPalette: useCallback(() => uiDispatch({ type: "CLOSE_COMMAND_PALETTE" }), []),
    selectEvent: useCallback((id) => uiDispatch({ type: "SELECT_EVENT", id }), []),
    toggleSidebar: useCallback(() => uiDispatch({ type: "TOGGLE_SIDEBAR" }), []),
    toggleMapFullscreen: useCallback(() => uiDispatch({ type: "TOGGLE_MAP_FULLSCREEN" }), []),
    setTheme: useCallback((theme) => uiDispatch({ type: "SET_THEME", theme }), []),
  };

  // User — hydrate from localStorage once on mount
  const [userState, userDispatch] = useReducer(userReducer, userInitial);
  useEffect(() => {
    const saved = loadUserFromStorage();
    if (Object.keys(saved).length > 0) {
      userDispatch({ type: "HYDRATE", payload: saved });
    }
  }, []);
  // Persist on every change
  useEffect(() => {
    persistUser(userState);
  }, [userState]);

  const userStore: UserStore = {
    ...userState,
    setUser: useCallback(
      (payload) => userDispatch({ type: "SET_USER", payload }),
      [],
    ),
    addToWatchlist: useCallback(
      (id) => userDispatch({ type: "ADD_WATCHLIST", id }),
      [],
    ),
    removeFromWatchlist: useCallback(
      (id) => userDispatch({ type: "REMOVE_WATCHLIST", id }),
      [],
    ),
    pinEvent: useCallback(
      (id) => userDispatch({ type: "PIN_EVENT", id }),
      [],
    ),
    unpinEvent: useCallback(
      (id) => userDispatch({ type: "UNPIN_EVENT", id }),
      [],
    ),
    addRecentSearch: useCallback(
      (q) => userDispatch({ type: "ADD_RECENT_SEARCH", q }),
      [],
    ),
  };

  // Map
  const [mapState, mapDispatch] = useReducer(mapReducer, mapInitial);
  const mapStore: MapStore = {
    ...mapState,
    toggleLiveMode: useCallback(() => mapDispatch({ type: "TOGGLE_LIVE_MODE" }), []),
    toggleHeatmap: useCallback(() => mapDispatch({ type: "TOGGLE_HEATMAP" }), []),
    setSelectedLayer: useCallback(
      (id) => mapDispatch({ type: "SET_LAYER", id }),
      [],
    ),
    setMapView: useCallback(
      (center, zoom) => mapDispatch({ type: "SET_MAP_VIEW", center, zoom }),
      [],
    ),
  };

  return (
    <UIContext.Provider value={uiStore}>
      <UserContext.Provider value={userStore}>
        <MapContext.Provider value={mapStore}>{children}</MapContext.Provider>
      </UserContext.Provider>
    </UIContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// PUBLIC HOOKS
// ---------------------------------------------------------------------------

export function useUIStore(): UIStore {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIStore must be used inside <StoreProvider>");
  return ctx;
}

export function useUserStore(): UserStore {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserStore must be used inside <StoreProvider>");
  return ctx;
}

export function useMapStore(): MapStore {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMapStore must be used inside <StoreProvider>");
  return ctx;
}
