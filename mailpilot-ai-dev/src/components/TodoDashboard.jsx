// components/TodoDashboard.jsx (개선된 버전)
import React, { useState, useEffect } from 'react';
import './TodoDashboard.css';

const TodoDashboard = ({ email, appPassword }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [filterType, setFilterType] = useState('all'); // 'all', 'meeting', 'deadline', 'task', 'event'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // ✅ 새로 추가된 상태들
  const [newTodo, setNewTodo] = useState('');
  const [newTodoEmail, setNewTodoEmail] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ DB에서 할일 목록만 조회 (빠른 로딩)
  const loadTodos = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('[📋 할일 목록 로딩]');
      
      const response = await fetch(`http://localhost:5001/api/todos?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTodos(data.todos);
        console.log(`[✅ 할일 목록 로딩 완료] ${data.total_count}개`);
      } else {
        throw new Error(data.error || '할일 목록 로딩 실패');
      }
    } catch (err) {
      console.error('[❗할일 목록 로딩 오류]', err);
      setError(`할일 목록 로딩 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 할일 추출 (수동 버튼용 - 모든 이메일 재분석)
  const extractTodos = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('[📋 할일 추출 시작] 모든 이메일 재분석');
      
      const response = await fetch('http://localhost:5001/api/extract-todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          app_password: appPassword,
          email_ids: [] // 빈 배열 = 모든 메일 분석
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTodos(data.todos);
        console.log(`[✅ 할일 추출 완료] ${data.total_count}개`);
      } else {
        throw new Error(data.error || '할일 추출 실패');
      }
    } catch (err) {
      console.error('[❗할일 추출 오류]', err);
      setError(`할일 추출 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 새 할일 추가
  const addNewTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          type: 'task',
          title: newTodo,
          description: `사용자가 직접 추가한 할일`,
          date: newTodoDueDate || null,
          time: null,
          priority: 'medium',
          status: 'pending',
          source_email: newTodoEmail || null
        }),
      });

      if (response.ok) {
        setNewTodo('');
        setNewTodoEmail('');
        setNewTodoDueDate('');
        setShowAddForm(false);
        // DB에서 최신 할일 목록 다시 로딩
        loadTodos();
      }
    } catch (err) {
      console.error('[❗할일 추가 오류]', err);
    }
  };

  // 할일 상태 업데이트
  const updateTodoStatus = async (todoId, newStatus) => {
    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: todoId,
          status: newStatus,
          email: email
        }),
      });

      if (response.ok) {
        setTodos(todos.map(todo => 
          todo.id === todoId ? { ...todo, status: newStatus } : todo
        ));
      }
    } catch (err) {
      console.error('[❗할일 상태 업데이트 오류]', err);
    }
  };

  // ✅ 같은 이메일의 모든 할일 완료 처리
  const completeAllByEmail = async (sourceEmail) => {
    if (!sourceEmail) return;

    try {
      const todosByEmail = todos.filter(todo => 
        todo.source_email?.from === sourceEmail && todo.status !== 'completed'
      );

      // 각 할일의 상태를 완료로 업데이트
      const updatePromises = todosByEmail.map(todo => 
        updateTodoStatus(todo.id, 'completed')
      );

      await Promise.all(updatePromises);
      
      console.log(`[✅ 이메일별 일괄 완료] ${sourceEmail}: ${todosByEmail.length}개`);
    } catch (err) {
      console.error('[❗이메일별 완료 오류]', err);
    }
  };

  // ✅ 할일 삭제
  const deleteTodo = async (todoId) => {
    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: todoId,
          email: email
        }),
      });

      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== todoId));
      }
    } catch (err) {
      console.error('[❗할일 삭제 오류]', err);
    }
  };

  // ✅ 중복 할일 정리
  const cleanupDuplicates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/todos/cleanup-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ ${data.removed_count}개의 중복 할일이 제거되었습니다!`);
        // 할일 목록 새로고침 (DB에서 최신 데이터 로딩)
        loadTodos();
      } else {
        throw new Error(data.error || '중복 정리 실패');
      }
    } catch (err) {
      console.error('[❗중복 정리 오류]', err);
      setError(`중복 정리 실패: ${err.message}`);
    }
  };

  // 컴포넌트 마운트 시 할일 목록 로딩 (빠른 DB 조회)
  useEffect(() => {
    loadTodos();
  }, []);

  // 필터링된 할일들
  const filteredTodos = todos.filter(todo => {
    const typeMatch = filterType === 'all' || todo.type === filterType;
    const priorityMatch = filterPriority === 'all' || todo.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  // ✅ 날짜별로 할일 그룹화
  const getTodosByDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredTodos.filter(todo => {
      if (!todo.date) return false;
      const todoDateString = todo.date.split('T')[0];
      return todoDateString === dateString;
    });
  };

  // ✅ 오늘까지 마감인 할일들
  const getTodayAndOverdueTodos = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTodos.filter(todo => {
      if (!todo.date) return false;
      const todoDate = todo.date.split('T')[0];
      return todoDate <= today && todo.status !== 'completed';
    });
  };

  // 우선순위별 색상
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  // 타입별 아이콘
  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return '🤝';
      case 'deadline': return '⏰';
      case 'task': return '📋';
      case 'event': return '🎉';
      default: return '📝';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return '날짜 미정';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return '날짜 오류';
    }
  };

  // ✅ 마감일까지 남은 일수 계산
  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ✅ 마감일 색상 결정
  const getDueDateColor = (dueDate, completed) => {
    if (completed) return '#a0aec0';
    const days = getDaysUntilDue(dueDate);
    if (days === null) return '#718096';
    if (days < 0) return '#e53e3e'; // 지남
    if (days === 0) return '#dd6b20'; // 오늘
    if (days <= 3) return '#d69e2e'; // 3일 이내
    return '#38a169'; // 여유
  };

  // ✅ 캘린더 날짜 생성
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(selectedDate);

  // 통계 계산
  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    pending: todos.filter(t => t.status === 'pending').length,
    high_priority: todos.filter(t => t.priority === 'high').length,
    today_overdue: getTodayAndOverdueTodos().length
  };

  return (
    <div className="todo-dashboard">
      {/* 헤더 */}
      <div className="todo-header">
        <div className="header-left">
          <h1>📋 할일 관리</h1>
          <p>이메일에서 자동으로 추출된 할일과 일정을 관리하세요</p>
        </div>
        <div className="header-right">
          <button 
            className="extract-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ marginRight: '10px', backgroundColor: '#4CAF50' }}
          >
            ➕ 할일 추가
          </button>
          <button 
            className="extract-btn"
            onClick={cleanupDuplicates}
            style={{ marginRight: '10px', backgroundColor: '#ff6b6b' }}
            title="중복된 할일들을 제거합니다"
          >
            🗑️ 중복 정리
          </button>
          <button 
            className="extract-btn"
            onClick={extractTodos}
            disabled={loading}
          >
            {loading ? '🔄 분석 중...' : '📧 메일에서 할일 추출'}
          </button>
        </div>
      </div>

      {/* ✅ 할일 추가 폼 */}
      {showAddForm && (
        <div className="add-todo-form" style={{
          background: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>새 할일 추가</h3>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="할일 내용을 입력하세요..."
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <input
              type="date"
              value={newTodoDueDate}
              onChange={(e) => setNewTodoDueDate(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="email"
              value={newTodoEmail}
              onChange={(e) => setNewTodoEmail(e.target.value)}
              placeholder="관련 이메일 (선택사항)"
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addNewTodo}
              disabled={!newTodo.trim()}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: newTodo.trim() ? 'pointer' : 'not-allowed',
                opacity: newTodo.trim() ? 1 : 0.5
              }}
            >
              ✅ 추가
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '12px 24px',
                background: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ❌ 취소
            </button>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">전체 할일</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">완료됨</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">대기 중</div>
          </div>
        </div>
        <div className="stat-card high-priority">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.high_priority}</div>
            <div className="stat-label">긴급</div>
          </div>
        </div>
        <div className="stat-card today">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.today_overdue}</div>
            <div className="stat-label">오늘/지남</div>
          </div>
        </div>
      </div>

      {/* 필터 및 보기 옵션 */}
      <div className="todo-controls">
        <div className="filters">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 유형</option>
            <option value="meeting">회의</option>
            <option value="deadline">마감일</option>
            <option value="task">업무</option>
            <option value="event">이벤트</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 우선순위</option>
            <option value="high">긴급</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>

        <div className="view-modes">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 목록
          </button>
          <button
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 캘린더
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>메일에서 할일을 추출하고 있습니다...</p>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {!loading && !error && (
        <>
          {viewMode === 'list' && (
            <div className="todos-list">
              {filteredTodos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>할일이 없습니다</h3>
                  <p>메일에서 할일을 추출하거나 직접 추가해보세요.</p>
                </div>
              ) : (
                filteredTodos.map((todo, index) => (
                  <div key={index} className={`todo-item ${todo.status}`}>
                    <div className="todo-checkbox">
                      <input
                        type="checkbox"
                        checked={todo.status === 'completed'}
                        onChange={(e) => 
                          updateTodoStatus(todo.id, e.target.checked ? 'completed' : 'pending')
                        }
                      />
                    </div>

                    <div className="todo-content">
                      <div className="todo-header-row">
                        <div className="todo-type">
                          <span className="type-icon">{getTypeIcon(todo.type)}</span>
                          <span className="type-label">{todo.type}</span>
                        </div>
                        <div 
                          className="todo-priority" 
                          style={{ backgroundColor: getPriorityColor(todo.priority) }}
                        >
                          {todo.priority}
                        </div>
                      </div>

                      <h3 className="todo-title">{todo.title}</h3>
                      <p className="todo-description">{todo.description}</p>

                      <div className="todo-meta">
                        <div className="todo-date">
                          📅 {formatDate(todo.date)}
                          {todo.time && <span className="todo-time"> {todo.time}</span>}
                          {/* ✅ 마감일까지 남은 일수 표시 */}
                          {todo.date && todo.status !== 'completed' && (
                            <span 
                              style={{ 
                                color: getDueDateColor(todo.date, false),
                                fontWeight: 'bold',
                                marginLeft: '8px'
                              }}
                            >
                              {(() => {
                                const days = getDaysUntilDue(todo.date);
                                if (days === null) return '';
                                if (days < 0) return `(${Math.abs(days)}일 지남)`;
                                if (days === 0) return '(오늘 마감)';
                                return `(${days}일 남음)`;
                              })()}
                            </span>
                          )}
                        </div>
                        <div className="todo-source">
                          📧 {todo.source_email?.from || 'Unknown'}
                          {/* ✅ 같은 이메일 모두 완료 버튼 */}
                          {todo.source_email?.from && todo.source_email.from !== 'manual' && (
                            <button
                              onClick={() => completeAllByEmail(todo.source_email.from)}
                              style={{
                                marginLeft: '8px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              title="같은 이메일의 모든 할일 완료"
                            >
                              모두 완료
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="todo-actions">
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteTodo(todo.id)}
                        title="할일 삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ✅ 실제 작동하는 캘린더 뷰 */}
          {viewMode === 'calendar' && (
            <div className="calendar-view">
              <div className="calendar-header">
                <button 
                  className="calendar-nav"
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setSelectedDate(prev);
                  }}
                >
                  ‹
                </button>
                <h2 className="calendar-title">
                  {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
                </h2>
                <button 
                  className="calendar-nav"
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setMonth(next.getMonth() + 1);
                    setSelectedDate(next);
                  }}
                >
                  ›
                </button>
              </div>
              
              <div className="calendar-grid">
                {/* 요일 헤더 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '8px' }}>
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      padding: '12px',
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* 캘린더 날짜들 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dayTodos = getTodosByDate(day);
                    const hasTodos = dayTodos.length > 0;
                    const hasOverdue = dayTodos.some(todo => 
                      getDaysUntilDue(todo.date) < 0 && todo.status !== 'completed'
                    );
                    
                    return (
                      <div
                        key={index}
                        style={{
                          minHeight: '80px',
                          padding: '8px',
                          backgroundColor: isCurrentMonth ? 'white' : '#f8fafc',
                          border: isToday ? '2px solid #667eea' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isCurrentMonth ? 'white' : '#f8fafc';
                        }}
                      >
                        <div style={{
                          fontWeight: isToday ? 'bold' : 'normal',
                          color: isCurrentMonth ? (isToday ? '#667eea' : '#1e293b') : '#a0aec0',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          {day.getDate()}
                        </div>
                        
                        {hasTodos && (
                          <div>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: hasOverdue ? '#e53e3e' : '#38a169',
                              marginBottom: '2px'
                            }}></div>
                            <div style={{
                              fontSize: '10px',
                              color: '#64748b',
                              fontWeight: '500'
                            }}>
                              {dayTodos.length}개
                            </div>
                            {/* 할일 미리보기 */}
                            {dayTodos.slice(0, 2).map((todo, todoIndex) => (
                              <div key={todoIndex} style={{
                                fontSize: '9px',
                                color: todo.status === 'completed' ? '#a0aec0' : '#4a5568',
                                textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                                marginTop: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {getTypeIcon(todo.type)} {todo.title.slice(0, 10)}...
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TodoDashboard;