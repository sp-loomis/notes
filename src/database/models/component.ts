/**
 * Component model representing a note component in the application
 */
export interface Component {
  id: number;
  noteId: number;
  name: string;
  type: ComponentType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Available component types
 */
export enum ComponentType {
  Markup = 'Markup',
  Image = 'Image',
  GeoJSON = 'GeoJSON',
  TLDraw = 'TLDraw',
}

/**
 * Data needed to create a new component
 */
export interface CreateComponentData {
  noteId: number;
  name: string;
  type: ComponentType;
}

/**
 * Data for updating an existing component
 */
export interface UpdateComponentData {
  name?: string;
  type?: ComponentType;
}
