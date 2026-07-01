import { useState, useEffect } from 'react';
import API from '../utils/api';
import BoardCard from '../components/BoardCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await API.get('/boards');
      setBoards(res.data);
    } catch (error) {
      toast.error('Failed to fetch boards');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Board name is required');
      return;
    }
    try {
      const res = await API.post('/boards', formData);
      setBoards([...boards, res.data]);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      toast.success('Board created!');
    } catch (error) {
      toast.error('Failed to create board');
    }
  };

  const handleDelete = async (boardId) => {
    if (!window.confirm('Delete this board?')) return;
    try {
      await API.delete(`/boards/${boardId}`);
      setBoards(boards.filter(b => b._id !== boardId));
      toast.success('Board deleted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete board');
    }
  };

  if (loading) return <div className="loading">Loading boards...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Boards</h1>
          <p>Welcome back, {user?.name}! 👋</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Board'}
        </button>
      </div>

      {showForm && (
        <div className="create-board-form">
          <h3>Create New Board</h3>
          <div className="form-group">
            <label>Board Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter board name"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <button onClick={handleCreate} className="btn-primary">Create Board</button>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="empty-state">
          <h2>No boards yet!</h2>
          <p>Create your first board to get started</p>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <BoardCard key={board._id} board={board} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;