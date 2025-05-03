import { Database } from 'sqlite3';
import { SQLiteComponentRepository } from '../../src/database/repositories/sqlite-component-repository';
import { Component, ComponentType } from '../../src/database/models/component';
import { ComponentVersion } from '../../src/database/models/component-version';

// Mock database
const mockDb = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
} as unknown as Database;

describe('SQLiteComponentRepository', () => {
  let repository: SQLiteComponentRepository;
  const dateNow = new Date();

  // Mock component
  const mockComponent: Component = {
    id: 1,
    noteId: 1,
    name: 'Test Component',
    type: ComponentType.Markup,
    createdAt: dateNow,
    updatedAt: dateNow,
  };

  // Mock component version
  const mockVersion: ComponentVersion = {
    id: 'abc123',
    componentId: 1,
    content: '<p>Test content</p>',
    createdAt: dateNow,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteComponentRepository(mockDb);

    // Mock Date constructor to return a consistent date for testing
    jest.spyOn(global, 'Date').mockImplementation(() => dateNow as unknown as Date);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createComponent', () => {
    it('should create a component successfully', async () => {
      // Mock successful component creation
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ lastID: 1 }, null);
        }
      );

      const result = await repository.createComponent({
        noteId: 1,
        name: 'Test Component',
        type: ComponentType.Markup,
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO components'),
        [1, 'Test Component', 'Markup', dateNow.toISOString(), dateNow.toISOString()],
        expect.any(Function)
      );

      expect(result).toBe(1);
    });

    it('should reject when database operation fails', async () => {
      // Mock database error
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(new Error('Database error'), undefined);
        }
      );

      await expect(
        repository.createComponent({
          noteId: 1,
          name: 'Test Component',
          type: ComponentType.Markup,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getComponentById', () => {
    it('should get a component by ID', async () => {
      // Mock successful component retrieval
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          if (params[0] === 1) {
            callback(null, {
              id: 1,
              noteId: 1,
              name: 'Test Component',
              type: 'Markup',
              createdAt: dateNow.toISOString(),
              updatedAt: dateNow.toISOString(),
            });
          } else {
            callback(null, null);
          }
        }
      );

      const result = await repository.getComponentById(1);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1],
        expect.any(Function)
      );

      expect(result).toEqual(mockComponent);
    });

    it('should return null when component is not found', async () => {
      // Mock component not found
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, null);
        }
      );

      const result = await repository.getComponentById(999);

      expect(result).toBeNull();
    });
  });

  describe('getComponentsByNoteId', () => {
    it('should get all components for a note', async () => {
      // Mock components retrieval
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          if (params[0] === 1) {
            callback(null, [
              {
                id: 1,
                noteId: 1,
                name: 'Test Component 1',
                type: 'Markup',
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
              {
                id: 2,
                noteId: 1,
                name: 'Test Component 2',
                type: 'Image',
                createdAt: dateNow.toISOString(),
                updatedAt: dateNow.toISOString(),
              },
            ]);
          } else {
            callback(null, []);
          }
        }
      );

      const result = await repository.getComponentsByNoteId(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE note_id = ?'),
        [1],
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Component 1');
      expect(result[1].type).toBe('Image');
    });

    it('should return an empty array when no components exist for the note', async () => {
      // Mock no components found
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, []);
        }
      );

      const result = await repository.getComponentsByNoteId(999);

      expect(result).toEqual([]);
    });
  });

  describe('updateComponent', () => {
    it('should update a component successfully', async () => {
      // Mock successful component update
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ changes: 1 }, null);
        }
      );

      const result = await repository.updateComponent(1, {
        name: 'Updated Component',
        type: ComponentType.Image,
      });

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE components SET'),
        ['Updated Component', 'Image', dateNow.toISOString(), 1],
        expect.any(Function)
      );

      expect(result).toBe(true);
    });

    it('should return false when no component is found to update', async () => {
      // Mock no component found
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ changes: 0 }, null);
        }
      );

      const result = await repository.updateComponent(999, {
        name: 'Updated Component',
      });

      expect(result).toBe(false);
    });

    it('should return false when no update data is provided', async () => {
      const result = await repository.updateComponent(1, {});
      expect(result).toBe(false);
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });

  describe('deleteComponent', () => {
    it('should delete a component successfully', async () => {
      // Mock successful component deletion
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ changes: 1 }, null);
        }
      );

      const result = await repository.deleteComponent(1);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM components'),
        [1],
        expect.any(Function)
      );

      expect(result).toBe(true);
    });

    it('should return false when no component is found to delete', async () => {
      // Mock no component found
      (mockDb.run as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback.call({ changes: 0 }, null);
        }
      );

      const result = await repository.deleteComponent(999);

      expect(result).toBe(false);
    });
  });

  describe('createComponentVersion', () => {
    it('should create a component version successfully', async () => {
      // Mock successful version creation and component update
      (mockDb.run as jest.Mock)
        .mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          // First call - insert version
          callback(null);
        })
        .mockImplementationOnce((sql: string, params: any[], callback: Function) => {
          // Second call - update component
          callback(null);
        });

      const content = '<p>Test content</p>';
      const result = await repository.createComponentVersion(1, content);

      // Check that the version was created
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO component_versions'),
        expect.arrayContaining([expect.any(String), 1, content, dateNow.toISOString()]),
        expect.any(Function)
      );

      // Check that the component was updated
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE components SET updated_at'),
        [dateNow.toISOString(), 1],
        expect.any(Function)
      );

      // Should return a string version ID
      expect(typeof result).toBe('string');
      expect(result.length).toBe(16);
    });
  });

  describe('getComponentVersions', () => {
    it('should get all versions for a component', async () => {
      // Mock versions retrieval
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          if (params[0] === 1) {
            callback(null, [
              {
                id: 'abc123',
                componentId: 1,
                content: '<p>Version 1</p>',
                createdAt: dateNow.toISOString(),
              },
              {
                id: 'def456',
                componentId: 1,
                content: '<p>Version 2</p>',
                createdAt: new Date(dateNow.getTime() - 60000).toISOString(), // 1 minute earlier
              },
            ]);
          } else {
            callback(null, []);
          }
        }
      );

      const result = await repository.getComponentVersions(1);

      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE component_id = ?'),
        [1],
        expect.any(Function)
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('abc123');
      expect(result[1].content).toBe('<p>Version 2</p>');
    });

    it('should return an empty array when no versions exist', async () => {
      // Mock no versions found
      (mockDb.all as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, []);
        }
      );

      const result = await repository.getComponentVersions(999);

      expect(result).toEqual([]);
    });
  });

  describe('getComponentVersion', () => {
    it('should get a specific component version', async () => {
      // Mock version retrieval
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          if (params[0] === 'abc123') {
            callback(null, {
              id: 'abc123',
              componentId: 1,
              content: '<p>Test content</p>',
              createdAt: dateNow.toISOString(),
            });
          } else {
            callback(null, null);
          }
        }
      );

      const result = await repository.getComponentVersion('abc123');

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        ['abc123'],
        expect.any(Function)
      );

      expect(result).toEqual(mockVersion);
    });

    it('should return null when version is not found', async () => {
      // Mock version not found
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, null);
        }
      );

      const result = await repository.getComponentVersion('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getLatestComponentVersion', () => {
    it('should get the latest version for a component', async () => {
      // Mock latest version retrieval
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          if (params[0] === 1) {
            callback(null, {
              id: 'latest123',
              componentId: 1,
              content: '<p>Latest content</p>',
              createdAt: dateNow.toISOString(),
            });
          } else {
            callback(null, null);
          }
        }
      );

      const result = await repository.getLatestComponentVersion(1);

      expect(mockDb.get).toHaveBeenCalledWith(expect.any(String), [1], expect.any(Function));

      expect(result).toEqual({
        id: 'latest123',
        componentId: 1,
        content: '<p>Latest content</p>',
        createdAt: dateNow,
      });
    });

    it('should return null when no versions exist', async () => {
      // Mock no versions found
      (mockDb.get as jest.Mock).mockImplementation(
        (sql: string, params: any[], callback: Function) => {
          callback(null, null);
        }
      );

      const result = await repository.getLatestComponentVersion(999);

      expect(result).toBeNull();
    });
  });
});
