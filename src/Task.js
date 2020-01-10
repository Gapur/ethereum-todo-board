import React, { Component } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from 'semantic-ui-react';
import styled from 'styled-components';

import colors from './colors';

const primaryButton = 0;
const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9,
};
const grid = 8;
const borderRadius = 2;

const getBackgroundColor = ({
  isSelected,
  isGhosting,
}) => {
  if (isGhosting) {
    return colors.silver;
  }

  if (isSelected) {
    return colors.dimGray;
  }

  return colors.silver;
};

const getColor = ({ isSelected, isGhosting }) => {
  if (isGhosting) {
    return 'darkgrey';
  }
  if (isSelected) {
    return colors.dimGray;
  }
  return colors.silver;
};

const DraggableCard = styled.div`
  background-color: ${props => getBackgroundColor(props)};
  color: ${props => getColor(props)};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  border: 3px solid ${colors.N90};
  ${props =>
    props.isDragging ? `box-shadow: 2px 2px 1px ${colors.N90};` : ''} ${props =>
    props.isGhosting
      ? 'opacity: 0.8;'
      : ''}

  /* needed for SelectionCount */
  position: relative;

  /* avoid default outline which looks lame with the position: absolute; */
  &:focus {
    outline: none;
    border-color: ${colors.G200};
  }
`;

class Task extends Component {
  onKeyDown = (
    event,
    provided,
    snapshot,
  ) => {
    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();
    this.performAction(event);
  };

  // Using onClick as it will be correctly
  // preventing if there was a drag
  onClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();
    this.performAction(event);
  };

  onTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    // marking the event as used
    // we would also need to add some extra logic to prevent the click
    // if this element was an anchor
    event.preventDefault();
    this.props.toggleSelectionInGroup(this.props.task.id);
  };

  // Determines if the platform specific toggle selection in group key was used
  wasToggleInSelectionGroupKeyUsed = (event) => {
    const isUsingWindows = navigator.platform.indexOf('Win') >= 0;
    return isUsingWindows ? event.ctrlKey : event.metaKey;
  };

  performAction = (event) => {
    const {
      task,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo,
    } = this.props;

    if (this.wasToggleInSelectionGroupKeyUsed(event)) {
      toggleSelectionInGroup(task.id);
      return;
    }

    if (this.wasMultiSelectKeyUsed(event)) {
      multiSelectTo(task.id);
      return;
    }

    toggleSelection(task.id);
  };

  render() {
    const { task, index, isSelected, selectionCount, isGhosting } = this.props;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => {
          const shouldShowSelection = snapshot.isDragging && selectionCount > 1;
          return (
            <DraggableCard
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
              <Card>
                <Card.Content>
                  <Card.Header>{task.content}</Card.Header>
                  <Card.Description>
                    {shouldShowSelection ? selectionCount : null}
                  </Card.Description>
                </Card.Content>
              </Card>
            </DraggableCard>
          );
        }}
      </Draggable>
    );
  }
}

export default Task;
