import React, { Component } from 'react';
import Web3 from 'web3';
import { Container, Header, Grid, Dimmer, Loader } from 'semantic-ui-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Pane } from 'evergreen-ui';

import { AnimatedButton, Column, TodoListModal } from './components';
import { TODO_LIST_ABI, TODO_LIST_ADDRESS } from './constants/config';
import { mutliDragAwareReorder } from './utils';

const TODO = {
  id: 'todo',
  title: 'To do',
  taskIds: [],
};

const DONE = {
  id: 'done',
  title: 'Done',
  taskIds: [],
};

const initial = {
  columnOrder: [TODO.id, DONE.id],
  columns: {
    [TODO.id]: TODO,
    [DONE.id]: DONE,
  },
  tasks: {},
};

const getTasks = (entities, columnId) =>
  entities.columns[columnId].taskIds.map(
    (taskId) => entities.tasks[taskId]);

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    try {
      const web3 = new Web3(Web3.currentProvider || "http://localhost:7545");
      const accounts = await web3.eth.getAccounts();
      const todoList = new web3.eth.Contract(TODO_LIST_ABI, TODO_LIST_ADDRESS);
      const taskCount = await todoList.methods.taskCount().call();
      const tasks = {};
      for (var i = 1; i <= taskCount; i++) {
        const task = await todoList.methods.tasks(i).call()
        tasks[task.id] = task;
      }
      initial.tasks = tasks;
      initial.columns[TODO.id] = {
        ...TODO,
        taskIds: Object.keys(tasks).filter(id => !tasks[id].completed)
      };
      initial.columns[DONE.id] = {
        ...DONE,
        taskIds: Object.keys(tasks).filter(id => tasks[id].completed)
      };
      this.setState({ entities: initial, loading: false, account: accounts[0], todoList });
    } catch (err) {
      console.log('err: ', err.message);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      account: '',
      loading: true,
      entities: initial,
      selectedTaskIds: [],
      showModal: false
    }

    this.createTask = this.createTask.bind(this)
    this.toggleCompleted = this.toggleCompleted.bind(this)
  }

  onDragStart = (start) => {
    const id = start.draggableId;
    const selected = this.state.selectedTaskIds.find(
      (taskId) => taskId === id,
    );
    if (!selected) {
      this.setState({
        selectedTaskIds: [],
      });
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

  toggleSelection = (taskId) => {
    const selectedTaskIds = this.state.selectedTaskIds;
    const wasSelected = selectedTaskIds.includes(taskId);

    const newTaskIds = (() => {
      if (!wasSelected) {
        return [taskId];
      }
      if (selectedTaskIds.length > 1) {
        return [taskId];
      }
      return [];
    })();

    this.setState({
      selectedTaskIds: newTaskIds,
    });
  };

  toggleSelectionInGroup = (taskId) => {
    const selectedTaskIds = this.state.selectedTaskIds;
    const index = selectedTaskIds.indexOf(taskId);
    if (index === -1) {
      this.setState({
        selectedTaskIds: [...selectedTaskIds, taskId],
      });
      return;
    }
    const shallow = [...selectedTaskIds];
    shallow.splice(index, 1);
    this.setState({
      selectedTaskIds: shallow,
    });
  };

  createTask(formData) {
    this.setState({ loading: true })
    this.state.todoList.methods
      .createTask(formData.title)
      .send({ from: this.state.account })
      .once('receipt', () => {
        this.setState({ loading: false, showModal: false });
      });
  }

  toggleCompleted(taskId) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(taskId).send({ from: this.state.account })
    .once('receipt', () => {
      this.setState({ loading: false });
    });
  }

  render() {
    const { entities, selectedTaskIds, loading, showModal } = this.state;
    return (
      <Container textAlign="center">
        <Pane height={24} />
        <Header>Blockchain Todo Board Powered by Ethereum Smart Contracts</Header>
        {loading ? (
          <Dimmer active inverted><Loader /></Dimmer>
        ) : (
          <Pane marginBottom={16}>
            <AnimatedButton
              positive
              onClick={() => this.setState({ showModal: true })}
            >
              Create
            </AnimatedButton>
            <DragDropContext
              onDragStart={this.onDragStart}
              onDragEnd={this.onDragEnd}
            >
              <Grid centered padded>
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
          </Pane>
        )}
        <TodoListModal
          showModal={showModal}
          onClose={() => this.setState({ showModal: false })}
          onSave={(formData) => this.createTask(formData)}
        />
      </Container>
    );
  }
}

export default App;
