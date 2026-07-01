import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityColors = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444'
};

const CardItem = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card-item"
      onClick={() => onClick(card)}
    >
      <div className="card-priority" style={{ backgroundColor: priorityColors[card.priority] }}>
        {card.priority}
      </div>
      <h4 className="card-title">{card.title}</h4>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
      <div className="card-footer">
        {card.assignee && <span>👤 {card.assignee.name}</span>}
        {card.dueDate && (
          <span>📅 {new Date(card.dueDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default CardItem;