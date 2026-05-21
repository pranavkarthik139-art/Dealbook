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
    return <div style={{
      height: '160px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}><Spinner /></div>;
  }

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--text-lg)',
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: '0 0 var(--space-6) 0'
      }}>Daily To-Do</h2>
      <Card>
        <form onSubmit={handleAddTodo} style={{
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--line)'
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a task..."
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-family-sans)',
                backgroundColor: 'var(--paper)',
                outline: 'none',
                transition: 'border-color var(--transition-base), box-shadow var(--transition-base)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cobalt)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--cobalt-light)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !input.trim()}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: submitting || !input.trim() ? 'var(--ink-lighter)' : 'var(--ink)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: submitting || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color var(--transition-base)',
                opacity: submitting || !input.trim() ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting && input.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--ink-light)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--ink)';
              }}
            >
              {submitting ? '...' : 'Add'}
            </button>
          </div>
        </form>

        {incompleteTodos.length === 0 && completedTodos.length === 0 ? (
          <p style={{
            color: 'var(--ink-lighter)',
            textAlign: 'center',
            paddingTop: 'var(--space-8)',
            paddingBottom: 'var(--space-8)',
            margin: 0
          }}>No tasks. You're all set!</p>
        ) : (
          <div>
            {incompleteTodos.length > 0 && (
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--ink-light)',
                  marginBottom: 'var(--space-3)',
                  margin: '0 0 var(--space-3) 0'
                }}>Pending</h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}>
                  {incompleteTodos.map((todo) => (
                    <div key={todo.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)'
                    }}>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTodo(todo)}
                        style={{
                          marginTop: 'var(--space-1)',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: 'var(--cobalt)'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--ink)',
                          margin: 0
                        }}>{todo.content}</p>
                        {todo.deal && (
                          <p style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--ink-lighter)',
                            margin: 'var(--space-1) 0 0 0'
                          }}>{todo.deal.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--ink-lighter)',
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'color var(--transition-base)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-lighter)'}
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
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--ink-light)',
                  marginBottom: 'var(--space-3)',
                  margin: '0 0 var(--space-3) 0'
                }}>Completed</h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  opacity: 0.6
                }}>
                  {completedTodos.map((todo) => (
                    <div key={todo.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-3)'
                    }}>
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleTodo(todo)}
                        style={{
                          marginTop: 'var(--space-1)',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          accentColor: 'var(--success)'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--ink-lighter)',
                          margin: 0,
                          textDecoration: 'line-through'
                        }}>{todo.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--ink-lighter)',
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'color var(--transition-base)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-lighter)'}
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
