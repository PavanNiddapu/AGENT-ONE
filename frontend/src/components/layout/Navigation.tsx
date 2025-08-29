import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, UtensilsCrossed, MapPin, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const NavContainer = styled.nav`
  background-color: #ffffff;
  border-bottom: 1px solid #e0e6ed;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: #0056b3;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$isActive ? '#007bff' : '#6c757d'};
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: #007bff;
    background-color: #f8f9fa;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-weight: 500;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 8px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

interface NavigationProps {
  children?: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/dashboard">
          <UtensilsCrossed size={28} />
          Food Tracker
        </Logo>

        <NavLinks>
          <NavLink to="/dashboard" $isActive={isActivePath('/dashboard')}>
            <Home size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/restaurants" $isActive={isActivePath('/restaurants')}>
            <MapPin size={20} />
            Restaurants
          </NavLink>
          <NavLink to="/visits" $isActive={isActivePath('/visits')}>
            <UtensilsCrossed size={20} />
            My Visits
          </NavLink>
          <NavLink to="/analytics" $isActive={isActivePath('/analytics')}>
            <BarChart3 size={20} />
            Analytics
          </NavLink>
        </NavLinks>

        <UserSection>
          <UserInfo>
            <User size={20} />
            {user?.firstName || user?.username}
          </UserInfo>
          <Button
            variant="outline"
            size="small"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </UserSection>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;