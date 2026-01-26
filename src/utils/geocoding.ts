
// OpenStreetMap Nominatim API Wrapper
// No Key required, but respects User-Agent policy

interface GeocodingResult {
    lat: number;
    lon: number;
    display_name: string;
}

export const searchAddress = async (query: string): Promise<GeocodingResult[]> => {
    if (!query || query.length < 3) return [];

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();

        return data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            display_name: item.display_name
        }));
    } catch (error) {
        console.error("Geocoding Error:", error);
        return [];
    }
};
