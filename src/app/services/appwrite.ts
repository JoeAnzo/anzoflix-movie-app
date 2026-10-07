import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  OAuthProvider,
  Query,
} from "react-native-appwrite";

// IMPORTANT:
// This file is the Appwrite boundary for the entire app.
// The rest of the application should not import the Appwrite SDK directly.
// This keeps all auth logic centralized and easier to fix when the SDK changes.
const client = new Client()
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string)
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID as string;
const USER_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_USER_TABLE_ID as string;
const SAVED_TABLE_ID = process.env
  .EXPO_PUBLIC_APPWRITE_SAVED_TABLE_ID as string;
const WATCHLIST_TABLE_ID = process.env
  .EXPO_PUBLIC_APPWRITE_WATCHLIST_TABLE_ID as string;

export const account = new Account(client);
const databases = new Databases(client);
const avatars = new Avatars(client);

// This function is the startup check for a saved session.
// The app calls this during bootstrap to decide whether a user is still authenticated.
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch (error) {
    // Appwrite throws when there is no valid session.
    // We treat that as a normal logged-out state instead of crashing the app.
    console.warn("No Appwrite session found during auth bootstrap.", error);
    return null;
  }
};

// This function checks the active Appwrite session on the current device.
export const getCurrentSession = async () => {
  try {
    return await account.getSession({ sessionId: "current" });
  } catch (error) {
    console.warn("Current Appwrite session is invalid or missing.", error);
    return null;
  }
};

// Email/password sign-up.
// We create the user first, then immediately create a login session.
// This ensures the user is authenticated right after signup.
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    const fallbackUsername = email.split("@")[0];
    const generatedAvatarUrl = await avatars
      .getInitials({ name: fallbackUsername, width: 200, height: 200 })
      .toString();

    const user = await account.create({
      userId: ID.unique(),
      email,
      password,
      name: fallbackUsername,
    });

    await account.createEmailPasswordSession({
      email,
      password,
    });

    console.log("DEBUG APPWRITE KEYS:", {
      DATABASE_ID,
      USER_TABLE_ID,
      userId: user?.$id,
    });

    const userProfile = await databases.createDocument(
      DATABASE_ID,
      USER_TABLE_ID,
      user.$id,
      {
        user_name: fallbackUsername,
        email,
        avatar_url: generatedAvatarUrl,
      },
    );

    return { success: true, user, saved_user: userProfile };
  } catch (error) {
    console.error("Appwrite sign-up failed:", error);
    throw error;
  }
};

// Keep the Appwrite user profile table in sync with the authenticated account.
// Google OAuth currently exposes name and email through Account.get(); when no
// provider picture is available, use the same generated avatar as email signup.

export const syncCurrentUserProfile = async () => {
  let currentUser;

  try {
    currentUser = await account.get();
  } catch (error) {
    console.warn(
      "No active Appwrite session found during profile sync attempt.",
      error,
    );
    return null;
  }

  // FIXED: Added [0] index to split array
  const username =
    currentUser.name?.trim() || currentUser.email?.split("@")[0] || "Movie fan";
  const preferences = currentUser.prefs as Record<string, unknown>;
  let googleAvatarUrl: string | undefined;

  try {
    const session = await account.getSession({ sessionId: "current" });
    if (session.provider === "google" && (session as any).providerAccessToken) {
      const response = await fetch("https://googleapis.com", {
        headers: {
          Authorization: `Bearer ${(session as any).providerAccessToken}`,
        },
      });
      if (response.ok) {
        const googleProfile = (await response.json()) as { picture?: string };
        googleAvatarUrl = googleProfile.picture;
      }
    }
  } catch (error) {
    console.warn("Supplemental profile photo lookup skipped.", error);
  }

  const providerAvatarUrl = [
    googleAvatarUrl,
    preferences?.avatar_url,
    preferences?.avatarUrl,
  ].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  const avatarUrl =
    providerAvatarUrl ??
    avatars.getInitials({ name: username, width: 200, height: 200 }).toString();

  // SCHEMA FIXED: Matching "user_name" attribute constraint perfectly
  const profileData = {
    user_name: username,
    email: currentUser.email,
    avatar_url: avatarUrl,
  };

  let existingProfile = null;
  try {
    existingProfile = await databases.getDocument(
      DATABASE_ID,
      USER_TABLE_ID,
      currentUser.$id,
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 404) throw error;

    const profilesByEmail = await databases.listDocuments(
      DATABASE_ID,
      USER_TABLE_ID,
      [Query.equal("email", currentUser.email)],
    );
    // FIXED: Correctly extracted the first object element out of the documents array
    existingProfile = profilesByEmail.documents[0] ?? null;
  }

  if (existingProfile) {
    return databases.updateDocument(
      DATABASE_ID,
      USER_TABLE_ID,
      existingProfile.$id,
      profileData,
    );
  }

  return databases.createDocument(DATABASE_ID, USER_TABLE_ID, currentUser.$id, {
    ...profileData,
  });
};

export const getUserProfile = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    const profile = await databases.getDocument(
      DATABASE_ID,
      USER_TABLE_ID,
      currentUser.$id,
    );

    return profile;
  } catch (error) {
    console.warn("Appwrite user profile lookup failed:", error);

    try {
      const currentUser = await getCurrentUser();

      if (!currentUser?.email) {
        return null;
      }

      const existingProfiles = await databases.listDocuments(
        DATABASE_ID,
        USER_TABLE_ID,
        [Query.equal("email", [currentUser.email])],
      );

      return existingProfiles.documents[0] ?? null;
    } catch (fallbackError) {
      console.warn(
        "Appwrite user profile fallback lookup failed:",
        fallbackError,
      );
      return null;
    }
  }
};

export type MediaRecordType = "movie" | "tv";

const normalizeMediaType = (mediaType: string): MediaRecordType => {
  return mediaType === "tv" ? "tv" : "movie";
};

const findMovieRecord = async (
  collectionId: string,
  movie_id: string,
  mediaType: string,
  userId: string,
) => {
  const normalizedMediaType = normalizeMediaType(mediaType);

  try {
    const existingDocuments = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        Query.equal("user_id", userId),
        Query.equal("tmdb_id", movie_id),
        Query.equal("media_type", normalizedMediaType),
      ],
    );

    return existingDocuments.documents[0] ?? null;
  } catch (error) {
    console.error("Appwrite findMovieRecord query failed:", error);
    throw error;
  }
};

const upsertMovieRecord = async (
  collectionId: string,
  movie_id: string,
  movie_poster_url: string,
  mediaType: string,
  userId: string,
  title?: string,
) => {
  const normalizedMediaType = normalizeMediaType(mediaType);

  const existingDocument = await findMovieRecord(
    collectionId,
    movie_id,
    normalizedMediaType,
    userId,
  );

  if (existingDocument) {
    return existingDocument;
  }

  return databases.createDocument(DATABASE_ID, collectionId, ID.unique(), {
    user_id: userId,
    tmdb_id: movie_id,
    movie_poster: movie_poster_url,
    movie_title: title ?? "Untitled",
    media_type: normalizedMediaType,
  });
};

export const isMovieSaved = async (movie_id: string, mediaType: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const existingDocument = await findMovieRecord(
      SAVED_TABLE_ID,
      movie_id,
      mediaType,
      currentUser.$id,
    );

    return Boolean(existingDocument);
  } catch (error) {
    console.error("Appwrite saved-state check failed:", error);
    return false;
  }
};

export const isMovieOnWatchlist = async (
  movie_id: string,
  mediaType: string,
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const existingDocument = await findMovieRecord(
      WATCHLIST_TABLE_ID,
      movie_id,
      mediaType,
      currentUser.$id,
    );

    return Boolean(existingDocument);
  } catch (error) {
    console.error("Appwrite watchlist-state check failed:", error);
    return false;
  }
};

export const saveMovieToDatabase = async (
  movie_id: string,
  movie_poster_url: string,
  mediaType: "movie" | "tv",
  title?: string,
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error("You must be logged in to save a movie.");
    }

    return await upsertMovieRecord(
      SAVED_TABLE_ID,
      movie_id,
      movie_poster_url,
      mediaType,
      currentUser.$id,
      title,
    );
  } catch (error) {
    console.error("Appwrite save movie failed:", error);
    throw error;
  }
};

export const addMovieToWatchlist = async (
  movie_id: string,
  movie_poster_url: string,
  mediaType: string,
  title?: string,
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error(
        "You must be logged in to add a movie to your watchlist.",
      );
    }

    return await upsertMovieRecord(
      WATCHLIST_TABLE_ID,
      movie_id,
      movie_poster_url,
      mediaType,
      currentUser.$id,
      title,
    );
  } catch (error) {
    console.error("Appwrite watchlist update failed:", error);
    throw error;
  }
};

export const removeSavedMovie = async (movie_id: string, mediaType: string) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    const existingDocument = await findMovieRecord(
      SAVED_TABLE_ID,
      movie_id,
      mediaType,
      currentUser.$id,
    );

    if (!existingDocument) {
      return null;
    }

    await databases.deleteDocument(
      DATABASE_ID,
      SAVED_TABLE_ID,
      existingDocument.$id,
    );
    return existingDocument;
  } catch (error) {
    console.error("Appwrite remove-saved-item failed:", error);
    throw error;
  }
};

export const removeMovieFromWatchlist = async (
  movie_id: string,
  mediaType: string,
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return null;
    }

    const existingDocument = await findMovieRecord(
      WATCHLIST_TABLE_ID,
      movie_id,
      mediaType,
      currentUser.$id,
    );

    if (!existingDocument) {
      return null;
    }

    await databases.deleteDocument(
      DATABASE_ID,
      WATCHLIST_TABLE_ID,
      existingDocument.$id,
    );
    return existingDocument;
  } catch (error) {
    console.error("Appwrite remove-watchlist-item failed:", error);
    throw error;
  }
};

export const toggleSaveMovie = async (
  movie_id: string,
  movie_poster_url: string,
  mediaType: "movie" | "tv",
  title?: string,
) => {
  const saved = await isMovieSaved(movie_id, mediaType);

  if (saved) {
    await removeSavedMovie(movie_id, mediaType);
    return false;
  }

  await saveMovieToDatabase(movie_id, movie_poster_url, mediaType, title);
  return true;
};

export const toggleMovieWatchlist = async (
  movie_id: string,
  movie_poster_url: string,
  mediaType: string,
  title?: string,
) => {
  const isOnWatchlist = await isMovieOnWatchlist(movie_id, mediaType);

  if (isOnWatchlist) {
    await removeMovieFromWatchlist(movie_id, mediaType);
    return false;
  }

  await addMovieToWatchlist(movie_id, movie_poster_url, mediaType, title);
  return true;
};

export const getSavedMedia = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      SAVED_TABLE_ID,
      [
        Query.equal("user_id", [currentUser.$id]),
        Query.orderDesc("$createdAt"),
      ],
    );

    return response.documents;
  } catch (error) {
    console.error("Appwrite saved-media fetch failed:", error);
    return [];
  }
};

export const getWatchlistMediaByType = async (mediaType: MediaRecordType) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_TABLE_ID,
      [
        Query.equal("user_id", [currentUser.$id]),
        Query.equal("media_type", [mediaType]),
        Query.orderDesc("$createdAt"),
      ],
    );

    return response.documents;
  } catch (error) {
    console.error("Appwrite watchlist fetch failed:", error);
    return [];
  }
};

export const getWatchlistMedia = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      WATCHLIST_TABLE_ID,
      [
        Query.equal("user_id", [currentUser.$id]),
        Query.orderDesc("$createdAt"),
      ],
    );

    return response.documents;
  } catch (error) {
    console.error("Appwrite watchlist-media fetch failed:", error);
    return [];
  }
};

// Email/password sign-in.
// This creates the session and returns the Appwrite session object.
export const signInWithEmailAndPassword = async (
  email: string,
  password: string,
) => {
  try {
    return await account.createEmailPasswordSession({
      email,
      password,
    });
  } catch (error) {
    console.error("Appwrite sign-in failed:", error);
    throw error;
  }
};

// This is the correct Appwrite v1.6+ logout pattern.
// The old string overload (deleteSession("current")) is deprecated.
// The newer object parameter is required for the current SDK version.
export const logout = async () => {
  try {
    return await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    console.error("Appwrite logout failed:", error);
    throw error;
  }
};

// OAuth sign-in with Google.
// This flow is still valid, but we must avoid deprecated method signatures.
export const authenticateWithGoogle = async () => {
  try {
    const redirectUri = Linking.createURL("auth/callback");

    const tokenUrl = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: redirectUri,
      failure: redirectUri,
    });

    if (!tokenUrl) {
      throw new Error(
        "Failed to generate Appwrite OAuth2 token gateway routing URL.",
      );
    }

    const browserResult = await WebBrowser.openAuthSessionAsync(
      tokenUrl.toString(),
      redirectUri,
    );

    if (browserResult.type !== "success" || !browserResult.url) {
      throw new Error(
        "Google authentication workflow cancelled or unexpectedly closed.",
      );
    }

    const parsedUrl = Linking.parse(browserResult.url);

    const rawUserId = parsedUrl.queryParams?.userId;
    const rawSecret = parsedUrl.queryParams?.secret;

    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const secret = Array.isArray(rawSecret) ? rawSecret[0] : rawSecret;

    if (!userId || !secret) {
      throw new Error(
        "Missing authentication credentials within deep link callback response.",
      );
    }

    // This is the modern object-style Appwrite session creation signature.
    const session = await account.createSession({
      userId,
      secret,
    });

    await syncCurrentUserProfile();

    return session;
  } catch (error) {
    console.error("Google Auth Action Core Exception:", error);
    throw error;
  }
};
