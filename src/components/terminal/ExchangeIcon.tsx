import React from 'react';

export type ExchangeId = 'binance' | 'bybit' | 'kucoin' | 'okx' | 'synthetic';

interface ExchangeIconProps {
  exchange: ExchangeId | string;
  className?: string;
  size?: number;
}

export const ExchangeIcon: React.FC<ExchangeIconProps> = ({
  exchange,
  className = 'w-4 h-4',
  size = 16
}) => {
  const ex = exchange.toLowerCase();

  switch (ex) {
    case 'binance':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#F0B90B" />
          <path
            d="M16 6.8L12.4 10.4L16 14L19.6 10.4L16 6.8ZM21.6 12.4L18 16L21.6 19.6L25.2 16L21.6 12.4ZM10.4 12.4L6.8 16L10.4 19.6L14 16L10.4 12.4ZM16 18L12.4 21.6L16 25.2L19.6 21.6L16 18ZM16 13.6L14.4 15.2L16 16.8L17.6 15.2L16 13.6Z"
            fill="#181A20"
          />
        </svg>
      );

    case 'bybit':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#121214" />
          <path
            d="M8.5 9H13.8C15.8 9 17.2 10.2 17.2 12C17.2 13.4 16.2 14.5 14.8 14.8C16.6 15.1 17.8 16.3 17.8 18C17.8 20 16.2 21.5 13.8 21.5H8.5V9ZM11.5 14.2H13.5C14.4 14.2 15 13.6 15 12.8C15 12 14.4 11.4 13.5 11.4H11.5V14.2ZM11.5 19.1H13.8C14.8 19.1 15.5 18.5 15.5 17.6C15.5 16.7 14.8 16.1 13.8 16.1H11.5V19.1Z"
            fill="#F7A600"
          />
          <path
            d="M19.2 14.8L23.5 9H20.2L17.5 12.8L19.2 14.8ZM19.2 17.2L17.5 19.2L20.2 23H23.5L19.2 17.2Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'kucoin':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#24AE8F" />
          <path
            d="M11 8V24H14.8V17.8L20.2 24H25L18.2 16.2L24.5 8H19.8L14.8 14.5V8H11Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case 'okx':
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <rect x="8" y="8" width="5.5" height="5.5" fill="#FFFFFF" rx="1" />
          <rect x="18.5" y="8" width="5.5" height="5.5" fill="#FFFFFF" rx="1" />
          <rect x="8" y="18.5" width="5.5" height="5.5" fill="#FFFFFF" rx="1" />
          <rect x="18.5" y="18.5" width="5.5" height="5.5" fill="#FFFFFF" rx="1" />
          <rect x="13.25" y="13.25" width="5.5" height="5.5" fill="#FFFFFF" rx="1" />
        </svg>
      );

    case 'synthetic':
    default:
      return (
        <svg
          viewBox="0 0 32 32"
          width={size}
          height={size}
          className={className}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#6366F1" />
          <path
            d="M16 7L23 11V21L16 25L9 21V11L16 7Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="16" cy="16" r="3" fill="#FFFFFF" />
        </svg>
      );
  }
};
