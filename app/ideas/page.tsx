"use client";

import { useEffect, useState } from 'react';
import React from 'react';
import { getAllIdeas, saveIdea, deleteIdea, clearIdeas } from './db';

const colors = {
  accent: '#2563eb',
  cardBorder: '#e5e7eb',
  cardBg: '#fff',
  buttonBg: '#2563eb',
  buttonText: '#fff',
  heading: '#22223b',
};

type IdeaAuthor = {
  _id: string;
  email?: string;
};

type Idea = {
  _id: string;
  description?: string;
  author?: IdeaAuthor | string;
  createdAt?: string;
  updatedAt?: string;
};

export default function IdeasPage() {
  const [description, setDescription] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<null | Idea>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  useEffect(() => {
    async function fetchMeAndIdeas() {
      if (isOnline) {
        try {
          const me = await fetch('/api/auth/me');
          const meData = await me.json();
          if (me.ok && meData.user) setUser(meData.user);
        } catch (err) {
          // fallback to local ideas
          const localIdeas = await getAllIdeas();
          setIdeas(localIdeas);
        }
      } else {
        const localIdeas = await getAllIdeas();
        setIdeas(localIdeas);
      }
    }
    fetchMeAndIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  async function fetchIdeas() {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load ideas');
      setIdeas(data.ideas || []);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setMessage(m);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return setMessage('You must be logged in to create an idea');
    setMessage('Creating...');
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setDescription('');
      setMessage('Idea created');
      // prepend
      setIdeas((s) => [data.idea, ...s]);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setMessage(m);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return setMessage('You must be logged in to delete an idea');
    if (!confirm('Delete this idea?')) return;
    try {
      const res = await fetch('/api/ideas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setIdeas((s) => s.filter((i) => i._id !== id));
      setMessage('Deleted');
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setMessage(m);
    }
  }

  function formatDate(d?: string) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  function startEdit(idea: Idea) {
    setEditingId(idea._id);
    setEditDescription(idea.description || '');
    setMessage('');
  }

  async function saveEdit(id: string) {
    if (!editDescription) return setMessage('Description is required');
    try {
      const res = await fetch('/api/ideas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      // replace idea in list
      setIdeas((s) => s.map((it) => (it._id === id ? data.idea : it)));
      setEditingId(null);
      setEditDescription('');
      setMessage('Updated');
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setMessage(m);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDescription('');
  }

  async function handleAddIdea() {
    const newIdea = {
      _id: Date.now().toString(),
      description,
      author: user?.id || 'offline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: !isOnline,
    };
    setIdeas(prev => [newIdea, ...prev]);
    await saveIdea(newIdea);
    setDescription('');
    setMessage('Idea saved locally. Will sync when online.');
    if (isOnline) {
      // TODO: Sync to server
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans">
        <main className="w-full max-w-md rounded-md bg-white p-8 shadow">
          <h2 className="mb-4 text-xl font-semibold">Please login</h2>
          <p className="text-sm">You need to login first on the home page to add or delete ideas.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center font-sans py-8 px-4 relative overflow-x-hidden" style={{ background: '#f8fafc' }}>
      {/* floating logout button top-right */}
      {user && (
        <button
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm rounded-lg shadow-sm transition-all duration-300"
          style={{ background: colors.cardBg, color: colors.accent, border: `2px solid ${colors.cardBorder}` }}
          onClick={logout}
        >
          Logout
        </button>
      )}
      <main className="w-full max-w-lg sm:max-w-2xl lg:max-w-4xl rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg relative z-10" style={{ background: colors.cardBg, border: `2px solid ${colors.cardBorder}` }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: colors.heading }}>{'Ideas'}</h1>
        </div>
        {!editingId && (
          <form onSubmit={handleCreate} className="mb-8 flex flex-col gap-4">
            <textarea
              placeholder="Share your brilliant idea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg px-4 py-3"
              style={{
                background: colors.cardBg,
                border: `2px solid ${colors.cardBorder}`,
                color: colors.heading,
                transition: 'all 0.3s',
              }}
              rows={4}
              required
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg px-6 py-3 font-semibold"
                style={{
                  background: colors.buttonBg,
                  color: colors.buttonText,
                  boxShadow: `0 2px 8px 0 #2563eb22`,
                  transition: 'all 0.3s',
                }}
              >
                Share idea
              </button>
              <button
                type="button"
                className="rounded-lg px-6 py-3 font-medium"
                style={{
                  background: colors.cardBg,
                  border: `2px solid ${colors.cardBorder}`,
                  color: colors.accent,
                  transition: 'all 0.3s',
                }}
                onClick={() => setDescription('')}
              >
                Clear
              </button>
            </div>
          </form>
        )}
        {message && (
          <p className="mb-6 text-sm fade-in px-4 py-2 rounded-lg" style={{ background: colors.cardBg, color: colors.heading }}>
            {message}
          </p>
        )}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ideas.length === 0 && (
            <p className="text-sm col-span-full text-center py-8 fade-in" style={{ color: colors.heading }}>
              No ideas yet. Be the first to share one!
            </p>
          )}
          {ideas.map((idea, index) => {
            const authorId = String(typeof idea.author === 'object' ? idea.author._id : (idea.author || ''));
            const isOwner = user && String(user.id) === authorId;
            return (
              <article
                key={idea._id}
                className="card rounded-xl p-5 sm:p-6 cursor-pointer animate-pop-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  background: colors.cardBg,
                  border: `2px solid ${colors.cardBorder}`,
                  color: colors.heading,
                  boxShadow: `0 2px 8px 0 #2563eb22`,
                  transition: 'all 0.3s',
                }}
                onClick={() => {
                  if (!editingId) setSelectedIdea(idea);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* owner controls (not triggering modal) */}
                    {isOwner && editingId !== idea._id && (
                      <>
                        <button
                          className="text-xs flex items-center gap-1 hover:text-blue-700 text-blue-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(idea);
                          }}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414L15.414 4.586a1 1 0 00-1.414 0L4 14.586V20z" />
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          className="text-xs flex items-center gap-1 hover:text-red-700 text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(idea._id);
                          }}
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4l1 2h-6l1-2z" />
                          </svg>
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </>
                    )}
                    {isOwner && editingId === idea._id && (
                      <>
                        <button
                          className="text-xs hover:text-teal-light transition-colors duration-200"
                          style={{ color: colors.accent }}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit(idea._id);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="text-xs hover:text-gray-600 transition-colors duration-200"
                          style={{ color: colors.accent }}
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === idea._id ? (
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-2 rounded-lg w-full"
                    style={{
                      background: colors.cardBg,
                      border: `2px solid ${colors.cardBorder}`,
                      color: colors.heading,
                      transition: 'all 0.3s',
                    }}
                    rows={3}
                  />
                ) : (
                  idea.description && (
                    <p className="text-sm line-clamp-3 leading-relaxed animate-fade-in" style={{ color: colors.heading }}>{idea.description}</p>
                  )
                )}
                <div className="mt-4 text-xs flex flex-col gap-1 animate-fade-in" style={{ color: colors.heading }}>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(idea.createdAt)}
                  </div>
                  {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {formatDate(idea.updatedAt)}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* Modal for full idea */}
        {selectedIdea && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 animate-fade-in" 
            style={{ background: 'rgba(0,0,0,0.08)' }}
            onClick={() => setSelectedIdea(null)}
          >
            <div 
              className="card rounded-xl p-6 sm:p-8 max-w-xl w-full pop-in shadow-xl animate-pop-in" 
              onClick={(e) => e.stopPropagation()}
              style={{ background: colors.cardBg, color: colors.heading, border: `2px solid ${colors.cardBorder}` }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: colors.heading }}>Your Idea</h2>
                <button 
                  className="rounded-lg p-2 hover:bg-gray-100/50 transition-colors duration-200"
                  style={{ color: colors.accent }}
                  onClick={() => setSelectedIdea(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 text-sm sm:text-base whitespace-pre-wrap leading-relaxed animate-fade-in" style={{ color: colors.heading }}>
                {selectedIdea.description}
              </div>
              <div className="mt-6 flex flex-col gap-1 text-xs animate-fade-in" style={{ color: colors.heading }}>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(selectedIdea.createdAt)}
                </div>
                {selectedIdea.updatedAt && selectedIdea.updatedAt !== selectedIdea.createdAt && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {formatDate(selectedIdea.updatedAt)}
                  </div>
                )}
              </div>
              <div className="mt-8 flex gap-3 justify-end animate-fade-in">
                {user && String(typeof selectedIdea.author === 'object' ? selectedIdea.author._id : selectedIdea.author) === String(user.id) && (
                  <>
                    <button
                      className="px-4 py-1.5 rounded text-xs text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      onClick={() => {
                        setSelectedIdea(null);
                        startEdit(selectedIdea);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-1.5 rounded text-xs text-red-600 hover:text-red-700 transition-colors duration-200"
                      onClick={async () => {
                        await handleDelete(selectedIdea._id);
                        setSelectedIdea(null);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
