// User types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Restaurant types
export interface Restaurant {
  id: number;
  name: string;
  cuisine_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  website?: string;
  operating_hours?: Record<string, any>;
  avg_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantFormData {
  name: string;
  cuisineType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  operatingHours?: Record<string, any>;
}

// Category types
export interface Category {
  id: number;
  name: string;
  type: 'cuisine' | 'dish';
  created_at: string;
}

// Food Item types
export interface FoodItem {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  ingredients?: string;
  allergens?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  created_at: string;
}

// Visit types
export interface Visit {
  id: number;
  user_id: number;
  restaurant_id: number;
  visit_date: string;
  occasion?: string;
  party_size?: number;
  overall_rating?: number;
  service_rating?: number;
  ambiance_rating?: number;
  wait_time?: number;
  total_cost?: number;
  tip_amount?: number;
  payment_method?: string;
  notes?: string;
  would_return?: boolean;
  created_at: string;
}

export interface VisitFormData {
  restaurantId: number;
  visitDate: string;
  occasion?: string;
  partySize?: number;
  overallRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  waitTime?: number;
  totalCost?: number;
  tipAmount?: number;
  paymentMethod?: string;
  notes?: string;
  wouldReturn?: boolean;
}

// Visit Food Item types
export interface VisitFoodItem {
  id: number;
  visit_id: number;
  food_item_id: number;
  dish_name: string;
  price?: number;
  portion_size?: string;
  rating?: number;
  notes?: string;
  photo_path?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Search and Filter types
export interface RestaurantFilters {
  search?: string;
  cuisineType?: string;
  city?: string;
  minRating?: number;
  sortBy?: 'name' | 'avg_rating' | 'total_reviews' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Component Props types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  as?: React.ElementType;
  to?: string;
}

export interface InputProps {
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

export interface SelectProps {
  options: Array<{ value: string | number; label: string }>;
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

// Rating component types
export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Navigation types
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}