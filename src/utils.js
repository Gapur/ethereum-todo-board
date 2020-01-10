import { invariant } from 'react-beautiful-dnd/dist/react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const withNewTaskIds = (column, taskIds) => ({
  id: column.id,
  title: column.title,
  taskIds,
});

const reorderSingleDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}) => {
  // moving in the same list
  if (source.droppableId === destination.droppableId) {
    const column = entities.columns[source.droppableId];
    const reordered = reorder(
      column.taskIds,
      source.index,
      destination.index,
    );

    const updated = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewTaskIds(column, reordered),
      },
    };

    return {
      entities: updated,
      selectedTaskIds,
    };
  }

  // moving to a new list
  const home = entities.columns[source.droppableId];
  const foreign = entities.columns[destination.droppableId];

  // the id of the task to be moved
  const taskId = home.taskIds[source.index];

  // remove from home column
  const newHomeTaskIds = [...home.taskIds];
  newHomeTaskIds.splice(source.index, 1);

  // add to foreign column
  const newForeignTaskIds = [...foreign.taskIds];
  newForeignTaskIds.splice(destination.index, 0, taskId);

  const updated = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewTaskIds(home, newHomeTaskIds),
      [foreign.id]: withNewTaskIds(foreign, newForeignTaskIds),
    },
  };

  return {
    entities: updated,
    selectedTaskIds,
  };
};

export const getHomeColumn = (entities, taskId) => {
  const columnId = entities.columnOrder.find((id) => {
    const column = entities.columns[id];
    return column.taskIds.includes(taskId);
  });

  invariant(columnId, 'Count not find column for task');

  return entities.columns[columnId];
};

const reorderMultiDrag = ({
  entities,
  selectedTaskIds,
  source,
  destination,
}) => {
  const start = entities.columns[source.droppableId];
  const dragged = start.taskIds[source.index];

  const insertAtIndex = (() => {
    const destinationIndexOffset = selectedTaskIds.reduce(
      (previous, current) => {
        if (current === dragged) {
          return previous;
        }

        const final = entities.columns[destination.droppableId];
        const column = getHomeColumn(entities, current);

        if (column !== final) {
          return previous;
        }

        const index = column.taskIds.indexOf(current);

        if (index >= destination.index) {
          return previous;
        }

        // the selected item is before the destination index
        // we need to account for this when inserting into the new location
        return previous + 1;
      },
      0,
    );

    const result = destination.index - destinationIndexOffset;
    return result;
  })();

  // doing the ordering now as we are required to look up columns
  // and know original ordering
  const orderedSelectedTaskIds = [...selectedTaskIds];
  orderedSelectedTaskIds.sort((a, b) => {
    // moving the dragged item to the top of the list
    if (a === dragged) {
      return -1;
    }
    if (b === dragged) {
      return 1;
    }

    // sorting by their natural indexes
    const columnForA = getHomeColumn(entities, a);
    const indexOfA = columnForA.taskIds.indexOf(a);
    const columnForB = getHomeColumn(entities, b);
    const indexOfB = columnForB.taskIds.indexOf(b);

    if (indexOfA !== indexOfB) {
      return indexOfA - indexOfB;
    }

    // sorting by their order in the selectedTaskIds list
    return -1;
  });

  // we need to remove all of the selected tasks from their columns
  const withRemovedTasks = entities.columnOrder.reduce(
    (previous, columnId) => {
      const column = entities.columns[columnId];

      // remove the id's of the items that are selected
      const remainingTaskIds  = column.taskIds.filter(
        (id) => !selectedTaskIds.includes(id),
      );

      previous[column.id] = withNewTaskIds(column, remainingTaskIds);
      return previous;
    },
    entities.columns,
  );

  const final = withRemovedTasks[destination.droppableId];
  const withInserted = (() => {
    const base = [...final.taskIds];
    base.splice(insertAtIndex, 0, ...orderedSelectedTaskIds);
    return base;
  })();

  // insert all selected tasks into final column
  const withAddedTasks = {
    ...withRemovedTasks,
    [final.id]: withNewTaskIds(final, withInserted),
  };

  const updated = {
    ...entities,
    columns: withAddedTasks,
  };

  return {
    entities: updated,
    selectedTaskIds: orderedSelectedTaskIds,
  };
};

export const mutliDragAwareReorder = (args) => {
  if (args.selectedTaskIds.length > 1) {
    return reorderMultiDrag(args);
  }
  return reorderSingleDrag(args);
};
