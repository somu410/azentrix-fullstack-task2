import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../utils/api';
import KanbanBoard from '../components/KanbanBoard';
import CardModal from '../components/CardModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BoardPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchBoard();
    fetchCards();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinBoard', id);

    socketRef.current.on('cardCreated', (card) => {
      setCards(prev => [...prev, card]);
      toast.success('New card added by teammate!');
    });

    socketRef.current.on('cardUpdated', (updatedCard) => {
      setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
    });

    socketRef.current.on('cardDeleted', ({ cardId }) => {
      setCards(prev => prev.filter(c => c._id !== cardId));
      toast.success('A card was deleted by teammate!');
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  const fetchBoard = async () => {
    try {
      const res = await API.get(`/boards/${id}`);
      setBoard(res.data);
    } catch (error) {
      toast.error('Failed to fetch board');
    }
  };

  const fetchCards = async () => {
    try {
      const res = await API.get(`/cards/board/${id}`);
      setCards(res.data);
    } catch (error) {
      toast.error('Failed to fetch cards');
    }
    setLoading(false);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowModal(true);
  };

  const handleNewCard = () => {
    setSelectedCard({ title: '', description: '', priority: 'medium', column: 'todo' });
    setShowModal(true);
  };

  const handleSave = (card, type) => {
    if (type === 'create') {
      setCards(prev => [...prev, card]);
      socketRef.current.emit('cardCreated', { ...card, boardId: id });
      toast.success('Card created!');
    } else {
      setCards(prev => prev.map(c => c._id === card._id ? card : c));
      socketRef.current.emit('cardUpdated', { ...card, boardId: id });
      toast.success('Card updated!');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email');
      return;
    }
    try {
      const res = await API.post(`/boards/${id}/members`, { email: inviteEmail });
      setBoard(res.data);
      setInviteEmail('');
      setShowInvite(false);
      toast.success('Member invited successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleDelete = (cardId) => {
    setCards(prev => prev.filter(c => c._id !== cardId));
    socketRef.current.emit('cardDeleted', { cardId, boardId: id });
    toast.success('Card deleted!');
  };

  if (loading) return <div className="loading">Loading board...</div>;

  return (
    <div className="board-page">
      <div className="board-page-header">
        <div>
          <h1>{board?.name}</h1>
          <p>{board?.description}</p>
          <div className="board-members">
            👥 Members: {board?.members?.map(m => m.name).join(', ')}
          </div>
        </div>
        <div className="board-actions">
          {user?._id === board?.owner?._id && (
            <button onClick={() => setShowInvite(!showInvite)} className="btn-secondary">
              {showInvite ? 'Cancel' : '+ Invite Member'}
            </button>
          )}
          <button onClick={handleNewCard} className="btn-primary">+ Add Card</button>
        </div>
      </div>

      {showInvite && (
        <div className="invite-form">
          <input
            type="email"
            placeholder="Enter member's email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <button onClick={handleInvite} className="btn-primary">Send Invite</button>
        </div>
      )}

      <KanbanBoard
        cards={cards}
        setCards={setCards}
        onCardClick={handleCardClick}
        socket={socketRef.current}
        boardId={id}
      />

      {showModal && (
        <CardModal
          card={selectedCard}
          boardId={id}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          members={board?.members}
          user={user}
        />
      )}
    </div>
  );
};

export default BoardPage;