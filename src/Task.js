import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';

class Task extends Component {
  render() {
    const { task, index, isSelected, selectionCount, isGhosting } = this.props;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => {
          const shouldShowSelection = snapshot.isDragging && selectionCount > 1;
          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={this.onClick}
              onTouchEnd={this.onTouchEnd}
              onKeyDown={(event) => this.onKeyDown(event, provided, snapshot)}
              isDragging={snapshot.isDragging}
              isSelected={isSelected}
              isGhosting={isGhosting}
            >
              <span>{task.content}</span>
              {shouldShowSelection ? (
                <span>{selectionCount}</span>
              ) : null}
            </div>
          );
        }}
      </Draggable>
    );
  }
}

export default Task;
