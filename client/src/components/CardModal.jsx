import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import * as cardDetailsApi from '../api/cardDetails.js';
import * as cardsApi from '../api/cards.js';
import DueDateBadge from './DueDateBadge.jsx';
import { useAuth } from '../hooks/useAuth.js';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const LABEL_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#a855f7', '#0ea5e9'];

export default function CardModal({ card: initialCard, listId, onClose, onUpdate }) {
  const { user } = useAuth();
  const [card, setCard] = useState(initialCard);
  const [commentText, setCommentText] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(initialCard.title);
  const [editingDesc, setEditingDesc] = useState(false);
  const [description, setDescription] = useState(initialCard.description || '');
  const [dueDate, setDueDate] = useState(initialCard.dueDate ? initialCard.dueDate.slice(0, 10) : '');
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState({});
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  async function refreshCard() {
    try {
      const fullCard = await cardDetailsApi.getCard(card.id);
      setCard(fullCard);
      onUpdate(fullCard);
    } catch {
      // keep existing data
    }
  }

  useEffect(() => {
    refreshCard();
  }, []);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  async function saveTitle() {
    if (!title.trim()) {
      setTitle(card.title);
      setEditingTitle(false);
      return;
    }
    try {
      const updated = await cardsApi.updateCard(listId, card.id, { title: title.trim() });
      setCard((prev) => ({ ...prev, title: updated.title }));
      onUpdate({ ...card, title: updated.title });
    } catch {
      toast.error('Failed to update title');
      setTitle(card.title);
    }
    setEditingTitle(false);
  }

  async function saveDescription() {
    try {
      const updated = await cardsApi.updateCard(listId, card.id, { description });
      setCard((prev) => ({ ...prev, description: updated.description }));
      onUpdate({ ...card, description: updated.description });
    } catch {
      toast.error('Failed to update description');
    }
    setEditingDesc(false);
  }

  async function saveDueDate(value) {
    setDueDate(value);
    try {
      const payload = value ? { dueDate: value } : { dueDate: null };
      const updated = await cardsApi.updateCard(listId, card.id, payload);
      setCard((prev) => ({ ...prev, dueDate: updated.dueDate }));
      onUpdate({ ...card, dueDate: updated.dueDate });
    } catch {
      toast.error('Failed to update due date');
    }
  }

  async function handleAddLabel() {
    if (!labelText.trim()) return;
    try {
      await cardDetailsApi.addLabel(card.id, {
        text: labelText.trim(),
        color: labelColor,
      });
      await refreshCard();
      setLabelText('');
      setShowLabelForm(false);
    } catch {
      toast.error('Failed to add label');
    }
  }

  async function handleDeleteLabel(labelId) {
    try {
      await cardDetailsApi.deleteLabel(card.id, labelId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete label');
    }
  }

  async function handleAddChecklist() {
    if (!newChecklistTitle.trim()) return;
    try {
      await cardDetailsApi.addChecklist(card.id, {
        title: newChecklistTitle.trim(),
      });
      await refreshCard();
      setNewChecklistTitle('');
      setShowChecklistForm(false);
    } catch {
      toast.error('Failed to add checklist');
    }
  }

  async function handleDeleteChecklist(checklistId) {
    try {
      await cardDetailsApi.deleteChecklist(card.id, checklistId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete checklist');
    }
  }

  async function handleAddChecklistItem(checklistId) {
    const text = newItemTexts[checklistId]?.trim();
    if (!text) return;
    try {
      await cardDetailsApi.addChecklistItem(card.id, checklistId, { text });
      await refreshCard();
      setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }));
    } catch {
      toast.error('Failed to add item');
    }
  }

  async function handleToggleItem(checklistId, itemId) {
    try {
      await cardDetailsApi.toggleChecklistItem(card.id, checklistId, itemId);
      await refreshCard();
    } catch {
      toast.error('Failed to toggle item');
    }
  }

  async function handleDeleteItem(checklistId, itemId) {
    try {
      await cardDetailsApi.deleteChecklistItem(card.id, checklistId, itemId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete item');
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    try {
      await cardDetailsApi.addComment(card.id, { text: commentText.trim() });
      await refreshCard();
      setCommentText('');
    } catch {
      toast.error('Failed to post comment');
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await cardDetailsApi.deleteComment(card.id, commentId);
      await refreshCard();
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-md flex items-start justify-center z-50 overflow-y-auto py-12 px-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-void-850 border border-gray-200 dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 w-full max-w-2xl p-6 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg p-1.5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="mb-6 pr-8">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setTitle(card.title);
                  setEditingTitle(false);
                }
              }}
              className="font-display text-xl font-bold w-full bg-gray-50 dark:bg-void-900 border border-indigo-400 dark:border-neon-cyan/40 rounded-lg px-3 py-1.5 outline-none text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-400/30 dark:focus:ring-neon-cyan/30"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] rounded-lg px-3 py-1.5 -mx-3 transition-colors"
            >
              {card.title}
            </h2>
          )}
        </div>

        {/* Labels */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Labels</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {card.labels?.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-white text-xs font-semibold border border-white/[0.1]"
                style={{ backgroundColor: `${label.color}cc`, boxShadow: `0 0 10px ${label.color}33` }}
              >
                {label.text}
                <button
                  onClick={() => handleDeleteLabel(label.id)}
                  className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>

          {showLabelForm ? (
            <div className="bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.06] rounded-xl p-3 animate-fade-in">
              <input
                type="text"
                placeholder="Label text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="w-full bg-white dark:bg-void-800 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 mb-2 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
              />
              <div className="flex gap-2 mb-3">
                {LABEL_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setLabelColor(color)}
                    className={`w-7 h-7 rounded-lg transition-all ${
                      labelColor === color ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-void-900 ring-gray-400 dark:ring-white/40 scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLabel}
                  className="bg-gradient-to-r from-neon-indigo to-neon-cyan text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:shadow-glow-sm transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowLabelForm(false)}
                  className="text-gray-500 hover:text-gray-300 px-3 py-1.5 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLabelForm(true)}
              className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-neon-cyan hover:bg-gray-50 dark:hover:bg-white/[0.03] px-2 py-1 rounded-lg transition-all"
            >
              + Add Label
            </button>
          )}
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Due Date</h3>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => saveDueDate(e.target.value)}
              className="bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
            />
            {card.dueDate && (
              <>
                <DueDateBadge date={card.dueDate} />
                <button
                  onClick={() => saveDueDate('')}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Description</h3>
          {editingDesc ? (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 resize-y transition-all"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveDescription}
                  className="bg-gradient-to-r from-neon-indigo to-neon-cyan text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:shadow-glow-sm transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setDescription(card.description || '');
                    setEditingDesc(false);
                  }}
                  className="text-gray-500 hover:text-gray-300 px-3 py-1.5 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingDesc(true)}
              className="min-h-[60px] bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.04] rounded-lg p-3 text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-gray-300 dark:hover:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-void-800 transition-all whitespace-pre-wrap"
            >
              {card.description || 'Add a more detailed description...'}
            </div>
          )}
        </div>

        {/* Checklists */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Checklists</h3>

          {card.checklists?.map((checklist) => {
            const total = checklist.items?.length || 0;
            const checked = checklist.items?.filter((i) => i.checked).length || 0;
            const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

            return (
              <div key={checklist.id} className="mb-4 bg-gray-50 dark:bg-void-900 rounded-xl p-3 border border-gray-200 dark:border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display font-semibold text-gray-800 dark:text-gray-200 text-sm">{checklist.title}</h4>
                  <button
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 w-8 font-mono">{percent}%</span>
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent === 100
                          ? 'bg-gradient-to-r from-emerald-400 to-green-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                          : 'bg-gradient-to-r from-neon-indigo to-neon-cyan'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-0.5 mb-2">
                  {checklist.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 group hover:bg-gray-100 dark:hover:bg-white/[0.02] rounded-lg px-1.5 py-1 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleToggleItem(checklist.id, item.id)}
                      />
                      <span
                        className={`flex-1 text-sm transition-colors ${
                          item.checked ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(checklist.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an item..."
                    value={newItemTexts[checklist.id] || ''}
                    onChange={(e) =>
                      setNewItemTexts((prev) => ({
                        ...prev,
                        [checklist.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                    className="flex-1 bg-white dark:bg-void-800 border border-gray-200 dark:border-white/[0.06] rounded-lg px-2.5 py-1.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-1 focus:ring-indigo-400/30 dark:focus:ring-neon-cyan/30 transition-all"
                  />
                  <button
                    onClick={() => handleAddChecklistItem(checklist.id)}
                    className="bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-white/[0.06] px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}

          {showChecklistForm ? (
            <div className="flex gap-2 animate-fade-in">
              <input
                type="text"
                placeholder="Checklist title..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
                autoFocus
                className="flex-1 bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 transition-all"
              />
              <button
                onClick={handleAddChecklist}
                className="bg-gradient-to-r from-neon-indigo to-neon-cyan text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:shadow-glow-sm transition-all"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowChecklistForm(false);
                  setNewChecklistTitle('');
                }}
                className="text-gray-500 hover:text-gray-300 px-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowChecklistForm(true)}
              className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-neon-cyan hover:bg-gray-50 dark:hover:bg-white/[0.03] px-2 py-1 rounded-lg transition-all"
            >
              + Add Checklist
            </button>
          )}
        </div>

        {/* Comments */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comments</h3>

          {/* Add comment */}
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-indigo to-neon-cyan flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment..."
                rows={2}
                className="w-full bg-gray-50 dark:bg-void-900 border border-gray-200 dark:border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-neon-cyan/30 focus:border-indigo-400 dark:focus:border-neon-cyan/40 resize-none transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="mt-1.5 bg-gradient-to-r from-neon-indigo to-neon-cyan text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:shadow-glow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-3">
            {card.comments?.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 group">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-void-700 border border-gray-300 dark:border-white/[0.08] flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {comment.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.user?.name}</span>
                    <span className="text-[11px] text-gray-600 font-mono">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                </div>
                {user?.id === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1 self-start"
                    title="Delete comment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
