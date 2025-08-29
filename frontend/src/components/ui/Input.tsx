import React from 'react';
import styled from 'styled-components';
import { InputProps } from '../../types';

const InputContainer = styled.div`
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

const StyledInput = styled.input<{ $hasError: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.$hasError ? '#dc3545' : '#e0e6ed'};
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#dc3545' : '#007bff'};
  }
  
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <InputContainer>
      {label && (
        <Label className={required ? 'required' : ''}>
          {label}
        </Label>
      )}
      <StyledInput
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        $hasError={!!error}
        disabled={disabled}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;