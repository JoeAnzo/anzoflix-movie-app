import { Stack } from "expo-router";
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'

export default function RootLayout() {

  const queryClient = new QueryClient()
  return(
    <QueryClientProvider client={queryClient}>
    <Stack>
      <Stack.Screen name="index" options={{headerShown:false}}/>
      <Stack.Screen name="(tabs)" options={{headerShown:false}}/>
      <Stack.Screen name="details/[id]" options={{headerShown:false}}/>
    </Stack>
    </QueryClientProvider>
  )
}
