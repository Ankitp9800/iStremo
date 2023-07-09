const multer = require('multer');
const path = require('path');


// Create a storage engine for multer

const destinationFolder = path.join(__dirname, '../assets'); 
console.log("destinationFolder",destinationFolder);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder where the images will be stored
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.mimetype.split('/')[1];
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

// Create the multer middleware
const upload = multer({ storage });

// Export the middleware
module.exports = upload;
