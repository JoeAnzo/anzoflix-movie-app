import { Client, Account, ID,OAuthProvider } from "react-native-appwrite";
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';




const client = new Client()
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string) 
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string)


const account = new Account(client)


export const signUpWithEmailAndPassword = async (email:string, password: string) => {
    try {
        const user = await account.create({
            userId:ID.unique(),
            email: email,
            password: password
        });
        console.log(user)
        return user
    } catch (e){
        console.error(e)
        throw e
    }
}


export const signInWithEmailAndPassword = async (email:string, password: string) => {
    try {
        const result = await account.createEmailPasswordSession({
        email: email,
        password: password
        });
        console.log(result);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const authenticateWithGoogle = async () => {
    try {
        const redirectUri = Linking.createURL("auth/callback");

        // FIX 1: Pass an object payload with named parameters
        const tokenUrl = await account.createOAuth2Token({
            provider: OAuthProvider.Google, 
            success: redirectUri,
            failure: redirectUri
        });

        if (!tokenUrl) {
            throw new Error("Failed to generate Appwrite OAuth2 token gateway routing URL.");
        }

        const browserResult = await WebBrowser.openAuthSessionAsync(
            tokenUrl.toString(),
            redirectUri
        );

        if (browserResult.type !== "success" || !browserResult.url) {
            throw new Error("Google authentication workflow cancelled or unexpectedly closed.");
        }

        const parsedUrl = Linking.parse(browserResult.url);
        
        const rawUserId = parsedUrl.queryParams?.userId;
        const rawSecret = parsedUrl.queryParams?.secret;

        const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
        const secret = Array.isArray(rawSecret) ? rawSecret[0] : rawSecret;

        if (!userId || !secret) {
            throw new Error("Missing authentication credentials within deep link callback response.");
        }

        // FIX 2: Pass an object configuration to establish the user session
        const session = await account.createSession({
            userId: userId, 
            secret: secret
        });
        
        console.log("Google session created successfully:", session);
        return session;

    } catch (error) {
        console.error("Google Auth Action Core Exception:", error);
        throw error;
    }
};