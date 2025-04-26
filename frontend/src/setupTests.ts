import '@testing-library/jest-dom';

// Mock the window.api object for tests
window.api = {
  notes: {
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((noteData) => ({
      id: 'test-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...noteData,
    })),
    update: jest.fn().mockImplementation((id, noteData) => ({
      id,
      updatedAt: new Date().toISOString(),
      ...noteData,
    })),
    delete: jest.fn().mockResolvedValue(true),
    getByTag: jest.fn().mockResolvedValue([]),
    getLinked: jest.fn().mockResolvedValue([]),
  },
  tags: {
    list: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((tagData) => ({
      id: 'test-tag-id',
      createdAt: new Date().toISOString(),
      ...tagData,
    })),
    update: jest.fn().mockImplementation((id, tagData) => ({
      id,
      ...tagData,
    })),
    delete: jest.fn().mockResolvedValue(true),
    findByName: jest.fn().mockResolvedValue(null),
  },
};