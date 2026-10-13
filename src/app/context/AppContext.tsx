import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    getCurrentUser,
    logout as logoutFromAppwrite,
} from "../services/appwrite";

// This context owns the app's auth state.
// The important part is that it bootstraps the current session when the app first loads.
type AppUser = Awaited<ReturnType<typeof getCurrentUser>>;

interface AppProviderProps {
  children: ReactNode;
}

interface AppContextType {
  selectedLanguage: string;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  user: AppUser | null;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  authError: string | null;
  bootstrapAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: AppProviderProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // This is the auth bootstrap step.
  // It runs on app start and asks Appwrite whether a valid saved session exists.
  const bootstrapAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(Boolean(currentUser));
      setAuthError(null);
    } catch (error) {
      console.error("Auth bootstrap failed:", error);
      setAuthError(
        "We couldn’t verify your session. Check your connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // This keeps the state consistent with the Appwrite session.
  const logout = useCallback(async () => {
    try {
      await logoutFromAppwrite();
    } catch (error) {
      console.error("Logout call failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Check the persisted Appwrite session once when the provider mounts.
  useEffect(() => {
    let isMounted = true;

    const runBootstrap = async () => {
      setIsLoading(true);
      setAuthError(null);

      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        setIsAuthenticated(Boolean(currentUser));
        setAuthError(null);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);

        if (isMounted) {
          setAuthError(
            "We couldn’t verify your session. Check your connection and try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void runBootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        authError,
        bootstrapAuth,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp must be used within an AppContextProvider");
  }

  return context;
};
