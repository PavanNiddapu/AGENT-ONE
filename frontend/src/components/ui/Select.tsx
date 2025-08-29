import React from 'react';
import styled from 'styled-components';

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  
  &.required:after {
    content: ' *';
    color: #dc3545;
  }
`;

const StyledSelect = styled.select<{ $hasError: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.$hasError ? '#dc3545' : '#e0e6ed'};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease-in-out;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc3545' : '#007bff'};
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

interface SelectProps {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
  children,
  ...props
}) => {
  return (
    <SelectContainer>
      {label && (
        <Label className={required ? 'required' : ''}>
          {label}
        </Label>
      )}
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
        $hasError={!!error}
        disabled={disabled}
        {...props}
      >
        {children}
      </StyledSelect>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectContainer>
  );
};

export default Select;