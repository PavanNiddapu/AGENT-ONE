import React from 'react';
import styled from 'styled-components';
import { Star } from 'lucide-react';

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const StarButton = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
  
  svg {
    color: ${props => props.$filled ? '#ffc107' : '#e0e6ed'};
    fill: ${props => props.$filled ? '#ffc107' : 'none'};
  }
`;

const RatingValue = styled.span`
  margin-left: 8px;
  font-size: 14px;
  color: #6c757d;
`;

interface RatingProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  maxRating?: number;
  size?: number;
  disabled?: boolean;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  label,
  maxRating = 5,
  size = 20,
  disabled = false
}) => {
  const handleStarClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  return (
    <RatingContainer>
      {label && <Label>{label}</Label>}
      <StarsContainer>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          return (
            <StarButton
              key={index}
              type="button"
              $filled={starValue <= value}
              onClick={() => handleStarClick(starValue)}
              disabled={disabled}
            >
              <Star size={size} />
            </StarButton>
          );
        })}
        {value > 0 && <RatingValue>{value}/5</RatingValue>}
      </StarsContainer>
    </RatingContainer>
  );
};

export default Rating;