import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Search, MapPin, Star, Phone, Globe } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import restaurantService from '../services/restaurants';
import { Restaurant, RestaurantFilters } from '../types';
import { Link } from 'react-router-dom';

const RestaurantsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #333;
`;

const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e0e6ed;
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
`;

const RestaurantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const RestaurantCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 2px solid #e0e6ed;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const RestaurantContent = styled.div`
  padding: 20px;
`;

const RestaurantName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const RestaurantMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const CuisineType = styled.span`
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffc107;
`;

const RestaurantAddress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  margin-bottom: 8px;
`;

const RestaurantContact = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6c757d;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e0e6ed;
`;

const EmptyStateTitle = styled.h3`
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
`;

const EmptyStateText = styled.p`
  color: #6c757d;
  margin-bottom: 24px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: #6c757d;
`;

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RestaurantFilters>({
    search: '',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    loadRestaurants();
  }, [filters]);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const response = await restaurantService.getRestaurants(filters);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#ffc107' : 'none'}
        color={i < rating ? '#ffc107' : '#e0e6ed'}
      />
    ));
  };

  return (
    <Layout>
      <RestaurantsContainer>
        <Header>
          <Title>Restaurants</Title>
          <Button as={Link} to="/restaurants/new">
            <Plus size={20} />
            Add Restaurant
          </Button>
        </Header>

        <FiltersSection>
          <Input
            type="text"
            placeholder="Search restaurants..."
            value={filters.search}
            onChange={handleSearchChange}
            label=""
          />
          <Button variant="outline">
            <Search size={20} />
            Search
          </Button>
        </FiltersSection>

        {isLoading ? (
          <LoadingState>Loading restaurants...</LoadingState>
        ) : restaurants.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>No restaurants found</EmptyStateTitle>
            <EmptyStateText>
              {filters.search
                ? "No restaurants match your search criteria."
                : "You haven't added any restaurants yet. Add your first restaurant to get started!"}
            </EmptyStateText>
            <Button as={Link} to="/restaurants/new">
              <Plus size={20} />
              Add Your First Restaurant
            </Button>
          </EmptyState>
        ) : (
          <RestaurantsGrid>
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id}>
                <RestaurantContent>
                  <RestaurantName>{restaurant.name}</RestaurantName>
                  
                  <RestaurantMeta>
                    {restaurant.cuisine_type && (
                      <CuisineType>{restaurant.cuisine_type}</CuisineType>
                    )}
                    {restaurant.avg_rating > 0 && (
                      <Rating>
                        {renderStars(Math.round(restaurant.avg_rating))}
                        <span style={{ color: '#6c757d', marginLeft: '4px' }}>
                          ({restaurant.total_reviews})
                        </span>
                      </Rating>
                    )}
                  </RestaurantMeta>

                  {restaurant.address && (
                    <RestaurantAddress>
                      <MapPin size={16} />
                      <span>
                        {restaurant.address}
                        {restaurant.city && `, ${restaurant.city}`}
                        {restaurant.state && `, ${restaurant.state}`}
                      </span>
                    </RestaurantAddress>
                  )}

                  <RestaurantContact>
                    {restaurant.phone && (
                      <ContactItem>
                        <Phone size={14} />
                        {restaurant.phone}
                      </ContactItem>
                    )}
                    {restaurant.website && (
                      <ContactItem>
                        <Globe size={14} />
                        Website
                      </ContactItem>
                    )}
                  </RestaurantContact>
                </RestaurantContent>
              </RestaurantCard>
            ))}
          </RestaurantsGrid>
        )}
      </RestaurantsContainer>
    </Layout>
  );
};

export default RestaurantsPage;