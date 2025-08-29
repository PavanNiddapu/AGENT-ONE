import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Calendar, MapPin, DollarSign, Star, Utensils, Trash2, Filter } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import visitService, { VisitWithDetails } from '../services/visits';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #6c757d;
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  align-items: end;
`;

const VisitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VisitCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const VisitHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const RestaurantName = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const CuisineType = styled.span`
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const VisitDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 8px;
`;

const VisitInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6c757d;
`;

const OverallRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #ffc107;
`;

const FoodItemsSection = styled.div`
  border-top: 1px solid #e0e6ed;
  padding-top: 16px;
  margin-top: 16px;
`;

const FoodItemsSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
`;

const FoodItemsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FoodItemTag = styled.span`
  background: #f8f9fa;
  color: #495057;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  border: 1px solid #e0e6ed;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 20px;
  color: #6c757d;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 8px;
  color: #333;
`;

const EmptyStateDescription = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 64px 20px;
  color: #6c757d;
  font-size: 18px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e6ed;
`;

const ViewVisitsPage: React.FC = () => {
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<VisitWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: ''
  });

  // Load visits on component mount
  useEffect(() => {
    const loadVisits = async () => {
      try {
        console.log('Loading visits...');
        const fetchedVisits = await visitService.getVisits();
        setVisits(fetchedVisits);
        setFilteredVisits(fetchedVisits);
        console.log('Visits loaded:', fetchedVisits);
      } catch (error) {
        console.error('Error loading visits:', error);
        toast.error('Failed to load visits');
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, []);

  // Apply filters whenever filters or visits change
  useEffect(() => {
    let filtered = [...visits];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.restaurant_name.toLowerCase().includes(searchLower) ||
        visit.cuisine_type?.toLowerCase().includes(searchLower) ||
        visit.occasion?.toLowerCase().includes(searchLower) ||
        visit.notes?.toLowerCase().includes(searchLower) ||
        visit.foodItems.some(item => 
          item.dish_name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(visit => 
        new Date(visit.visit_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(visit => 
        new Date(visit.visit_date) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    setFilteredVisits(filtered);
  }, [filters, visits]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleDeleteVisit = async (visitId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!window.confirm('Are you sure you want to delete this visit?')) {
      return;
    }

    try {
      console.log('Deleting visit:', visitId);
      await visitService.deleteVisit(visitId);
      
      // Remove from local state
      setVisits(prev => prev.filter(visit => visit.id !== visitId));
      toast.success('Visit deleted successfully');
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast.error('Failed to delete visit');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '';
    return `$${amount.toFixed(2)}`;
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return (
      <OverallRating>
        <Star size={16} fill="currentColor" />
        {rating}/5
      </OverallRating>
    );
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <LoadingState>Loading your visits...</LoadingState>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <HeaderContent>
            <PageTitle>My Visits</PageTitle>
            <PageSubtitle>
              {visits.length === 0 
                ? 'Start logging your dining experiences' 
                : `${visits.length} dining experience${visits.length !== 1 ? 's' : ''} recorded`
              }
            </PageSubtitle>
          </HeaderContent>
          <Button as={Link} to="/visits/new" size="large">
            <Plus size={20} />
            Log New Visit
          </Button>
        </PageHeader>

        {visits.length > 0 && (
          <FiltersContainer>
            <FiltersGrid>
              <Input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search restaurants, dishes, or notes..."
                label="Search"
              />
              
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                label="From Date"
              />
              
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                label="To Date"
              />
              
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!filters.search && !filters.startDate && !filters.endDate}
              >
                <Filter size={16} />
                Clear Filters
              </Button>
            </FiltersGrid>
          </FiltersContainer>
        )}

        {visits.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>🍽️</EmptyStateIcon>
            <EmptyStateTitle>No visits yet</EmptyStateTitle>
            <EmptyStateDescription>
              Start building your dining history by logging your first restaurant visit
            </EmptyStateDescription>
            <Button as={Link} to="/visits/new" size="large">
              <Plus size={20} />
              Log Your First Visit
            </Button>
          </EmptyState>
        ) : filteredVisits.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>🔍</EmptyStateIcon>
            <EmptyStateTitle>No matching visits</EmptyStateTitle>
            <EmptyStateDescription>
              Try adjusting your search criteria or clear the filters
            </EmptyStateDescription>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </EmptyState>
        ) : (
          <VisitsGrid>
            {filteredVisits.map((visit) => (
              <VisitCard key={visit.id}>
                <VisitHeader>
                  <div>
                    <RestaurantName>{visit.restaurant_name}</RestaurantName>
                    {visit.cuisine_type && (
                      <CuisineType>{visit.cuisine_type}</CuisineType>
                    )}
                  </div>
                  {visit.overall_rating && renderStars(visit.overall_rating)}
                </VisitHeader>

                <VisitDate>
                  <Calendar size={16} />
                  {formatDate(visit.visit_date)}
                  {visit.occasion && ` • ${visit.occasion}`}
                </VisitDate>

                <VisitInfo>
                  {visit.party_size && (
                    <InfoItem>
                      <span>👥 {visit.party_size} people</span>
                    </InfoItem>
                  )}
                  
                  {visit.total_cost && (
                    <InfoItem>
                      <DollarSign size={16} />
                      {formatCurrency(visit.total_cost)}
                    </InfoItem>
                  )}
                  
                  {visit.address && (
                    <InfoItem>
                      <MapPin size={16} />
                      {visit.address}
                    </InfoItem>
                  )}
                </VisitInfo>

                {visit.foodItems && visit.foodItems.length > 0 && (
                  <FoodItemsSection>
                    <FoodItemsSummary>
                      <Utensils size={16} />
                      {visit.foodItems.length} dish{visit.foodItems.length !== 1 ? 'es' : ''}
                    </FoodItemsSummary>
                    <FoodItemsList>
                      {visit.foodItems.slice(0, 3).map((foodItem) => (
                        <FoodItemTag key={foodItem.id}>
                          {foodItem.dish_name}
                          {foodItem.rating && (
                            <span style={{ marginLeft: '4px', color: '#ffc107' }}>
                              ★{foodItem.rating}
                            </span>
                          )}
                        </FoodItemTag>
                      ))}
                      {visit.foodItems.length > 3 && (
                        <FoodItemTag>+{visit.foodItems.length - 3} more</FoodItemTag>
                      )}
                    </FoodItemsList>
                  </FoodItemsSection>
                )}

                {visit.notes && (
                  <div style={{ 
                    marginTop: '12px', 
                    fontSize: '14px', 
                    color: '#6c757d',
                    fontStyle: 'italic',
                    borderLeft: '3px solid #e0e6ed',
                    paddingLeft: '12px'
                  }}>
                    "{visit.notes.length > 100 ? visit.notes.substring(0, 100) + '...' : visit.notes}"
                  </div>
                )}

                <CardActions>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e: React.MouseEvent) => handleDeleteVisit(visit.id, e)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </CardActions>
              </VisitCard>
            ))}
          </VisitsGrid>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ViewVisitsPage;