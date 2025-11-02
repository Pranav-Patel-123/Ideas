/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema(
  {
    // single field for the idea text — no separate title
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { collection: 'ideas', timestamps: true }
);

module.exports = mongoose.models.Idea || mongoose.model('Idea', IdeaSchema);
