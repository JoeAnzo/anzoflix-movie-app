export const formatRuntime = (minutes?: number | null): string => {
	if (minutes == null || !Number.isFinite(minutes) || minutes < 0) {
		return 'N/A';
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	if (hours === 0) {
		return `${remainingMinutes} min`;
	}

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}min`;
};
