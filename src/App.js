import React, { Component } from 'react';
import Web3 from 'web3';
import { Container, Header } from 'semantic-ui-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Grid } from 'semantic-ui-react';

import TodoList from './TodoList';
import Column from './Column';
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './config';
import { mutliDragAwareReorder } from './utils';

const tasks = Array.from({ length: 20 }, (v, k) => k).map(
  (val) => ({
    id: `task-${val}`,
    content: `Task ${val}`,
  }),
);

const taskMap = tasks.reduce(
  (previous, current) => {
    previous[current.id] = current;
    return previous;
  },
  {},
);

const todo = {
  id: 'todo',
  title: 'To do',
  taskIds: tasks.map((task) => task.id),
};

const done = {
  id: 'done',
  title: 'Done',
  taskIds: [],
};

const initial = {
  columnOrder: [todo.id, done.id],
  columns: {
    [todo.id]: todo,
    [done.id]: done,
  },
  tasks: taskMap,
};

const getTasks = (entities, columnId) =>
  entities.columns[columnId].taskIds.map(
    (taskId) => entities.tasks[taskId]);

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData();
  }

  componentDidMount() {
    window.addEventListener('click', this.onWindowClick);
    window.addEventListener('touchend', this.onWindowTouchEnd);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
    window.removeEventListener('touchend', this.onWindowTouchEnd);
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS)
    this.setState({ todoList })
    const taskCount = await todoList.methods.taskCount().call()
    this.setState({ taskCount })
    for (var i = 1; i <= taskCount; i++) {
      const task = await todoList.methods.tasks(i).call()
      this.setState({
        tasks: [...this.state.tasks, task]
      })
    }
    this.setState({ loading: false })
  }

  constructor(props) {
    super(props);

    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true,
      entities: initial,
      selectedTaskIds: [],
    }

    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  onDragStart = (start) => {
    const id = start.draggableId;
    const selected = this.state.selectedTaskIds.find(
      (taskId) => taskId === id,
    );

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      this.unselectAll();
    }
  };

  onDragEnd = (result) => {
    const destination = result.destination;
    const source = result.source;

    if (!destination || result.reason === 'CANCEL') {
      return;
    }

    const processed = mutliDragAwareReorder({
      entities: this.state.entities,
      selectedTaskIds: this.state.selectedTaskIds,
      source,
      destination,
    });

    this.setState({ ...processed });
  };

  onWindowClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  onWindowTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }
    this.unselectAll();
  };

  toggleSelection = (taskId) => {
    const selectedTaskIds = this.state.selectedTaskIds;
    const wasSelected = selectedTaskIds.includes(taskId);

    const newTaskIds = (() => {
      // Task was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [taskId];
      }

      // Task was part of a selected group
      // will now become the only selected item
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }

      // task was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    this.setState({
      selectedTaskIds: newTaskIds,
    });
  };

  toggleSelectionInGroup = (taskId) => {
    const selectedTaskIds = this.state.selectedTaskIds;
    const index = selectedTaskIds.indexOf(taskId);

    // if not selected - add it to the selected items
    if (index === -1) {
      this.setState({
        selectedTaskIds: [...selectedTaskIds, taskId],
      });
      return;
    }

    // it was previously selected and now needs to be removed from the group
    const shallow = [...selectedTaskIds];
    shallow.splice(index, 1);
    this.setState({
      selectedTaskIds: shallow,
    });
  };

  unselect = () => {
    this.unselectAll();
  };

  unselectAll = () => {
    this.setState({
      selectedTaskIds: [],
    });
  };

  createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    const { entities, selectedTaskIds } = this.state;

    return (
      <Container>
        <Header>Blockchain Todo Board Powered by Ethereum Smart Contracts</Header>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TodoList
                  tasks={this.state.tasks}
                  createTask={this.createTask}
                  toggleCompleted={this.toggleCompleted} />
              }
            </main>
          </div>
          <div className="row">
            <DragDropContext
              onDragStart={this.onDragStart}
              onDragEnd={this.onDragEnd}
            >
              <Grid>
                {entities.columnOrder.map((columnId) => (
                  <Column
                    column={entities.columns[columnId]}
                    tasks={getTasks(entities, columnId)}
                    selectedTaskIds={selectedTaskIds}
                    key={columnId}
                    toggleSelection={this.toggleSelection}
                    toggleSelectionInGroup={this.toggleSelectionInGroup}
                  />
                ))}
              </Grid>
            </DragDropContext>
          </div>
        </div>
      </Container>
    );
  }
}

export default App;
