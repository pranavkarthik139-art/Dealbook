'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';

interface Todo {
  id: number;
  content: string;
  completed: boolean;
  dealId: number | null;
  deal?: { name: string } | null;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const data = await response.json();
          setTodos(data);
        }
      } catch (error) {
        console.error('Failed to fetch todos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos([newTodo, ...todos]);
        setInput('');
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (response.ok) {
        setTodos(todos.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t)));
      }
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  if (loading) {
    return <div className="h-40 flex items-center justify-center"><Spinner /></div>;
  }

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div>
      <h2 className="text-lg font-serif font-bold text-slate-900 mb-4">Daily To-Do</h2>
      <Card>
        <form onSubmit={handleAddTodo} className="mb-4 pb-4 border-b border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '...' : 'Add'}
            </button>
          </div>
        </form>

        {incompleteTodos.length === 0 && completedTodos.length === 0 ? (
          <p className="text-slate-600 text-center py-8">No tasks. You're all set!</p>
        ) : (
          <div>
            {incompleteTodos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Pending</h3>
                <div className="space-y-2">
                  {incompleteTodos.map((todo) => (
                    <div key={todo.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTodo(todo)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{todo.content}</p>
                        {todo.deal && (
                          <p className="text-xs text-slate-500">{todo.deal.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedTodos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Completed</h3>
                <div className="space-y-2">
                  {completedTodos.map((todo) => (
                    <div key={todo.id} className="flex items-start gap-3 opacity-60">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleTodo(todo)}
                        className="mt-1 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 line-through">{todo.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-400 hover:text-red-600 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
