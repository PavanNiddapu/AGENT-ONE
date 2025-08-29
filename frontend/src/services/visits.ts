import apiService from './api';
import { 
  Visit, 
  VisitFormData
} from '../types';

export interface VisitWithDetails extends Visit {
  restaurant_name: string;
  cuisine_type?: string;
  address?: string;
  foodItems: Array<{
    id: number;
    visit_id: number;
    food_item_id: number;
    dish_name: string;
    price?: number;
    rating?: number;
    notes?: string;
    food_item_name: string;
  }>;
}

export interface CreateVisitData extends VisitFormData {
  foodItems?: Array<{
    dishName: string;
    category?: string;
    price?: number;
    rating?: number;
    notes?: string;
  }>;
}

class VisitService {
  async getVisits(): Promise<VisitWithDetails[]> {
    console.log('Fetching visits from API...');
    const response = await apiService.get<{ visits: VisitWithDetails[] }>('/visits');
    console.log('Visits fetched:', response.visits);
    return response.visits;
  }

  async getVisit(id: number): Promise<VisitWithDetails> {
    console.log('Fetching visit by ID:', id);
    const response = await apiService.get<{ visit: VisitWithDetails }>(`/visits/${id}`);
    console.log('Visit fetched:', response.visit);
    return response.visit;
  }

  async createVisit(data: CreateVisitData): Promise<VisitWithDetails> {
    console.log('Creating new visit:', data);
    const response = await apiService.post<{ visit: VisitWithDetails }>('/visits', data);
    console.log('Visit created:', response.visit);
    return response.visit;
  }

  async deleteVisit(id: number): Promise<void> {
    console.log('Deleting visit:', id);
    await apiService.delete(`/visits/${id}`);
    console.log('Visit deleted successfully');
  }
}

export default new VisitService();