import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from 'semantic-ui-react';
import styled from 'styled-components';

const DragCard = styled.div`
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 2px;
  position: relative;
`;

const DraggableCard = ({ task, index, selectionCount, toggleSelection, toggleSelectionInGroup }) => {
  const onClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    toggleSelection(task.id);
  };

  const onTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    toggleSelectionInGroup(task.id);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        const shouldShowSelection = snapshot.isDragging && selectionCount > 1;
        return (
          <DragCard
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            onTouchEnd={onTouchEnd}
            isDragging={snapshot.isDragging}
          >
            <Card>
              <Card.Content>
                <Card.Header>{task.content}</Card.Header>
                <Card.Description>
                  {shouldShowSelection ? selectionCount : null}
                </Card.Description>
              </Card.Content>
            </Card>
          </DragCard>
        );
      }}
    </Draggable>
  );
}

export default DraggableCard;
