import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, Header, Dimmer, Grid, Loader } from 'semantic-ui-react';
import { Pane } from 'evergreen-ui';
import { DragDropContext } from 'react-beautiful-dnd';
import Swal from 'sweetalert2';

import { AnimatedButton, Column, TodoListModal } from './components';
import { CONFIG, INITIAL, TODO, DONE } from './constants';
import { reorderSingleDrag } from './utils';

const getTasks = (data, columnId) =>
  data.columns[columnId].taskIds.map(taskId => data.tasks[taskId]);

const App = () => {
  const [account, setAccount] = useState(null);
  const [todoList, setTodoList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(null);

  const onLoadBlockchainData = async () => {
    try {
      const web3 = new Web3(Web3.currentProvider || 'http://localhost:7545');
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
      const web3TodoList = new web3.eth.Contract(
        CONFIG.TODO_LIST_ABI,
        CONFIG.TODO_LIST_ADDRESS
      );
      setTodoList(web3TodoList);
      const taskCount = await web3TodoList.methods.taskCount().call();
      const tasks = {};
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i <= taskCount; i++) {
        // eslint-disable-next-line no-await-in-loop
        const task = await web3TodoList.methods.tasks(i).call();
        tasks[task.id] = task;
      }
      INITIAL.tasks = tasks;
      INITIAL.columns[TODO.id] = {
        ...TODO,
        taskIds: Object.keys(tasks).filter(id => !tasks[id].completed),
      };
      INITIAL.columns[DONE.id] = {
        ...DONE,
        taskIds: Object.keys(tasks).filter(id => tasks[id].completed),
      };
      setData(INITIAL);
    } catch (err) {
      console.log('err: ', err.message);
    }
  };

  useEffect(() => {
    onLoadBlockchainData();
  }, [data]);

  const onDragEnd = result => {
    const { destination } = result;
    const { source } = result;
    if (
      !destination ||
      result.reason === 'CANCEL' ||
      source.droppableId === destination.droppableId
    ) {
      return;
    }
    onToggleCompleted(result.draggableId);

    const newBoardData = reorderSingleDrag({
      entities: data,
      source,
      destination,
    });
    setData(newBoardData);
  };

  const onCreateTask = ({ title, description }) => {
    todoList.methods
      .createTask(title, description)
      .send({ from: account, gas: 3000000 })
      .once('receipt', receipt => {
        const newTask = receipt.events.TaskCreated.returnValues;
        const newData = {
          ...data,
          tasks: { ...data.tasks, [newTask.id]: newTask },
        };
        setData(newData);
        setShowModal(false);
        Swal.fire({
          text: 'Task created successfully.',
          type: 'success',
        });
      });
  };

  const onToggleCompleted = taskId =>
    todoList.methods.toggleCompleted(taskId).send({ from: account });

  return (
    <Container textAlign="center">
      <Pane height={24} />
      <Header>Blockchain Todo Board Powered by Ethereum Smart Contracts</Header>
      {data === null ? (
        <Dimmer active inverted>
          <Loader />
        </Dimmer>
      ) : (
        <Pane marginBottom={16}>
          <AnimatedButton positive onClick={() => setShowModal(true)}>
            Create
          </AnimatedButton>
          <DragDropContext onDragEnd={onDragEnd}>
            <Grid centered padded>
              {data.columnOrder.map(columnId => (
                <Column
                  key={columnId}
                  column={data.columns[columnId]}
                  tasks={getTasks(data, columnId)}
                />
              ))}
            </Grid>
          </DragDropContext>
        </Pane>
      )}
      <TodoListModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSave={formData => onCreateTask(formData)}
      />
    </Container>
  );
};

export default App;
