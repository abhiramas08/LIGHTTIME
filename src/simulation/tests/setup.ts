import '@testing-library/jest-dom';

// Global ResizeObserver mock for Recharts responsive containers in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

