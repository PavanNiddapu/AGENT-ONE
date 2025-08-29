import React from 'react';
import styled, { css } from 'styled-components';
import { ButtonProps } from '../../types';

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  outline: none;
  font-family: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      cursor: wait;
    `}

  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return css`
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        `;
      case 'large':
        return css`
          padding: 16px 32px;
          font-size: 18px;
          min-height: 56px;
        `;
      default:
        return css`
          padding: 12px 24px;
          font-size: 16px;
          min-height: 44px;
        `;
    }
  }}

  ${({ $variant }) => {
    switch ($variant) {
      case 'secondary':
        return css`
          background-color: #6c757d;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #5a6268;
          }
        `;
      case 'danger':
        return css`
          background-color: #dc3545;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: #007bff;
          border: 2px solid #007bff;
          
          &:hover:not(:disabled) {
            background-color: #007bff;
            color: white;
          }
        `;
      default:
        return css`
          background-color: #007bff;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #0056b3;
          }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps & any> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  as,
  ...props
}) => {
  const Component = as || 'button';
  
  return (
    <StyledButton
      as={Component}
      $variant={variant}
      $size={size}
      $loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};

export default Button;