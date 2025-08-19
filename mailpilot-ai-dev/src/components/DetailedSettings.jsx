import React, { useState, useEffect } from 'react';
import './Settings.css';

const DetailedSettings = ({ onClose }) => {
  const [structure, setStructure] = useState({});
  const [settings, setSettings] = useState({});
  const [pendingChanges, setPendingChanges] = useState({}); // 저장되지 않은 변경사항
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('GENERAL');
  const [activeSubcategory, setActiveSubcategory] = useState('READ');
  const [saving, setSaving] = useState(false);

  // 설정 구조와 데이터 불러오기
  useEffect(() => {
    fetchSettingsStructure();
    fetchAllSettings();
  }, []);

  const fetchSettingsStructure = async () => {
    try {
      console.log('[🎯 프론트] 설정 구조 요청 시작');
      const response = await fetch('http://localhost:5001/api/settings/structure', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        console.log('[🎯 프론트] 설정 구조 로드 성공:', Object.keys(data.structure));
        setStructure(data.structure);
      } else {
        console.error('[🎯 프론트] 설정 구조 로드 실패:', data.error);
      }
    } catch (error) {
      console.error('[🎯 프론트] 설정 구조 불러오기 실패:', error);
    }
  };

  const fetchAllSettings = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        console.error('[DetailedSettings] 사용자 이메일이 없습니다.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:5001/api/settings?email=${encodeURIComponent(userEmail)}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('[설정] 데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 변경사항이 있는지 확인
  const hasChanges = () => {
    return Object.entries(pendingChanges).some(([pendingKey, pendingValue]) => {
      const [category, subcategory, fieldName] = pendingKey.split('.');
      const savedValue = settings[category]?.[subcategory]?.[fieldName];
      return pendingValue !== savedValue;
    });
  };

  // 실제 변경사항 개수 계산
  const getChangeCount = () => {
    return Object.entries(pendingChanges).filter(([pendingKey, pendingValue]) => {
      const [category, subcategory, fieldName] = pendingKey.split('.');
      const savedValue = settings[category]?.[subcategory]?.[fieldName];
      return pendingValue !== savedValue;
    }).length;
  };

  // 현재 값 가져오기 (저장된 값 + 변경사항)
  const getCurrentValue = (category, subcategory, fieldName, fieldInfo) => {
    const pendingKey = `${category}.${subcategory}.${fieldName}`;
    if (pendingChanges[pendingKey] !== undefined) {
      return pendingChanges[pendingKey];
    }
    const savedValue = settings[category]?.[subcategory]?.[fieldName];
    // 값이 없으면 기본값 사용
    if (savedValue === undefined || savedValue === null) {
      return fieldInfo?.default;
    }
    return savedValue;
  };

  // 필드 변경 (로컬 상태만 업데이트)
  const handleFieldChange = (category, subcategory, fieldName, value) => {
    console.log(`[🎯 프론트] 설정 변경 (로컬): ${category}/${subcategory}/${fieldName} = ${value}`);
    const pendingKey = `${category}.${subcategory}.${fieldName}`;
    
    setPendingChanges(prev => ({
      ...prev,
      [pendingKey]: value
    }));
  };

  // 모든 변경사항 저장
  const handleSaveAll = async () => {
    if (!hasChanges()) return;
    
    console.log('[🎯 프론트] 모든 변경사항 저장 시작');
    setSaving(true);
    
    try {
      const userEmail = localStorage.getItem('email');
      
      // 실제로 변경된 것만 필터링
      const actualChanges = Object.entries(pendingChanges).filter(([pendingKey, pendingValue]) => {
        const [category, subcategory, fieldName] = pendingKey.split('.');
        const savedValue = settings[category]?.[subcategory]?.[fieldName];
        return pendingValue !== savedValue;
      });
      
      for (const [pendingKey, value] of actualChanges) {
        const [category, subcategory, fieldName] = pendingKey.split('.');
        const url = `http://localhost:5001/api/settings/${category}/${subcategory}/${fieldName}`;
        
        console.log(`[🎯 프론트] API 요청: PUT ${url} = ${value}`);
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ 
            value,
            email: userEmail 
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(`${category}/${subcategory}/${fieldName} 저장 실패: ${data.error}`);
        }
      }
      
      // 성공시 실제 설정에 반영하고 변경사항 초기화
      const newSettings = { ...settings };
      for (const [pendingKey, value] of actualChanges) {
        const [category, subcategory, fieldName] = pendingKey.split('.');
        if (!newSettings[category]) newSettings[category] = {};
        if (!newSettings[category][subcategory]) newSettings[category][subcategory] = {};
        newSettings[category][subcategory][fieldName] = value;
      }
      
      setSettings(newSettings);
      setPendingChanges({});
      
      console.log('[✅ 프론트] 모든 설정 저장 완료');
      
      // 설정 업데이트 이벤트 발생 (WriteMail 등 다른 컴포넌트에 알림)
      window.dispatchEvent(new Event('settingsUpdated'));
      
      alert('✅ 설정이 저장되었습니다.');
      
    } catch (error) {
      console.error('[❌ 프론트] 설정 저장 실패:', error);
      alert('❌ 설정 저장 실패: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 변경사항 취소
  const handleCancelChanges = () => {
    console.log('[🎯 프론트] 변경사항 취소');
    setPendingChanges({});
  };

  // 필드 렌더링
  const renderField = (category, subcategory, fieldName, fieldInfo) => {
    const fieldId = `${category}-${subcategory}-${fieldName}`;
    const currentValue = getCurrentValue(category, subcategory, fieldName, fieldInfo);
    const pendingKey = `${category}.${subcategory}.${fieldName}`;
    
    // 변경 상태 확인: pendingChanges에 있고, 저장된 값과 다른 경우에만 변경으로 표시
    const savedValue = settings[category]?.[subcategory]?.[fieldName];
    const pendingValue = pendingChanges[pendingKey];
    const hasChange = pendingValue !== undefined && pendingValue !== savedValue;
    
    const handleChange = (newValue) => {
      handleFieldChange(category, subcategory, fieldName, newValue);
    };

    switch (fieldInfo.type) {
      case 'checkbox':
        return (
          <div key={fieldName} className={`setting-item ${hasChange ? 'changed' : ''}`}>
            <label htmlFor={fieldId}>
              <input
                id={fieldId}
                type="checkbox"
                checked={currentValue || false}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={saving}
              />
              {fieldInfo.label}
              {hasChange && <span className="change-indicator">●</span>}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div key={fieldName} className={`setting-item ${hasChange ? 'changed' : ''}`}>
            <label className="setting-label">
              {fieldInfo.label}
              {hasChange && <span className="change-indicator">●</span>}
            </label>
            <div className="radio-group">
              {fieldInfo.options?.map(option => (
                <label key={option.value} className="radio-option">
                  <input
                    type="radio"
                    name={fieldId}
                    value={option.value}
                    checked={currentValue === option.value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={saving}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className={`setting-item ${hasChange ? 'changed' : ''}`}>
            <label htmlFor={fieldId}>
              {fieldInfo.label}
              {hasChange && <span className="change-indicator">●</span>}
            </label>
            <select
              id={fieldId}
              value={currentValue || fieldInfo.default || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={saving}
            >
              {fieldInfo.options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} className={`setting-item ${hasChange ? 'changed' : ''}`}>
            <label htmlFor={fieldId}>
              {fieldInfo.label}
              {hasChange && <span className="change-indicator">●</span>}
            </label>
            <input
              id={fieldId}
              type="number"
              min={fieldInfo.min}
              max={fieldInfo.max}
              step={fieldInfo.step || 1}
              value={currentValue !== undefined && currentValue !== null ? currentValue : (fieldInfo.default || '')}
              onChange={(e) => {
                const value = e.target.value;
                // 빈 문자열이면 undefined로 처리, 아니면 숫자로 변환
                handleChange(value === '' ? undefined : parseInt(value));
              }}
              disabled={saving}
            />
          </div>
        );

      case 'text':
        return (
          <div key={fieldName} className={`setting-item ${hasChange ? 'changed' : ''}`}>
            <label htmlFor={fieldId}>
              {fieldInfo.label}
              {hasChange && <span className="change-indicator">●</span>}
            </label>
            <input
              id={fieldId}
              type="text"
              placeholder={fieldInfo.placeholder}
              value={currentValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={saving}
            />
          </div>
        );

      case 'checkbox_group':
        return (
          <div key={fieldName} className="setting-item">
            <label className="setting-label">{fieldInfo.label}</label>
            <div className="checkbox-group">
              {fieldInfo.options?.map(option => (
                <label key={option.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={(currentValue || []).includes(option.value)}
                    onChange={(e) => {
                      const newValue = currentValue || [];
                      if (e.target.checked) {
                        handleChange([...newValue, option.value]);
                      } else {
                        handleChange(newValue.filter(v => v !== option.value));
                      }
                    }}
                    disabled={saving}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        );

      case 'signature_list':
        // getCurrentValue를 사용하여 변경사항 포함된 값 가져오기
        const currentSignatures = getCurrentValue(activeCategory, activeSubcategory, 'signatures', fieldInfo) || [];
        const currentSignature = currentSignatures[0] || {};
        const signatureEnabled = getCurrentValue(activeCategory, activeSubcategory, 'enabled', { default: true });
        
        return (
          <div key={fieldName} className="setting-item">
            <label className="setting-label">{fieldInfo.label}</label>
            
            {/* 서명 사용 여부 */}
            <div className="signature-toggle" style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={signatureEnabled !== false}
                  onChange={(e) => {
                    handleFieldChange(activeCategory, activeSubcategory, 'enabled', e.target.checked);
                  }}
                />
                서명 사용
              </label>
            </div>

            {/* 서명 내용 입력 */}
            <div className="signature-content">
              <label>서명 내용:</label>
              <textarea
                value={currentSignature.content || ''}
                onChange={(e) => {
                  const updatedSignature = {
                    id: 1,
                    name: '내 서명',
                    content: e.target.value,
                    html_content: '',
                    is_html: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  handleFieldChange(activeCategory, activeSubcategory, 'signatures', [updatedSignature]);
                }}
                placeholder="최수운&#10;MailPilot AI 개발팀&#10;csw21c915@gmail.com&#10;010-1234-5678"
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  // 테마 섹션 렌더링
  const renderThemeSection = () => {
    const currentTheme = getCurrentValue('GENERAL', 'THEME', 'appearance', { default: 'light' });
    const hasChange = pendingChanges['GENERAL.THEME.appearance'] !== undefined && 
                     pendingChanges['GENERAL.THEME.appearance'] !== settings?.GENERAL?.THEME?.appearance;

    return (
      <div className="settings-sections">
        <div className="settings-section">
          <h4>🌙 테마 설정</h4>
          <div className="section-fields">
            <div className={`setting-item ${hasChange ? 'changed' : ''}`}>
              <label className="setting-label">
                테마 모드
                {hasChange && <span className="change-indicator">●</span>}
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="theme-mode"
                    value="light"
                    checked={currentTheme === 'light'}
                    onChange={(e) => handleFieldChange('GENERAL', 'THEME', 'appearance', 'light')}
                    disabled={saving}
                  />
                  ☀️ 라이트 모드
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="theme-mode"
                    value="dark"
                    checked={currentTheme === 'dark'}
                    onChange={(e) => handleFieldChange('GENERAL', 'THEME', 'appearance', 'dark')}
                    disabled={saving}
                  />
                  🌙 다크 모드
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="theme-mode"
                    value="auto"
                    checked={currentTheme === 'auto'}
                    onChange={(e) => handleFieldChange('GENERAL', 'THEME', 'appearance', 'auto')}
                    disabled={saving}
                  />
                  🔄 시스템 설정 따르기
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 섹션 렌더링
  const renderSection = (category, subcategory) => {
    // 테마 섹션은 특별 처리
    if (category === 'GENERAL' && subcategory === 'THEME') {
      return renderThemeSection();
    }

    const subcategoryData = structure[category]?.[subcategory];
    const settingsData = settings[category]?.[subcategory] || {};

    if (!subcategoryData || !subcategoryData.sections) {
      return <div>설정을 불러오는 중...</div>;
    }

    return (
      <div className="settings-sections">
        {Object.entries(subcategoryData.sections).map(([sectionKey, sectionData]) => (
          <div key={sectionKey} className="settings-section">
            <h4>{sectionData.name}</h4>
            <div className="section-fields">
              {Object.entries(sectionData.fields).map(([fieldName, fieldInfo]) => {
                // showIf 조건 체크
                if (fieldInfo.showIf) {
                  const [conditionField, conditionValue] = Object.entries(fieldInfo.showIf)[0];
                  if (settingsData[conditionField] !== conditionValue) {
                    return null;
                  }
                }
                
                return renderField(
                  category,
                  subcategory,
                  fieldName,
                  fieldInfo
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="settings-overlay">
        <div className="settings-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p>설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay">
      <div className="settings-container detailed-settings">
        <div className="settings-header">
          <h2>설정</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <ul>
              {/* 일반 설정 */}
              <li className={activeCategory === 'GENERAL' ? 'active' : ''}>
                <div 
                  className="category-title"
                  onClick={() => setActiveCategory('GENERAL')}
                >
                  일반
                </div>
                {activeCategory === 'GENERAL' && (
                  <ul className="subcategory-list">
                    <li 
                      className={activeSubcategory === 'READ' ? 'active' : ''}
                      onClick={() => setActiveSubcategory('READ')}
                    >
                      읽기
                    </li>
                    <li 
                      className={activeSubcategory === 'WRITE' ? 'active' : ''}
                      onClick={() => setActiveSubcategory('WRITE')}
                    >
                      쓰기
                    </li>
                    <li 
                      className={activeSubcategory === 'THEME' ? 'active' : ''}
                      onClick={() => setActiveSubcategory('THEME')}
                    >
                      테마
                    </li>
                  </ul>
                )}
              </li>

              {/* 내 메일 설정 */}
              <li className={activeCategory === 'MY_EMAIL' ? 'active' : ''}>
                <div 
                  className="category-title"
                  onClick={() => setActiveCategory('MY_EMAIL')}
                >
                  내 메일
                </div>
                {activeCategory === 'MY_EMAIL' && (
                  <ul className="subcategory-list">
                    <li 
                      className={activeSubcategory === 'SIGNATURE_MANAGEMENT' ? 'active' : ''}
                      onClick={() => setActiveSubcategory('SIGNATURE_MANAGEMENT')}
                    >
                      서명 관리
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          <div className="settings-main">
            <div className="settings-content-header">
              <h3>
                {structure[activeCategory]?.[activeSubcategory]?.name || activeSubcategory}
              </h3>
              {saving && <span className="saving-indicator">저장 중...</span>}
            </div>
            
            {renderSection(activeCategory, activeSubcategory)}
          </div>
        </div>

        <div className="settings-footer">
          <div className="footer-left">
            {hasChanges() && (
              <span className="changes-indicator">
                🔄 {getChangeCount()}개 변경사항
              </span>
            )}
          </div>
          <div className="footer-right">
            <button 
              className="btn-cancel" 
              onClick={handleCancelChanges}
              disabled={!hasChanges() || saving}
            >
              취소
            </button>
            <button 
              className="btn-save" 
              onClick={handleSaveAll}
              disabled={!hasChanges() || saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button className="btn-close" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedSettings;