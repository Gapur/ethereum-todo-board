import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Grid, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import Task from './Task';
import colors from './colors';

const grid = 8;
const borderRadius = 2;

const GridColumn = styled(Grid.Column)`
  margin: ${grid}px;
  border-radius: ${borderRadius}px;
  border: 1px solid ${colors.silver};
  background-color: ${colors.dimGray};
  display: flex;
  flex-direction: column;
`;

const TaskList = styled.div`
  padding: ${grid}px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${props => (props.isDraggingOver ? `background-color: ${colors.silver}` : '')};
`;

class Column extends Component {
  render() {
    const {
      column,
      tasks,
      selectedTaskIds,
      draggingTaskId,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
    } = this.props;

    const getSelectedMap = (selectedTaskIds) =>
      selectedTaskIds.reduce((previous, current) => {
        previous[current] = true;
        return previous;
      }, {});

    return (
      <GridColumn width={4}>
        <Header>{column.title}</Header>
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <TaskList
              ref={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
            >
              {tasks.map((task, index) => {
                const isSelected = getSelectedMap(selectedTaskIds)[task.id];
                const isGhosting = isSelected && draggingTaskId && draggingTaskId !== task.id;
                return (
                  <Task
                    key={task.id}
                    task={task}
                    index={index}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedTaskIds.length}
                    toggleSelection={toggleSelection}
                    toggleSelectionInGroup={toggleSelectionInGroup}
                    multiSelectTo={multiSelectTo}
                  />
                );
              })}
              {provided.placeholder}
            </TaskList>
          )}
        </Droppable>
      </GridColumn>
    );
  }
}

export default Column;
