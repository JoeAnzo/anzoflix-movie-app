export interface apiResquestHeaders {
    method:string;
    headers:{
        accept:string;
        Authorization:string;
    }
}

export interface Content {
    name?:string;
    title?:string;
    backdrop_path:string;
    over_view:string;
    popularity:number;
    original_title:string;
    original_language:string;
    poster_path:string;
    release_date?:string;
    vote_average:number;
    vote_count:number;
}

export interface MovieItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: string;
}

export interface TMDBResponse {
  page: number;
  results: Content; 
  total_pages: number;
  total_results: number;
}

export interface popularMoviesResponse {
    success:boolean;
    movies:Content[];
}
