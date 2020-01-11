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

const DraggableCard = ({ task, index }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided, snapshot) => {
      return (
        <DragCard
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
        >
          <Card>
            <Card.Content>
              <Card.Header>{task.content}</Card.Header>
              <Card.Description>Test</Card.Description>
            </Card.Content>
          </Card>
        </DragCard>
      );
    }}
  </Draggable>
);

export default DraggableCard;
