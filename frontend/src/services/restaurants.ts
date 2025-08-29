import apiService from './api';
import { 
  Restaurant, 
  RestaurantFormData, 
  RestaurantFilters,
  PaginatedResponse 
} from '../types';

class RestaurantService {
  async getRestaurants(filters?: RestaurantFilters): Promise<PaginatedResponse<Restaurant>> {
    const response = await apiService.get<{ restaurants: Restaurant[]; pagination: any }>('/restaurants', filters);
    return {
      data: response.restaurants,
      pagination: response.pagination
    };
  }

  async getRestaurant(id: number): Promise<Restaurant> {
    const response = await apiService.get<{ restaurant: Restaurant }>(`/restaurants/${id}`);
    return response.restaurant;
  }

  async createRestaurant(data: RestaurantFormData): Promise<Restaurant> {
    const response = await apiService.post<{ restaurant: Restaurant }>('/restaurants', data);
    return response.restaurant;
  }

  async updateRestaurant(id: number, data: RestaurantFormData): Promise<Restaurant> {
    const response = await apiService.put<{ restaurant: Restaurant }>(`/restaurants/${id}`, data);
    return response.restaurant;
  }

  async deleteRestaurant(id: number): Promise<void> {
    await apiService.delete(`/restaurants/${id}`);
  }

  async getCuisineTypes(): Promise<string[]> {
    const response = await apiService.get<{ cuisineTypes: string[] }>('/restaurants/cuisine-types');
    return response.cuisineTypes;
  }
}

export default new RestaurantService();