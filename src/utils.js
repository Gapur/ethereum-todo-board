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

export const reorderSingleDrag = ({
  entities,
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

    return updated;
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

  return updated;
};
