import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Dark theme (default) */
    --background-color: #1e1e1e;
    --sidebar-color: #252526;
    --editor-color: #1e1e1e;
    --selection-color: #264f78;
    --text-color: #d4d4d4;
    --border-color: #474747;
    --primary-color: #0e639c;
    --primary-hover-color: #1177bb;
    --secondary-color: #3a3d41;
    --hover-color: #2a2d2e;
    --active-color: #37373d;
    --input-background: #3c3c3c;
    --input-text: #cccccc;
    --error-color: #f48771;
    --success-color: #89d185;
  }

  body[data-theme="light"] {
    --background-color: #ffffff;
    --sidebar-color: #f3f3f3;
    --editor-color: #ffffff;
    --selection-color: #add6ff;
    --text-color: #333333;
    --border-color: #cccccc;
    --primary-color: #007acc;
    --primary-hover-color: #006bb3;
    --secondary-color: #e7e7e7;
    --hover-color: #e8e8e8;
    --active-color: #d6d6d6;
    --input-background: #ffffff;
    --input-text: #333333;
    --error-color: #e51400;
    --success-color: #008000;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 14px;
    line-height: 1.5;
    overflow: hidden;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 13px;
    
    &:hover {
      background-color: var(--primary-hover-color);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    &.secondary {
      background-color: var(--secondary-color);
      
      &:hover {
        background-color: var(--active-color);
      }
    }
    
    &.icon {
      background: transparent;
      padding: 4px;
      color: var(--text-color);
      
      &:hover {
        background-color: var(--hover-color);
      }
    }
  }

  input, textarea, select {
    background-color: var(--input-background);
    color: var(--input-text);
    border: 1px solid var(--border-color);
    padding: 6px 8px;
    border-radius: 2px;
    
    &:focus {
      outline: 1px solid var(--primary-color);
    }
  }

  .error {
    color: var(--error-color);
  }

  .success {
    color: var(--success-color);
  }
`;

export default GlobalStyles;