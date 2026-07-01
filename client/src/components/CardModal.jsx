import { useState, useEffect } from 'react';
import API from '../utils/api';

const CardModal = ({ card, boardId, onClose, onSave, onDelete, members, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    column: 'todo'
  });

  useEffect(() => {
    if (card) {
      setFormData({
        title: card.title || '',
        description: card.description || '',
        priority: card.priority || 'medium',
        assignee: card.assignee?._id || '',
        dueDate: card.dueDate ? card.dueDate.split('T')[0] : '',
        column: card.column || 'todo'
      });
    }
  }, [card]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (card._id) {
        const res = await API.put(`/cards/${card._id}`, formData);
        onSave(res.data, 'update');
      } else {
        const res = await API.post('/cards', { ...formData, boardId });
        onSave(res.data, 'create');
      }
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving card');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this card?')) {
      try {
        await API.delete(`/cards/${card._id}`);
        onDelete(card._id);
        onClose();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting card');
      }
    }
  };

  const canEdit = user?.role === 'admin' || card?.createdBy?._id === user?._id || !card?._id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{card?._id ? 'Edit Card' : 'Create Card'}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="Card title"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!canEdit}
              placeholder="Card description"
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} disabled={!canEdit}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Column</label>
              <select name="column" value={formData.column} onChange={handleChange} disabled={!canEdit}>
                <option value="todo">📋 To Do</option>
                <option value="inprogress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Assignee</label>
              <select name="assignee" value={formData.assignee} onChange={handleChange} disabled={!canEdit}>
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {card?._id && canEdit && (
            <button onClick={handleDelete} className="btn-danger">Delete Card</button>
          )}
          {canEdit && (
            <button onClick={handleSubmit} className="btn-primary">
              {card?._id ? 'Save Changes' : 'Create Card'}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;