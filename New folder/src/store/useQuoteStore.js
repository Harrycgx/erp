import { useMemo } from 'react';

const initialQuote = {
  quantity: 0,
  unitPrice: 0,
  markup: 0.12,
  total: 0,
};

export function useQuoteStore() {
  const quote = useMemo(() => ({
    ...initialQuote,
    total: initialQuote.quantity * initialQuote.unitPrice * (1 + initialQuote.markup),
  }), []);

  return {
    quote,
  };
}
