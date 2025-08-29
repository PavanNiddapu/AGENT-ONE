import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LoginCredentials } from '../types';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const LogoText = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 24px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #6c757d;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 24px;
  color: #6c757d;
  
  a {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the AuthContext
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoSection>
          <UtensilsCrossed size={36} color="#007bff" />
          <LogoText>Food Tracker</LogoText>
        </LogoSection>

        <Title>Welcome back</Title>
        <Subtitle>Sign in to your account</Subtitle>

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            value={credentials.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            size="large"
          >
            Sign In
          </Button>
        </Form>

        <LinkText>
          Don't have an account?{' '}
          <Link to="/register">Create one here</Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;