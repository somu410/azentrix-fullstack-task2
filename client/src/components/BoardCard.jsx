import { useNavigate } from 'react-router-dom';

const BoardCard = ({ board, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="board-card">
      <div className="board-card-header">
        <h3>{board.name}</h3>
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(board._id);
          }}
        >🗑️</button>
      </div>
      <p className="board-description">{board.description || 'No description'}</p>
      <div className="board-meta">
        <span>👑 {board.owner?.name}</span>
        <span>👥 {board.members?.length} members</span>
      </div>
      <button
        className="btn-open-board"
        onClick={() => navigate(`/board/${board._id}`)}
      >
        Open Board →
      </button>
    </div>
  );
};

export default BoardCard;