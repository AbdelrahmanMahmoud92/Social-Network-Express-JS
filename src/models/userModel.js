const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const userSchema = new mongoose.Schema({
  _id:{
     type: String, default: uuidv4
  }, // Assign UUID as the _id field
  name: String,
  email: {
    type: String, unique: true
  },
  bio : String,
  role: String,
  password: String,
  privacy: String,
},
  {timestamps : true} 


);

const User = mongoose.model('users', userSchema);

module.exports = User;