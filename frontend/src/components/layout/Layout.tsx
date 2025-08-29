import React from 'react';
import styled from 'styled-components';
import Navigation from './Navigation';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Navigation />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;