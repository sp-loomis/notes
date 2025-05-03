/**
 * Tag model representing a tag in the application
 */
export interface Tag {
  id: number;
  name: string;
  color: string;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data needed to create a new tag
 */
export interface CreateTagData {
  name: string;
  color: string;
  parentId?: number | null;
}

/**
 * Data for updating an existing tag
 */
export interface UpdateTagData {
  name?: string;
  color?: string;
  parentId?: number | null;
}

/**
 * Represents a tag in a hierarchical structure
 */
export interface TagTreeNode extends Tag {
  children: TagTreeNode[];
}