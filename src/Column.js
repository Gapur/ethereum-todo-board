import React, { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';

import Task from './Task';

class Column extends Component {
  render() {
    const { column, tasks, selectedTaskIds, draggingTaskId } = this.props;
    const getSelectedMap = (selectedTaskIds) =>
      selectedTaskIds.reduce((previous, current) => {
        previous[current] = true;
        return previous;
      }, {});

    return (
      <div>
        <span>{column.title}</span>
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
                    task={task}
                    index={index}
                    key={task.id}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedTaskIds.length}
                    toggleSelection={this.props.toggleSelection}
                    toggleSelectionInGroup={this.props.toggleSelectionInGroup}
                    multiSelectTo={this.props.multiSelectTo}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }
}

export default Column;
