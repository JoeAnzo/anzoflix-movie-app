// Structure for Movie release dates
interface MovieReleaseDateItem {
    certification: string;
    iso_639_1?: string;
    note?: string;
    release_date?: string;
    type?: number;
}

interface MovieCountryResult {
    iso_3166_1: string;
    release_dates: MovieReleaseDateItem[];
}


interface TVRatingResult {
    descriptors?: string[];
    iso_3166_1: string;
    rating: string;
}



interface TmdbRatingPayload {
    release_dates?: {
        results: MovieCountryResult[];
    };
    content_ratings?: {
        results: TVRatingResult[];
    };
}

type MediaType = 'movie' | 'tv';





export function formatReleaseDate(dateString:string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatRating(voteAverage:number, asPercentage = true) {
    if (!voteAverage || voteAverage === 0) return 'N/A';
    
    if (asPercentage) {
        return `${Math.round(voteAverage * 10)}%`;
    }
    return voteAverage.toFixed(1);
}

export function formatVoteCount(votes:number, compact = false) {
    if (!votes) return '0';
    
    if (compact) {
        return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(votes);
    }
    return new Intl.NumberFormat('en-US').format(votes);
}


export function getAgeRating(tmdbData: TmdbRatingPayload, type: MediaType = 'movie'): string {
    if (type === 'movie') {
        const results = tmdbData.release_dates?.results || [];
        
        
        const usRelease = results.find((item: MovieCountryResult) => item.iso_3166_1 === 'US');
        
        
        const ratingItem = usRelease?.release_dates?.find((r: MovieReleaseDateItem) => r.certification !== '');
        
        return ratingItem?.certification || 'NR'; // Fallback to 'NR' (Not Rated)
    } 
    
    if (type === 'tv') {
        const results = tmdbData.content_ratings?.results || [];
        
        // Find the US television rating entry
        const usRating = results.find((item: TVRatingResult) => item.iso_3166_1 === 'US');
        
        return usRating?.rating || 'NR';
    }

    return 'NR';
}
