import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setSidebarWidth, toggleSidebar } from "../../store/uiSlice";
import Titlebar from "./Titlebar";
import Sidebar from "./Sidebar";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";

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

const ContentPanel = styled.div`
  height: 100%;
  overflow: auto;
  background-color: var(--editor-color);
  position: relative;
`;

const CustomResizeHandle = styled(PanelResizeHandle)`
  width: 8px;
  margin: 0 -4px;
  background-color: transparent;
  position: relative;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 3px;
    right: 3px;
    bottom: 0;
    width: 2px;
    height: 100%;
    margin: 0 auto;
    background-color: var(--border-color);
    opacity: 0.4;
    transition: opacity 0.2s, background-color 0.2s;
  }
  
  &:hover::after {
    opacity: 1;
    background-color: var(--primary-color);
  }
`;

// Minimum width for the sidebar in pixels
const MIN_SIDEBAR_WIDTH = 40;

// This percentage threshold controls when the sidebar collapses
const COLLAPSE_THRESHOLD_PERCENT = 8; // If sidebar is less than 8% of container, collapse it

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { sidebarWidth, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  
  // Convert pixel width to percentage for the library
  const sidebarInitialPercent = !sidebarCollapsed ? Math.max(15, (sidebarWidth / window.innerWidth) * 100) : 5;
  
  // Handle resize events from the panel library
  const handleResize = (sizes: number[]) => {
    // Convert percentage back to pixels
    const containerWidth = window.innerWidth;
    const newWidthPx = Math.round((sizes[0] / 100) * containerWidth);
    
    // Update Redux state - both width and collapse status are handled in the reducer
    dispatch(setSidebarWidth(newWidthPx));
  };
  
  return (
    <LayoutContainer>
      <Titlebar />
      <MainContent>
        <PanelGroup direction="horizontal" onLayout={handleResize}>
          <Panel 
            id="sidebar" 
            defaultSize={sidebarInitialPercent}
            minSize={4} // Minimum size as percentage
            collapsible={true}
            collapsedSize={MIN_SIDEBAR_WIDTH}
          >
            <Sidebar width={sidebarWidth} collapsed={sidebarCollapsed} />
          </Panel>
          
          <CustomResizeHandle />
          
          <Panel id="content">
            <ContentPanel>
              {children}
            </ContentPanel>
          </Panel>
        </PanelGroup>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
