import { Component, CreateComponentData, UpdateComponentData } from '../models/component';
import { ComponentVersion } from '../models/component-version';

/**
 * Repository interface for component operations
 */
export interface ComponentRepository {
  /**
   * Creates a new component
   * @param data Component creation data
   * @returns Promise resolving to the ID of the created component
   */
  createComponent(data: CreateComponentData): Promise<number>;

  /**
   * Gets a component by ID
   * @param id Component ID
   * @returns Promise resolving to the component or null if not found
   */
  getComponentById(id: number): Promise<Component | null>;

  /**
   * Gets all components for a note
   * @param noteId Note ID
   * @returns Promise resolving to an array of components
   */
  getComponentsByNoteId(noteId: number): Promise<Component[]>;

  /**
   * Updates a component
   * @param id Component ID
   * @param data Component update data
   * @returns Promise resolving to true if successful, false if component not found
   */
  updateComponent(id: number, data: UpdateComponentData): Promise<boolean>;

  /**
   * Deletes a component and all its versions
   * @param id Component ID
   * @returns Promise resolving to true if successful, false if component not found
   */
  deleteComponent(id: number): Promise<boolean>;

  /**
   * Creates a new version for a component
   * @param componentId Component ID
   * @param content Component content
   * @returns Promise resolving to the version ID
   */
  createComponentVersion(componentId: number, content: string): Promise<string>;

  /**
   * Gets all versions for a component
   * @param componentId Component ID
   * @returns Promise resolving to an array of component versions
   */
  getComponentVersions(componentId: number): Promise<ComponentVersion[]>;

  /**
   * Gets a specific component version
   * @param versionId Version ID
   * @returns Promise resolving to the component version or null if not found
   */
  getComponentVersion(versionId: string): Promise<ComponentVersion | null>;

  /**
   * Gets the latest version for a component
   * @param componentId Component ID
   * @returns Promise resolving to the latest component version or null if none exists
   */
  getLatestComponentVersion(componentId: number): Promise<ComponentVersion | null>;
}
