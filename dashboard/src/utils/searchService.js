// Search Service for handling search API calls
import { API_BASE_URL } from "../config/api";

class SearchService {
  static baseURL = `${API_BASE_URL}/api`;

  // Perform search with debouncing
  static async search(query, type = "all", limit = 10) {
    try {
      if (!query || query.length < 1) {
        return {
          success: true,
          suggestions: [],
          results: { products: [], stores: [], total: 0 },
        };
      }

      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });

      if (type !== "all") {
        params.append("type", type);
      }

      const response = await fetch(`${this.baseURL}/search?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Search service error:", error);
      return {
        success: false,
        error: error.message,
        suggestions: [],
        results: { products: [], stores: [], total: 0 },
      };
    }
  }

  // Get suggestions for autocomplete (faster, fewer results)
  static async getSuggestions(query, limit = 8) {
    try {
      const result = await this.search(query, "all", limit);
      return result.suggestions || [];
    } catch (error) {
      console.error("Get suggestions error:", error);
      return [];
    }
  }

  // Search specific types
  static async searchProducts(query, limit = 20) {
    return await this.search(query, "products", limit);
  }

  static async searchStores(query, limit = 20) {
    return await this.search(query, "stores", limit);
  }

  static async searchArtists(query, limit = 20) {
    return await this.search(query, "artists", limit);
  }
}

export default SearchService;
