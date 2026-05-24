import { calculatePricing } from './calculatePricing';
import { calculateBoardArea } from './boardCalculations';

export function buildQuote({ quantity = 0, unitPrice = 0, markup = 0, width = 0, height = 0, depth = 0 }) {
  const pricing = calculatePricing({ quantity, unitPrice, markup });
  const board = calculateBoardArea(width, height, depth);

  return {
    pricing,
    board,
    quoteTotal: pricing.total,
    summary: `Quote for ${quantity} units with board area ${board.area.toFixed(2)} sq units.`,
  };
}
