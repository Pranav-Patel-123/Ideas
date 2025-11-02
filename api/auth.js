/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcryptjs');
const connect = require('./db');
const User = require('../models/user');

async function signup(email, password) {
  await connect();
  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await User.create({ email, password: hash });
  return { id: user._id, email: user.email };
}

async function login(email, password) {
  await connect();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');
  return { id: user._id, email: user.email };
}

module.exports = { signup, login };
