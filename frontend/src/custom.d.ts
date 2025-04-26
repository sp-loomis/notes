interface Window {
  api: {
    notes: {
      list: () => Promise<any[]>;
      get: (id: string) => Promise<any>;
      create: (noteData: any) => Promise<any>;
      update: (id: string, noteData: any) => Promise<any>;
      delete: (id: string) => Promise<boolean>;
      getByTag: (tag: string) => Promise<any[]>;
      getLinked: (noteId: string) => Promise<any[]>;
    };
    tags: {
      list: () => Promise<any[]>;
      get: (id: string) => Promise<any>;
      create: (tagData: any) => Promise<any>;
      update: (id: string, tagData: any) => Promise<any>;
      delete: (id: string) => Promise<boolean>;
      findByName: (name: string) => Promise<any>;
    };
  };
}