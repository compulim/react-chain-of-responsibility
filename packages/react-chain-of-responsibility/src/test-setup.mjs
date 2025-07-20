// Test setup for Node.js test runner with happy-dom
import { Window } from 'happy-dom';

// Create a virtual window and setup global environment
const window = new Window();
const document = window.document;

// Assign to global scope for compatibility with React and testing libraries
global.window = window;
global.document = document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;

// For React testing
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

// Cleanup on exit
process.on('exit', () => {
  window.close();
});