import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchNotes, setCurrentNote } from '../../store/notesSlice';
import { setSearchQuery } from '../../store/uiSlice';
import { VscSearch, VscClose } from 'react-icons/vsc';
import { formatDate } from '../../utils/dateUtils';

const SearchContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SearchHeader = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 8px;
  color: var(--text-color);
  opacity: 0.7;
`;

const ClearIcon = styled.span`
  position: absolute;
  right: 8px;
  color: var(--text-color);
  opacity: 0.7;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 30px;
  border-radius: 3px;
  font-size: 14px;
`;

const SearchResults = styled.div`
  flex: 1;
  overflow: auto;
  padding: 10px;
`;

const SearchResultItem = styled.div`
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 3px;
  background-color: var(--secondary-color);
  cursor: pointer;
  
  &:hover {
    background-color: var(--hover-color);
  }
`;

const ResultTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const ResultExcerpt = styled.div`
  font-size: 12px;
  margin-bottom: 5px;
  
  .highlight {
    background-color: rgba(255, 255, 0, 0.2);
    padding: 0 2px;
  }
`;

const ResultMeta = styled.div`
  font-size: 11px;
  color: var(--text-color);
  opacity: 0.7;
  display: flex;
  justify-content: space-between;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 5px 0;
`;

const Tag = styled.span<{ color?: string }>`
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 3px;
  background-color: ${props => props.color || '#666'};
  color: #fff;
`;

const NoResults = styled.div`
  text-align: center;
  margin-top: 20px;
  color: var(--text-color);
  opacity: 0.7;
`;

const SearchView: React.FC = () => {
  const dispatch = useDispatch();
  const { notes } = useSelector((state: RootState) => state.notes);
  const { tags } = useSelector((state: RootState) => state.tags);
  const { searchQuery } = useSelector((state: RootState) => state.ui);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  
  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);
  
  useEffect(() => {
    // Update local state when redux state changes
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  useEffect(() => {
    // Perform search when query or notes change
    if (!localSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const query = localSearchQuery.toLowerCase();
    const results = notes.filter(note => {
      // Search in title
      if (note.title.toLowerCase().includes(query)) return true;
      
      // Search in content
      if (note.content.plainText?.toLowerCase().includes(query)) return true;
      
      // Search in tags
      if (note.tags.some(tag => tag.toLowerCase().includes(query))) return true;
      
      return false;
    });
    
    setSearchResults(results);
  }, [localSearchQuery, notes]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    dispatch(setSearchQuery(value));
  };
  
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
  };
  
  const handleSelectNote = (note: Note) => {
    dispatch(setCurrentNote(note));
  };
  
  // Function to find tag colors
  const getTagColor = (tagName: string): string | undefined => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color;
  };
  
  // Function to highlight search query in text
  const highlightText = (text: string, query: string): JSX.Element => {
    if (!query.trim() || !text) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="highlight">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };
  
  return (
    <SearchContainer>
      <SearchHeader>
        <SearchInputContainer>
          <SearchIcon>
            <VscSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search notes..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
          {localSearchQuery && (
            <ClearIcon onClick={handleClearSearch}>
              <VscClose />
            </ClearIcon>
          )}
        </SearchInputContainer>
      </SearchHeader>
      
      <SearchResults>
        {localSearchQuery ? (
          searchResults.length > 0 ? (
            <>
              <div>Found {searchResults.length} results for "{localSearchQuery}"</div>
              {searchResults.map(note => (
                <SearchResultItem 
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                >
                  <ResultTitle>
                    {highlightText(note.title, localSearchQuery)}
                  </ResultTitle>
                  
                  {note.tags.length > 0 && (
                    <TagsList>
                      {note.tags.map(tag => (
                        <Tag key={tag} color={getTagColor(tag)}>
                          {highlightText(tag, localSearchQuery)}
                        </Tag>
                      ))}
                    </TagsList>
                  )}
                  
                  <ResultExcerpt>
                    {note.content.plainText ? (
                      highlightText(
                        note.content.plainText.substring(0, 150) + 
                        (note.content.plainText.length > 150 ? '...' : ''),
                        localSearchQuery
                      )
                    ) : (
                      'No content'
                    )}
                  </ResultExcerpt>
                  
                  <ResultMeta>
                    <span>Updated: {formatDate(note.updatedAt)}</span>
                    {note.links.length > 0 && (
                      <span>{note.links.length} links</span>
                    )}
                  </ResultMeta>
                </SearchResultItem>
              ))}
            </>
          ) : (
            <NoResults>
              <p>No results found for "{localSearchQuery}"</p>
            </NoResults>
          )
        ) : (
          <NoResults>
            <p>Type to search notes</p>
          </NoResults>
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default SearchView;