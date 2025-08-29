import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Rating from '../components/ui/Rating';
import visitService, { CreateVisitData } from '../services/visits';
import restaurantService from '../services/restaurants';
import { Restaurant } from '../types';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
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

const Form = styled.form`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 2px solid #e0e6ed;
  padding-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FoodItemsContainer = styled.div`
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FoodItemHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
`;

const FoodItemTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
`;

const RemoveFoodItemButton = styled(Button)`
  padding: 8px;
  min-height: auto;
`;

const AddFoodItemButton = styled(Button)`
  width: 100%;
  margin-top: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #e0e6ed;
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.$hasError ? '#dc3545' : '#e0e6ed'};
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc3545' : '#007bff'};
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

interface FoodItem {
  dishName: string;
  category: string;
  price: string;
  rating: number;
  notes: string;
}

const LogNewVisitPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  
  // Form state
  const [visitData, setVisitData] = useState({
    restaurantId: '',
    visitDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    occasion: '',
    partySize: '',
    overallRating: 0,
    serviceRating: 0,
    ambianceRating: 0,
    waitTime: '',
    totalCost: '',
    tipAmount: '',
    paymentMethod: '',
    notes: '',
    wouldReturn: true
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    {
      dishName: '',
      category: 'Main Course',
      price: '',
      rating: 0,
      notes: ''
    }
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load restaurants on component mount
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        console.log('Loading restaurants...');
        const response = await restaurantService.getRestaurants();
        setRestaurants(response.data);
        console.log('Restaurants loaded:', response.data);
      } catch (error) {
        console.error('Error loading restaurants:', error);
        toast.error('Failed to load restaurants');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    loadRestaurants();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setVisitData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (field: string, rating: number) => {
    setVisitData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const addFoodItem = () => {
    setFoodItems(prev => [...prev, {
      dishName: '',
      category: 'Main Course',
      price: '',
      rating: 0,
      notes: ''
    }]);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    setFoodItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!visitData.restaurantId) {
      newErrors.restaurantId = 'Please select a restaurant';
    }

    if (!visitData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    // Validate at least one food item with dish name
    const validFoodItems = foodItems.filter(item => item.dishName.trim());
    if (validFoodItems.length === 0) {
      newErrors.foodItems = 'Please add at least one dish';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const visitPayload: CreateVisitData = {
        restaurantId: parseInt(visitData.restaurantId),
        visitDate: visitData.visitDate,
        occasion: visitData.occasion || undefined,
        partySize: visitData.partySize ? parseInt(visitData.partySize) : undefined,
        overallRating: visitData.overallRating || undefined,
        serviceRating: visitData.serviceRating || undefined,
        ambianceRating: visitData.ambianceRating || undefined,
        waitTime: visitData.waitTime ? parseInt(visitData.waitTime) : undefined,
        totalCost: visitData.totalCost ? parseFloat(visitData.totalCost) : undefined,
        tipAmount: visitData.tipAmount ? parseFloat(visitData.tipAmount) : undefined,
        paymentMethod: visitData.paymentMethod || undefined,
        notes: visitData.notes || undefined,
        wouldReturn: visitData.wouldReturn,
        foodItems: foodItems
          .filter(item => item.dishName.trim())
          .map(item => ({
            dishName: item.dishName.trim(),
            category: item.category,
            price: item.price ? parseFloat(item.price) : undefined,
            rating: item.rating || undefined,
            notes: item.notes || undefined
          }))
      };

      console.log('Submitting visit data:', visitPayload);

      const createdVisit = await visitService.createVisit(visitPayload);
      
      console.log('Visit created successfully:', createdVisit);
      toast.success('Visit logged successfully!');
      navigate('/visits');
    } catch (error) {
      console.error('Error creating visit:', error);
      toast.error('Failed to log visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Log New Visit</PageTitle>
          <PageSubtitle>Record your dining experience with detailed ratings and notes</PageSubtitle>
        </PageHeader>

        <Form onSubmit={handleSubmit}>
          {/* Restaurant & Visit Details */}
          <Section>
            <SectionTitle>Visit Details</SectionTitle>
            
            <Grid>
              <Select
                name="restaurantId"
                value={visitData.restaurantId}
                onChange={handleInputChange}
                label="Restaurant"
                required
                error={errors.restaurantId}
                disabled={loadingRestaurants}
              >
                <option value="">
                  {loadingRestaurants ? 'Loading restaurants...' : 'Select a restaurant'}
                </option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} {restaurant.cuisine_type && `(${restaurant.cuisine_type})`}
                  </option>
                ))}
              </Select>

              <Input
                type="datetime-local"
                name="visitDate"
                value={visitData.visitDate}
                onChange={handleInputChange}
                label="Visit Date & Time"
                required
                error={errors.visitDate}
              />

              <Input
                type="text"
                name="occasion"
                value={visitData.occasion}
                onChange={handleInputChange}
                label="Occasion"
                placeholder="Dinner, lunch, celebration..."
              />

              <Input
                type="number"
                name="partySize"
                value={visitData.partySize}
                onChange={handleInputChange}
                label="Party Size"
                placeholder="Number of people"
                min="1"
              />
            </Grid>
          </Section>

          {/* Ratings */}
          <Section>
            <SectionTitle>Ratings</SectionTitle>
            
            <Grid>
              <Rating
                label="Overall Rating"
                value={visitData.overallRating}
                onChange={(rating) => handleRatingChange('overallRating', rating)}
              />
              
              <Rating
                label="Service Rating"
                value={visitData.serviceRating}
                onChange={(rating) => handleRatingChange('serviceRating', rating)}
              />
              
              <Rating
                label="Ambiance Rating"
                value={visitData.ambianceRating}
                onChange={(rating) => handleRatingChange('ambianceRating', rating)}
              />
            </Grid>
          </Section>

          {/* Food Items */}
          <Section>
            <SectionTitle>Food Items</SectionTitle>
            {errors.foodItems && (
              <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '14px' }}>
                {errors.foodItems}
              </div>
            )}
            
            {foodItems.map((foodItem, index) => (
              <FoodItemsContainer key={index}>
                <FoodItemHeader>
                  <FoodItemTitle>Dish {index + 1}</FoodItemTitle>
                  {foodItems.length > 1 && (
                    <RemoveFoodItemButton
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => removeFoodItem(index)}
                    >
                      <Trash2 size={16} />
                    </RemoveFoodItemButton>
                  )}
                </FoodItemHeader>
                
                <Grid>
                  <Input
                    type="text"
                    name={`dishName-${index}`}
                    value={foodItem.dishName}
                    onChange={(e) => updateFoodItem(index, 'dishName', e.target.value)}
                    label="Dish Name"
                    placeholder="Enter dish name"
                    required
                  />
                  
                  <Select
                    name={`category-${index}`}
                    value={foodItem.category}
                    onChange={(e) => updateFoodItem(index, 'category', e.target.value)}
                    label="Category"
                  >
                    <option value="Appetizer">Appetizer</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                    <option value="Side Dish">Side Dish</option>
                  </Select>
                  
                  <Input
                    type="number"
                    name={`price-${index}`}
                    value={foodItem.price}
                    onChange={(e) => updateFoodItem(index, 'price', e.target.value)}
                    label="Price ($)"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </Grid>
                
                <Rating
                  label="Dish Rating"
                  value={foodItem.rating}
                  onChange={(rating) => updateFoodItem(index, 'rating', rating)}
                />
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#333', 
                    marginBottom: '4px', 
                    display: 'block' 
                  }}>
                    Notes
                  </label>
                  <TextArea
                    name={`notes-${index}`}
                    value={foodItem.notes}
                    onChange={(e) => updateFoodItem(index, 'notes', e.target.value)}
                    placeholder="Additional notes about this dish..."
                  />
                </div>
              </FoodItemsContainer>
            ))}
            
            <AddFoodItemButton
              type="button"
              variant="outline"
              onClick={addFoodItem}
            >
              <Plus size={20} />
              Add Another Dish
            </AddFoodItemButton>
          </Section>

          {/* Payment & Additional Info */}
          <Section>
            <SectionTitle>Payment & Additional Info</SectionTitle>
            
            <Grid>
              <Input
                type="number"
                name="totalCost"
                value={visitData.totalCost}
                onChange={handleInputChange}
                label="Total Cost ($)"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <Input
                type="number"
                name="tipAmount"
                value={visitData.tipAmount}
                onChange={handleInputChange}
                label="Tip Amount ($)"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <Select
                name="paymentMethod"
                value={visitData.paymentMethod}
                onChange={handleInputChange}
                label="Payment Method"
              >
                <option value="">Select payment method</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Mobile Payment">Mobile Payment</option>
              </Select>
              
              <Input
                type="number"
                name="waitTime"
                value={visitData.waitTime}
                onChange={handleInputChange}
                label="Wait Time (minutes)"
                placeholder="0"
                min="0"
              />
            </Grid>
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#333', 
                marginBottom: '4px', 
                display: 'block' 
              }}>
                Additional Notes
              </label>
              <TextArea
                name="notes"
                value={visitData.notes}
                onChange={handleInputChange}
                placeholder="Overall experience, recommendations, etc..."
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  name="wouldReturn"
                  checked={visitData.wouldReturn}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                Would return to this restaurant
              </label>
            </div>
          </Section>

          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/visits')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              <Save size={20} />
              Save Visit
            </Button>
          </ButtonGroup>
        </Form>
      </PageContainer>
    </Layout>
  );
};

export default LogNewVisitPage;