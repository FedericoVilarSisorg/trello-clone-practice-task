import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header.jsx';
import * as boardsApi from '../api/boards.js';

const PRESET_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

export default function BoardsPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const boards = await boardsApi.getBoards();
      setBoards(boards);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const board = await boardsApi.createBoard({ title: newTitle.trim(), color: newColor });
      setBoards((prev) => [...prev, board]);
      setNewTitle('');
      setNewColor(PRESET_COLORS[0]);
      setShowForm(false);
      toast.success('Board created');
    } catch {
      toast.error('Failed to create board');
    }
  }

  async function handleDeleteBoard(e, boardId, boardTitle) {
    e.stopPropagation();
    if (!window.confirm(`Delete board "${boardTitle}"? This cannot be undone.`)) return;
    try {
      await boardsApi.deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-void-950 relative">
      <div className="absolute inset-0 bg-mesh pointer-events-none hidden dark:block" />
      <Header />
      <main className="relative pt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="font-display text-2xl font-bold text-gradient mb-8">Your Boards</h1>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-300 dark:border-neon-cyan/20 border-t-indigo-600 dark:border-t-neon-cyan animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {boards.map((board, i) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/boards/${board.id}`)}
                  className="relative group rounded-xl h-32 p-4 cursor-pointer border border-white/10 dark:border-white/[0.06] hover:border-white/20 dark:hover:border-white/[0.15] transition-all duration-300 hover:shadow-lg dark:hover:shadow-neon hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden animate-slide-up"
                  style={{
                    background: `linear-gradient(135deg, ${board.color || '#6366f1'}dd, ${board.color || '#6366f1'}88)`,
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

                  <h3 className="relative text-white font-display font-bold text-base truncate pr-6 drop-shadow-sm">
                    {board.title}
                  </h3>

                  <div className="relative flex items-center gap-2.5 text-white/70 text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      {board.listCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {board.totalCards || 0}
                    </span>
                    {board.pastDueCount > 0 && (
                      <span className="bg-red-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">
                        {board.pastDueCount} overdue
                      </span>
                    )}
                    {board.dueSoonCount > 0 && (
                      <span className="bg-amber-500/90 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">
                        {board.dueSoonCount} soon
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 bg-black/30 hover:bg-red-500/80 text-white rounded-lg p-1.5 transition-all backdrop-blur-sm"
                    title="Delete board"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Create new board */}
              {showForm ? (
                <div className="bg-white dark:bg-void-800 border border-gray-200 dark:border-white/[0.08] rounded-xl p-4 animate-fade-in">
                  <form onSubmit={handleCreateBoard}>
                    <input
                      type="text"
                      placeholder="Board title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                      className="w-full bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 mb-3 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
                    />

                    <div className="flex gap-2 mb-3">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewColor(color)}
                          className={`w-7 h-7 rounded-lg transition-all ${
                            newColor === color
                              ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-void-800 ring-gray-400 dark:ring-white/40 scale-110'
                              : 'hover:scale-105 opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-neon-indigo to-neon-cyan text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:shadow-glow-cyan transition-all"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setNewTitle('');
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  onClick={() => setShowForm(true)}
                  className="border border-dashed border-gray-300 dark:border-white/[0.1] hover:border-indigo-400 dark:hover:border-neon-cyan/30 rounded-xl h-32 p-4 cursor-pointer transition-all flex items-center justify-center group hover:bg-indigo-50/50 dark:hover:bg-white/[0.02]"
                >
                  <span className="text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-neon-cyan font-medium text-sm flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    New board
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
