import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Grid, Header } from 'semantic-ui-react';

import Task from './Task';

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
      <Grid.Column width={8}>
        <Header>{column.title}</Header>
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
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
            </div>
          )}
        </Droppable>
      </Grid.Column>
    );
  }
}

export default Column;
