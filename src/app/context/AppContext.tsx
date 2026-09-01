import {createContext,useState,useContext, ReactNode} from 'react'


const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children:ReactNode;
}

interface AppContextType {
    selectedLanguage:string;
    setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
    isAuthenticated:boolean;
    setIsAuthenticated:React.Dispatch<React.SetStateAction<boolean>>;
}


export const AppContextProvider = ({children}:AppProviderProps) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en-US')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
  return (
    <AppContext.Provider value={{selectedLanguage,setSelectedLanguage,isAuthenticated,setIsAuthenticated}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  
  return context;

}



