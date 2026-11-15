import '@testing-library/jest-dom';

// Global ResizeObserver mock for Recharts responsive containers in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Global scrollIntoView mock for JSDOM
if (typeof window !== 'undefined' && window.HTMLElement) {
  window.HTMLElement.prototype.scrollIntoView = function () {};
}

