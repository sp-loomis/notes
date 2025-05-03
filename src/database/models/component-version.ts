/**
 * Component version model representing a version of a component's content
 */
export interface ComponentVersion {
  id: string;
  componentId: number;
  content: string;
  createdAt: Date;
}

/**
 * Data needed to create a new component version
 */
export interface CreateComponentVersionData {
  componentId: number;
  content: string;
}
