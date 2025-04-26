import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSidebarMode } from '../../store/uiSlice';
import { VscNote, VscTag, VscSearch, VscLink } from 'react-icons/vsc';
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


const Sidebar: React.FC<SidebarProps> = ({ width, collapsed }) => {
  const dispatch = useDispatch();
  const { sidebarMode } = useSelector((state: RootState) => state.ui);
  
  const handleTabChange = (mode: 'notes' | 'tags' | 'search' | 'links') => {
    dispatch(setSidebarMode(mode));
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
    </SidebarContainer>
  );
};

export default Sidebar;