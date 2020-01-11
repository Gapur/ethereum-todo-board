import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Grid, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import DraggableCard from './DraggableCard';
import colors from '../constants/colors';

const GridColumn = styled(Grid.Column)`
  &&&&& {
    display: flex;
    flex-direction: column;
    margin-right: 8px;
    margin-left: 8px;
    border-radius: 2px;
    border: 1px solid ${colors.spindle};
    background-color: ${colors.pattentsBlue};
    padding-left: 0;
    padding-right: 0;
  }
`;

const TaskList = styled.div`
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${props => (props.isDraggingOver ? `background-color: ${colors.spindle}` : '')};
`;

const Title = styled(Header)`
  &&& {
    padding-left: 12px;
    padding-right: 12px;
  }
`;

const Column = ({ column, tasks }) => {
  return (
    <GridColumn width={4}>
      <Title>{column.title}</Title>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            isDraggingOver={snapshot.isDraggingOver}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => <DraggableCard key={task.id} task={task} index={index} />)}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </GridColumn>
  );
}

export default Column;
