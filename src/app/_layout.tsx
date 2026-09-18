import { Stack } from "expo-router";
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {AppContextProvider} from "./context/AppContext";

export default function RootLayout() {

  const queryClient = new QueryClient()
  return(
    <QueryClientProvider client={queryClient}>
    <AppContextProvider>
    <Stack>
      <Stack.Screen name="index" options={{headerShown:false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
      <Stack.Screen name="details/[id]" options={{headerShown:false}}/>
      <Stack.Screen name="(auth)/login" options={{headerShown:false}}/>
    </Stack>
    </AppContextProvider>
    </QueryClientProvider>
  )
}
