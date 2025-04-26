import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/uiSlice';
import { VscMenu, VscChromeClose, VscChromeMinimize, VscChromeMaximize, VscChromeRestore, VscColorMode } from 'react-icons/vsc';

interface TitlebarProps {
  onToggleSidebar: () => void;
}

const TitlebarContainer = styled.div`
  height: 30px;
  background-color: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  -webkit-app-region: drag;
  user-select: none;
  border-bottom: 1px solid var(--border-color);
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  -webkit-app-region: no-drag;
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-color);
  }
`;

const WindowControls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
`;

const WindowTitle = styled.div`
  color: var(--text-color);
  font-size: 12px;
  flex: 1;
  text-align: center;
`;

const WindowButton = styled(MenuButton)`
  &:hover {
    background-color: ${props => props.title === 'Close' ? '#e81123' : 'var(--hover-color)'};
  }
`;

const Titlebar: React.FC<TitlebarProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const [isMaximized, setIsMaximized] = React.useState(false);
  
  // Function to handle window control actions
  const handleWindowControls = (action: 'minimize' | 'maximize' | 'close') => {
    // In a real Electron app, we'd use IPC to control the window
    // For this demo, we're just showing the UI
    if (action === 'maximize') {
      setIsMaximized(!isMaximized);
    }
  };
  
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Also set the data-theme attribute on the body
    document.body.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <TitlebarContainer>
      <MenuButton onClick={onToggleSidebar} title="Toggle Sidebar">
        <VscMenu />
      </MenuButton>
      
      <WindowTitle>Notes App</WindowTitle>
      
      <MenuButton onClick={handleThemeToggle} title="Toggle Theme">
        <VscColorMode />
      </MenuButton>
      
      <WindowControls>
        <WindowButton 
          onClick={() => handleWindowControls('minimize')} 
          title="Minimize"
        >
          <VscChromeMinimize />
        </WindowButton>
        
        <WindowButton 
          onClick={() => handleWindowControls('maximize')} 
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
        </WindowButton>
        
        <WindowButton 
          onClick={() => handleWindowControls('close')} 
          title="Close"
        >
          <VscChromeClose />
        </WindowButton>
      </WindowControls>
    </TitlebarContainer>
  );
};

export default Titlebar;