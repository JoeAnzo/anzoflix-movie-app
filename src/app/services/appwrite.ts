import { Client, Account, ID } from "react-native-appwrite";




const client = new Client()
    .setProject(`${process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID}`) 
    .setEndpoint(`${process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT}`)


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
    const result = await account.createEmailPasswordSession({
    email: email,
    password: password
    });
    console.log(result);
}


