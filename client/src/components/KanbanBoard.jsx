import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import CardItem from './CardItem';
import API from '../utils/api';

const COLUMNS = [
  { id: 'todo', label: '📋 To Do' },
  { id: 'inprogress', label: '🔄 In Progress' },
  { id: 'done', label: '✅ Done' }
];

const KanbanBoard = ({ cards, setCards, onCardClick, socket, boardId }) => {
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const getCardsByColumn = (column) => cards.filter(c => c.column === column);

  const handleDragStart = (event) => {
    const card = cards.find(c => c._id === event.active.id);
    setActiveCard(card);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeCard = cards.find(c => c._id === active.id);
    const newColumn = over.id;

    if (!COLUMNS.find(col => col.id === newColumn)) return;
    if (activeCard.column === newColumn) return;

    const updatedCards = cards.map(c =>
      c._id === activeCard._id ? { ...c, column: newColumn } : c
    );
    setCards(updatedCards);

    try {
      const res = await API.put(`/cards/${activeCard._id}`, { column: newColumn });
      if (socket) {
        socket.emit('cardUpdated', { ...res.data, boardId });
      }
    } catch (error) {
      console.error('Error updating card column:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div key={col.id} className="kanban-column">
            <div className="column-header">
              <h3>{col.label}</h3>
              <span className="card-count">{getCardsByColumn(col.id).length}</span>
            </div>
            <SortableContext
              items={getCardsByColumn(col.id).map(c => c._id)}
              strategy={verticalListSortingStrategy}
              id={col.id}
            >
              <div className="column-cards" id={col.id}>
                {getCardsByColumn(col.id).map(card => (
                  <CardItem key={card._id} card={card} onClick={onCardClick} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeCard && <CardItem card={activeCard} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;