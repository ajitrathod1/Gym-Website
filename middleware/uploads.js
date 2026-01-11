const multer  = require('multer');
const sharp   = require('sharp');
const path    = require('path');
const fs      = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.route.path.includes('member') ? 'members' : 'posts';
    cb(null, path.join('public', 'uploads', folder));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

module.exports = function (req, res, next) {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ msg: 'Upload error' });
    if (!req.file) return next();

    const filepath = req.file.path;
    try {
      const optimizedPath = filepath.replace(/(\.\w+)$/, '_optimized$1');
      await sharp(filepath)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(optimizedPath);
      fs.unlinkSync(filepath);

      // ← leading slash pakka
      const webPath = `/uploads/${path.dirname(optimizedPath).split(path.sep).slice(-1)[0]}/${path.basename(optimizedPath)}`;
      req.file.filename = webPath;
      next();
    } catch (e) {
      console.error(e);
      res.status(500).json({ msg: 'Image processing failed' });
    }
  });
};