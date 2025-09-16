const express = require('express')
const router = express.Router();
const multer = require('multer')  
const supabase = require('../supabaseClient.cjs')
const { v4: uuidv4 } = require('uuid')
const fileModel = require('../models/file.models')
const authMiddleware = require('../middlewares/auth.js')
const upload = multer({ storage: multer.memoryStorage() })

router.get('/home', authMiddleware, async (req,res) => {
  const userFiles = await fileModel.find({
    user: req.user.userId
  })
  console.log(userFiles);
  
  res.render('home',{
    files: userFiles
  });
})


router.post('/upload-file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { originalname, buffer } = req.file
    
    const uniqueName = `${Date.now()}-${uuidv4()}-${originalname}`
    const { data, error } = await supabase.storage
      .from('database') 
      .upload(`uploads/${uniqueName}`, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: req.file.mimetype,
      })
    
    const newFile = await fileModel.create({
      user: req.user.userId,
      path: `uploads/${uniqueName}`,
      originalName: req.file.originalname,

    })

    if (error) throw error
    res.json({ success: true, data })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/download/:path', authMiddleware, async (req,res)=>{
  
  const loggedInUserId = req.user.userId;
  const path = decodeURIComponent(req.params.path);

  const file = await fileModel.findOne({
    user: loggedInUserId,
    path: path
  })
  
  if(!file){
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }

  const { data, error } = await supabase.storage.from('database').createSignedUrl(path, 60);
  res.redirect(data.signedUrl)

})

module.exports = router;