import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSidebarMode, toggleSidebar } from '../../store/uiSlice';
import { VscNote, VscTag, VscSearch, VscLink, VscChevronLeft, VscChevronRight } from 'react-icons/vsc';
import NotesList from '../Notes/NotesList';
import TagsList from '../Tags/TagsList';
import SearchView from '../Search/SearchView';
import LinksView from '../Notes/LinksView';

interface SidebarProps {
  width: number;
  collapsed: boolean;
}

const SidebarContainer = styled.div<{ width: number; $collapsed: boolean }>`
  height: 100%;
  width: ${props => (props.$collapsed ? '40px' : `${props.width}px`)};
  background-color: var(--sidebar-color);
  display: flex;
  flex-direction: row;
  overflow: hidden;
  transition: width 0.2s ease;
  position: relative;
`;

const SidebarTabs = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid var(--border-color);
  height: 100%;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${props => (props.$active ? 'var(--active-color)' : 'transparent')};
  border: none;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  svg {
    font-size: 18px;
  }
  
  span {
    display: none;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow: auto;
`;

const CollapseButton = styled.button`
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  svg {
    font-size: 16px;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ width, collapsed }) => {
  const dispatch = useDispatch();
  const { sidebarMode } = useSelector((state: RootState) => state.ui);
  
  const handleTabChange = (mode: 'notes' | 'tags' | 'search' | 'links') => {
    dispatch(setSidebarMode(mode));
  };
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  // Render the appropriate sidebar content based on current mode
  const renderContent = () => {
    if (collapsed) return null;
    
    switch (sidebarMode) {
      case 'notes':
        return <NotesList />;
      case 'tags':
        return <TagsList />;
      case 'search':
        return <SearchView />;
      case 'links':
        return <LinksView />;
      default:
        return <NotesList />;
    }
  };
  
  return (
    <SidebarContainer width={width} $collapsed={collapsed}>
      <SidebarTabs $collapsed={collapsed}>
        <TabButton 
          $active={sidebarMode === 'notes'} 
          onClick={() => handleTabChange('notes')}
          title="Notes"
        >
          <VscNote />
        </TabButton>
        
        <TabButton 
          $active={sidebarMode === 'tags'} 
          onClick={() => handleTabChange('tags')}
          title="Tags"
        >
          <VscTag />
        </TabButton>
        
        <TabButton 
          $active={sidebarMode === 'search'} 
          onClick={() => handleTabChange('search')}
          title="Search"
        >
          <VscSearch />
        </TabButton>
        
        <TabButton 
          $active={sidebarMode === 'links'} 
          onClick={() => handleTabChange('links')}
          title="Links"
        >
          <VscLink />
        </TabButton>
      </SidebarTabs>
      
      <SidebarContent>
        {renderContent()}
      </SidebarContent>
      
      <CollapseButton 
        onClick={handleToggleSidebar} 
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <VscChevronRight /> : <VscChevronLeft />}
      </CollapseButton>
    </SidebarContainer>
  );
};

export default Sidebar;