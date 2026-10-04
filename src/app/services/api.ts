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

export type MediaType = "movie" | "tv";

/**
 * Ask the app's licensed playback backend to resolve an available source.
 * The backend should return { available: true, playbackUrl: "https://..." }
 * or { available: false }. Provider selection and rights checks belong there.
 */
export const resolvePlaybackSource = async (
  mediaType: MediaType,
  contentId: string,
): Promise<string | null> => {
  const resolverUrl = process.env.EXPO_PUBLIC_PLAYBACK_API_URL;
  if (!resolverUrl) {
    throw new Error("Playback service is not configured yet.");
  }

  const url = new URL(`${resolverUrl.replace(/\/$/, "")}/resolve`);
  url.searchParams.set("mediaType", mediaType);
  url.searchParams.set("id", contentId);

  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
  });
  if (response.status === 404 || response.status === 204) return null;
  if (!response.ok) {
    throw new Error(`Playback lookup failed (${response.status}).`);
  }

  const result: { available?: boolean; playbackUrl?: string } =
    await response.json();
  if (!result.available || !result.playbackUrl) return null;

  const playbackUrl = new URL(result.playbackUrl);
  if (playbackUrl.protocol !== "https:") {
    throw new Error("Playback source must use HTTPS.");
  }

  return playbackUrl.toString();
};

export const fetchTvDetails = (tvId: number, page?: number) =>
  fetchContent(
    `${ENDPOINTS.tv.details}/${tvId}`,
    page,
    undefined,
    "videos,credits",
  );
