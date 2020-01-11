import * as CONFIG from './config';

export { CONFIG };

export const TODO = {
  id: 'todo',
  title: 'To do',
  taskIds: [],
};

export const DONE = {
  id: 'done',
  title: 'Done',
  taskIds: [],
};

export const INITIAL = {
  columnOrder: [TODO.id, DONE.id],
  columns: {
    [TODO.id]: TODO,
    [DONE.id]: DONE,
  },
  tasks: {},
};
