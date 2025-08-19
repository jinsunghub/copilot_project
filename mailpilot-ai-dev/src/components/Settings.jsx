import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    general: {
      language: 'ko',
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 5
    },
    notifications: {
      notifications: true,
      soundAlerts: false,
      desktopNotifications: false
    },
    ai: {
      aiModel: 'qwen',
      useLocalModel: true,
      modelPath: '',
      maxTokens: 2048,
      temperature: 0.7
    },
    email: {
      emailsPerPage: 20,
      autoMarkRead: false,
      confirmDelete: true,
      defaultFolder: 'INBOX'
    },
    security: {
      sessionTimeout: 30,
      autoLogout: true,
      encryptLocalData: false,
      twoFactorAuth: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('general');
  
  // 서명 관리 상태
  const [signatures, setSignatures] = useState([]);
  const [signatureEnabled, setSignatureEnabled] = useState(true);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [editingSignature, setEditingSignature] = useState(null);
  const [signatureForm, setSignatureForm] = useState({
    name: '',
    content: '',
    html_content: '',
    is_html: false
  });

  // DB에서 설정 불러오기
  useEffect(() => {
    fetchSettings();
    if (activeCategory === 'signature') {
      fetchSignatures();
      fetchSignatureSettings();
    }
  }, [activeCategory]);
  
  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/settings', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings({
          general: data.settings.general || settings.general,
          notifications: data.settings.notifications || settings.notifications,
          ai: data.settings.ai || settings.ai,
          email: data.settings.email || settings.email,
          security: data.settings.security || settings.security
        });
      }
    } catch (error) {
      console.error('[설정] 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 설정 저장 (DB로)
  const handleSave = async () => {
    try {
      // 1. 서명이 편집 중이면 먼저 서명 저장
      if (isEditingSignature) {
        // HTML 서명이면 html_content, 일반 서명이면 content 확인
        const hasContent = signatureForm.is_html 
          ? signatureForm.html_content.trim()
          : signatureForm.content.trim();
          
        if (!hasContent) {
          alert('서명 내용을 입력해주세요.');
          return;
        }

        const url = editingSignature 
          ? `http://localhost:5001/api/signatures/${editingSignature.id}`
          : 'http://localhost:5001/api/signatures';
        
        const method = editingSignature ? 'PUT' : 'POST';

        console.log('[설정] 서명 저장 요청:', {
          url,
          method,
          form: signatureForm
        });

        const signatureResponse = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(signatureForm)
        });

        const signatureData = await signatureResponse.json();
        console.log('[설정] 서명 저장 응답:', signatureData);
        
        if (!signatureData.success) {
          alert(signatureData.error || '서명 저장에 실패했습니다.');
          return;
        }

        // 서명 저장 성공 후 상태 정리
        setIsEditingSignature(false);
        setEditingSignature(null);
        setSignatureForm({ name: '내 서명', content: '', html_content: '', is_html: false });
        
        // 서명 목록 새로고침
        await fetchSignatures();
        
        // 서명 업데이트 이벤트 발송
        window.dispatchEvent(new CustomEvent('signatureUpdated'));
      }

      // 2. 일반 설정 저장
      const response = await fetch('http://localhost:5001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(isEditingSignature ? '서명과 설정이 저장되었습니다.' : '설정이 저장되었습니다.');
        onClose();
      } else {
        alert('설정 저장 실패: ' + (data.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('[설정] 저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  // 설정 변경 핸들러
  const handleChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  // 설정 초기화
  const handleReset = async (category = null) => {
    if (!confirm(category ? `${category} 설정을 초기화하시겠습니까?` : '모든 설정을 초기화하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ category })
      });
      
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings({
          general: data.settings.general || settings.general,
          notifications: data.settings.notifications || settings.notifications,
          ai: data.settings.ai || settings.ai,
          email: data.settings.email || settings.email,
          security: data.settings.security || settings.security
        });
        alert('설정이 초기화되었습니다.');
      }
    } catch (error) {
      console.error('[설정] 초기화 실패:', error);
      alert('설정 초기화 중 오류가 발생했습니다.');
    }
  };

  // 서명 관련 함수들
  const fetchSignatures = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;

      const response = await fetch('http://localhost:5001/api/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      if (data.success) {
        setSignatures(data.signatures || []);
      }
    } catch (error) {
      console.error('[설정] 서명 조회 실패:', error);
    }
  };

  const fetchSignatureSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:5001/api/settings/MY_EMAIL/SIGNATURE_MANAGEMENT?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success && data.settings) {
        setSignatureEnabled(data.settings.enabled !== false);
      }
    } catch (error) {
      console.error('[설정] 서명 설정 조회 실패:', error);
    }
  };


  const handleEditSignature = (signature) => {
    setSignatureForm({
      name: '내 서명', // 고정된 이름 사용
      content: signature.content || '',
      html_content: signature.html_content || '',
      is_html: signature.is_html || false
    });
    setEditingSignature(signature);
    setIsEditingSignature(true);
  };

  const handleDeleteSignature = async (signatureId) => {
    if (!window.confirm('이 서명을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/signatures/${signatureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('서명이 삭제되었습니다.');
        fetchSignatures();
      } else {
        alert(data.error || '서명 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('[설정] 서명 삭제 실패:', error);
      alert('서명 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleSignature = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:5001/api/settings/MY_EMAIL/SIGNATURE_MANAGEMENT?email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          enabled: !signatureEnabled
        })
      });

      const data = await response.json();
      if (data.success) {
        setSignatureEnabled(!signatureEnabled);
        // 설정 업데이트 이벤트 발송
        window.dispatchEvent(new CustomEvent('signatureUpdated'));
      } else {
        alert(data.error || '서명 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('[설정] 서명 설정 변경 실패:', error);
      alert('서명 설정 변경 중 오류가 발생했습니다.');
    }
  };

  const cancelSignatureEdit = () => {
    setIsEditingSignature(false);
    setEditingSignature(null);
    setSignatureForm({ name: '내 서명', content: '', html_content: '', is_html: false });
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <div className="settings-header">
          <h2>설정</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p>설정을 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="settings-sidebar">
                <ul>
                  <li 
                    className={activeCategory === 'general' ? 'active' : ''}
                    onClick={() => setActiveCategory('general')}
                  >
                    일반
                  </li>
                  <li 
                    className={activeCategory === 'notifications' ? 'active' : ''}
                    onClick={() => setActiveCategory('notifications')}
                  >
                    알림
                  </li>
                  <li 
                    className={activeCategory === 'ai' ? 'active' : ''}
                    onClick={() => setActiveCategory('ai')}
                  >
                    AI 모델
                  </li>
                  <li 
                    className={activeCategory === 'email' ? 'active' : ''}
                    onClick={() => setActiveCategory('email')}
                  >
                    이메일
                  </li>
                  <li 
                    className={activeCategory === 'security' ? 'active' : ''}
                    onClick={() => setActiveCategory('security')}
                  >
                    보안
                  </li>
                  <li 
                    className={activeCategory === 'signature' ? 'active' : ''}
                    onClick={() => setActiveCategory('signature')}
                  >
                    서명 관리
                  </li>
                </ul>
              </div>

          <div className="settings-main">
            {/* 일반 설정 */}
            {activeCategory === 'general' && (
              <section className="settings-section">
                <h3>일반 설정</h3>
                
                <div className="setting-item">
                  <label>언어</label>
                  <select 
                    value={settings.general.language}
                    onChange={(e) => handleChange('general', 'language', e.target.value)}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>테마</label>
                  <select 
                    value={settings.general.theme}
                    onChange={(e) => handleChange('general', 'theme', e.target.value)}
                  >
                    <option value="light">라이트</option>
                    <option value="dark">다크</option>
                    <option value="auto">시스템 설정 따르기</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.general.autoRefresh}
                      onChange={(e) => handleChange('general', 'autoRefresh', e.target.checked)}
                    />
                    자동 새로고침
                  </label>
                </div>

                {settings.general.autoRefresh && (
                  <div className="setting-item">
                    <label>새로고침 간격 (분)</label>
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      value={settings.general.refreshInterval}
                      onChange={(e) => handleChange('general', 'refreshInterval', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </section>
            )}

            {/* AI 모델 설정 */}
            {activeCategory === 'ai' && (
              <section className="settings-section">
                <h3>AI 모델 설정</h3>
                
                <div className="setting-item">
                  <label>AI 모델 선택</label>
                  <select 
                    value={settings.ai.aiModel}
                    onChange={(e) => handleChange('ai', 'aiModel', e.target.value)}
                  >
                    <option value="qwen">Qwen (기본)</option>
                    <option value="mistral">Mistral-7B</option>
                    <option value="llama">Llama 3.2</option>
                    <option value="custom">사용자 정의</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.ai.useLocalModel}
                      onChange={(e) => handleChange('ai', 'useLocalModel', e.target.checked)}
                    />
                    로컬 모델 사용 (ONNX)
                  </label>
                </div>

                {settings.ai.useLocalModel && (
                  <div className="setting-item">
                    <label>모델 경로</label>
                    <input 
                      type="text"
                      placeholder="C:/Users/csw21/Downloads/model.onnx"
                      value={settings.ai.modelPath}
                      onChange={(e) => handleChange('ai', 'modelPath', e.target.value)}
                    />
                  </div>
                )}
                
                <div className="setting-item">
                  <label>최대 토큰 수</label>
                  <input 
                    type="number"
                    min="512"
                    max="4096"
                    value={settings.ai.maxTokens}
                    onChange={(e) => handleChange('ai', 'maxTokens', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="setting-item">
                  <label>Temperature (창의성)</label>
                  <input 
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.ai.temperature}
                    onChange={(e) => handleChange('ai', 'temperature', parseFloat(e.target.value))}
                  />
                </div>
              </section>
            )}
            
            {/* 알림 설정 */}
            {activeCategory === 'notifications' && (
              <section className="settings-section">
                <h3>알림 설정</h3>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.notifications.notifications}
                      onChange={(e) => handleChange('notifications', 'notifications', e.target.checked)}
                    />
                    알림 활성화
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.notifications.soundAlerts}
                      onChange={(e) => handleChange('notifications', 'soundAlerts', e.target.checked)}
                    />
                    소리 알림
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.notifications.desktopNotifications}
                      onChange={(e) => handleChange('notifications', 'desktopNotifications', e.target.checked)}
                    />
                    데스크톱 알림
                  </label>
                </div>
              </section>
            )}

            {/* 이메일 설정 */}
            {activeCategory === 'email' && (
              <section className="settings-section">
                <h3>이메일 설정</h3>
                
                <div className="setting-item">
                  <label>페이지당 이메일 수</label>
                  <input 
                    type="number"
                    min="10"
                    max="100"
                    value={settings.email.emailsPerPage}
                    onChange={(e) => handleChange('email', 'emailsPerPage', parseInt(e.target.value))}
                  />
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.email.autoMarkRead}
                      onChange={(e) => handleChange('email', 'autoMarkRead', e.target.checked)}
                    />
                    열람 시 자동으로 읽음 표시
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.email.confirmDelete}
                      onChange={(e) => handleChange('email', 'confirmDelete', e.target.checked)}
                    />
                    삭제 시 확인 메시지 표시
                  </label>
                </div>
              </section>
            )}
            
            {/* 보안 설정 */}
            {activeCategory === 'security' && (
              <section className="settings-section">
                <h3>보안 설정</h3>
                
                <div className="setting-item">
                  <label>세션 타임아웃 (분)</label>
                  <input 
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.security.autoLogout}
                      onChange={(e) => handleChange('security', 'autoLogout', e.target.checked)}
                    />
                    자동 로그아웃
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.security.encryptLocalData}
                      onChange={(e) => handleChange('security', 'encryptLocalData', e.target.checked)}
                    />
                    로컬 데이터 암호화
                  </label>
                </div>
                
                <div className="setting-item">
                  <label>
                    <input 
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                    2단계 인증
                  </label>
                </div>
              </section>
            )}

            {/* 서명 관리 */}
            {activeCategory === 'signature' && (
              <section className="settings-section">
                <h3>📝 서명 관리</h3>

                {/* 서명 사용 설정 */}
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={signatureEnabled}
                      onChange={handleToggleSignature}
                    />
                    서명 사용
                  </label>
                  <p className="setting-description">
                    {signatureEnabled 
                      ? '새 메일 작성 시 서명이 자동으로 추가됩니다.' 
                      : '서명 기능이 비활성화되어 있습니다.'}
                  </p>
                </div>

                {/* 서명 설정 */}
                <div className="signature-section">
                  <h4>내 서명</h4>
                  
                  {signatures.length === 0 ? (
                    <div className="empty-state">
                      <p>서명이 설정되지 않았습니다.</p>
                      <button 
                        onClick={() => {
                          setSignatureForm({ name: '내 서명', content: '', html_content: '', is_html: false });
                          setIsEditingSignature(true);
                        }} 
                        className="btn-add"
                        disabled={isEditingSignature}
                      >
                        서명 설정하기
                      </button>
                    </div>
                  ) : (
                    <div className="signature-display">
                      {signatures.map((signature) => (
                        <div key={signature.id} className="current-signature">
                          <div className="signature-info">
                            <div className="signature-preview">
                              {signature.is_html ? (
                                <div dangerouslySetInnerHTML={{ __html: signature.html_content }} />
                              ) : (
                                <pre>{signature.content}</pre>
                              )}
                            </div>
                            <div className="signature-meta">
                              <span className="signature-type">
                                {signature.is_html ? '🌐 HTML 서명' : '📝 텍스트 서명'}
                              </span>
                              {signature.updated_at && (
                                <span className="signature-date">
                                  수정: {new Date(signature.updated_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleEditSignature(signature)}
                            className="btn-edit-signature"
                            disabled={isEditingSignature}
                          >
                            ✏️ 서명 수정
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 서명 편집 폼 */}
                {isEditingSignature && (
                  <div className="signature-form">
                    <h4>{editingSignature ? '서명 수정' : '서명 설정'}</h4>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={signatureForm.is_html}
                          onChange={(e) => setSignatureForm(prev => ({ ...prev, is_html: e.target.checked }))}
                        />
                        HTML 서명 사용
                      </label>
                    </div>

                    {signatureForm.is_html ? (
                      <div className="form-group">
                        <label>HTML 내용</label>
                        <textarea
                          value={signatureForm.html_content}
                          onChange={(e) => setSignatureForm(prev => ({ ...prev, html_content: e.target.value }))}
                          placeholder="<div>최수운<br/>MailPilot AI 개발팀<br/><a href='mailto:csw21c915@gmail.com'>csw21c915@gmail.com</a></div>"
                          className="form-textarea html-textarea"
                          rows={8}
                        />
                        {signatureForm.html_content && (
                          <div className="html-preview">
                            <h5>미리보기:</h5>
                            <div className="preview-content" dangerouslySetInnerHTML={{ __html: signatureForm.html_content }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>서명 내용</label>
                        <textarea
                          value={signatureForm.content}
                          onChange={(e) => setSignatureForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder={`최수운\nMailPilot AI 개발팀\ncsw21c915@gmail.com\n010-1234-5678`}
                          className="form-textarea"
                          rows={6}
                        />
                      </div>
                    )}

                    <div className="form-actions">
                      <button onClick={cancelSignatureEdit} className="btn-cancel">
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
            </>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn-reset" onClick={() => handleReset(activeCategory)}>
            현재 탭 초기화
          </button>
          <div>
            <button className="btn-cancel" onClick={onClose}>취소</button>
            <button className="btn-save" onClick={handleSave}>저장</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;