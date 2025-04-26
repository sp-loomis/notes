import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSidebarWidth, toggleSidebar } from '../../store/uiSlice';
import Titlebar from './Titlebar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  background-color: var(--editor-color);
  position: relative;
`;

const ResizeHandle = styled.div`
  width: 5px;
  height: 100%;
  cursor: col-resize;
  background-color: var(--border-color);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { sidebarWidth, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const resizeRef = React.useRef<HTMLDivElement>(null);
  
  // Handle sidebar resizing
  React.useEffect(() => {
    const resizeHandle = resizeRef.current;
    if (!resizeHandle) return;
    
    let startX = 0;
    let startWidth = 0;
    
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startWidth = sidebarWidth;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      if (newWidth > 100 && newWidth < 500) {
        dispatch(setSidebarWidth(newWidth));
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    resizeHandle.addEventListener('mousedown', onMouseDown);
    
    return () => {
      resizeHandle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dispatch, sidebarWidth]);
  
  return (
    <LayoutContainer>
      <Titlebar />
      <MainContent>
        <Sidebar width={sidebarWidth} collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && <ResizeHandle ref={resizeRef} />}
        <Content>
          {children}
        </Content>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;