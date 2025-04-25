import { Note, Tag } from '../src/models/types';

// In-memory storage for tests
export const testData = {
  notes: new Map<string, Note>(),
  tags: new Map<string, Tag>()
};

// Mocked Redis client for tests
export const createMockRedisClient = () => {
  const client: any = {
    // Mock basic Redis operations
    get: jest.fn((key: string) => {
      if (key.startsWith('note:')) {
        const id = key.substring(5);
        return Promise.resolve(testData.notes.get(id) || null);
      } else if (key.startsWith('tag:')) {
        const id = key.substring(4);
        return Promise.resolve(testData.tags.get(id) || null);
      }
      return Promise.resolve(null);
    }),
    set: jest.fn((key: string, value: string) => {
      if (key.startsWith('note:')) {
        const id = key.substring(5);
        const note = JSON.parse(value) as Note;
        testData.notes.set(id, note);
      } else if (key.startsWith('tag:')) {
        const id = key.substring(4);
        const tag = JSON.parse(value) as Tag;
        testData.tags.set(id, tag);
      }
      return Promise.resolve('OK');
    }),
    del: jest.fn((key: string) => {
      if (key.startsWith('note:')) {
        const id = key.substring(5);
        return Promise.resolve(testData.notes.delete(id) ? 1 : 0);
      } else if (key.startsWith('tag:')) {
        const id = key.substring(4);
        return Promise.resolve(testData.tags.delete(id) ? 1 : 0);
      }
      return Promise.resolve(0);
    }),
    exists: jest.fn((key: string) => {
      if (key.startsWith('note:')) {
        const id = key.substring(5);
        return Promise.resolve(testData.notes.has(id) ? 1 : 0);
      } else if (key.startsWith('tag:')) {
        const id = key.substring(4);
        return Promise.resolve(testData.tags.has(id) ? 1 : 0);
      }
      return Promise.resolve(0);
    }),
    keys: jest.fn((pattern: string) => {
      if (pattern.startsWith('note:*')) {
        return Promise.resolve(Array.from(testData.notes.keys()).map(id => `note:${id}`));
      } else if (pattern.startsWith('tag:*')) {
        return Promise.resolve(Array.from(testData.tags.keys()).map(id => `tag:${id}`));
      }
      return Promise.resolve([]);
    }),
    ping: jest.fn().mockResolvedValue('PONG'),
    flushall: jest.fn(() => {
      testData.notes.clear();
      testData.tags.clear();
      return Promise.resolve('OK');
    }),
    quit: jest.fn().mockResolvedValue('OK'),

    // Mock Redis JSON operations
    json: {
      set: jest.fn((key: string, path: string, value: any) => {
        if (key.startsWith('note:')) {
          const id = key.substring(5);
          testData.notes.set(id, value);
        } else if (key.startsWith('tag:')) {
          const id = key.substring(4);
          testData.tags.set(id, value);
        }
        return Promise.resolve('OK');
      }),
      get: jest.fn((key: string) => {
        if (key.startsWith('note:')) {
          const id = key.substring(5);
          return Promise.resolve(testData.notes.get(id) || null);
        } else if (key.startsWith('tag:')) {
          const id = key.substring(4);
          return Promise.resolve(testData.tags.get(id) || null);
        }
        return Promise.resolve(null);
      })
    },

    // Mock Redis multi operations
    multi: jest.fn(() => {
      const commands: Array<{ key: string, cmd: string }> = [];
      const pipeline = {
        json: {
          get: (key: string) => {
            commands.push({ key, cmd: 'get' });
            return pipeline;
          }
        },
        exec: jest.fn(() => {
          const results = commands.map(({ key, cmd }) => {
            if (cmd === 'get') {
              if (key.startsWith('note:')) {
                const id = key.substring(5);
                return testData.notes.get(id) || null;
              } else if (key.startsWith('tag:')) {
                const id = key.substring(4);
                return testData.tags.get(id) || null;
              }
            }
            return null;
          });
          commands.length = 0; // Clear commands after execution
          return Promise.resolve(results);
        })
      };
      return pipeline;
    })
  };

  return client;
};

// Reset test data
export const resetTestData = () => {
  testData.notes.clear();
  testData.tags.clear();
};