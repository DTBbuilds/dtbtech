// Empty auth buttons component - functionality removed
// This file exists to prevent build errors from legacy references

export default null;
export { AuthButtons };

class AuthButtons extends HTMLElement {
  constructor() {
    super();
    // Placeholder class - no functionality
  }
  
  connectedCallback() {
    // Empty implementation
  }
}

// Register the custom element
customElements.define('auth-buttons', AuthButtons);
