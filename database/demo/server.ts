import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { DatabaseService, Note, Tag } from '../src';
import expressLayouts from 'express-ejs-layouts';

const app = express();
const port = 3000;

// Configure Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database service
const dbService = new DatabaseService();

// Connect to Redis before starting the server
async function startServer() {
  try {
    await dbService.initialize();
    console.log('Connected to Redis');
    
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

// Home page - Display all notes and tags
app.get('/', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    const tagService = dbService.getTagService();
    
    const notes = await noteService.listNotes();
    const tags = await tagService.listTags();
    
    res.render('index', { notes, tags });
  } catch (error) {
    console.error('Error getting notes and tags:', error);
    res.status(500).render('error', { error });
  }
});

// Get note details
app.get('/notes/:id', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    const tagService = dbService.getTagService();
    
    const note = await noteService.getNote(req.params.id);
    const tags = await tagService.listTags();
    
    res.render('note', { note, tags });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).render('error', { error });
  }
});

// Create note form
app.get('/new-note', async (req, res) => {
  try {
    const tagService = dbService.getTagService();
    const tags = await tagService.listTags();
    
    res.render('new-note', { tags });
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).render('error', { error });
  }
});

// Create note action
app.post('/notes', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    
    const { title, content, tags } = req.body;
    const selectedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
    
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content: { plainText: content },
      tags: selectedTags,
      links: []
    };
    
    await noteService.createNote(newNote);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).render('error', { error });
  }
});

// Delete note action
app.post('/notes/:id/delete', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    await noteService.deleteNote(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).render('error', { error });
  }
});

// Update note form
app.get('/notes/:id/edit', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    const tagService = dbService.getTagService();
    
    const note = await noteService.getNote(req.params.id);
    const tags = await tagService.listTags();
    
    res.render('edit-note', { note, tags });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(500).render('error', { error });
  }
});

// Update note action
app.post('/notes/:id', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    
    const { title, content, tags } = req.body;
    const selectedTags = Array.isArray(tags) ? tags : tags ? [tags] : [];
    
    const updatedNote = {
      title,
      content: { plainText: content },
      tags: selectedTags
    };
    
    await noteService.updateNote(req.params.id, updatedNote);
    res.redirect(`/notes/${req.params.id}`);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).render('error', { error });
  }
});

// Tags

// Create tag form
app.get('/new-tag', (req, res) => {
  res.render('new-tag');
});

// Create tag action
app.post('/tags', async (req, res) => {
  try {
    const tagService = dbService.getTagService();
    
    const { name, color, description } = req.body;
    
    const newTag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      color,
      description
    };
    
    await tagService.createTag(newTag);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).render('error', { error });
  }
});

// Delete tag action
app.post('/tags/:id/delete', async (req, res) => {
  try {
    const tagService = dbService.getTagService();
    await tagService.deleteTag(req.params.id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).render('error', { error });
  }
});

// Get notes by tag
app.get('/tags/:id/notes', async (req, res) => {
  try {
    const noteService = dbService.getNoteService();
    const tagService = dbService.getTagService();
    
    const tag = await tagService.getTag(req.params.id);
    const notes = await noteService.findNotesByTag(tag.name);
    
    res.render('tag-notes', { tag, notes });
  } catch (error) {
    console.error('Error getting notes by tag:', error);
    res.status(500).render('error', { error });
  }
});

// Start the server
startServer();