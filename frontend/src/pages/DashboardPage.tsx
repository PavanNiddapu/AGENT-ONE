import React from 'react';
import styled from 'styled-components';
import { Plus, MapPin, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const WelcomeSubtitle = styled.p`
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 24px;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const ActionCard = styled(Link)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  border: 2px solid #e0e6ed;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
  }
`;

const ActionIcon = styled.div`
  background: #f8f9fa;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #007bff;
`;

const ActionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const ActionDescription = styled.p`
  color: #6c757d;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e0e6ed;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-weight: 500;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
`;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <DashboardContainer>
        <WelcomeSection>
          <WelcomeTitle>
            Welcome back, {user?.firstName || user?.username}!
          </WelcomeTitle>
          <WelcomeSubtitle>
            Ready to track some delicious experiences?
          </WelcomeSubtitle>
          <Button as={Link} to="/visits/new" size="large">
            <Plus size={20} />
            Log New Visit
          </Button>
        </WelcomeSection>

        <div>
          <SectionTitle>Quick Actions</SectionTitle>
          <QuickActionsGrid>
            <ActionCard to="/restaurants">
              <ActionIcon>
                <MapPin size={32} />
              </ActionIcon>
              <ActionTitle>Browse Restaurants</ActionTitle>
              <ActionDescription>
                Discover restaurants and add new ones to your collection
              </ActionDescription>
            </ActionCard>

            <ActionCard to="/visits">
              <ActionIcon>
                <UtensilsCrossed size={32} />
              </ActionIcon>
              <ActionTitle>My Visits</ActionTitle>
              <ActionDescription>
                View your dining history and past experiences
              </ActionDescription>
            </ActionCard>

            <ActionCard to="/analytics">
              <ActionIcon>
                <TrendingUp size={32} />
              </ActionIcon>
              <ActionTitle>View Analytics</ActionTitle>
              <ActionDescription>
                Analyze your dining patterns and spending habits
              </ActionDescription>
            </ActionCard>
          </QuickActionsGrid>
        </div>

        <div>
          <SectionTitle>Your Stats</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>0</StatValue>
              <StatLabel>Restaurants Visited</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>0</StatValue>
              <StatLabel>Total Visits</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>0</StatValue>
              <StatLabel>Dishes Tried</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>$0</StatValue>
              <StatLabel>Total Spent</StatLabel>
            </StatCard>
          </StatsGrid>
        </div>
      </DashboardContainer>
    </Layout>
  );
};

export default DashboardPage;