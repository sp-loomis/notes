import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Component,
  CreateComponentData,
  UpdateComponentData,
  ComponentType,
} from '../../database/models/component';
import { ComponentVersion } from '../../database/models/component-version';
import { componentRepository } from '../../database';

// Define the context type
interface ComponentsContextType {
  components: Component[];
  selectedComponent: Component | null;
  selectedVersion: ComponentVersion | null;
  loading: boolean;
  error: string | null;
  loadComponentsForNote: (noteId: number) => Promise<void>;
  selectComponent: (componentId: number) => Promise<void>;
  loadComponentVersion: (versionId: string) => Promise<void>;
  loadLatestVersion: (componentId: number) => Promise<void>;
  createComponent: (data: CreateComponentData, initialContent: string) => Promise<number>;
  updateComponent: (id: number, data: UpdateComponentData) => Promise<boolean>;
  updateComponentContent: (componentId: number, content: string) => Promise<string>;
  deleteComponent: (id: number) => Promise<boolean>;
}

// Create the context with default values
const ComponentsContext = createContext<ComponentsContextType>({
  components: [],
  selectedComponent: null,
  selectedVersion: null,
  loading: false,
  error: null,
  loadComponentsForNote: async () => {},
  selectComponent: async () => {},
  loadComponentVersion: async () => {},
  loadLatestVersion: async () => {},
  createComponent: async () => -1,
  updateComponent: async () => false,
  updateComponentContent: async () => '',
  deleteComponent: async () => false,
});

// Custom hook to use the components context
export const useComponents = () => useContext(ComponentsContext);

// Provider component
export const ComponentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ComponentVersion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load components for a note
  const loadComponentsForNote = async (noteId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComponents = await componentRepository.getComponentsByNoteId(noteId);
      setComponents(fetchedComponents);
      // Reset selections when loading new note components
      setSelectedComponent(null);
      setSelectedVersion(null);
    } catch (err) {
      setError(`Failed to load components: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading components:', err);
    } finally {
      setLoading(false);
    }
  };

  // Select a component by ID
  const selectComponent = async (componentId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const component = await componentRepository.getComponentById(componentId);
      setSelectedComponent(component);
      if (component) {
        await loadLatestVersion(componentId);
      } else {
        setSelectedVersion(null);
      }
    } catch (err) {
      setError(`Failed to select component: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error selecting component:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load a specific component version
  const loadComponentVersion = async (versionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const version = await componentRepository.getComponentVersion(versionId);
      setSelectedVersion(version);
    } catch (err) {
      setError(`Failed to load version: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error loading version:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load the latest version of a component
  const loadLatestVersion = async (componentId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const latestVersion = await componentRepository.getLatestComponentVersion(componentId);
      setSelectedVersion(latestVersion);
    } catch (err) {
      setError(
        `Failed to load latest version: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error('Error loading latest version:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new component with initial content
  const createComponent = async (
    data: CreateComponentData,
    initialContent: string
  ): Promise<number> => {
    try {
      setLoading(true);
      setError(null);
      const componentId = await componentRepository.createComponent(data);

      if (componentId > 0) {
        // Create initial version with content
        await componentRepository.createComponentVersion(componentId, initialContent);
        // Refresh components list
        await loadComponentsForNote(data.noteId);
      }

      return componentId;
    } catch (err) {
      setError(`Failed to create component: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error creating component:', err);
      return -1;
    } finally {
      setLoading(false);
    }
  };

  // Update a component
  const updateComponent = async (id: number, data: UpdateComponentData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await componentRepository.updateComponent(id, data);

      if (success && selectedComponent && selectedComponent.id === id) {
        // Update the selected component if it was modified
        const updatedComponent = await componentRepository.getComponentById(id);
        setSelectedComponent(updatedComponent);
      }

      if (success && components.length > 0) {
        // Refresh the component that was updated in the components list
        const componentIndex = components.findIndex((c) => c.id === id);
        if (componentIndex >= 0) {
          const updatedComponent = await componentRepository.getComponentById(id);
          if (updatedComponent) {
            const updatedComponents = [...components];
            updatedComponents[componentIndex] = updatedComponent;
            setComponents(updatedComponents);
          }
        }
      }

      return success;
    } catch (err) {
      setError(`Failed to update component: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error updating component:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update component content (creates a new version)
  const updateComponentContent = async (componentId: number, content: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const versionId = await componentRepository.createComponentVersion(componentId, content);

      // Load the new version
      if (versionId) {
        await loadComponentVersion(versionId);
      }

      return versionId;
    } catch (err) {
      setError(`Failed to update content: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error updating content:', err);
      return '';
    } finally {
      setLoading(false);
    }
  };

  // Delete a component
  const deleteComponent = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await componentRepository.deleteComponent(id);

      if (success) {
        // Reset selections if the deleted component was selected
        if (selectedComponent && selectedComponent.id === id) {
          setSelectedComponent(null);
          setSelectedVersion(null);
        }

        // Remove component from the list
        setComponents((prevComponents) => prevComponents.filter((c) => c.id !== id));
      }

      return success;
    } catch (err) {
      setError(`Failed to delete component: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Error deleting component:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentsContext.Provider
      value={{
        components,
        selectedComponent,
        selectedVersion,
        loading,
        error,
        loadComponentsForNote,
        selectComponent,
        loadComponentVersion,
        loadLatestVersion,
        createComponent,
        updateComponent,
        updateComponentContent,
        deleteComponent,
      }}
    >
      {children}
    </ComponentsContext.Provider>
  );
};

export default ComponentsContext;
