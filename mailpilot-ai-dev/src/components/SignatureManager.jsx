import React, { useState, useEffect } from 'react';
import './SignatureManager.css';

const SignatureManager = ({ userEmail, onUpdate }) => {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newSignature, setNewSignature] = useState({
    name: '',
    content: '',
    html_content: '',
    is_html: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSignatures();
  }, []);

  const fetchSignatures = async () => {
    try {
      console.log('[📝 서명UI] 서명 목록 요청 시작');
      const response = await fetch('http://localhost:5001/api/signatures', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`[📝 서명UI] 서명 ${data.signatures.length}개 로드 성공`);
        setSignatures(data.signatures);
      } else {
        console.error('[📝 서명UI] 서명 불러오기 실패:', data.error);
      }
    } catch (error) {
      console.error('[📝 서명UI] 서명 불러오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSignature = async () => {
    if (!newSignature.name.trim() || !newSignature.content.trim()) {
      alert('서명 이름과 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newSignature)
      });

      const data = await response.json();
      
      if (data.success) {
        setSignatures([...signatures, data.signature]);
        setNewSignature({
          name: '',
          content: '',
          html_content: '',
          is_html: false
        });
        setShowAddForm(false);
        if (onUpdate) onUpdate();
      } else {
        alert('서명 추가 실패: ' + data.error);
      }
    } catch (error) {
      console.error('서명 추가 오류:', error);
      alert('서명 추가 중 오류가 발생했습니다.');
    }
  };

  const updateSignature = async (id, updatedData) => {
    try {
      const response = await fetch(`http://localhost:5001/api/signatures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSignatures(signatures.map(sig => 
          sig.id === id ? { ...sig, ...updatedData } : sig
        ));
        setEditing(null);
        if (onUpdate) onUpdate();
      } else {
        alert('서명 수정 실패: ' + data.error);
      }
    } catch (error) {
      console.error('서명 수정 오류:', error);
      alert('서명 수정 중 오류가 발생했습니다.');
    }
  };

  const deleteSignature = async (id) => {
    if (!confirm('이 서명을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/signatures/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setSignatures(signatures.filter(sig => sig.id !== id));
        if (onUpdate) onUpdate();
      } else {
        alert('서명 삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('서명 삭제 오류:', error);
      alert('서명 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="signature-manager-loading">서명을 불러오는 중...</div>;
  }

  return (
    <div className="signature-manager">
      <div className="signature-list">
        {signatures.map(signature => (
          <div key={signature.id} className="signature-item">
            {editing === signature.id ? (
              <div className="signature-edit-form">
                <input
                  type="text"
                  value={signature.name}
                  onChange={(e) => setSignatures(signatures.map(sig => 
                    sig.id === signature.id ? { ...sig, name: e.target.value } : sig
                  ))}
                  placeholder="서명 이름"
                />
                <textarea
                  value={signature.content}
                  onChange={(e) => setSignatures(signatures.map(sig => 
                    sig.id === signature.id ? { ...sig, content: e.target.value } : sig
                  ))}
                  placeholder="서명 내용"
                  rows="4"
                />
                <div className="signature-actions">
                  <button
                    onClick={() => updateSignature(signature.id, {
                      name: signature.name,
                      content: signature.content
                    })}
                    className="btn-save"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="btn-cancel"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="signature-display">
                <div className="signature-header">
                  <h4>{signature.name}</h4>
                  <div className="signature-actions">
                    <button
                      onClick={() => setEditing(signature.id)}
                      className="btn-edit"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => deleteSignature(signature.id)}
                      className="btn-delete"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="signature-content">
                  <pre>{signature.content}</pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="signature-add-form">
          <h4>새 서명 추가</h4>
          <input
            type="text"
            value={newSignature.name}
            onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
            placeholder="서명 이름"
          />
          <textarea
            value={newSignature.content}
            onChange={(e) => setNewSignature({ ...newSignature, content: e.target.value })}
            placeholder="서명 내용"
            rows="4"
          />
          <div className="signature-actions">
            <button onClick={addSignature} className="btn-save">
              추가
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSignature({
                  name: '',
                  content: '',
                  html_content: '',
                  is_html: false
                });
              }}
              className="btn-cancel"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-add-signature"
        >
          + 새 서명 추가
        </button>
      )}
    </div>
  );
};

export default SignatureManager;