import { apiResquestHeaders } from "../interfaces/content.interfaces";

const BASE_URL = process.env.EXPO_PUBLIC_TMDB_BASE_URL;

const ENDPOINTS = {
  search: "search/multi",
  languages: "configuration/languages",
  movies: {
    nowPlaying: "movie/now_playing",
    popular: "movie/popular",
    topRated: "movie/top_rated",
    upComing: "movie/upcoming",
    details: "movie",
    genreList: "genre/movie/list",
  },
  tv: {
    airingToday: "tv/airing_today",
    onTheAir: "tv/on_the_air",
    popular: "tv/popular",
    topRated: "tv/top_rated",
    details: "tv",
    genreList: "genre/tv/list",
  },
} as const;

const options: apiResquestHeaders = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_KEY}`,
  },
};

// Movie API Calls Here

const fetchContent = async (
  endpoint: string,
  page: number = 1,
  query?: string,
  appendToResponse?: string,
  language = "en-US",
) => {
  let url = `${BASE_URL}/${endpoint}?language=${language}&page=${page}`;
  if (appendToResponse) {
    url += `&append_to_response=${encodeURIComponent(appendToResponse)}`;
  }
  if (query) {
    url += `&query=${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(
        `HTTP REQUEST ERROR ${response.statusText} - ${response.status}`,
      );
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// All movies fetching functions

export const nowPlayingMovies = (page?: number, language?: string) =>
  fetchContent(
    ENDPOINTS.movies.nowPlaying,
    page,
    undefined,
    undefined,
    language,
  );

export const popularMovies = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.movies.popular, page, undefined, undefined, language);

export const topRatedMovies = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.movies.topRated, page, undefined, undefined, language);

export const upcomingMovies = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.movies.upComing, page, undefined, undefined, language);

// All Tv Shows fetching functions

export const airingTodayShows = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.tv.airingToday, page, undefined, undefined, language);

export const onTheAirShows = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.tv.onTheAir, page, undefined, undefined, language);

export const popularTvShows = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.tv.popular, page, undefined, undefined, language);

export const topRatedTv = (page?: number, language?: string) =>
  fetchContent(ENDPOINTS.tv.topRated, page, undefined, undefined, language);

// Searching feature

export const searchContent = (query: string, page?: number) =>
  fetchContent(ENDPOINTS.search, page, query);
export const fetchMovieDetails = (movieId: number, page?: number) =>
  fetchContent(
    `${ENDPOINTS.movies.details}/${movieId}`,
    page,
    undefined,
    "videos,credits",
  );
export const fetchSimilarMovies = (movieId: number, page?: number) =>
  fetchContent(
    `${ENDPOINTS.movies.details}/${movieId}/similar`,
    page,
    undefined,
    "videos,credits",
  );
export const fetchSimilarTvs = (movieId: number, page?: number) =>
  fetchContent(
    `${ENDPOINTS.tv.details}/${movieId}/similar`,
    page,
    undefined,
    "videos,credits",
  );
export const fetchAvailableLanguages = (page?: number) =>
  fetchContent(ENDPOINTS.languages, page);

export type MediaType = "movie" | "tv" | "series";

interface PlaybackOptions {
  season?: number;
  episode?: number;
}


export const resolvePlaybackSource = async (
  mediaType: MediaType,
  contentId: string,
  options: PlaybackOptions = {}
): Promise<string | null> => {
  const resolverUrl = process.env.EXPO_PUBLIC_PLAYBACK_API_URL || "https://vidsrc.mov";
  const cleanBase = resolverUrl.replace(/\/\$/, "");

  // Build the correct URL path pattern required by VidCore
  let path = "";
  if (mediaType === "movie") {
    path = `/embed/movie/${contentId}`;
  } else {
    // If it's a series and parameters aren't provided yet, default to season 1 episode 1
    const season = options.season ?? 1;
    const episode = options.episode ?? 1;
    path = `/embed/tv/${contentId}/${season}/${episode}`;
  }

  const finalUrl = `${cleanBase}${path}`;

  try {
    // Use a lightweight HEAD request to verify source availability
    const response = await fetch(finalUrl, { method: "HEAD" });
    
    if (response.status === 404 || response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`VidCore endpoint lookup failed with status: ${response.status}`);
    }

    return finalUrl;
  } catch (error) {
    console.error("Failed to resolve VidCore playback source:", error);
    return null;
  }
};

export const fetchTvDetails = (tvId: number, page?: number) =>
  fetchContent(
    `${ENDPOINTS.tv.details}/${tvId}`,
    page,
    undefined,
    "videos,credits",
  );
