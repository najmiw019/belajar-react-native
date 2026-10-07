const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const postsFile = path.join(__dirname, 'posts.json');
const uploadsDirectory = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsDirectory, {recursive: true});

function readPosts() {
  return JSON.parse(fs.readFileSync(postsFile, 'utf8'));
}

function writePosts(posts) {
  fs.writeFileSync(postsFile, `${JSON.stringify(posts, null, 2)}\n`);
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadsDirectory),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {fileSize: 5 * 1024 * 1024},
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('File harus berupa gambar'));
      return;
    }
    callback(null, true);
  },
});

const app = express();

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

app.get('/api/posts', (_request, response) => {
  try {
    response.json({data: readPosts()});
  } catch (error) {
    console.error('Failed to read posts:', error);
    response.status(500).json({message: 'Failed to read posts'});
  }
});

app.get('/api/posts/:id', (request, response) => {
  try {
    const post = readPosts().find(item => item.id === request.params.id);
    if (!post) {
      response.status(404).json({message: 'Post tidak ditemukan'});
      return;
    }
    response.json({data: post});
  } catch (error) {
    console.error('Failed to read post:', error);
    response.status(500).json({message: 'Failed to read post'});
  }
});

app.post('/api/posts', upload.single('image'), (request, response) => {
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';
  if (!title) {
    if (request.file) {
      fs.unlinkSync(request.file.path);
    }
    response.status(400).json({
      errors: [{path: 'title', msg: 'Title wajib diisi'}],
      message: 'Title wajib diisi',
    });
    return;
  }

  try {
    const posts = readPosts();
    const post = {
      id: crypto.randomUUID(),
      title,
      content: typeof request.body.content === 'string' ? request.body.content : '',
      image: request.file?.filename || '',
    };
    posts.push(post);
    writePosts(posts);
    response.status(201).json({data: post});
  } catch (error) {
    if (request.file) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Failed to save post:', error);
    response.status(500).json({message: 'Failed to save post'});
  }
});

app.put('/api/posts/:id', upload.single('image'), (request, response) => {
  const title = typeof request.body.title === 'string' ? request.body.title.trim() : '';
  if (!title) {
    if (request.file) {
      fs.unlinkSync(request.file.path);
    }
    response.status(400).json({
      errors: [{path: 'title', msg: 'Title wajib diisi'}],
      message: 'Title wajib diisi',
    });
    return;
  }

  try {
    const posts = readPosts();
    const index = posts.findIndex(item => item.id === request.params.id);
    if (index === -1) {
      if (request.file) {
        fs.unlinkSync(request.file.path);
      }
      response.status(404).json({message: 'Post tidak ditemukan'});
      return;
    }

    posts[index] = {
      ...posts[index],
      title,
      content:
        typeof request.body.content === 'string'
          ? request.body.content
          : posts[index].content || '',
      image: request.file?.filename || posts[index].image || '',
    };
    writePosts(posts);
    response.json({data: posts[index]});
  } catch (error) {
    if (request.file) {
      fs.unlinkSync(request.file.path);
    }
    console.error('Failed to update post:', error);
    response.status(500).json({message: 'Failed to update post'});
  }
});

app.delete('/api/posts/:id', (request, response) => {
  try {
    const posts = readPosts();
    const post = posts.find(item => item.id === request.params.id);
    if (!post) {
      response.status(404).json({message: 'Post tidak ditemukan'});
      return;
    }

    writePosts(posts.filter(item => item.id !== request.params.id));

    if (post.image) {
      const imagePath = path.join(uploadsDirectory, path.basename(post.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    response.json({message: 'Post berhasil dihapus'});
  } catch (error) {
    console.error('Failed to delete post:', error);
    response.status(500).json({message: 'Failed to delete post'});
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    response.status(400).json({message: 'Ukuran gambar maksimal 5 MB'});
    return;
  }
  if (error instanceof Error) {
    response.status(400).json({message: error.message});
    return;
  }
  response.status(500).json({message: 'Terjadi kesalahan pada server'});
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Posts API listening on http://0.0.0.0:${PORT}`);
});
