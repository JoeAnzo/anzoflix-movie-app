import {useQuery} from '@tanstack/react-query';

export const useContent = (queryKey:string[],fetchFunction:() => Promise<any>) => {
    return useQuery({
        queryKey,
        queryFn: async () => {
            const result = await fetchFunction();
            console.log("RAW API RESULT:", result)
            if (!result.success) throw new Error(result.message)
            const finalData = result.data.results !== undefined ? result.data.results : result.data;
            console.log("FINAL RETURNED DATA:", finalData); // 🔍 If this is undefined, you found the culprit.
    
    return finalData
        },
        staleTime: 1000 * 60 * 5
    }
    )
}
